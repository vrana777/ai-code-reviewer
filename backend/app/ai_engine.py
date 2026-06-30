import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load configurations from our system .env file
load_dotenv()

# Authenticate the Google GenAI SDK
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def execute_ai_review(raw_code: str, language: str) -> dict:
    """
    Interfaces with the Gemini API to analyze raw source code
    using tailored language-specific rulesets.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    # Define specialized audit focus areas based on the selected framework language
    language_rules = {
        "Python": "Focus on PEP 8 compliance, proper indentation, exception handling block closures, list comprehensions, and runtime efficiency.",
        "JavaScript": "Focus on modern ES6+ syntax standards, avoiding global scope pollution, promise/async-await handling, and memory leaks.",
        "TypeScript": "Focus heavily on explicit type safety, eliminating 'any' type abuses, interface design, and strict null/undefined checks.",
        "Java": "Focus on object-oriented design patterns, proper garbage collection handling, stream optimizations, and explicit null-pointer safety.",
        "C++": "Focus intensely on manual memory management (tracking pointers/delete), buffer overflow risks, efficient pass-by-reference habits, and RAII principles."
    }
    
    # Fallback default rule if a language isn't explicitly mapped
    specific_focus = language_rules.get(language, "Focus on general clean code practices, structural bugs, and standard algorithmic optimizations.")

    # Construct the highly targeted prompt enforcing structured JSON constraints
    prompt = f"""
    You are an elite Senior Staff Full-Stack and AppSec Engineer. Analyze the following {language} code.
    
    CRITICAL LANGUAGE FOCUS AUDIT RULE:
    {specific_focus}

    You must respond ONLY with a raw JSON object containing exactly these three text string properties:
    {{
      "bugs": "List any logical errors, syntax bugs, security gaps, or language-specific issues found.",
      "optimization": "Provide step-by-step performance optimizations or modern idioms/best practices for this specific language.",
      "improved_code": "Output the fully refactored, cleaned, and perfectly commented version of the code snippet."
    }}
    Do not include markdown blocks like ```json in your response. Output raw, pure stringified JSON.

    Source Code to Inspect:
    {raw_code}
    """
    
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.strip()
        
        # Strip out markdown code formatting if the LLM auto-injects it
        if clean_text.startswith("```json"):
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text.split("```")[1].split("```")[0].strip()

        return json.loads(clean_text)
    except Exception as err:
        return {
            "bugs": f"Failed parsing structural metrics during active execution runtime. Error: {str(err)}",
            "optimization": "Review system console outputs for active debugging information.",
            "improved_code": raw_code
        }