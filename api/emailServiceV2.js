const nodemailer = require('nodemailer');

// Email configuration for Vercel serverless functions
const emailConfig = {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'hrd-helpdesk@castotravel.ph',
    pass: 'wngxrmcmqwhzgnrd'
  },
  tls: {
    ciphers: 'SSLv3'
  },
  // Add timeout settings for Vercel
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000      // 10 seconds
};

class EmailServiceV2 {
  constructor() {
    console.log('🔧 EmailServiceV2 - Using email: hrd-helpdesk@castotravel.ph');
    console.log('🔧 EmailServiceV2 - Using hardcoded credentials approach');
    
    console.log('🔧 EmailServiceV2 - Initializing with nodemailer');
    console.log('🔧 EmailServiceV2 - Nodemailer type:', typeof nodemailer);
    console.log('🔧 EmailServiceV2 - Available methods:', Object.getOwnPropertyNames(nodemailer));
    
    try {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ EmailServiceV2 - Transporter created successfully');
    } catch (error) {
      console.error('❌ EmailServiceV2 - Error creating transporter:', error);
      throw error;
    }
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }

  // Send HRD Helpdesk form submission to osTicket
  async sendHRDRequest(formData, attachments = []) {
    try {
      console.log('📧 Email Service - Received form data:', JSON.stringify(formData, null, 2));
      console.log('📎 Email Service - Received attachments:', JSON.stringify(attachments, null, 2));
      
      const {
        name,
        email,
        divisionmanager,
        subject,
        description,
        formType,
        priority = 'Normal',
        department = 'HRD'
      } = formData;

      // Create email content
      const emailContent = this.createEmailContent(formData, attachments);
      
      // Prepare mail options
      const mailOptions = {
        from: `"${name}" <hrd-helpdesk@castotravel.ph>`,
        to: 'hrd-helpdesk@castotravel.ph', // Your osTicket email
        cc: email, // CC the user
        replyTo: email, // Set reply-to as user's email
        subject: `${name} - ${subject} [HRD Helpdesk]`,
        html: emailContent,
        // Add custom headers for osTicket integration
        headers: {
          'X-Original-Sender': email,
          'X-Sender-Name': name,
          'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@castotravel.ph>`,
          'X-Priority': priority === 'High' ? '1' : '3',
          'X-MSMail-Priority': priority === 'High' ? 'High' : 'Normal',
          'Importance': priority === 'High' ? 'high' : 'normal',
          'X-Mailer': 'HRD Helpdesk System v1.0'
        }
      };

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map(attachment => ({
          filename: attachment.originalname,
          content: Buffer.from(attachment.buffer), // Convert array back to Buffer
          contentType: attachment.mimetype
        }));
      }

      console.log('📧 Email Service - Sending email with options:', JSON.stringify(mailOptions, null, 2));

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);

