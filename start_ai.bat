@echo off
echo ===================================================
echo Starting MetaMind AI Python NLP Microservice (Port 8000)...
echo ===================================================

cd ai-service

if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
