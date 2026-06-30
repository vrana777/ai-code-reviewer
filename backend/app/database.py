import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Calculate the absolute path of the backend folder to find .env reliably on Windows
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")

# 2. Force-load the .env file from its absolute location
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Graceful check to inform you if the environmental variable was missed
if not DATABASE_URL:
    raise ValueError(
        "\n\n❌ ERROR: DATABASE_URL variable is missing or empty!\n"
        "Please check your '.env' file inside your 'backend/' folder.\n"
        f"Expected File Path: {env_path}\n"
        "It must contain exactly: DATABASE_URL=postgresql://postgres:password123@localhost:5432/ai_reviewer_db\n"
    )

# 4. Create the connection engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

