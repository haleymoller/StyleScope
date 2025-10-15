from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
import numpy as np

from models.embed import LayerEmbedder
from presets import PRESETS
from utils.shuffle import block_shuffle

app = FastAPI(title="StyleScope Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmbedReq(BaseModel):
    text: str
    model: str = "mock"
    chunk_size: int = 32
    method: Literal["pca", "umap"] = "pca"


class EmbedResp(BaseModel):
    coords2d: List[List[float]]
    layers: int
    dim: int
    chunk_size: int
    method: str


_embedder_cache = {}


def get_embedder(model_name: str):
    if model_name not in _embedder_cache:
        _embedder_cache[model_name] = LayerEmbedder(model_name=model_name)
    return _embedder_cache[model_name]


def compute_trajectory_2d(layer_embeddings: np.ndarray, method: str = "pca"):
    # layer_embeddings: (L, D) averaged across chunks
    if method == "umap":
        try:
            import umap  # type: ignore
            reducer = umap.UMAP(n_components=2, n_neighbors=10,
                                min_dist=0.1, metric="cosine", random_state=0)
            coords = reducer.fit_transform(layer_embeddings)
        except Exception:
            method = "pca"
    if method == "pca":
        # PCA via SVD to avoid sklearn heavy deps
        X = layer_embeddings - layer_embeddings.mean(axis=0, keepdims=True)
        U, S, Vt = np.linalg.svd(X, full_matrices=False)
        V2 = Vt[:2].T
        coords = X @ V2
    return coords, method


@app.post("/embed", response_model=EmbedResp)
def embed(req: EmbedReq):
    eb = get_embedder(req.model)
    chunks = eb.chunk_text(req.text, req.chunk_size)
    # collect [num_chunks x num_layers x dim]
    per_chunk: List[np.ndarray] = []
    for ids in chunks:
        h = eb.last_token_per_layer(ids)  # (L, D) np.ndarray or torch
        if hasattr(h, "cpu"):
            h = h.cpu().numpy()
        per_chunk.append(h)
    arr = np.stack(per_chunk, axis=0)  # (C, L, D)
    # average over chunks → (L, D)
    layer_avg = arr.mean(axis=0)
    coords, used_method = compute_trajectory_2d(layer_avg, method=req.method)
    return EmbedResp(
        coords2d=coords.tolist(),
        layers=layer_avg.shape[0],
        dim=layer_avg.shape[1],
        chunk_size=req.chunk_size,
        method=used_method,
    )


class ShuffleReq(BaseModel):
    text: str
    B: Optional[int] = None  # block size; None for full permute
    model: str = "mock"
    chunk_size: int = 32
    method: Literal["pca", "umap"] = "pca"


@app.post("/shuffle", response_model=EmbedResp)
def shuffle_and_embed(req: ShuffleReq):
    text2 = block_shuffle(req.text, req.B)
    return embed(EmbedReq(text=text2, model=req.model, chunk_size=req.chunk_size, method=req.method))


class ProbeReq(BaseModel):
    X: List[List[float]]
    y: List[int]


@app.post("/probe")
def probe(req: ProbeReq):
    from probes.linear_svm import train_eval
    return train_eval(np.array(req.X), np.array(req.y))


@app.get("/presets")
def presets():
    return PRESETS


@app.get("/")
def root():
    return {"ok": True, "service": "StyleScope backend"}
