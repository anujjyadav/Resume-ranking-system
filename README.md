 <!-- ResumeAI — Resume Ranking & Job Role Recommendation System -->

An AI-powered  project that uses **Sentence-BERT** + **NLP** to:
1. **Rank resumes** against a job description (Recruiter View)
2. **Suggest job roles** based on a candidate's resume (Job Seeker View)

---

 <!-- Project Structure -->

```
resume-ranking-system/
├── backend/           # Python + FastAPI ML backend
│   ├── main.py
│   ├── requirements.txt
│   ├── core/          # ML engine (parser, embedder, scorer, recommender)
│   ├── api/routes/    # REST API endpoints
│   └── data/          # Skills taxonomy + job roles JSON
│
└── frontend/          # React + Vite UI
    └── src/
        ├── pages/     # Home, RecruiterView, JobSeekerView
        └── components/ # FileUpload, ResultCard, RoleCard, ScoreGauge
```

---

 <!-- Setup & Run -->

 <!-- 1. Backend Setup -->

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Pre-compute job role embeddings (run once)
python precompute_embeddings.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

 <!-- 2. Frontend Setup -->

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App available at: http://localhost:5173

---

 <!-- 🧠 ML Architecture -->

| Layer | Method | Details |
|---|---|---|
| **Text Extraction** | PyMuPDF + python-docx | PDF & DOCX support |
| **Skill Extraction** | Regex + Skills Taxonomy | 200+ curated skills |
| **Semantic Embedding** | `all-MiniLM-L6-v2` (SBERT) | 384-dim vectors |
| **Scoring** | Hybrid (50% semantic + 35% skill + 15% experience) | Explained scores |
| **Role Recommendation** | Pre-computed role embeddings + cosine similarity | 25 job roles |

---

<!-- 🔌 API Endpoints -->

| Endpoint | Method | Description |
|---|---|---|
| `/api/rank-resumes` | POST | Rank multiple resumes vs JD |
| `/api/suggest-roles` | POST | Get role recommendations from resume |
| `/api/parse-resume` | POST | Parse a single resume |
| `/docs` | GET | Interactive Swagger UI |

---

 <!--  Features -->

- **Recruiter View**: Upload JD + multiple resumes → ranked candidates with match %, skill breakdown, and hiring tags
- **Job Seeker View**: Upload resume → top job role matches with skill gap analysis
- **Explainability**: Every score broken down into semantic, skill, and experience components
- **Dark glassmorphism UI** with animated score gauges and skill pills
- **No external APIs** — runs fully offline with local SBERT model
