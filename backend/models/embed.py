import hashlib
from typing import List
import numpy as np
try:
    import torch  # type: ignore
except Exception:
    torch = None  # type: ignore
try:
    from transformers import AutoModel, AutoTokenizer  # type: ignore
except Exception:
    AutoModel = None  # type: ignore
    AutoTokenizer = None  # type: ignore


class LayerEmbedder:
    def __init__(self, model_name: str = "meta-llama/Llama-3.2-1B"):
        self.model_name = model_name
        self.mock = model_name.lower() == "mock" or AutoModel is None or AutoTokenizer is None or torch is None
        if not self.mock:
            self.tok = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(
                model_name, output_hidden_states=True).eval()
        else:
            self.tok = None
            self.model = None

    def chunk_text(self, text: str, chunk_size: int):
        if self.mock:
            toks = text.split()
            chunks: List[np.ndarray] = []
            for i in range(0, len(toks), chunk_size):
                sl = toks[i: i + chunk_size]
                if not sl:
                    continue
                ids = np.array([int(hashlib.md5(t.encode()).hexdigest()[:6], 16) % 10000 for t in sl], dtype=np.int64).reshape(1, -1)
                chunks.append(ids)
            if not chunks:
                chunks = [np.array([[0]], dtype=np.int64)]
            return chunks
        # tokenize once; then slice into chunks of chunk_size tokens
        ids = self.tok(text, return_tensors="pt",
                       truncation=False).input_ids[0]
        chunks = []
        for i in range(0, len(ids), chunk_size):
            sl = ids[i: i + chunk_size]
            if len(sl) == 0:
                continue
            chunks.append(sl.unsqueeze(0))
        if not chunks:
            chunks = [ids[:chunk_size].unsqueeze(0)]
        return chunks

    def last_token_per_layer(self, text_ids):
        if self.mock:
            if isinstance(text_ids, np.ndarray):
                data = text_ids.tobytes()
            else:
                data = text_ids.cpu().numpy().tobytes()
            h = hashlib.md5(data).hexdigest()
            seed = int(h[:8], 16) % (2**31 - 1)
            rng = np.random.default_rng(seed)
            layers = 24
            dim = 256
            return rng.standard_normal(size=(layers, dim)).astype(np.float32)
        # real model path
        assert torch is not None
        with torch.no_grad():
            out = self.model(text_ids, output_hidden_states=True)
        hs = out.hidden_states  # tuple: (layer0..L)
        return torch.stack([h[-1, -1, :] for h in hs])  # (layers, dim)
