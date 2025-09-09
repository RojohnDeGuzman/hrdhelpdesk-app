// Email Configuration for Office 365 SMTP
let config;
try {
  config = require('./config.js');
} catch (error) {
  console.log('⚠️  config.js not found. Using default values. Please copy config.example.js to config.js');
  config = {
    office365Email: 'hrd-helpdesk@castotravel.ph',
    office365Password: 'your-password',
    osticketEmail: 'hrd-helpdesk@castotravel.ph'
  };
}

module.exports = {
  // Office 365 SMTP Settings
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.office365Email,
    pass: config.office365Password
  },
  tls: {
    ciphers: 'SSLv3'
  }
};

// Instructions for setting up Outlook App Password:
// 1. Go to https://account.microsoft.com/security
// 2. Sign in with your Outlook account
// 3. Go to "Security" > "Advanced security options"
// 4. Turn on "Two-step verification" if not already enabled
// 5. Under "App passwords", click "Create a new app password"
// 6. Name it "HRD Helpdesk" and copy the generated password
// 7. Use this password in the OUTLOOK_PASSWORD environment variable
