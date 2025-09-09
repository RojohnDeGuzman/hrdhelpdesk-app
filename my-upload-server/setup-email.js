#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 HRD Helpdesk Email Setup');
console.log('============================\n');

// Check if config.js exists
const configPath = path.join(__dirname, 'config.js');
const examplePath = path.join(__dirname, 'config.example.js');

if (!fs.existsSync(configPath)) {
  if (fs.existsSync(examplePath)) {
    console.log('📋 Creating config.js from example...');
    fs.copyFileSync(examplePath, configPath);
    console.log('✅ config.js created successfully!\n');
    
    console.log('📝 Next steps:');
    console.log('1. Edit config.js with your Outlook email details');
    console.log('2. Create an App Password at: https://account.microsoft.com/security');
    console.log('3. Run: npm start');
    console.log('4. Test: http://localhost:3001/test-email\n');
  } else {
    console.log('❌ config.example.js not found!');
    process.exit(1);
  }
} else {
  console.log('✅ config.js already exists');
}

// Check if nodemailer is installed
try {
  require('nodemailer');
  console.log('✅ Nodemailer is installed');
} catch (error) {
  console.log('❌ Nodemailer not found. Installing...');
  console.log('Run: npm install nodemailer');
}

console.log('\n🎯 Setup complete! Follow the README-EMAIL-SETUP.md for detailed instructions.');
