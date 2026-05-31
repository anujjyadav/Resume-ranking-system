from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import json

from core.parser import parse_resume
from core.scorer import rank_resumes

router = APIRouter()


@router.post("/rank-resumes")
async def rank_resumes_endpoint(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
):
    """
    Rank multiple resumes against a job description.

    - **job_description**: Plain text of the job description
    - **resumes**: One or more resume files (PDF or DOCX)
    """
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    if not resumes:
        raise HTTPException(status_code=400, detail="At least one resume file is required.")

    if len(resumes) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 resumes allowed per request.")

    parsed_resumes = []
    errors = []

    for resume_file in resumes:
        try:
            content = await resume_file.read()
            parsed = parse_resume(content, resume_file.filename)
            parsed_resumes.append(parsed)
        except ValueError as e:
            errors.append({"filename": resume_file.filename, "error": str(e)})
        except Exception as e:
            errors.append({"filename": resume_file.filename, "error": f"Unexpected error: {str(e)}"})

    if not parsed_resumes:
        raise HTTPException(
            status_code=422,
            detail={"message": "No resumes could be parsed.", "errors": errors}
        )

    # Run ranking
    ranked = rank_resumes(parsed_resumes, job_description)

    # Extract JD skills for response
    from core.skill_extractor import extract_skills
    jd_skills = extract_skills(job_description)

    return {
        "status": "success",
        "total_resumes": len(parsed_resumes),
        "jd_skills": jd_skills,
        "results": ranked,
        "parse_errors": errors,
    }
