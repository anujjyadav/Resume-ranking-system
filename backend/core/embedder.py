import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Union
import os

# Load model once at module level (cached after first load)
_MODEL_NAME = "all-MiniLM-L6-v2"
_model: SentenceTransformer = None


def get_model() -> SentenceTransformer:
    """Lazy-load the sentence transformer model (singleton)."""
    global _model
    if _model is None:
        print(f"[Embedder] Loading model: {_MODEL_NAME} ...")
        _model = SentenceTransformer(_MODEL_NAME)
        print(f"[Embedder] Model loaded successfully.")
    return _model


def embed_text(text: str) -> np.ndarray:
    """Generate a 384-dim embedding vector for a single text string."""
    model = get_model()
    embedding = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return embedding


def embed_texts(texts: List[str]) -> np.ndarray:
    """Generate embeddings for a list of texts (batched for efficiency)."""
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True, show_progress_bar=False)
    return embeddings


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two normalized vectors.
    Since we normalize during encoding, this is just the dot product.
    """
    return float(np.dot(vec_a, vec_b))


def build_resume_embedding(parsed_resume: dict) -> np.ndarray:
    """
    Build a composite embedding from the most important resume sections.
    Weights: skills section (40%) + experience section (40%) + full text (20%)
    """
    sections = parsed_resume.get("sections", {})

    # Collect weighted text chunks
    chunks = []
    weights = []

    skills_text = sections.get("skills", "")
    experience_text = sections.get("experience", "")
    projects_text = sections.get("projects", "")
    raw_text = parsed_resume.get("raw_text", "")

    if skills_text:
        chunks.append(skills_text[:1000])
        weights.append(0.35)

    if experience_text:
        chunks.append(experience_text[:1500])
        weights.append(0.40)

    if projects_text:
        chunks.append(projects_text[:800])
        weights.append(0.15)

    # Always add full text with low weight for context
    if raw_text:
        chunks.append(raw_text[:2000])
        weights.append(0.10)

    if not chunks:
        return embed_text(raw_text[:3000] if raw_text else "")

    # Normalize weights
    total_weight = sum(weights)
    weights = [w / total_weight for w in weights]

    # Embed each chunk and compute weighted average
    embeddings = embed_texts(chunks)
    weighted_embedding = np.zeros(embeddings.shape[1])
    for emb, w in zip(embeddings, weights):
        weighted_embedding += emb * w

    # Re-normalize the combined embedding
    norm = np.linalg.norm(weighted_embedding)
    if norm > 0:
        weighted_embedding = weighted_embedding / norm

    return weighted_embedding


def build_jd_embedding(jd_text: str) -> np.ndarray:
    """Generate embedding for a job description."""
    # Truncate to model max
    return embed_text(jd_text[:3000])
