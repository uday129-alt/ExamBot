@echo off
echo ==========================================================
echo   AI EXAM PAPER GENERATOR & EVALUATOR (MERN + RAG)
echo ==========================================================
echo.
echo [1/3] Launching Node.js Backend Server (Port 5000)...
start "AI Exam Backend" cmd /c "cd backend && npm start"

echo [2/3] Launching Vite Frontend Client (Port 5173)...
start "AI Exam Frontend" cmd /c "cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak > nul

echo [INFO] Opening portal in your default web browser...
start http://localhost:5173

echo.
echo ==========================================================
echo   Both services are now running in background consoles.
echo   Press any key to close this launcher script.
echo ==========================================================
pause > nul
