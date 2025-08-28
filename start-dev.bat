@echo off
echo ========================================
echo   HabitTracker Development Startup
echo ========================================
echo.

echo Starting MongoDB (if installed locally)...
echo Note: If MongoDB is not installed, the server will retry connection
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo   Development Environment Started!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
