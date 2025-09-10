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
    console.log('📧 Email Service - Using NEW PROFESSIONAL template version 2.0');
      
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

  // Create email content - COMPACT VERSION
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

    // Get current timestamp
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
            color: #2c3e50; 
            margin: 0; 
            padding: 0; 
            background-color: #ecf0f1;
          }
          .container { 
            max-width: 700px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid #bdc3c7;
          }
          .header { 
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); 
            color: white; 
            padding: 25px; 
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
            margin: 0; 
            font-size: 24px; 
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            letter-spacing: 0.5px;
          }
          .content { 
            padding: 30px; 
            background: #ffffff;
          }
          .field-line {
            margin-bottom: 12px;
            line-height: 1.6;
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
          }
          .field-line:last-child { 
            border-bottom: none; 
            margin-bottom: 0;
          }
          .label { 
            font-weight: 700; 
            color: #2c3e50; 
            font-size: 14px;
            display: inline;
            min-width: 140px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 12px;
          }
          .value { 
            font-size: 14px;
            color: #34495e;
            display: inline;
            font-weight: 400;
            margin-left: 8px;
          }
          .footer { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            padding: 20px 30px; 
            border-top: 1px solid #dee2e6;
            font-size: 12px; 
            color: #6c757d;
            text-align: center;
            font-weight: 500;
          }
          .priority-badge {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 10px;
          }
          .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #27ae60;
            border-radius: 50%;
            margin-right: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-content">
              <h1>🎯 HRD Helpdesk Request</h1>
            </div>
          </div>

          <div class="content">
    `;

    // Only show fields that have values - start with essential fields
    if (formType && formType.trim() !== '') {
      html += `
            <div class="field-line">
              <span class="label">Form Type:</span> <span class="value">${formType}</span>
            </div>
      `;
    }

    // Requester is always required, but show fallback if missing
    if (name && name.trim() !== '') {
      html += `
            <div class="field-line">
              <span class="label">Requester:</span> <span class="value">${name} (${email})</span>
            </div>
      `;
    } else {
      html += `
            <div class="field-line">
              <span class="label">Requester:</span> <span class="value">${email}</span>
            </div>
      `;
    }

    if (divisionmanager && divisionmanager.trim() !== '') {
      html += `
            <div class="field-line">
              <span class="label">Division/Manager:</span> <span class="value">${divisionmanager}</span>
            </div>
      `;
    }

    if (subject && subject.trim() !== '') {
      html += `
            <div class="field-line">
              <span class="label">Subject:</span> <span class="value">${subject}</span>
            </div>
      `;
    }

    if (description && description.trim() !== '') {
      html += `
            <div class="field-line">
              <span class="label">Description:</span> <span class="value">${description}</span>
            </div>
      `;
    }

    // Add other form fields dynamically (exclude unwanted fields and empty values)
    const excludedFields = ['attachments', 'ntLogin', 'userVerification', 'title', 'formType', 'name', 'email', 'divisionmanager', 'subject', 'description'];
    const meaningfulFields = ['reason', 'adjustmentType', 'salaryPeriod', 'employeeName', 'currentDept', 'effectiveDate', 'fromDate', 'toDate', 'requestedAgent', 'funddepartment', 'agentName', 'fromDept', 'toDept', 'emergencyContact', 'contactNumber', 'address', 'ccEmail'];
    
    console.log('📧 Email Service - Processing other fields:', Object.keys(otherFields));
    console.log('📧 Email Service - Meaningful fields to include:', meaningfulFields);
    
    Object.entries(otherFields).forEach(([key, value]) => {
      // Only show if field has value, is not excluded, and is meaningful
      if (value && value.toString().trim() !== '' && 
          !excludedFields.includes(key) && 
          meaningfulFields.includes(key)) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`📧 Email Service - Adding field: ${key} = ${value}`);
        html += `
            <div class="field-line">
              <span class="label">${label}:</span> <span class="value">${value}</span>
            </div>
        `;
      }
    });

    html += `
          </div>

          <div class="footer">
            <div><span class="status-indicator"></span>HRD Helpdesk System</div>
            <div style="margin-top: 8px; font-size: 11px; color: #95a5a6;">Generated on ${timestamp}</div>
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
