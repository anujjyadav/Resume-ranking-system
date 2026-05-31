import numpy as np
from typing import List, Dict, Any
from .embedder import cosine_similarity, build_resume_embedding, build_jd_embedding
from .skill_extractor import extract_skills, compute_skill_overlap


# ─────────────────────────────────────────
# Weights for hybrid score
# ─────────────────────────────────────────
W_SEMANTIC   = 0.50   # Sentence-BERT cosine similarity
W_SKILL      = 0.35   # Skill overlap (Jaccard-style)
W_EXPERIENCE = 0.15   # Years of experience match


def _experience_score(candidate_years: int, jd_text: str) -> float:
    """
    Parse the JD for required years of experience and compare to candidate.
    Returns a score between 0 and 1.
    """
    import re
    patterns = [
        r"(\d+)\+?\s*years?\s+of\s+experience",
        r"(\d+)\+?\s*years?\s+experience",
        r"minimum\s+(\d+)\s+years?",
        r"at\s+least\s+(\d+)\s+years?",
        r"(\d+)-(\d+)\s+years?",
    ]

    required_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, jd_text.lower())
        if matches:
            flat = [int(m) if isinstance(m, str) else int(m[0]) for m in matches]
            required_years = max(flat)
            break

    if required_years == 0:
        return 1.0  # No experience requirement stated → full score

    if candidate_years >= required_years:
        return 1.0
    elif candidate_years == 0:
        return 0.2  # Fresher bonus — not zero
    else:
        return min(1.0, candidate_years / required_years)


def score_resume_against_jd(
    parsed_resume: dict,
    jd_text: str,
    jd_skills: List[str],
    resume_embedding: np.ndarray,
    jd_embedding: np.ndarray,
) -> dict:
    """
    Compute a hybrid match score for a single resume against a job description.

    Returns:
        A dict containing:
            - total_score (0-100)
            - semantic_score (0-100)
            - skill_score (0-100)
            - experience_score (0-100)
            - matched_skills: list of skills present in both
            - missing_skills: list of skills in JD but not in resume
            - resume_skills: all extracted resume skills
    """
    # 1. Semantic similarity
    semantic_sim = cosine_similarity(resume_embedding, jd_embedding)
    semantic_sim = max(0.0, min(1.0, semantic_sim))  # clamp

    # 2. Skill overlap
    resume_skills = extract_skills(parsed_resume.get("raw_text", ""))
    skill_result = compute_skill_overlap(resume_skills, jd_skills)

    # 3. Experience match
    candidate_years = parsed_resume.get("years_experience", 0)
    exp_score = _experience_score(candidate_years, jd_text)

    # 4. Weighted hybrid score
    hybrid = (
        W_SEMANTIC   * semantic_sim +
        W_SKILL      * skill_result["score"] +
        W_EXPERIENCE * exp_score
    )

    total_score = round(hybrid * 100, 1)

    return {
        "total_score": total_score,
        "semantic_score": round(semantic_sim * 100, 1),
        "skill_score": round(skill_result["score"] * 100, 1),
        "experience_score": round(exp_score * 100, 1),
        "matched_skills": skill_result["matched"],
        "missing_skills": skill_result["missing"],
        "resume_skills": resume_skills,
        "candidate_years_experience": candidate_years,
    }


def rank_resumes(
    parsed_resumes: List[dict],
    jd_text: str,
) -> List[Dict[str, Any]]:
    """
    Rank a list of parsed resumes against a job description.

    Returns a sorted list of result dicts (highest score first),
    each containing resume metadata + scoring details.
    """
    from .embedder import build_resume_embedding, build_jd_embedding

    # Extract JD skills and embedding
    jd_skills = extract_skills(jd_text)
    jd_embedding = build_jd_embedding(jd_text)

    results = []
    for idx, resume in enumerate(parsed_resumes):
        resume_embedding = build_resume_embedding(resume)
        score_data = score_resume_against_jd(
            parsed_resume=resume,
            jd_text=jd_text,
            jd_skills=jd_skills,
            resume_embedding=resume_embedding,
            jd_embedding=jd_embedding,
        )

        # Build recommendation tag
        total = score_data["total_score"]
        if total >= 80:
            tag = "Highly Recommended"
            tag_color = "green"
        elif total >= 60:
            tag = "Good Match"
            tag_color = "blue"
        elif total >= 40:
            tag = "Moderate Match"
            tag_color = "yellow"
        else:
            tag = "Low Match"
            tag_color = "red"

        results.append({
            "rank": 0,  # filled after sort
            "filename": resume.get("filename", f"Resume_{idx+1}"),
            "name": resume.get("name", "Unknown"),
            "email": resume.get("email", ""),
            "phone": resume.get("phone", ""),
            "linkedin": resume.get("linkedin", ""),
            "github": resume.get("github", ""),
            "recommendation_tag": tag,
            "recommendation_color": tag_color,
            **score_data,
        })

    # Sort descending by total score
    results.sort(key=lambda x: x["total_score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return results
