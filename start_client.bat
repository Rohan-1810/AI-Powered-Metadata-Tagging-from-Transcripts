@echo off
echo Starting MetaMind AI React Frontend Client (Port 5173)...
cd client
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
npm run dev
pause
