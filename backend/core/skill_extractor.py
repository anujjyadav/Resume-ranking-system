import json
import os
import re
from typing import List, Set

# Load skills taxonomy once at module level
_TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "skills_taxonomy.json")

def _load_taxonomy() -> dict:
    with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

_TAXONOMY = _load_taxonomy()

# Flatten to a single set of all skills (lowercase for matching)
_ALL_SKILLS_RAW: List[str] = []
for category_skills in _TAXONOMY.values():
    _ALL_SKILLS_RAW.extend(category_skills)

# Build a lookup: lowercase skill -> original skill name
_SKILL_LOOKUP: dict = {skill.lower(): skill for skill in _ALL_SKILLS_RAW}

# Sorted by length descending so longer phrases match first (e.g. "machine learning" before "machine")
_SORTED_SKILLS = sorted(_SKILL_LOOKUP.keys(), key=len, reverse=True)


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from text using the skills taxonomy.
    Uses longest-match-first to avoid partial overlaps.
    Returns a deduplicated list of original skill names.
    """
    text_lower = text.lower()
    matched_skills: Set[str] = set()
    consumed_spans = []

    for skill_lower in _SORTED_SKILLS:
        # Use word boundaries to avoid partial matches
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill_lower) + r"(?![a-zA-Z0-9])"
        for match in re.finditer(pattern, text_lower):
            start, end = match.start(), match.end()
            # Check for overlap with already consumed spans
            overlaps = any(s <= start < e or s < end <= e for s, e in consumed_spans)
            if not overlaps:
                matched_skills.add(_SKILL_LOOKUP[skill_lower])
                consumed_spans.append((start, end))

    return sorted(matched_skills)


def extract_skills_from_sections(sections: dict) -> dict:
    """
    Extract skills from each section separately.
    Returns skills categorized by section.
    """
    section_skills = {}
    all_skills = set()

    # Priority sections for skill extraction
    priority_sections = ["skills", "experience", "projects", "summary", "certifications", "general"]

    for section_name in priority_sections:
        if section_name in sections and sections[section_name]:
            skills = extract_skills(sections[section_name])
            if skills:
                section_skills[section_name] = skills
                all_skills.update(skills)

    return {
        "by_section": section_skills,
        "all_skills": sorted(all_skills),
    }


def compute_skill_overlap(resume_skills: List[str], required_skills: List[str]) -> dict:
    """
    Compute Jaccard-style overlap between resume skills and a list of required skills.
    Returns: matched, missing, score (0-1).
    """
    resume_set = {s.lower() for s in resume_skills}
    required_set = {s.lower() for s in required_skills}

    matched_lower = resume_set & required_set
    missing_lower = required_set - resume_set

    # Map back to original casing
    matched = [_SKILL_LOOKUP.get(s, s) for s in matched_lower]
    missing = [_SKILL_LOOKUP.get(s, s) for s in missing_lower]

    score = len(matched) / len(required_set) if required_set else 0.0

    return {
        "matched": sorted(matched),
        "missing": sorted(missing),
        "score": round(score, 4),
    }


def categorize_skills(skills: List[str]) -> dict:
    """Group a flat list of skills back into their taxonomy categories."""
    categorized = {}
    skill_to_category = {}
    for category, category_skills in _TAXONOMY.items():
        for s in category_skills:
            skill_to_category[s.lower()] = category

    for skill in skills:
        category = skill_to_category.get(skill.lower(), "other")
        categorized.setdefault(category, []).append(skill)

    return categorized
