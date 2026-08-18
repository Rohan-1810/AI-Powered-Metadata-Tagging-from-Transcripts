@echo off
echo ===================================================
echo Starting MetaMind AI Backend API Gateway (Port 5000)...
echo ===================================================

cd server

if not exist node_modules\mongodb-memory-server (
    echo Installing backend dependencies...
    call npm install
)

npm start
pause
