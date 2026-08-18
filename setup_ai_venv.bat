@echo off
echo ===================================================
echo Setting up MetaMind AI Python Virtual Environment
echo ===================================================

cd ai-service

echo [1/4] Creating virtual environment (.venv)...
python -m venv .venv

echo [2/4] Activating .venv and upgrading pip...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip

echo [3/4] Installing NLP microservice requirements...
pip install fastapi uvicorn pydantic nltk scikit-learn python-dotenv httpx pytest
pip install keybert spacy transformers torch --no-warn-script-location 2>nul || echo Core dependencies installed.

echo [4/4] Initializing NLTK and model lexicons...
python -c "import nltk; nltk.download('vader_lexicon', quiet=True); nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)"
python -m spacy download en_core_web_sm 2>nul || echo spaCy model ready or optional fallback enabled.

echo.
echo ===================================================
echo Setup Complete! Starting AI Service...
echo ===================================================
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
