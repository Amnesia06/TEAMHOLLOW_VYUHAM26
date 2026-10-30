"""
Embedding Module for Pathwise (Track 3: Intelligence).
Uses all-MiniLM-L6-v2 (vector size 384) per README Section 5.1 & Section 14.
"""

import logging
import math
import hashlib
from typing import List, Union

try:
    import numpy as np
except ImportError:
    np = None

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 384
MODEL_NAME = "all-MiniLM-L6-v2"

_model = None


def get_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(MODEL_NAME)
            logger.info(f"Loaded sentence-transformers model: {MODEL_NAME}")
        except Exception as e:
            logger.warning(f"Could not load sentence-transformers ({e}). Using deterministic fallback.")
            _model = "FALLBACK"
    return _model


def embed_text(text: str) -> List[float]:
    """Generates a 384-dimensional vector embedding for a single string."""
    model = get_embedding_model()
    if model != "FALLBACK":
        emb = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return emb.tolist()

    # Deterministic 384-dim normalized pseudo-embedding fallback
    vec = [0.0] * EMBEDDING_DIM
    words = text.lower().split()
    if not words:
        words = ["empty"]
    for w in words:
        h = int(hashlib.sha256(w.encode("utf-8")).hexdigest(), 16)
        idx = h % EMBEDDING_DIM
        sign = 1.0 if ((h >> 10) & 1) else -1.0
        vec[idx] += sign

    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [round(x / norm, 6) for x in vec]
    return vec


def embed_batch(texts: List[str]) -> List[List[float]]:
    """Generates 384-dimensional vector embeddings for a list of strings."""
    model = get_embedding_model()
    if model != "FALLBACK":
        embs = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return [e.tolist() for e in embs]
    return [embed_text(t) for t in texts]
