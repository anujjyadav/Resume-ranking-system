import fitz  # PyMuPDF
import docx
import re
import os


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from a PDF file given as bytes."""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        return clean_text(text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract raw text from a DOCX file given as bytes."""
    try:
        import io
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return clean_text("\n".join(paragraphs))
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")


def clean_text(text: str) -> str:
    """Remove excessive whitespace, fix encoding artifacts."""
    # Normalize unicode
    text = text.encode("utf-8", errors="ignore").decode("utf-8")
    # Remove non-printable characters (keep newlines)
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_email(text: str) -> str:
    """Extract email address from text."""
    pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    matches = re.findall(pattern, text)
    return matches[0] if matches else ""


def extract_phone(text: str) -> str:
    """Extract phone number from text."""
    pattern = r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}"
    matches = re.findall(pattern, text)
    if matches:
        return "".join(["".join(m) for m in matches[:1]])
    return ""


def extract_name(text: str) -> str:
    """Heuristically extract name from top of resume."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:5]:
        # Skip lines that look like headers, emails, or phone numbers
        if (len(line.split()) >= 2 and len(line.split()) <= 5
                and not re.search(r"[@\d|/\\]", line)
                and not any(kw in line.lower() for kw in
                            ["resume", "cv", "curriculum", "address", "linkedin", "github"])):
            return line
    return ""


def extract_linkedin(text: str) -> str:
    """Extract LinkedIn profile URL."""
    pattern = r"(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9\-_%]+"
    matches = re.findall(pattern, text)
    return matches[0] if matches else ""


def extract_github(text: str) -> str:
    """Extract GitHub profile URL."""
    pattern = r"(https?://)?(www\.)?github\.com/[a-zA-Z0-9\-_%]+"
    matches = re.findall(pattern, text)
    return matches[0] if matches else ""


def extract_years_of_experience(text: str) -> int:
    """Estimate total years of experience by parsing date ranges."""
    # Look for year patterns like 2018-2021, 2020 - 2023, Jan 2019 – Dec 2022
    pattern = r"\b(20\d{2}|19\d{2})\b"
    years_found = [int(y) for y in re.findall(pattern, text)]
    if len(years_found) >= 2:
        years_found = sorted(set(years_found))
        # Estimate as span between earliest and latest year
        return max(0, years_found[-1] - years_found[0])
    return 0


def extract_sections(text: str) -> dict:
    """Split resume into named sections heuristically."""
    section_keywords = {
        "summary": ["summary", "objective", "profile", "about me", "career objective"],
        "skills": ["skills", "technical skills", "core competencies", "technologies", "expertise"],
        "experience": ["experience", "work experience", "employment", "professional experience", "work history"],
        "education": ["education", "academic", "qualification", "degree", "university", "college"],
        "projects": ["projects", "personal projects", "notable projects", "side projects"],
        "certifications": ["certifications", "certificates", "courses", "achievements", "awards"],
    }

    lines = text.split("\n")
    current_section = "general"
    sections = {"general": []}

    for line in lines:
        stripped = line.strip().lower()
        matched = False
        for section, keywords in section_keywords.items():
            if any(kw in stripped for kw in keywords) and len(stripped) < 60:
                current_section = section
                sections.setdefault(section, [])
                matched = True
                break
        if not matched and line.strip():
            sections.setdefault(current_section, []).append(line.strip())

    return {k: "\n".join(v) for k, v in sections.items()}


def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """
    Master function: extract all structured info from a resume file.
    Returns a dict with: raw_text, name, email, phone, linkedin, github,
    years_experience, sections.
    """
    ext = os.path.splitext(filename)[-1].lower()
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext in [".docx", ".doc"]:
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Use PDF or DOCX.")

    sections = extract_sections(raw_text)

    return {
        "raw_text": raw_text,
        "filename": filename,
        "name": extract_name(raw_text),
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "linkedin": extract_linkedin(raw_text),
        "github": extract_github(raw_text),
        "years_experience": extract_years_of_experience(raw_text),
        "sections": sections,
    }
