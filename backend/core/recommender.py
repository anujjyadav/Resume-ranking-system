import json
import os
import numpy as np
from typing import List, Dict, Any
from .embedder import embed_texts, embed_text, cosine_similarity
from .skill_extractor import extract_skills, compute_skill_overlap

_ROLES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "job_roles.json")
_EMBEDDINGS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "role_embeddings.npy")
_ROLE_IDS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "role_ids.json")


def _load_roles() -> List[dict]:
    with open(_ROLES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _build_role_text(role: dict) -> str:
    """Concatenate role fields into a single string for embedding."""
    required = ", ".join(role.get("required_skills", []))
    preferred = ", ".join(role.get("preferred_skills", []))
    return (
        f"{role['title']}. {role['description']} "
        f"Required skills: {required}. "
        f"Preferred skills: {preferred}."
    )


def precompute_role_embeddings():
    """
    Pre-compute SBERT embeddings for all job roles and save to disk.
    Run this once during setup.
    """
    roles = _load_roles()
    role_texts = [_build_role_text(r) for r in roles]
    role_ids = [r["id"] for r in roles]

    print(f"[Recommender] Computing embeddings for {len(roles)} job roles...")
    embeddings = embed_texts(role_texts)

    np.save(_EMBEDDINGS_PATH, embeddings)
    with open(_ROLE_IDS_PATH, "w") as f:
        json.dump(role_ids, f)

    print(f"[Recommender] Saved embeddings to {_EMBEDDINGS_PATH}")
    return embeddings, role_ids


def _load_role_embeddings():
    """Load pre-computed role embeddings. Compute if missing."""
    if not os.path.exists(_EMBEDDINGS_PATH) or not os.path.exists(_ROLE_IDS_PATH):
        return precompute_role_embeddings()

    embeddings = np.load(_EMBEDDINGS_PATH)
    with open(_ROLE_IDS_PATH, "r") as f:
        role_ids = json.load(f)

    return embeddings, role_ids


# Cache at module load time
_ROLES: List[dict] = _load_roles()
_ROLE_MAP: Dict[str, dict] = {r["id"]: r for r in _ROLES}
_ROLE_EMBEDDINGS, _ROLE_IDS = None, None  # Lazy loaded


def _ensure_embeddings():
    global _ROLE_EMBEDDINGS, _ROLE_IDS
    if _ROLE_EMBEDDINGS is None:
        _ROLE_EMBEDDINGS, _ROLE_IDS = _load_role_embeddings()


def recommend_roles(
    parsed_resume: dict,
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Recommend top-N job roles based on the candidate's resume.

    Returns a list of role dicts with:
        - role title, category, description
        - match_score (0-100)
        - matched_skills, missing_skills
        - salary range
        - skill_gap_count
    """
    _ensure_embeddings()

    raw_text = parsed_resume.get("raw_text", "")
    resume_skills = extract_skills(raw_text)

    # Build resume embedding
    from .embedder import build_resume_embedding
    resume_embedding = build_resume_embedding(parsed_resume)

    # Compute cosine similarity against all role embeddings
    similarities = []
    for i, role_id in enumerate(_ROLE_IDS):
        role_embedding = _ROLE_EMBEDDINGS[i]
        sim = cosine_similarity(resume_embedding, role_embedding)
        similarities.append((role_id, sim))

    # Sort by similarity
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_roles = similarities[:top_n]

    results = []
    for role_id, semantic_sim in top_roles:
        role = _ROLE_MAP.get(role_id)
        if not role:
            continue

        required_skills = role.get("required_skills", [])
        preferred_skills = role.get("preferred_skills", [])
        all_role_skills = required_skills + preferred_skills

        # Skill overlap
        skill_result = compute_skill_overlap(resume_skills, required_skills)
        preferred_result = compute_skill_overlap(resume_skills, preferred_skills)

        # Hybrid match score: 60% semantic + 40% required skill overlap
        hybrid_score = 0.60 * semantic_sim + 0.40 * skill_result["score"]
        match_pct = round(min(100.0, hybrid_score * 100), 1)

        # Strength tag
        if match_pct >= 75:
            fit = "Strong Fit"
            fit_color = "green"
        elif match_pct >= 55:
            fit = "Good Fit"
            fit_color = "blue"
        elif match_pct >= 35:
            fit = "Partial Fit"
            fit_color = "yellow"
        else:
            fit = "Stretch Goal"
            fit_color = "red"

        results.append({
            "role_id": role_id,
            "title": role["title"],
            "category": role["category"],
            "description": role["description"],
            "match_score": match_pct,
            "fit_label": fit,
            "fit_color": fit_color,
            "matched_skills": skill_result["matched"],
            "missing_skills": skill_result["missing"],
            "preferred_matched": preferred_result["matched"],
            "preferred_missing": preferred_result["missing"],
            "resume_skills": resume_skills,
            "skill_gap_count": len(skill_result["missing"]),
            "avg_salary": role.get("avg_salary", "N/A"),
            "experience_years": role.get("experience_years", "N/A"),
        })

    return results
