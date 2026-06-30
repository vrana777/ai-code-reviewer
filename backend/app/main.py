from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import app.models as models
from app.database import engine, Base, get_db
from app.ai_engine import execute_ai_review

# 1. Map and generate database tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Code Reviewer API Platform",
    description="Backend gateway managing database records and AI orchestration engines.",
    version="1.0.0"
)

# 2. Configure Cross-Origin Resource Sharing (CORS) rules for our Next.js UI
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define the structural rules for incoming code data
class CodeReviewRequest(BaseModel):
    raw_code: str
    language: str

# 4. Core API Routing Endpoint to execute reviews
@app.post("/api/review")
def create_code_review(payload: CodeReviewRequest, db: Session = Depends(get_db)):
    # A. Guarantee a default test user exists in PostgreSQL to avoid foreign key errors
    test_user = db.query(models.User).filter(models.User.email == "developer@example.com").first()
    if not test_user:
        test_user = models.User(
            email="developer@example.com",
            hashed_password="mock_password_hash"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

    # B. Send the code out to our Gemini AI structural parsing engine
    ai_results = execute_ai_review(payload.raw_code, payload.language)

    # C. Bundle everything and save it directly inside our Postgres tables
    new_review = models.CodeReview(
        user_id=test_user.id,
        filename="workspace_snippet",
        language=payload.language,
        raw_code=payload.raw_code,
        ai_analysis=ai_results
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Reviewer Core Gateway fully integrated with AI Engine and DB active!"
    }
@app.get("/api/history")
def get_review_history(db: Session = Depends(get_db)):
    # Retrieve the 10 most recent reviews from the database
    reviews = db.query(models.CodeReview).order_by(models.CodeReview.id.desc()).limit(10).all()
    return reviews