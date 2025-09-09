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
  }
};

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter(emailConfig);
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
        description,
        title,
        // Extract all other fields dynamically
      } = formData;

      // Create email subject
      const subject = `${name} - ${title} [HRD Helpdesk]`;

      // Create comprehensive email body with all form fields
      const formatField = (label, value) => {
        if (!value || value === '') return '';
        return `<p style="margin: 3px 0; font-size: 13px;"><strong>${label}:</strong> ${value}</p>`;
      };

      // Helper function to format field labels
      const formatFieldLabel = (key) => {
        return key
          .replace(/([A-Z])/g, ' $1') // Add space before capital letters
          .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
          .replace(/\b(Id|Url|Email|Phone|Fax|Ssn|Dob|Zip|Usa|Uk|Us|Hr|It|Pm|Am|Qa|Ui|Ux|Api|Csv|Pdf|Jpg|Png|Gif|Mp4|Mp3|Wav|Avi|Mov|Wmv|Flv|Webm|Ogg|Mkv|3gp|M4v|Ts|M2ts|Mts|Vob|Asf|Rm|Rmv|Divx|Xvid|H264|H265|Vp8|Vp9|Av1|Hevc|Aac|Mp3|Wma|Flac|Alac|Ogg|Wav|Aiff|Au|Ra|M4a|Aac|Opus|Vorbis|Speex|Gsm|Dct|Vox|Snd|Raw|Pcm|Adpcm|G721|G722|G723|G726|G728|G729|Gsm|Msadpcm|Imaadpcm|Dviadpcm|Yamaha|Dk3|Dk4|Dk5|Dk6|Dk7|Dk8|Dk9|Dk10|Dk11|Dk12|Dk13|Dk14|Dk15|Dk16|Dk17|Dk18|Dk19|Dk20|Dk21|Dk22|Dk23|Dk24|Dk25|Dk26|Dk27|Dk28|Dk29|Dk30|Dk31|Dk32|Dk33|Dk34|Dk35|Dk36|Dk37|Dk38|Dk39|Dk40|Dk41|Dk42|Dk43|Dk44|Dk45|Dk46|Dk47|Dk48|Dk49|Dk50|Dk51|Dk52|Dk53|Dk54|Dk55|Dk56|Dk57|Dk58|Dk59|Dk60|Dk61|Dk62|Dk63|Dk64|Dk65|Dk66|Dk67|Dk68|Dk69|Dk70|Dk71|Dk72|Dk73|Dk74|Dk75|Dk76|Dk77|Dk78|Dk79|Dk80|Dk81|Dk82|Dk83|Dk84|Dk85|Dk86|Dk87|Dk88|Dk89|Dk90|Dk91|Dk92|Dk93|Dk94|Dk95|Dk96|Dk97|Dk98|Dk99|Dk100)\b/g, '$1') // Preserve common acronyms
          .trim();
      };

      // Build comprehensive form data section
      let formFieldsHTML = '';
      Object.keys(formData).forEach(key => {
        if (key !== 'attachments' && formData[key] && formData[key] !== '') {
          const label = formatFieldLabel(key);
          formFieldsHTML += formatField(label, formData[key]);
        }
      });

      // Create HTML email body
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>HRD Helpdesk Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">HRD Helpdesk Request</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">New request submitted through the HRD Helpdesk system</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 16px;">📧 Request Submitted By</h3>
              <p style="margin: 0; font-weight: bold; font-size: 18px;">${name}</p>
              <p style="margin: 5px 0 0 0; color: #666;">${email}</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Request Details</h3>
              ${formFieldsHTML}
            </div>

            ${attachments.length > 0 ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">📎 Attachments</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${attachments.map(att => `<li style="margin: 5px 0;">${att.originalname}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
              <p style="margin: 0; font-size: 14px; color: #1976d2;">
                <strong>IMPORTANT:</strong> Reply directly to this email to respond to the employee. Your reply will be sent to: ${email}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; font-size: 12px; color: #666;">
            <p style="margin: 0;">📧 This request was submitted through the HRD Helpdesk system.</p>
            <p style="margin: 5px 0 0 0;">Submitted on: ${new Date().toLocaleString('en-US', { 
              timeZone: 'Asia/Manila',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}</p>
            <p style="margin: 5px 0 0 0;">System: HRD Helpdesk Application</p>
          </div>
        </body>
        </html>
      `;

      // Create plain text version
      const textBody = `
HRD Helpdesk Request

Request Submitted By:
${name}
${email}

Request Details:
${Object.keys(formData)
  .filter(key => key !== 'attachments' && formData[key] && formData[key] !== '')
  .map(key => `${formatFieldLabel(key)}: ${formData[key]}`)
  .join('\n')}

${attachments.length > 0 ? `Attachments:\n${attachments.map(att => `- ${att.originalname}`).join('\n')}\n` : ''}

IMPORTANT: Reply directly to this email to respond to the employee. Your reply will be sent to: ${email}

This request was submitted through the HRD Helpdesk system.
Submitted on: ${new Date().toLocaleString('en-US', { 
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
})}
System: HRD Helpdesk Application
      `;

      // Prepare email options
      const mailOptions = {
        from: {
          name: 'HRD Helpdesk System',
          address: 'hrd-helpdesk@castotravel.ph'
        },
        to: 'hrd-helpdesk@castotravel.ph',
        cc: email, // CC the user so they get a copy
        replyTo: email, // Set reply-to to user's email for threading
        subject: subject,
        text: textBody,
        html: htmlBody,
        // Add custom headers for osTicket integration
        headers: {
          'X-Original-Sender': email,
          'X-Sender-Name': name,
          'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@castotravel.ph>`,
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Mailer': 'HRD Helpdesk System'
        }
      };

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map(attachment => ({
          filename: attachment.originalname,
          content: attachment.buffer,
          contentType: attachment.mimetype
        }));
      }

      console.log('📧 Sending email with options:', JSON.stringify({
        from: mailOptions.from,
        to: mailOptions.to,
        cc: mailOptions.cc,
        replyTo: mailOptions.replyTo,
        subject: mailOptions.subject,
        attachmentCount: mailOptions.attachments ? mailOptions.attachments.length : 0
      }, null, 2));

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);

      return {
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }
  }

  // Send feedback email
  async sendFeedbackEmail(feedbackData) {
    try {
      const { rating, feedback, name, email, timestamp } = feedbackData;

      const subject = `Feedback & Suggestions - ${name} [HRD Helpdesk]`;

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Feedback & Suggestions</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⭐ Feedback & Suggestions</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">New feedback submitted through the HRD Helpdesk system</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
              <h3 style="margin: 0 0 10px 0; color: #ffc107; font-size: 16px;">👤 Submitted By</h3>
              <p style="margin: 0; font-weight: bold; font-size: 18px;">${name}</p>
              <p style="margin: 5px 0 0 0; color: #666;">${email}</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">⭐ Rating</h3>
              <p style="margin: 0; font-size: 18px;">
                ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5 stars)
              </p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">💬 Feedback</h3>
              <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${feedback}</p>
            </div>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                <strong>Thank you for your feedback!</strong> This helps us improve our HRD Helpdesk system.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; font-size: 12px; color: #666;">
            <p style="margin: 0;">📧 This feedback was submitted through the HRD Helpdesk system.</p>
            <p style="margin: 5px 0 0 0;">Submitted on: ${new Date(timestamp).toLocaleString('en-US', { 
              timeZone: 'Asia/Manila',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}</p>
            <p style="margin: 5px 0 0 0;">System: HRD Helpdesk Application</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: {
          name: 'HRD Helpdesk System',
          address: 'hrd-helpdesk@castotravel.ph'
        },
        to: 'hrd-helpdesk@castotravel.ph',
        cc: email,
        replyTo: email,
        subject: subject,
        html: htmlBody
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Feedback email sent successfully:', result.messageId);

      return {
        success: true,
        message: 'Feedback email sent successfully',
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error sending feedback email:', error);
      return {
        success: false,
        message: 'Failed to send feedback email',
        error: error.message
      };
    }
  }
}

module.exports = EmailService;
