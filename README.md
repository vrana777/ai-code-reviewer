# AI Code Reviewer Hub

A sleek, full-stack automated code analysis platform that provides real-time static checks, security auditing, and language-specific structural refactoring suggestions powered by the Gemini 2.5 Flash model.

## 🚀 Features
* **Language-Aware Reviews:** Tailored feedback patterns for Python, JavaScript, TypeScript, and Java.
* **Interactive Code Workspace:** Live text highlighter container with automatic syntax styling.
* **Persistent History Log:** Slide-out tracking sidebar feeding directly from a local PostgreSQL database layer.
* **One-Click Utility:** Integrated copy-to-clipboard actions for instant refactored code extraction.

## 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons, PrismJS
* **Backend:** FastAPI (Python), SQLAlchemy
* **Database:** PostgreSQL
* **AI Core:** Google Gemini 2.5 Flash API

---

## 💻 Local Setup Instructions

### 1. Prerequisites
Make sure you have Python, Node.js, and PostgreSQL installed on your machine.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
2. Create and activate a virtual environment:
   python -m venv venv
   venv\Scripts\activate
3. Install required packages:
   pip install -r requirements.txt
4. Create a .env file inside the backend/ directory using the provided template:
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_code_reviewer
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
5. Run the development server:
uvicorn app.main:app --reload

### 2. Frontend Setup
1. Navigate to the frontend directory:
   cd ../frontend
2. Install the web dependencies:
   npm install
3. Run the Next.js local server:
   npm run dev
4. Open your browser and view the application at http://localhost:3000.
---
