const nodemailer = require('nodemailer');
const emailConfig = require('./emailConfig');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
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
          .trim();
      };

      // Get all form fields except the basic ones
      const basicFields = ['name', 'email', 'divisionmanager', 'title'];
      const allFields = Object.keys(formData).filter(key => 
        !basicFields.includes(key) && 
        formData[key] !== null && 
        formData[key] !== undefined && 
        formData[key] !== ''
      );
      
      console.log('📋 All form fields found:', allFields);
      console.log('📋 Form data values:', allFields.map(field => `${field}: ${formData[field]}`));
      console.log('📋 Full formData object:', JSON.stringify(formData, null, 2));

      // Group fields by category for better organization
      const fieldCategories = {
        'Personal Information': ['employeeId', 'phoneNumber', 'address', 'emergencyContact', 'contactNumber', 'employeeName'],
        'Department & Assignment': ['agentName', 'fromDept', 'toDept', 'department', 'currentDept', 'requestedAgent', 'funddepartment'],
        'Dates & Time': ['startDate', 'endDate', 'fromDate', 'toDate', 'effectiveDate', 'requestDate', 'expectedResolution', 'resignationDate', 'lastWorkingDay', 'exitInterviewDate', 'exitInterviewTime', 'finalPaycheckDate', 'maturityDate', 'applicationDate', 'trainingDate', 'eventDate', 'expectedCompletion', 'incidentDate', 'violationDate', 'overtimeDate', 'payslipPeriod', 'salaryPeriod', 'taxYear', 'period', 'recordPeriod', 'reviewPeriod', 'preferredDate'],
        'Leave & Time Off': ['leaveType', 'medicalCertType', 'childAge'],
        'Financial': ['loanType', 'loanAmount', 'loanPurpose', 'repaymentPeriod', 'contributionType', 'contributionAmount', 'contributionPeriod', 'currentContribution', 'newContribution', 'amount', 'trainingCost'],
        'Work Schedule': ['timesheetPeriod', 'correctionReason', 'originalHours', 'correctedHours', 'overtimeHours', 'expectedHours', 'actualHours', 'currentSchedule', 'proposedSchedule'],
        'Supervision & Approval': ['supervisorName', 'supervisorEmail', 'previousApprover', 'newApprover'],
        'Location & Facilities': ['location', 'ccEmail', 'equipmentType', 'equipmentSpecs', 'equipmentIssue', 'facilityType', 'issueSeverity', 'repairType', 'assessmentType', 'changeType', 'workspaceRequest', 'loungeDate', 'loungeTime', 'loungeDuration', 'maintenanceIssue'],
        'Benefits & Policies': ['benefitType', 'benefitDetails', 'policyQuestion', 'policyType', 'policySection', 'policyName', 'complianceIssue', 'benefitsContinuation', 'insuranceType', 'coverageType', 'beneficiaryType', 'beneficiaryName', 'relationship'],
        'Training & Development': ['trainingTitle', 'trainingProvider', 'trainingCategory', 'trainingType', 'certificationName', 'certificationProvider', 'eventName', 'eventLocation', 'rating', 'feedbackType'],
        'Incidents & Reports': ['incidentType', 'involvedParties', 'reportType', 'suggestionCategory', 'conflictType', 'violationType', 'urgency'],
        'Documents & Verification': ['documentType', 'certificateType', 'purpose', 'verificationType', 'requestingParty', 'document'],
        'Application & Recruitment': ['positionApplied', 'referralType', 'referralName', 'position'],
        'Feedback & Suggestions': ['feedbackType', 'rating', 'suggestionCategory'],
        'Other': ['description', 'reason', 'priority', 'assistanceType', 'concernType', 'adjustmentType', 'errorType', 'taxType', 'resignationLetter', 'medicalCertificate', 'supportingDocuments', 'kudosRecipient', 'kudosReason', 'kudosCategory', 'reviewType', 'recordType']
      };

      // Function to get category for a field
      const getFieldCategory = (fieldName) => {
        for (const [category, fields] of Object.entries(fieldCategories)) {
          if (fields.includes(fieldName)) {
            return category;
          }
        }
        return 'Other';
      };

      // Group fields by category
      const groupedFields = {};
      allFields.forEach(field => {
        const category = getFieldCategory(field);
        if (!groupedFields[category]) {
          groupedFields[category] = [];
        }
        groupedFields[category].push(field);
      });
      
      console.log('📋 Grouped fields by category:', groupedFields);
      console.log('📋 Number of categories with fields:', Object.keys(groupedFields).length);
      console.log('📋 Categories with fields:', Object.keys(groupedFields));

      // Generate HTML for each category
      const generateCategoryHTML = (category, fields) => {
        if (fields.length === 0) return '';
        
        return `
          <div style="margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">${category}</h4>
            <div style="padding-left: 10px;">
              ${fields.map(field => formatField(formatFieldLabel(field), formData[field])).join('')}
            </div>
          </div>
        `;
      };

      let htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">HRD Helpdesk Request</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${name} (${email})</p>
            <p style="margin: 5px 0;"><strong>Request Type:</strong> ${title}</p>
            <p style="margin: 5px 0;"><strong>Division Manager:</strong> ${divisionmanager}</p>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">
              <strong>Reply to:</strong> ${email} | <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>

          ${Object.entries(groupedFields).map(([category, fields]) => 
            generateCategoryHTML(category, fields)
          ).join('')}

          <div style="margin-top: 20px; padding: 10px; background-color: #e9ecef; border-radius: 3px; font-size: 12px; color: #6c757d;">
            <strong>Note:</strong> Reply directly to this email to respond to the employee.
          </div>
        </div>
      `;

      // Prepare attachments - convert URLs to file paths
      const emailAttachments = attachments.map(attachment => {
        if (attachment.url) {
          // Convert URL to local file path
          // URL format: http://172.20.9.60:3001/download/pictures/filename.jpg
          // Local path: uploads/pictures/filename.jpg
          const urlParts = attachment.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          const folder = urlParts[urlParts.length - 2];
          
          const processedAttachment = {
            filename: attachment.filename || 'attachment',
            path: `uploads/${folder}/${filename}`,
            cid: attachment.cid || undefined
          };
          
          console.log('📎 Processing attachment:', attachment.url, '->', processedAttachment.path);
          return processedAttachment;
        } else if (attachment.path) {
          return {
            filename: attachment.filename || 'attachment',
            path: attachment.path,
            cid: attachment.cid || undefined
          };
        }
        return null;
      }).filter(attachment => attachment !== null);
      
      console.log('📎 Final email attachments:', JSON.stringify(emailAttachments, null, 2));

      // Email options
      const mailOptions = {
        from: `"HRD Helpdesk System" <${emailConfig.auth.user}>`, // Use system name to avoid auto-CC
        to: 'hrd-helpdesk@castotravel.ph', // Your osTicket email
        cc: email, // CC the user so they get a copy
        replyTo: email, // Set reply-to as the user's email for threading
        subject: subject,
        html: htmlBody,
        attachments: emailAttachments,
        headers: {
          'X-Original-Sender': email, // Custom header to identify the real sender
          'X-Sender-Name': name,
          'X-Priority': '3', // Normal priority
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Mailer': 'HRD Helpdesk System',
          'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@castotravel.ph>`,
          'In-Reply-To': '', // Empty for new conversations
          'References': '' // Empty for new conversations
        }
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully to osTicket'
      };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  // Send confirmation email to employee
  async sendConfirmationEmail(employeeEmail, title) {
    try {
      const mailOptions = {
        from: `"HRD Helpdesk System" <${emailConfig.auth.user}>`,
        to: employeeEmail,
        subject: `[HRD Helpdesk] Confirmation - ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">✅ Request Received</h2>
            <p>Dear Employee,</p>
            <p>We have received your <strong>${title}</strong> request through the HRD Helpdesk system.</p>
            <p>Your request has been forwarded to the appropriate department and you will receive a response within 2-3 business days.</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>Reference:</strong> ${title} - ${new Date().toLocaleDateString()}
              </p>
            </div>
            <p>Thank you for using the HRD Helpdesk system.</p>
            <p>Best regards,<br>HR Department</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send feedback email to HR
  async sendFeedbackEmail(feedbackData) {
    try {
      const { rating, feedback, name, email, timestamp } = feedbackData;
      
      const ratingText = {
        1: 'Poor',
        2: 'Fair', 
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
      };

      const stars = '⭐'.repeat(rating);
      
      const mailOptions = {
        from: `"HRD Helpdesk System" <${emailConfig.auth.user}>`,
        to: emailConfig.osticketEmail,
        cc: email,
        replyTo: email,
        subject: `Feedback & Suggestions - ${name} [HRD Helpdesk]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">💬 Feedback & Suggestions</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">HRD Helpdesk System</p>
            </div>
            
            <div style="padding: 24px;">
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">📧 Submitted By</h3>
                <p style="margin: 0; font-weight: 600; color: #374151;">${name}</p>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${email}</p>
              </div>

              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px;">⭐ Rating</h3>
                <div style="font-size: 24px; margin-bottom: 8px;">${stars}</div>
                <p style="margin: 0; font-weight: 600; color: #92400e;">${ratingText[rating]} (${rating}/5)</p>
              </div>

              <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px;">💭 Feedback</h3>
                <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${feedback}</p>
              </div>

              <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;"><strong>IMPORTANT:</strong> Reply directly to this email to respond to the employee. Your reply will be sent to: ${email}</p>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Submitted on: ${new Date(timestamp).toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
              <p style="margin: 4px 0 0 0;">System: HRD Helpdesk Application</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Feedback email sent successfully:', result.messageId);
      return result;

    } catch (error) {
      console.error('Error sending feedback email:', error);
      throw error;
    }
  }

}

module.exports = EmailService;
