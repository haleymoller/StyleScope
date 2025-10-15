import random


def block_shuffle(text: str, B: int | None):
    tokens = text.split()
    if not tokens:
        return text
    if B is None:
        random.Random(0).shuffle(tokens)
        return " ".join(tokens)
    # block-wise shuffle
    blocks = [tokens[i: i + B] for i in range(0, len(tokens), B)]
    random.Random(0).shuffle(blocks)
    flat = [t for b in blocks for t in b]
    return " ".join(flat)

