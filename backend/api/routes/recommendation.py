from fastapi import APIRouter, UploadFile, File, HTTPException

from core.parser import parse_resume
from core.recommender import recommend_roles

router = APIRouter()


@router.post("/suggest-roles")
async def suggest_roles_endpoint(
    resume: UploadFile = File(...),
    top_n: int = 5,
):
    """
    Suggest top-N job roles for a candidate based on their resume.

    - **resume**: A single resume file (PDF or DOCX)
    - **top_n**: Number of top roles to return (default: 5, max: 10)
    """
    if top_n > 10:
        top_n = 10

    try:
        content = await resume.read()
        parsed = parse_resume(content, resume.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

    if not parsed.get("raw_text", "").strip():
        raise HTTPException(status_code=422, detail="Resume appears to be empty or unreadable.")

    recommendations = recommend_roles(parsed, top_n=top_n)

    return {
        "status": "success",
        "candidate": {
            "name": parsed.get("name", ""),
            "email": parsed.get("email", ""),
            "phone": parsed.get("phone", ""),
            "linkedin": parsed.get("linkedin", ""),
            "github": parsed.get("github", ""),
            "years_experience": parsed.get("years_experience", 0),
        },
        "resume_skills": recommendations[0]["resume_skills"] if recommendations else [],
        "recommendations": recommendations,
    }
