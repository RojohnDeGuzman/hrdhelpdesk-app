const EmailService = require('./emailService');

async function testEmail() {
  console.log('🧪 Testing Email Service...\n');
  
  const emailService = new EmailService();
  
  // Test connection
  console.log('1. Testing connection...');
  const isConnected = await emailService.testConnection();
  
  if (isConnected) {
    console.log('✅ Email service is ready!\n');
    
    // Test sending a sample email
    console.log('2. Testing email sending...');
    const testFormData = {
      name: 'Test User',
      email: 'test@example.com',
      divisionmanager: 'Test Manager',
      description: 'This is a test email from HRD Helpdesk',
      title: 'Test Request'
    };
    
    const result = await emailService.sendHRDRequest(testFormData);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your HR email inbox for the test email.');
    } else {
      console.log('❌ Failed to send test email:', result.error);
    }
  } else {
    console.log('❌ Email service connection failed!');
    console.log('Please check your config.js settings.');
  }
}

testEmail().catch(console.error);
