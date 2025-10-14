@echo off
echo 🚀 HRD Helpdesk - Real Email OTP Setup
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo 📝 Creating .env file from template...
    copy env-example.txt .env
    echo ✅ .env file created!
    echo.
    echo 🔧 IMPORTANT: Please edit .env file with your email credentials:
    echo    - EMAIL_USER: Your email address
    echo    - EMAIL_PASS: Your email password or app password
    echo    - EMAIL_FROM: Your sender email address
    echo.
    echo 📧 For Gmail users:
    echo    1. Enable 2-Factor Authentication
    echo    2. Generate App Password: https://myaccount.google.com/apppasswords
    echo    3. Use the App Password in EMAIL_PASS
    echo.
    pause
)

echo 🖥️  Starting backend server...
start "HRD Backend" cmd /k "node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

echo 🌐 Starting frontend...
start "HRD Frontend" cmd /k "npm start"

echo.
echo ✅ HRD Helpdesk is starting!
echo 📧 Backend API: http://localhost:5000
echo 🌐 Frontend App: http://localhost:3000
echo.
echo 🔧 Both servers are starting in separate windows
echo 📧 Configure your email settings in .env file before testing
pause
