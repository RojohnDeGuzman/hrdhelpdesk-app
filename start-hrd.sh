#!/bin/bash

# HRD Helpdesk Startup Script
echo "🚀 Starting HRD Helpdesk with Real Email OTP..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env file from template..."
    cp env-example.txt .env
    echo "✅ .env file created!"
    echo ""
    echo "🔧 IMPORTANT: Please edit .env file with your email credentials:"
    echo "   - EMAIL_USER: Your email address"
    echo "   - EMAIL_PASS: Your email password or app password"
    echo "   - EMAIL_FROM: Your sender email address"
    echo ""
    echo "📧 For Gmail users:"
    echo "   1. Enable 2-Factor Authentication"
    echo "   2. Generate App Password: https://myaccount.google.com/apppasswords"
    echo "   3. Use the App Password in EMAIL_PASS"
    echo ""
    read -p "Press Enter after configuring .env file..."
fi

# Start the backend server
echo "🖥️  Starting backend server..."
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend
echo "🌐 Starting frontend..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ HRD Helpdesk is running!"
echo "📧 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:3000"
echo ""
echo "🔧 To stop the servers, press Ctrl+C"

# Wait for user to stop
wait
