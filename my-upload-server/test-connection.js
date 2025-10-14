const EmailService = require('./emailService');

async function testEmailConnection() {
  console.log('🔍 Testing email connection...');
  
  const emailService = new EmailService();
  
  try {
    const result = await emailService.testConnection();
    if (result) {
      console.log('✅ Email connection successful!');
    } else {
      console.log('❌ Email connection failed!');
    }
  } catch (error) {
    console.error('❌ Email connection error:', error.message);
  }
}

testEmailConnection();
