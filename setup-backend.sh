#!/bin/bash

# HRD Helpdesk Backend Setup Script
echo "🚀 Setting up HRD Helpdesk Backend..."

# Create backend directory if it doesn't exist
if [ ! -d "backend" ]; then
    mkdir backend
    echo "📁 Created backend directory"
fi

# Copy server files to backend directory
cp server.js backend/
cp backend-package.json backend/package.json
cp env-example.txt backend/.env.example

echo "📋 Backend files copied successfully"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "✅ Backend setup complete!"
echo ""
echo "📧 Next steps:"
echo "1. Copy backend/.env.example to backend/.env"
echo "2. Configure your email settings in backend/.env"
echo "3. Run 'npm start' in the backend directory"
echo "4. Your API will be available at http://localhost:5000"
echo ""
echo "🔧 Email Configuration:"
echo "- For Gmail: Use your Gmail address and App Password"
echo "- For Outlook: Use your Outlook email and password"
echo "- For Yahoo: Use your Yahoo email and App Password"
echo ""
echo "📚 See env-example.txt for detailed configuration options"
