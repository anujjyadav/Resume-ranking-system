from fastapi import APIRouter, UploadFile, File, HTTPException
from core.parser import parse_resume
from core.skill_extractor import extract_skills, categorize_skills

router = APIRouter()


@router.post("/parse-resume")
async def parse_resume_endpoint(resume: UploadFile = File(...)):
    """
    Parse a single resume and return structured data.

    - **resume**: A resume file (PDF or DOCX)
    """
    try:
        content = await resume.read()
        parsed = parse_resume(content, resume.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

    skills = extract_skills(parsed.get("raw_text", ""))
    categorized = categorize_skills(skills)

    return {
        "status": "success",
        "filename": parsed["filename"],
        "name": parsed["name"],
        "email": parsed["email"],
        "phone": parsed["phone"],
        "linkedin": parsed["linkedin"],
        "github": parsed["github"],
        "years_experience": parsed["years_experience"],
        "skills": skills,
        "skills_by_category": categorized,
        "sections": {k: v[:300] for k, v in parsed["sections"].items()},  # truncate for response
    }
