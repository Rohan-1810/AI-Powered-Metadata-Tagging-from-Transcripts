@echo off
echo ===================================================
echo Launching MetaMind AI Full-Stack Platform...
echo ===================================================

start "MetaMind AI Microservice (Port 8000)" cmd /k "call start_ai.bat"
start "MetaMind Backend API (Port 5000)" cmd /k "call start_server.bat"
start "MetaMind React Client (Port 5173)" cmd /k "call start_client.bat"

echo.
echo All 3 services are starting in separate windows!
echo - Frontend: http://localhost:5173
echo - AI Swagger Docs: http://localhost:8000/docs
echo - Backend API: http://localhost:5000/api
echo.
pause
