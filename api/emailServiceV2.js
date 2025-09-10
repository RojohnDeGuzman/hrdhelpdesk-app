const nodemailer = require('nodemailer');

// Email configuration for Vercel serverless functions
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.office365.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing required environment variables: EMAIL_USER and EMAIL_PASS must be set');
    }
    
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

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>HRD Helpdesk Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: #f9f9f9; border-radius: 3px; }
          .priority-high { color: #d32f2f; font-weight: bold; }
          .priority-normal { color: #1976d2; }
          .attachments { margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px; }
          .footer { margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🎯 HRD Helpdesk Request</h2>
          <p><strong>Form Type:</strong> ${formType}</p>
          <p><strong>Priority:</strong> <span class="priority-${priority.toLowerCase()}">${priority}</span></p>
        </div>

        <div class="content">
          <div class="field">
            <div class="label">👤 Requester Name:</div>
            <div class="value">${name}</div>
          </div>

          <div class="field">
            <div class="label">📧 Email Address:</div>
            <div class="value">${email}</div>
          </div>

          <div class="field">
            <div class="label">🏢 Division/Manager:</div>
            <div class="value">${divisionmanager || 'Not specified'}</div>
          </div>

          <div class="field">
            <div class="label">📋 Subject:</div>
            <div class="value">${subject}</div>
          </div>

          <div class="field">
            <div class="label">📝 Description:</div>
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
          <p><strong>📧 This email was sent from the HRD Helpdesk System</strong></p>
          <p>Please reply directly to this email to respond to the requester.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
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
