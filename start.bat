@echo off
title PrepPilot Launcher
color 0E

echo.
echo  ====================================
echo    PrepPilot - Starting All Services
echo  ====================================
echo.

:: Get the directory where this script lives
set "ROOT=%~dp0"
cd /d "%ROOT%"

:: Step 1: Seed database idempotently so new problems are added on update
if not exist "data\prep_pilot.db" (
    echo  [1/3] Seeding problem bank...
    python -m backend.seed_problems
    echo.
) else (
    echo  [1/3] Updating problem bank...
    python -m backend.seed_problems
    echo.
)

:: Step 2: Install frontend deps if needed
if not exist "frontend\node_modules" (
    echo  [2/3] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
) else (
    echo  [2/3] Frontend dependencies already installed.
)

:: Step 3: Launch both services
echo  [3/3] Starting services...
echo.
echo  Backend:   http://localhost:8000
echo  API Docs:  http://localhost:8000/docs
echo  Dashboard: http://localhost:3000
echo.

:: Start backend in a new window
start "PrepPilot Backend (FastAPI)" cmd /k "cd /d %ROOT% && color 0A && echo. && echo  PrepPilot Backend - FastAPI && echo  http://localhost:8000 && echo. && python -m uvicorn backend.main:app --reload --port 8000"

:: Wait a moment for backend to initialize
timeout /t 3 /noq >nul

:: Start frontend in a new window
start "PrepPilot Frontend (Next.js)" cmd /k "cd /d %ROOT%\frontend && color 0B && echo. && echo  PrepPilot Frontend - Next.js && echo  http://localhost:3000 && echo. && npm run dev"

:: Wait then open the dashboard
timeout /t 5 /noq >nul
start http://localhost:3000

echo.
echo  All services started!
echo  Close this window anytime - services run independently.
echo.
pause
