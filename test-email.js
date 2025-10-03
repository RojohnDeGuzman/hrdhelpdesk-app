const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmailConfig = () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check if .env variables exist
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM;
  
  console.log('📧 Email Configuration:');
  console.log(`   USER: ${emailUser ? '✅ Set' : '❌ Missing'}`);
  console.log(`   PASS: ${emailPass ? '✅ Set' : '❌ Missing'}`);
  console.log(`   FROM: ${emailFrom ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!emailUser || !emailPass) {
    console.log('❌ Missing email credentials!');
    console.log('📝 Please edit your .env file with:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('   EMAIL_FROM=noreply@yourcompany.com\n');
    return false;
  }
  
  // Create transporter with Office 365 configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      ciphers: 'SSLv3'
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
  
  // Test connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email configuration error:');
      console.log(`   ${error.message}\n`);
      
      if (error.code === 'EAUTH') {
        console.log('🔧 Solutions:');
        console.log('   1. Use App Password instead of regular password');
        console.log('   2. Enable 2-Factor Authentication');
        console.log('   3. Generate App Password: https://myaccount.google.com/apppasswords\n');
      }
    } else {
      console.log('✅ Email configuration is working!');
      console.log('📧 Ready to send OTP emails\n');
    }
  });
};

// Run the test
testEmailConfig();
