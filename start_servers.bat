@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo Starting Gladiator Application
echo ==========================================

:: ==========================================
:: CHECK BACKEND
:: ==========================================
echo Checking Backend configuration...
if not exist "backend\venv\Scripts\activate.bat" (
    echo [INFO] Backend virtual environment not found. Creating it now...
    cd backend
    python -m venv venv
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to create python venv. Make sure Python is installed and in your PATH.
        pause
        exit /b 1
    )
    
    echo [INFO] Installing backend dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install backend requirements.
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Backend setup complete.
)

:: ==========================================
:: CHECK FRONTEND
:: ==========================================
echo Checking Frontend configuration...
if not exist "frontend\node_modules" (
    echo [INFO] Frontend dependencies not found. Installing them now...
    cd frontend
    
    :: Use call npm to ensure batch execution properly handles it
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Frontend setup complete.
)

:: ==========================================
:: START SERVERS
:: ==========================================

:: Start Backend
echo Starting Backend Server...
start "Gladiator Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend
echo Starting Frontend Server...
start "Gladiator Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo Application processes started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo ==========================================
pause
