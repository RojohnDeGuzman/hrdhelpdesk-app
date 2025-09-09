// Configuration Example for Outlook Email
// Copy this file to config.js and fill in your details

module.exports = {
  // Your Outlook email address
  outlookEmail: 'your-email@outlook.com',
  
  // Your Outlook app password (not your regular password)
  // Instructions:
  // 1. Go to https://account.microsoft.com/security
  // 2. Sign in with your Outlook account
  // 3. Go to "Security" > "Advanced security options"
  // 4. Turn on "Two-step verification" if not already enabled
  // 5. Under "App passwords", click "Create a new app password"
  // 6. Name it "HRD Helpdesk" and copy the generated password
  // 7. Use this password below
  outlookPassword: 'your-app-password-here',
  
  // osTicket email address (where HRD requests will be sent)
  osticketEmail: 'hrm@castotravel.com'
};