      return {
        success: true,
        message: 'Email sent successfully to osTicket',
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Email Service - Error sending email:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }
  }

  // Create email content
  createEmailContent(formData, attachments) {
    const {
      name,
      email,
      divisionmanager,
      subject,
      description,
      formType,
      priority = 'Normal',
      department = 'HRD',
      ...otherFields
    } = formData;

    // Get current timestamp and user info
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>HRD Helpdesk Request</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .header-content { position: relative; z-index: 1; }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 300;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .header .subtitle { 
            font-size: 16px; 
            opacity: 0.9; 
            margin: 0;
          }
          .ticket-info { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 15px; 
            border-radius: 6px; 
            margin-top: 20px;
            backdrop-filter: blur(10px);
          }
          .ticket-info .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
          }
          .ticket-info .info-row:last-child { margin-bottom: 0; }
          .ticket-info .label { font-weight: 600; opacity: 0.9; }
          .ticket-info .value { font-weight: 500; }
          .content { padding: 30px; }
          .field { 
            margin-bottom: 20px; 
            border-left: 4px solid #667eea;
            padding-left: 15px;
          }
          .field .label { 
            font-weight: 600; 
            color: #495057; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .field .value { 
            margin-top: 5px; 
            padding: 12px 15px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
            font-size: 15px;
            line-height: 1.5;
          }
          .field .value.email { 
            color: #007bff; 
            text-decoration: none;
            font-weight: 500;
          }
          .priority-high { 
            color: #dc3545; 
            font-weight: 600; 
            background: #f8d7da;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            text-transform: uppercase;
          }
          .priority-medium { 
            color: #fd7e14; 
            font-weight: 600; 
            background: #fff3cd;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            text-transform: uppercase;
          }
          .priority-low { 
            color: #28a745; 
            font-weight: 600; 
            background: #d4edda;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            text-transform: uppercase;
          }
          .attachments { 
            margin-top: 25px; 
            padding: 20px; 
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 8px; 
            border: 1px solid #e1f5fe;
          }
          .attachments h3 { 
            margin: 0 0 15px 0; 
            color: #1976d2; 
            font-size: 16px;
            font-weight: 600;
          }
          .attachment-item { 
            background: white; 
            padding: 10px 15px; 
            margin: 8px 0; 
            border-radius: 6px; 
            border: 1px solid #e3f2fd;
            display: flex;
            align-items: center;
          }
          .attachment-icon { 
            margin-right: 10px; 
            font-size: 18px; 
          }
          .footer { 
            margin-top: 30px; 
            padding: 25px 30px; 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-top: 1px solid #dee2e6;
            font-size: 13px; 
            color: #6c757d;
            text-align: center;
          }
          .footer .system-info { 
            font-weight: 600; 
            color: #495057; 
            margin-bottom: 10px;
          }
          .footer .timestamp { 
            color: #6c757d; 
            font-size: 12px;
          }
          .user-verification {
            background: #e8f5e8;
            border: 1px solid #c3e6c3;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .user-verification h4 {
            margin: 0 0 10px 0;
            color: #155724;
            font-size: 14px;
            font-weight: 600;
          }
          .user-verification .info {
            font-size: 13px;
            color: #155724;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-content">
              <h1>🎯 HRD Helpdesk Request</h1>
              <p class="subtitle">New Support Ticket Submitted</p>
              <div class="ticket-info">
                <div class="info-row">
                  <span class="label">Form Type:</span>
                  <span class="value">${formType || 'General Request'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Priority:</span>
                  <span class="value priority-${priority.toLowerCase()}">${priority}</span>
                </div>
                <div class="info-row">
                  <span class="label">Department:</span>
                  <span class="value">${department}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="user-verification">
              <h4>🔐 User Verification</h4>
              <div class="info">
                <strong>Submitted by:</strong> ${name} (${email})<br>
                <strong>Submission Time:</strong> ${timestamp}<br>
                <strong>IP Address:</strong> ${formData.userVerification?.ipAddress || 'Unknown'}<br>
                <strong>Browser:</strong> ${formData.userVerification?.browser || 'Unknown'}<br>
                <strong>Operating System:</strong> ${formData.userVerification?.os || 'Unknown'}
              </div>
            </div>

            <div class="field">
              <div class="label">👤 Requester Name</div>
              <div class="value">${name}</div>
            </div>

            <div class="field">
              <div class="label">📧 Email Address</div>
              <div class="value email">${email}</div>
            </div>

            <div class="field">
              <div class="label">🏢 Division/Manager</div>
              <div class="value">${divisionmanager || 'Not specified'}</div>
            </div>

            <div class="field">
              <div class="label">📋 Subject</div>
              <div class="value">${subject || 'No subject provided'}</div>
            </div>

            <div class="field">
              <div class="label">📝 Description</div>
              <div class="value">${description || 'No description provided'}</div>
            </div>
    `;

    // Add other form fields dynamically
    Object.entries(otherFields).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'attachments') {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        html += `
          <div class="field">
            <div class="label">📄 ${label}:</div>
            <div class="value">${value}</div>
          </div>
        `;
      }
    });

    // Add attachments section if any
    if (attachments && attachments.length > 0) {
      html += `
        <div class="attachments">
          <h3>📎 Attachments (${attachments.length})</h3>
          <ul>
      `;
      attachments.forEach(attachment => {
        html += `<li>${attachment.originalname} (${attachment.mimetype})</li>`;
      });
      html += `
          </ul>
        </div>
      `;
    }

    html += `
        </div>

          <div class="footer">
            <div class="system-info">📧 This email was sent from the HRD Helpdesk System</div>
            <p>Please reply directly to this email to respond to the requester.</p>
            <p>This ticket has been automatically logged in our system for tracking and follow-up.</p>
            <div class="timestamp">Generated on: ${timestamp}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  // Send feedback email
  async sendFeedbackEmail(feedbackData) {
    try {
      const { rating, feedback, name, email, timestamp } = feedbackData;

      const stars = '⭐'.repeat(rating);
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Feedback & Suggestions</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .rating { font-size: 24px; margin: 10px 0; }
            .feedback { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .footer { margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>💬 Feedback & Suggestions</h2>
            <p><strong>Rating:</strong> <span class="rating">${stars}</span> (${rating}/5)</p>
          </div>

          <div class="content">
            <div class="feedback">
              <strong>Feedback:</strong><br>
              ${feedback}
            </div>
            
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>

          <div class="footer">
            <p>This feedback was submitted through the HRD Helpdesk System.</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: '"HRD Helpdesk System" <hrd-helpdesk@castotravel.ph>',
        to: 'hrd-helpdesk@castotravel.ph',
        cc: email,
        replyTo: email,
        subject: `Feedback & Suggestions - ${name} [HRD Helpdesk]`,
        html: emailContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Feedback email sent successfully:', result.messageId);

      return {
        success: true,
        message: 'Feedback sent successfully!',
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error sending feedback email:', error);
      return {
        success: false,
        message: 'Failed to send feedback',
        error: error.message
      };
    }
  }
}

module.exports = EmailServiceV2;
