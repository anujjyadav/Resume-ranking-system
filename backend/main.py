from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import ranking, recommendation, parsing

app = FastAPI(
    title="Resume Ranking System API",
    description="AI-powered resume ranking and job role recommendation using Sentence-BERT",
    version="1.0.0",
)

app.add_middleware(
# Allow requests from the React frontend dev server
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(ranking.router, prefix="/api", tags=["Ranking"])
app.include_router(recommendation.router, prefix="/api", tags=["Recommendation"])
app.include_router(parsing.router, prefix="/api", tags=["Parsing"])


@app.get("/")
def root():
    return {"message": "Resume Ranking System API is running ✅", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
