import React, { useState } from 'react';
import { DIVISION_MANAGERS, UPLOAD_SERVER_URL, getApiUrl } from '../constants/data';
import axios from 'axios';
import '../styles/modern-forms.css';

// Department options for dropdowns
const departments = ['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD',
  'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime',
  'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime',
  'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West',
  'Executive Travel - US Daytime','Accounting - FCTG S&C',
  'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk',
  'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk',
  'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime',
  'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations',
  'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime',
  'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service',
];

// Ultra-simple input components - defined outside component to prevent re-creation
const EnhancedInput = ({ fieldName, label, type = "text", required = false, placeholder, options = null, formData, updateField, ...props }) => {
  const value = formData[fieldName] || '';
  
  // Check if this is an email field that needs @castotravel.ph validation
  const isEmailField = fieldName === 'email';
  const isValidEmail = isEmailField ? value.endsWith('@castotravel.ph') : true;
  const showEmailError = isEmailField && value && !isValidEmail;

  return (
    <div className="modern-form-group">
      <label className="modern-form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      {type === 'select' ? (
        <select
          className="modern-form-select"
          value={value}
          onChange={(e) => updateField(fieldName, e.target.value)}
          required={required}
          {...props}
        >
          <option value="" disabled>Select {label}</option>
          {options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          className="modern-form-textarea"
          value={value}
          onChange={(e) => updateField(fieldName, e.target.value)}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={`modern-form-input ${showEmailError ? 'modern-form-input-error' : ''}`}
          value={value}
          onChange={(e) => updateField(fieldName, e.target.value)}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
      {showEmailError && (
        <div className="modern-form-error">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please enter a valid @castotravel.ph email address
        </div>
      )}
    </div>
  );
};

const Form = ({ title, onBack, onSubmitSuccess }) => {
  const [attachment, setAttachment] = useState(null);
  const [picture, setPicture] = useState(null);
  const [signature, setSignature] = useState(null);
  const [medicalCertificate, setMedicalCertificate] = useState(null);
  const [supportingDocuments, setSupportingDocuments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '', title: '', type: 'error' });

  // Professional Error Modal Component
  const ErrorModal = () => {
    if (!errorModal.show) return null;
    
    return (
      <div className="error-modal-overlay" onClick={() => setErrorModal({ show: false, message: '', title: '', type: 'error' })}>
        <div className={`error-modal ${errorModal.type === 'success' ? 'success' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="error-modal-header">
            <div className="error-modal-icon">{errorModal.type === 'success' ? '✅' : '⚠️'}</div>
            <h3 className="error-modal-title">{errorModal.title}</h3>
            <button 
              className="error-modal-close" 
              onClick={() => setErrorModal({ show: false, message: '', title: '', type: 'error' })}
            >
              ×
            </button>
          </div>
          <div className="error-modal-body">
            <p className="error-modal-message">{errorModal.message}</p>
          </div>
          <div className="error-modal-footer">
            <button 
              className="error-modal-button"
              onClick={() => setErrorModal({ show: false, message: '', title: '', type: 'error' })}
            >
              {errorModal.type === 'success' ? 'Awesome!' : 'Got it!'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Direct form state management - no hooks, no validation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    divisionmanager: '',
    description: '',
    location: '',
    employeeName: '',
    currentDept: '',
    effectiveDate: '',
    fromDate: '',
    toDate: '',
    requestedAgent: '',
    funddepartment: '',
    agentName: '',
    fromDept: '',
    toDept: '',
    emergencyContact: '',
    contactNumber: '',
    address: '',
    ccEmail: '',
    // New fields for specific form types
    employeeId: '',
    phoneNumber: '',
    reason: '',
    amount: '',
    loanType: '',
    contributionType: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    medicalCertificate: null,
    supportingDocuments: null,
    priority: '',
    department: '',
    supervisorName: '',
    supervisorEmail: '',
    requestDate: '',
    expectedResolution: '',
    previousApprover: '',
    newApprover: '',
    timesheetPeriod: '',
    correctionReason: '',
    loanAmount: '',
    loanPurpose: '',
    repaymentPeriod: '',
    contributionAmount: '',
    contributionPeriod: '',
    benefitType: '',
    policyQuestion: '',
    complianceIssue: '',
    equipmentType: '',
    equipmentSpecs: '',
    maintenanceIssue: '',
    workspaceRequest: '',
    loungeDate: '',
    loungeTime: '',
    loungeDuration: '',
    resignationDate: '',
    lastWorkingDay: '',
    exitInterviewDate: '',
    exitInterviewTime: '',
    finalPaycheckDate: '',
    benefitsContinuation: '',
    medicalCertType: '',
    kudosRecipient: '',
    kudosReason: '',
    kudosCategory: '',
    // Additional fields for new form configurations
    assistanceType: '',
    urgency: '',
    concernType: '',
    currentSchedule: '',
    proposedSchedule: '',
    originalHours: '',
    correctedHours: '',
    benefitDetails: '',
    maturityDate: '',
    // Additional fields for old system forms
    salaryPeriod: '',
    adjustmentType: '',
    overtimeDate: '',
    expectedHours: '',
    actualHours: '',
    overtimeHours: '',
    payslipPeriod: '',
    errorType: '',
    taxYear: '',
    taxType: '',
    documentType: '',
    relationship: '',
    childAge: '',
    insuranceType: '',
    coverageType: '',
    beneficiaryType: '',
    beneficiaryName: '',
    currentContribution: '',
    newContribution: '',
    period: '',
    incidentDate: '',
    incidentType: '',
    involvedParties: '',
    reportType: '',
    suggestionCategory: '',
    policyType: '',
    preferredDate: '',
    conflictType: '',
    certificateType: '',
    purpose: '',
    verificationType: '',
    requestingParty: '',
    reviewPeriod: '',
    reviewType: '',
    recordPeriod: '',
    recordType: '',
    applicationDate: '',
    positionApplied: '',
    referralType: '',
    referralName: '',
    position: '',
    document: null,
    trainingTitle: '',
    trainingDate: '',
    trainingProvider: '',
    trainingCost: '',
    certificationName: '',
    certificationProvider: '',
    expectedCompletion: '',
    eventName: '',
    eventDate: '',
    eventLocation: '',
    trainingCategory: '',
    policySection: '',
    policyName: '',
    violationType: '',
    violationDate: '',
    trainingType: '',
    equipmentIssue: '',
    facilityType: '',
    issueSeverity: '',
    repairType: '',
    assessmentType: '',
    changeType: '',
    resignationLetter: null,
    feedbackType: '',
    rating: ''
  });

  // Direct form field update function - no validation, no hooks
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Removed all validation rules for smooth typing

  // Removed unused getFieldLabel function

  // Removed validation function for smooth typing

  // Removed all validation-related code for smooth typing

  // Removed unused handler functions

  // Removed cleanup useEffect for validation

  // Disabled auto-save functionality for smooth typing

  // Disabled draft loading for smooth typing

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate basic required fields
    // Fun error messages for basic fields
    const basicErrorMessages = [
      "Hey there! You forgot to tell us your name! Did you read the form? 😊",
      "Oops! Missing your name there. Are you sure you filled everything out? 🤷‍♀️",
      "Hold on! We need to know who you are. Did you see the name field? 👤",
      "Almost there! But you forgot to enter your name. Check again! 👀",
      "Not quite ready! You need to fill in your name first. Take your time! ⏰"
    ];

    if (!formData.name || formData.name.trim() === '') {
      const randomMessage = basicErrorMessages[Math.floor(Math.random() * basicErrorMessages.length)];
      setErrorModal({ 
        show: true, 
        title: 'Missing Required Information', 
        message: `${randomMessage}\n\nMissing: Your name` 
      });
      return;
    }
    if (!formData.email || formData.email.trim() === '') {
      const randomMessage = basicErrorMessages[Math.floor(Math.random() * basicErrorMessages.length)];
      setErrorModal({ 
        show: true, 
        title: 'Missing Required Information', 
        message: `${randomMessage}\n\nMissing: Your email address` 
      });
      return;
    }
    // Fun error messages for email validation
    const emailErrorMessages = [
      "Hold up! That's not a Casto Travel email! Did you read the instructions? 🏢",
      "Oops! Wrong email domain there. Are you sure you're using your work email? 💼",
      "Not quite right! You need a @castotravel.ph email. Check your email address! 📧",
      "Almost there! But that's not the right email format. Read the field label! 👀",
      "Hey! That's not a company email. Did you see the @castotravel.ph requirement? 🤔",
      "Hold on! You need to use your Casto Travel email address. Check again! 🔍"
    ];

    // Validate that email is from @castotravel.ph domain
    if (!formData.email.endsWith('@castotravel.ph')) {
      const randomMessage = emailErrorMessages[Math.floor(Math.random() * emailErrorMessages.length)];
      setErrorModal({ 
        show: true, 
        title: 'Invalid Email Domain', 
        message: `${randomMessage}\n\nRequired: @castotravel.ph email address` 
      });
      return;
    }
    if (!formData.divisionmanager || formData.divisionmanager.trim() === '') {
      setErrorModal({ 
        show: true, 
        title: 'Missing Required Information', 
        message: 'Please select your division manager' 
      });
      return;
    }

    // Get form-specific required fields and validate them
    const formSpecificFields = getFormSpecificFields();
    const requiredFields = [];
    
    // Extract required field names from form configuration
    formSpecificFields.forEach(field => {
      if (field.props && field.props.required) {
        requiredFields.push({
          name: field.props.fieldName,
          label: field.props.label
        });
      }
    });

    // Fun error messages for missing fields
    const funErrorMessages = [
      "Oops! Looks like you missed something. Did you really read the form properly? 😅",
      "Hmm, seems like you skipped a step. Have you checked everything carefully? 🤔",
      "Almost there! But you forgot something important. Take another look! 👀",
      "Not quite ready yet! Did you read all the instructions properly? 📖",
      "Missing something there! Are you sure you filled everything out? 🤷‍♀️",
      "Hold up! You missed a required field. Double-check your work! 🔍",
      "Almost got it! But there's still something missing. Read it again! 📝",
      "Not so fast! You skipped something important. Take your time! ⏰"
    ];

    // Validate required fields
    for (const field of requiredFields) {
      const value = formData[field.name];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const randomMessage = funErrorMessages[Math.floor(Math.random() * funErrorMessages.length)];
        setErrorModal({ 
          show: true, 
          title: 'Missing Required Information', 
          message: `${randomMessage}\n\nMissing: ${field.label}` 
        });
        return;
      }
    }

    // Fun error messages for file uploads
    const fileErrorMessages = [
      "Hey! You forgot to attach something important! Did you read the requirements? 📎",
      "Oops! Missing an attachment there. Check what you need to upload! 📁",
      "Hold on! You need to upload a file. Did you see the upload section? 📤",
      "Almost there! But you're missing a required file. Look for the upload button! 🔍",
      "Not quite ready! You forgot to attach something. Check the form again! 👀"
    ];

    // Validate required file uploads (only for forms that actually require them)
    if (title === 'Request form for Company ID') {
      if (!picture) {
        const randomMessage = fileErrorMessages[Math.floor(Math.random() * fileErrorMessages.length)];
        setErrorModal({ 
          show: true, 
          title: 'Missing Required Files', 
          message: `${randomMessage}\n\nMissing: Picture upload` 
        });
        return;
      }
      if (!signature) {
        const randomMessage = fileErrorMessages[Math.floor(Math.random() * fileErrorMessages.length)];
        setErrorModal({ 
          show: true, 
          title: 'Missing Required Files', 
          message: `${randomMessage}\n\nMissing: Signature upload` 
        });
        return;
      }
    }
    
    // Note: Other forms may have optional file uploads, so we don't validate them here
    // Only validate file uploads for forms that explicitly require them

    setLoading(true);

    let uploadedFileUrls = {
      attachment: null,
      picture: null,
      signature: null
    };

    let uploadedFileNames = {
      attachment: null,
      picture: null,
      signature: null
    };

    try {
      // Prepare attachments for direct email sending (Vercel serverless approach)
      const attachments = [];
      
      // Handle regular attachment
      if (attachment && attachment instanceof File && attachment.size > 0) {
        console.log('📎 Processing attachment:', attachment.name, 'Size:', attachment.size);
        const attachmentBuffer = await attachment.arrayBuffer();
        attachments.push({
          originalname: attachment.name,
          mimetype: attachment.type,
          buffer: Array.from(new Uint8Array(attachmentBuffer))
        });
      }

      // Handle picture and signature uploads for Company ID form
      if (title === 'Request form for Company ID') {
        if (picture && picture instanceof File && picture.size > 0) {
          console.log('📎 Processing picture:', picture.name, 'Size:', picture.size);
          const pictureBuffer = await picture.arrayBuffer();
          attachments.push({
            originalname: picture.name,
            mimetype: picture.type,
            buffer: Array.from(new Uint8Array(pictureBuffer))
          });
        }

        if (signature && signature instanceof File && signature.size > 0) {
          console.log('📎 Processing signature:', signature.name, 'Size:', signature.size);
          const signatureBuffer = await signature.arrayBuffer();
          attachments.push({
            originalname: signature.name,
            mimetype: signature.type,
            buffer: Array.from(new Uint8Array(signatureBuffer))
          });
        }
      }

      // Send email using our backend service
      const emailData = {
        ...formData, // Include ALL form fields
        title: title,
        attachments: attachments // Send attachments directly
      };

      // Use the correct API URL based on environment
      const response = await axios.post(getApiUrl('send-email'), emailData);

      if (onSubmitSuccess) {
      onSubmitSuccess();
      } else {
        setErrorModal({ 
          show: true, 
          title: 'Success!', 
          message: 'Form submitted successfully! You will receive a confirmation email shortly.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setErrorModal({ 
        show: true, 
        title: 'Submission Failed', 
        message: 'Failed to submit the form. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReferralClick = () => {
    window.location.href = "https://forms.office.com/Pages/ResponsePage.aspx?id=OCfYxf2Iu0mwFJhfjf-8IwIdX7N3k2xEvvPK_rTQuKZUMDc3NlZTUjFLUElZT0VFUVRCUjVKM0E0Mi4u";
  };

  // Enhanced file upload component

  // Enhanced file upload component
  const EnhancedFileUpload = ({ fieldName, label, accept, required = false, multiple = false }) => {
    const [dragActive, setDragActive] = useState(false);
    
    // Get the current file from the parent component's state
    const getCurrentFile = () => {
      if (fieldName === 'attachment') return attachment;
      if (fieldName === 'picture') return picture;
      if (fieldName === 'signature') return signature;
      if (fieldName === 'medicalCertificate') return medicalCertificate;
      if (fieldName === 'supportingDocuments') return supportingDocuments;
      return null;
    };
    
    const file = getCurrentFile();

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        console.log('📎 File dropped:', droppedFile.name, 'Size:', droppedFile.size, 'Type:', droppedFile.type);
        if (fieldName === 'attachment') {
          setAttachment(droppedFile);
          console.log('📎 Attachment set:', droppedFile.name);
        }
        if (fieldName === 'picture') {
          setPicture(droppedFile);
          console.log('📎 Picture set:', droppedFile.name);
        }
        if (fieldName === 'signature') {
          setSignature(droppedFile);
          console.log('📎 Signature set:', droppedFile.name);
        }
        if (fieldName === 'medicalCertificate') {
          setMedicalCertificate(droppedFile);
          console.log('📎 Medical Certificate set:', droppedFile.name);
        }
        if (fieldName === 'supportingDocuments') {
          setSupportingDocuments(droppedFile);
          console.log('📎 Supporting Documents set:', droppedFile.name);
        }
      }
    };

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        console.log('📎 File selected:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
        if (fieldName === 'attachment') {
          setAttachment(selectedFile);
          console.log('📎 Attachment set:', selectedFile.name);
        }
        if (fieldName === 'picture') {
          setPicture(selectedFile);
          console.log('📎 Picture set:', selectedFile.name);
        }
        if (fieldName === 'signature') {
          setSignature(selectedFile);
          console.log('📎 Signature set:', selectedFile.name);
        }
        if (fieldName === 'medicalCertificate') {
          setMedicalCertificate(selectedFile);
          console.log('📎 Medical Certificate set:', selectedFile.name);
        }
        if (fieldName === 'supportingDocuments') {
          setSupportingDocuments(selectedFile);
          console.log('📎 Supporting Documents set:', selectedFile.name);
        }
      }
    };

  return (
      <div className="modern-form-group">
        <label className="modern-form-label">
          {label} {required && <span className="required">*</span>}
        </label>
        <label 
          htmlFor={`file-${fieldName}`}
          className={`modern-form-file-input ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            required={required}
            style={{ display: 'none' }}
            id={`file-${fieldName}`}
          />
            <div className="modern-form-file-text">
              {file ? (
              <div className="file-selected">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="file-info">
                  <strong style={{ color: '#10b981' }}>✓ {file.name}</strong>
                  <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button 
                  type="button" 
                  className="file-remove-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📎 Removing file:', file?.name);
                    if (fieldName === 'attachment') setAttachment(null);
                    if (fieldName === 'picture') setPicture(null);
                    if (fieldName === 'signature') setSignature(null);
                    if (fieldName === 'medicalCertificate') setMedicalCertificate(null);
                    if (fieldName === 'supportingDocuments') setSupportingDocuments(null);
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>
              ) : (
              <div className="file-placeholder">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Click to select file or drag and drop</span>
              </div>
              )}
            </div>
          </label>
      </div>
    );
  };

  // Form-specific field configurations
  const getFormSpecificFields = () => {
    const formConfigs = {
      // Personal Information Forms
      'Change of address or contact number': [
        <EnhancedInput formData={formData} updateField={updateField} key="employeeId" fieldName="employeeId" label="Employee ID" required placeholder="Enter your employee ID" formData={formData} updateField={updateField} />,
        <EnhancedInput formData={formData} updateField={updateField} key="phoneNumber" fieldName="phoneNumber" label="New Phone Number" type="tel" required placeholder="Enter new phone number" formData={formData} updateField={updateField} />,
        <EnhancedInput formData={formData} updateField={updateField} key="address" fieldName="address" label="New Address" type="textarea" required placeholder="Enter your new address" formData={formData} updateField={updateField} />
      ],
      'Update emergency contact details': [
        <EnhancedInput formData={formData} updateField={updateField} key="emergencyContact" fieldName="emergencyContact" label="Emergency Contact Name" required placeholder="Enter emergency contact name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="contactNumber" fieldName="contactNumber" label="Emergency Contact Number" type="tel" required placeholder="Enter emergency contact number" />,
        <EnhancedInput formData={formData} updateField={updateField} key="relationship" fieldName="relationship" label="Relationship" required placeholder="e.g., Spouse, Parent, Sibling" />
      ],
      
      // Leave Forms
      'Bereavement Leave': [
        <EnhancedInput formData={formData} updateField={updateField} key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Bereavement Leave']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="startDate" fieldName="startDate" label="Start Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="endDate" fieldName="endDate" label="End Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Leave" type="textarea" required placeholder="Please provide details about the bereavement" />
      ],
      'Maternity/Paternity leave applications': [
        <EnhancedInput formData={formData} updateField={updateField} key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Maternity Leave', 'Paternity Leave']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="startDate" fieldName="startDate" label="Expected Start Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="endDate" fieldName="endDate" label="Expected End Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="medicalCertificate" fieldName="medicalCertificate" label="Medical Certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
      ],
      
      // Loan Forms
      'SSS Calamity and Salary Loan': [
        <EnhancedInput formData={formData} updateField={updateField} key="loanType" fieldName="loanType" label="Loan Type" type="select" options={['SSS Calamity Loan', 'SSS Salary Loan']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="loanAmount" fieldName="loanAmount" label="Loan Amount" type="number" required placeholder="Enter loan amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="loanPurpose" fieldName="loanPurpose" label="Purpose of Loan" type="textarea" required placeholder="Describe the purpose of the loan" />,
        <EnhancedInput formData={formData} updateField={updateField} key="repaymentPeriod" fieldName="repaymentPeriod" label="Preferred Repayment Period" type="select" options={['6 months', '12 months', '18 months', '24 months']} required />
      ],
      'Pag-ibig and Salary Loan': [
        <EnhancedInput formData={formData} updateField={updateField} key="loanType" fieldName="loanType" label="Loan Type" type="select" options={['Pag-IBIG Salary Loan', 'Pag-IBIG Multi-Purpose Loan']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="loanAmount" fieldName="loanAmount" label="Loan Amount" type="number" required placeholder="Enter loan amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="loanPurpose" fieldName="loanPurpose" label="Purpose of Loan" type="textarea" required placeholder="Describe the purpose of the loan" />
      ],
      
      // Equipment and Facilities
      'Request new hardware (e.g., laptops, monitors)': [
        <EnhancedInput formData={formData} updateField={updateField} key="equipmentType" fieldName="equipmentType" label="Equipment Type" type="select" options={['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="equipmentSpecs" fieldName="equipmentSpecs" label="Specifications" type="textarea" required placeholder="Please specify the required specifications" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Business Justification" type="textarea" required placeholder="Explain why this equipment is needed" />
      ],
      
      // Exit and Offboarding
      'Submit resignation letter': [
        <EnhancedInput formData={formData} updateField={updateField} key="resignationDate" fieldName="resignationDate" label="Resignation Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="lastWorkingDay" fieldName="lastWorkingDay" label="Last Working Day" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Resignation" type="textarea" required placeholder="Please provide your reason for resigning" />
      ],
      'Schedule exit interview appointment': [
        <EnhancedInput formData={formData} updateField={updateField} key="exitInterviewDate" fieldName="exitInterviewDate" label="Preferred Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="exitInterviewTime" fieldName="exitInterviewTime" label="Preferred Time" type="time" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Additional Comments" type="textarea" placeholder="Any specific topics you'd like to discuss during the exit interview" />
      ],
      
      // Kudos and Recognition
      'Kudos Submission Form': [
        <EnhancedInput formData={formData} updateField={updateField} key="kudosRecipient" fieldName="kudosRecipient" label="Recipient Name" required placeholder="Enter the name of the person you want to recognize" />,
        <EnhancedInput formData={formData} updateField={updateField} key="kudosCategory" fieldName="kudosCategory" label="Category" type="select" options={['Customer Service Excellence', 'Team Collaboration', 'Innovation', 'Going Above and Beyond', 'Leadership', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="kudosReason" fieldName="kudosReason" label="Reason for Kudos" type="textarea" required placeholder="Describe why this person deserves recognition" />
      ],
      
      // Medical and Health
      'Verification of Medical Certificate': [
        <EnhancedInput formData={formData} updateField={updateField} key="medicalCertType" fieldName="medicalCertType" label="Medical Certificate Type" type="select" options={['Sick Leave', 'Medical Clearance', 'Health Check-up', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="startDate" fieldName="startDate" label="Start Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="endDate" fieldName="endDate" label="End Date" type="date" required />,
        <EnhancedFileUpload key="medicalCertificate" fieldName="medicalCertificate" label="Medical Certificate" accept=".pdf,.jpg,.jpeg,.png" required />
      ],
      
      // Transfer and Department Changes
      'Employee Reassignment Form': [
        <EnhancedInput formData={formData} updateField={updateField} key="agentName" fieldName="agentName" label="Employee Name" required placeholder="Enter employee name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="fromDept" fieldName="fromDept" label="From Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="toDept" fieldName="toDept" label="To Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Reassignment" type="textarea" required placeholder="Please provide the reason for the reassignment" />
      ],
      
      // Lounge and Facilities
      'Request for Lounge Space': [
        <EnhancedInput formData={formData} updateField={updateField} key="ccEmail" fieldName="ccEmail" label="Immediate Supervisor Email" type="email" required placeholder="Enter supervisor email" />,
        <EnhancedInput formData={formData} updateField={updateField} key="location" fieldName="location" label="Location of the Reservation" type="select" options={['Makati Lounge (Female)','Makati Lounge (Male)','Travelbank Lounge (for Travelbank employees)','QC Lounge','Cebu Lounge (Female)','Cebu Lounge (Male)','Bacolod Lounge (Female)', 'Bacolod Lounge (Male)','Alabang Lounge (Female)','Alabang Lounge (Male)']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="fromDate" fieldName="fromDate" label="Date Range - From" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="toDate" fieldName="toDate" label="Date Range - To" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="description" fieldName="description" label="Details of the Reservation" type="textarea" required placeholder="Enter details of the reservation" />
      ],
      
      // Company ID Request
      'Request form for Company ID': [
        <EnhancedInput formData={formData} updateField={updateField} key="emergencyContact" fieldName="emergencyContact" label="Emergency Contact Person" required placeholder="Enter emergency contact person" />,
        <EnhancedInput formData={formData} updateField={updateField} key="contactNumber" fieldName="contactNumber" label="Contact Number" type="tel" required placeholder="Enter contact number" />,
        <EnhancedInput formData={formData} updateField={updateField} key="address" fieldName="address" label="Address" type="textarea" required placeholder="Enter complete address" />,
        <EnhancedFileUpload key="picture" fieldName="picture" label="Upload Picture (Rename the file using your last name first, then your first name.)" accept="image/*" required />,
        <EnhancedFileUpload key="signature" fieldName="signature" label="Upload Signature (Rename the file using your last name first, then your first name.)" accept="image/*" required />
      ],
      
      // Floating Status Request
      'Request Floating Status Request Form': [
        <EnhancedInput formData={formData} updateField={updateField} key="employeeName" fieldName="employeeName" label="Employee Name (to be placed on Floating Status)" required placeholder="Enter employee's name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="currentDept" fieldName="currentDept" label="Current Department of the Employee" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="effectiveDate" fieldName="effectiveDate" label="Effective Date of Floating Status" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Requesting Floating Status" type="textarea" required placeholder="Enter the reason for floating status request" />
      ],
      
      // Employee Information Access
      'Request Employee Information Access': [
        <EnhancedInput formData={formData} updateField={updateField} key="requestedAgent" fieldName="requestedAgent" label="Name of the requested agent" required placeholder="Enter agent name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="description" fieldName="description" label="Details requested for the agent" type="textarea" required placeholder="Enter details" />
      ],
      
      // Team Fund Request
      'Team Fund Request Form': [
        <EnhancedInput formData={formData} updateField={updateField} key="funddepartment" fieldName="funddepartment" label="Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="description" fieldName="description" label="Details of the Request" type="textarea" required placeholder="Details" />
      ],
      
      // Payroll Dispute
      'Request for Payroll Dispute Form': [
        <EnhancedInput formData={formData} updateField={updateField} key="description" fieldName="description" label="Details of the Dispute" type="textarea" required placeholder="Enter details of the dispute" />
      ],
      
      // Additional form configurations for navigation titles
      'Downloadable Forms': [], // This will redirect to DownloadableForms component
      'EO Branch Referral Slip': [
        <EnhancedInput formData={formData} updateField={updateField} key="employeeName" fieldName="employeeName" label="Employee Name" required placeholder="Enter employee name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="department" fieldName="department" label="Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Referral" type="textarea" required placeholder="Enter reason for EO branch referral" />
      ],
      'ComPsych Assistance': [
        <EnhancedInput formData={formData} updateField={updateField} key="assistanceType" fieldName="assistanceType" label="Type of Assistance Needed" type="select" options={['Counseling', 'Mental Health Support', 'Work-Life Balance', 'Stress Management', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="urgency" fieldName="urgency" label="Urgency Level" type="select" options={['Low', 'Medium', 'High', 'Critical']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="description" fieldName="description" label="Description of Need" type="textarea" required placeholder="Please describe what assistance you need" />
      ],
      'Employee Reassignment Request': [
        <EnhancedInput formData={formData} updateField={updateField} key="agentName" fieldName="agentName" label="Agent Name" required placeholder="Enter agent name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="fromDept" fieldName="fromDept" label="From Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="toDept" fieldName="toDept" label="To Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Transfer" type="textarea" required placeholder="Please provide the reason for the transfer" />
      ],
      'Timesheet Correction': [
        <EnhancedInput formData={formData} updateField={updateField} key="timesheetPeriod" fieldName="timesheetPeriod" label="Timesheet Period" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="correctionReason" fieldName="correctionReason" label="Reason for Correction" type="textarea" required placeholder="Please explain why the timesheet needs to be corrected" />,
        <EnhancedInput formData={formData} updateField={updateField} key="originalHours" fieldName="originalHours" label="Original Hours Logged" type="number" required placeholder="Enter original hours" />,
        <EnhancedInput formData={formData} updateField={updateField} key="correctedHours" fieldName="correctedHours" label="Corrected Hours" type="number" required placeholder="Enter corrected hours" />
      ],
      'Change of Approver': [
        <EnhancedInput formData={formData} updateField={updateField} key="previousApprover" fieldName="previousApprover" label="Previous Approver" required placeholder="Enter previous approver name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="newApprover" fieldName="newApprover" label="New Approver" required placeholder="Enter new approver name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="effectiveDate" fieldName="effectiveDate" label="Effective Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Change" type="textarea" required placeholder="Please provide reason for changing approver" />
      ],
      'Other Concerns related to Worksched': [
        <EnhancedInput formData={formData} updateField={updateField} key="concernType" fieldName="concernType" label="Type of Concern" type="select" options={['Schedule Conflict', 'Overtime Issues', 'Shift Changes', 'Workload Distribution', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="currentSchedule" fieldName="currentSchedule" label="Current Schedule" type="textarea" required placeholder="Describe your current work schedule" />,
        <EnhancedInput formData={formData} updateField={updateField} key="proposedSchedule" fieldName="proposedSchedule" label="Proposed Schedule" type="textarea" placeholder="Describe your proposed schedule (if applicable)" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Details of Concern" type="textarea" required placeholder="Please provide details about your concern" />
      ],
      'RCBC Corporate Loan': [
        <EnhancedInput formData={formData} updateField={updateField} key="loanAmount" fieldName="loanAmount" label="Loan Amount" type="number" required placeholder="Enter loan amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="loanPurpose" fieldName="loanPurpose" label="Purpose of Loan" type="textarea" required placeholder="Describe the purpose of the loan" />,
        <EnhancedInput formData={formData} updateField={updateField} key="repaymentPeriod" fieldName="repaymentPeriod" label="Preferred Repayment Period" type="select" options={['6 months', '12 months', '18 months', '24 months', '36 months']} required />
      ],
      'SSS Contributions': [
        <EnhancedInput formData={formData} updateField={updateField} key="contributionType" fieldName="contributionType" label="Contribution Type" type="select" options={['Regular Contribution', 'Voluntary Contribution', 'Self-Employed Contribution']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionAmount" fieldName="contributionAmount" label="Contribution Amount" type="number" required placeholder="Enter contribution amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionPeriod" fieldName="contributionPeriod" label="Contribution Period" type="select" options={['Monthly', 'Quarterly', 'Annually']} required />
      ],
      'PHILHEALTH Contributions': [
        <EnhancedInput formData={formData} updateField={updateField} key="contributionType" fieldName="contributionType" label="Contribution Type" type="select" options={['Regular Contribution', 'Voluntary Contribution', 'Self-Employed Contribution']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionAmount" fieldName="contributionAmount" label="Contribution Amount" type="number" required placeholder="Enter contribution amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionPeriod" fieldName="contributionPeriod" label="Contribution Period" type="select" options={['Monthly', 'Quarterly', 'Annually']} required />
      ],
      'PAG-IBIG Contributions': [
        <EnhancedInput formData={formData} updateField={updateField} key="contributionType" fieldName="contributionType" label="Contribution Type" type="select" options={['Regular Contribution', 'Voluntary Contribution', 'Self-Employed Contribution']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionAmount" fieldName="contributionAmount" label="Contribution Amount" type="number" required placeholder="Enter contribution amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionPeriod" fieldName="contributionPeriod" label="Contribution Period" type="select" options={['Monthly', 'Quarterly', 'Annually']} required />
      ],
      'Modified Pag-IBIG (MP2)': [
        <EnhancedInput formData={formData} updateField={updateField} key="contributionAmount" fieldName="contributionAmount" label="MP2 Contribution Amount" type="number" required placeholder="Enter MP2 contribution amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="contributionPeriod" fieldName="contributionPeriod" label="Contribution Period" type="select" options={['Monthly', 'Quarterly', 'Annually']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="maturityDate" fieldName="maturityDate" label="Preferred Maturity Date" type="date" required />
      ],
      'Government Statutory Benefits': [
        <EnhancedInput formData={formData} updateField={updateField} key="benefitType" fieldName="benefitType" label="Benefit Type" type="select" options={['SSS Benefits', 'PHILHEALTH Benefits', 'PAG-IBIG Benefits', 'Other Government Benefits']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="benefitDetails" fieldName="benefitDetails" label="Benefit Details" type="textarea" required placeholder="Describe the specific benefit you need assistance with" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Request" type="textarea" required placeholder="Please provide reason for this benefit request" />
      ],
      
      // Additional form configurations from old system
      'Requests for salary breakdown and components': [
        <EnhancedInput formData={formData} updateField={updateField} key="salaryPeriod" fieldName="salaryPeriod" label="Salary Period" type="select" options={['Current Month', 'Previous Month', 'Specific Month']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Request" type="textarea" required placeholder="Please specify why you need the salary breakdown" />
      ],
      'Inquiries about salary adjustments or increments': [
        <EnhancedInput formData={formData} updateField={updateField} key="adjustmentType" fieldName="adjustmentType" label="Type of Adjustment" type="select" options={['Salary Increase', 'Promotion Adjustment', 'Market Adjustment', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Details of Inquiry" type="textarea" required placeholder="Please provide details about your salary adjustment inquiry" />
      ],
      'Discrepancies in overtime pay': [
        <EnhancedInput formData={formData} updateField={updateField} key="overtimeDate" fieldName="overtimeDate" label="Overtime Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="expectedHours" fieldName="expectedHours" label="Expected Hours" type="number" required placeholder="Enter expected overtime hours" />,
        <EnhancedInput formData={formData} updateField={updateField} key="actualHours" fieldName="actualHours" label="Actual Hours Paid" type="number" required placeholder="Enter actual hours paid" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Description of Discrepancy" type="textarea" required placeholder="Please describe the discrepancy in detail" />
      ],
      'Requests for overtime approval status': [
        <EnhancedInput formData={formData} updateField={updateField} key="overtimeDate" fieldName="overtimeDate" label="Overtime Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="overtimeHours" fieldName="overtimeHours" label="Overtime Hours" type="number" required placeholder="Enter overtime hours" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Overtime" type="textarea" required placeholder="Please provide reason for overtime work" />
      ],
      'Access to digital payslips': [
        <EnhancedInput formData={formData} updateField={updateField} key="payslipPeriod" fieldName="payslipPeriod" label="Payslip Period" type="select" options={['Current Month', 'Previous Month', 'Specific Month', 'Multiple Months']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Access" type="textarea" required placeholder="Please specify why you need access to payslips" />
      ],
      'Correction requests for payslip errors': [
        <EnhancedInput formData={formData} updateField={updateField} key="payslipPeriod" fieldName="payslipPeriod" label="Payslip Period" type="select" options={['Current Month', 'Previous Month', 'Specific Month']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="errorType" fieldName="errorType" label="Type of Error" type="select" options={['Salary Amount', 'Deductions', 'Tax Calculations', 'Benefits', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Description of Error" type="textarea" required placeholder="Please describe the payslip error in detail" />
      ],
      'Queries about tax deductions and exemptions': [
        <EnhancedInput formData={formData} updateField={updateField} key="taxYear" fieldName="taxYear" label="Tax Year" type="select" options={['2024', '2023', '2022', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="taxType" fieldName="taxType" label="Tax Type" type="select" options={['Income Tax', 'Withholding Tax', 'SSS', 'PHILHEALTH', 'PAG-IBIG', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Query" type="textarea" required placeholder="Please describe your tax-related query" />
      ],
      'Requests for tax documents (e.g., BIR Form 2316)': [
        <EnhancedInput formData={formData} updateField={updateField} key="documentType" fieldName="documentType" label="Document Type" type="select" options={['BIR Form 2316', 'Certificate of Compensation', 'Tax Certificate', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="taxYear" fieldName="taxYear" label="Tax Year" type="select" options={['2024', '2023', '2022', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Purpose of Document" type="textarea" required placeholder="Please specify the purpose of the tax document" />
      ],
      'Solo Parent Leave': [
        <EnhancedInput formData={formData} updateField={updateField} key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Solo Parent Leave']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="startDate" fieldName="startDate" label="Start Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="endDate" fieldName="endDate" label="End Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="childAge" fieldName="childAge" label="Child's Age" type="number" required placeholder="Enter child's age" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Leave" type="textarea" required placeholder="Please provide reason for solo parent leave" />
      ],
      'Other (Special) Leave': [
        <EnhancedInput formData={formData} updateField={updateField} key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Special Leave', 'Emergency Leave', 'Personal Leave', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="startDate" fieldName="startDate" label="Start Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="endDate" fieldName="endDate" label="End Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Special Leave" type="textarea" required placeholder="Please provide detailed reason for special leave" />
      ],
      'Enrollment in health insurance plans': [
        <EnhancedInput formData={formData} updateField={updateField} key="insuranceType" fieldName="insuranceType" label="Insurance Type" type="select" options={['HMO', 'Life Insurance', 'Disability Insurance', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="coverageType" fieldName="coverageType" label="Coverage Type" type="select" options={['Individual', 'Family', 'Dependent Only']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Enrollment" type="textarea" required placeholder="Please provide reason for insurance enrollment" />
      ],
      'Updates to beneficiary information': [
        <EnhancedInput formData={formData} updateField={updateField} key="beneficiaryType" fieldName="beneficiaryType" label="Beneficiary Type" type="select" options={['Life Insurance', 'Retirement Plan', 'HMO', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="beneficiaryName" fieldName="beneficiaryName" label="Beneficiary Name" required placeholder="Enter beneficiary full name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="relationship" fieldName="relationship" label="Relationship" type="select" options={['Spouse', 'Child', 'Parent', 'Sibling', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Update" type="textarea" required placeholder="Please provide reason for beneficiary update" />
      ],
      'Changes in retirement plan contributions': [
        <EnhancedInput formData={formData} updateField={updateField} key="contributionType" fieldName="contributionType" label="Contribution Type" type="select" options={['SSS', 'PAG-IBIG', 'Company Retirement', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="currentContribution" fieldName="currentContribution" label="Current Contribution Amount" type="number" required placeholder="Enter current contribution amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="newContribution" fieldName="newContribution" label="New Contribution Amount" type="number" required placeholder="Enter new contribution amount" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Change" type="textarea" required placeholder="Please provide reason for contribution change" />
      ],
      'Requests for current leave balance status': [
        <EnhancedInput formData={formData} updateField={updateField} key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Sick Leave', 'Vacation Leave', 'Personal Leave', 'All Types']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="period" fieldName="period" label="Period" type="select" options={['Current Year', 'Previous Year', 'Specific Period']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Request" type="textarea" placeholder="Please specify why you need leave balance information" />
      ],
      'Queries about leave accrual rates': [
        <EnhancedInput formData={formData} updateField={updateField} key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Sick Leave', 'Vacation Leave', 'Personal Leave', 'All Types']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Query" type="textarea" required placeholder="Please describe your leave accrual query" />
      ],
      'Incident reports for workplace disputes': [
        <EnhancedInput formData={formData} updateField={updateField} key="incidentDate" fieldName="incidentDate" label="Incident Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="incidentType" fieldName="incidentType" label="Incident Type" type="select" options={['Workplace Conflict', 'Harassment', 'Discrimination', 'Safety Issue', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="involvedParties" fieldName="involvedParties" label="Involved Parties" required placeholder="Enter names of involved parties" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Incident Description" type="textarea" required placeholder="Please provide detailed description of the incident" />
      ],
      'Requests for anonymous reporting options': [
        <EnhancedInput formData={formData} updateField={updateField} key="reportType" fieldName="reportType" label="Report Type" type="select" options={['Workplace Issue', 'Policy Violation', 'Safety Concern', 'Ethics Violation', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Details of Concern" type="textarea" required placeholder="Please provide details of your concern" />
      ],
      'Suggestions for workplace improvements': [
        <EnhancedInput formData={formData} updateField={updateField} key="suggestionCategory" fieldName="suggestionCategory" label="Category" type="select" options={['Work Environment', 'Process Improvement', 'Technology', 'Communication', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Suggestion Details" type="textarea" required placeholder="Please provide your suggestion for workplace improvement" />
      ],
      'Feedback on HR policies or initiatives': [
        <EnhancedInput formData={formData} updateField={updateField} key="policyType" fieldName="policyType" label="Policy/Initiative" type="select" options={['HR Policies', 'Benefits Programs', 'Training Initiatives', 'Workplace Culture', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="feedbackType" fieldName="feedbackType" label="Feedback Type" type="select" options={['Positive', 'Constructive', 'Concern', 'Suggestion']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Feedback Details" type="textarea" required placeholder="Please provide your feedback" />
      ],
      'Appointments with employee assistance programs (EAP)': [
        <EnhancedInput formData={formData} updateField={updateField} key="assistanceType" fieldName="assistanceType" label="Assistance Type" type="select" options={['Counseling', 'Mental Health Support', 'Work-Life Balance', 'Stress Management', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="urgency" fieldName="urgency" label="Urgency Level" type="select" options={['Low', 'Medium', 'High', 'Critical']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="preferredDate" fieldName="preferredDate" label="Preferred Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Description of Need" type="textarea" required placeholder="Please describe what assistance you need" />
      ],
      'Mediation requests for resolving conflicts': [
        <EnhancedInput formData={formData} updateField={updateField} key="conflictType" fieldName="conflictType" label="Conflict Type" type="select" options={['Interpersonal', 'Team Dynamics', 'Supervisor-Employee', 'Departmental', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="involvedParties" fieldName="involvedParties" label="Involved Parties" required placeholder="Enter names of parties involved in conflict" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Conflict Description" type="textarea" required placeholder="Please describe the conflict and why mediation is needed" />
      ],
      'Request employment certificate': [
        <EnhancedInput formData={formData} updateField={updateField} key="certificateType" fieldName="certificateType" label="Certificate Type" type="select" options={['Employment Certificate', 'Certificate of Employment', 'Service Record', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="purpose" fieldName="purpose" label="Purpose" type="select" options={['Bank Loan', 'Visa Application', 'Job Application', 'Government Transaction', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Additional Details" type="textarea" placeholder="Please provide any additional details for the certificate" />
      ],
      'Verification of employment for external purposes': [
        <EnhancedInput formData={formData} updateField={updateField} key="verificationType" fieldName="verificationType" label="Verification Type" type="select" options={['Employment Status', 'Salary Verification', 'Position Verification', 'Service Period', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="requestingParty" fieldName="requestingParty" label="Requesting Party" required placeholder="Enter name of requesting party/organization" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Purpose of Verification" type="textarea" required placeholder="Please specify the purpose of employment verification" />
      ],
      'Request performance review copies': [
        <EnhancedInput formData={formData} updateField={updateField} key="reviewPeriod" fieldName="reviewPeriod" label="Review Period" type="select" options={['Current Year', 'Previous Year', 'Specific Period']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reviewType" fieldName="reviewType" label="Review Type" type="select" options={['Annual Review', 'Mid-Year Review', 'Probationary Review', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Request" type="textarea" required placeholder="Please specify why you need the performance review copies" />
      ],
      'Access historical payroll records': [
        <EnhancedInput formData={formData} updateField={updateField} key="recordPeriod" fieldName="recordPeriod" label="Record Period" type="select" options={['Current Year', 'Previous Year', 'Specific Period', 'Multiple Years']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="recordType" fieldName="recordType" label="Record Type" type="select" options={['Payslips', 'Tax Documents', 'Deduction Records', 'All Records']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Access" type="textarea" required placeholder="Please specify why you need access to historical payroll records" />
      ],
      'Follow-up on job application status': [
        <EnhancedInput formData={formData} updateField={updateField} key="applicationDate" fieldName="applicationDate" label="Application Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="positionApplied" fieldName="positionApplied" label="Position Applied For" required placeholder="Enter position title" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Additional Information" type="textarea" placeholder="Please provide any additional information about your application" />
      ],
      'Feedback requests for unsuccessful candidates': [
        <EnhancedInput formData={formData} updateField={updateField} key="applicationDate" fieldName="applicationDate" label="Application Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="positionApplied" fieldName="positionApplied" label="Position Applied For" required placeholder="Enter position title" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Feedback Request" type="textarea" required placeholder="Please specify what type of feedback you are seeking" />
      ],
      'Inquiries about referral program rewards': [
        <EnhancedInput formData={formData} updateField={updateField} key="referralType" fieldName="referralType" label="Referral Type" type="select" options={['Employee Referral', 'External Referral', 'Client Referral', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="referralName" fieldName="referralName" label="Referred Person Name" required placeholder="Enter name of referred person" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Inquiry Details" type="textarea" required placeholder="Please describe your inquiry about referral rewards" />
      ],
      'Request onboarding schedule and agenda': [
        <EnhancedInput formData={formData} updateField={updateField} key="startDate" fieldName="startDate" label="Preferred Start Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="position" fieldName="position" label="Position" required placeholder="Enter your position title" />,
        <EnhancedInput formData={formData} updateField={updateField} key="department" fieldName="department" label="Department" type="select" options={departments} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Special Requirements" type="textarea" placeholder="Please specify any special onboarding requirements" />
      ],
      'Submit required documents (e.g., IDs, bank details)': [
        <EnhancedInput formData={formData} updateField={updateField} key="documentType" fieldName="documentType" label="Document Type" type="select" options={['Government ID', 'Bank Details', 'Educational Certificates', 'Medical Clearance', 'Other']} required />,
        <EnhancedFileUpload key="document" fieldName="document" label="Upload Document" accept=".pdf,.jpg,.jpeg,.png" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Additional Information" type="textarea" placeholder="Please provide any additional information about the document" />
      ],
      'Registration for in-house training sessions': [
        <EnhancedInput formData={formData} updateField={updateField} key="trainingTitle" fieldName="trainingTitle" label="Training Title" required placeholder="Enter training session title" />,
        <EnhancedInput formData={formData} updateField={updateField} key="trainingDate" fieldName="trainingDate" label="Training Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Reason for Registration" type="textarea" required placeholder="Please explain why you want to attend this training" />
      ],
      'Request for external training sponsorship': [
        <EnhancedInput formData={formData} updateField={updateField} key="trainingTitle" fieldName="trainingTitle" label="Training Title" required placeholder="Enter training title" />,
        <EnhancedInput formData={formData} updateField={updateField} key="trainingProvider" fieldName="trainingProvider" label="Training Provider" required placeholder="Enter training provider name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="trainingCost" fieldName="trainingCost" label="Training Cost" type="number" required placeholder="Enter estimated cost" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Business Justification" type="textarea" required placeholder="Please provide business justification for this training" />
      ],
      'Apply for certification courses': [
        <EnhancedInput formData={formData} updateField={updateField} key="certificationName" fieldName="certificationName" label="Certification Name" required placeholder="Enter certification name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="certificationProvider" fieldName="certificationProvider" label="Certification Provider" required placeholder="Enter certification provider" />,
        <EnhancedInput formData={formData} updateField={updateField} key="expectedCompletion" fieldName="expectedCompletion" label="Expected Completion Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Career Development Goals" type="textarea" required placeholder="Please explain how this certification aligns with your career goals" />
      ],
      'Request to attend conferences or seminars': [
        <EnhancedInput formData={formData} updateField={updateField} key="eventName" fieldName="eventName" label="Event Name" required placeholder="Enter conference/seminar name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="eventDate" fieldName="eventDate" label="Event Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="eventLocation" fieldName="eventLocation" label="Event Location" required placeholder="Enter event location" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Business Justification" type="textarea" required placeholder="Please provide business justification for attending this event" />
      ],
      'Submit training feedback forms': [
        <EnhancedInput formData={formData} updateField={updateField} key="trainingTitle" fieldName="trainingTitle" label="Training Title" required placeholder="Enter training title" />,
        <EnhancedInput formData={formData} updateField={updateField} key="trainingDate" fieldName="trainingDate" label="Training Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="rating" fieldName="rating" label="Overall Rating" type="select" options={['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Feedback Details" type="textarea" required placeholder="Please provide detailed feedback about the training" />
      ],
      'Suggestions for future training topics': [
        <EnhancedInput formData={formData} updateField={updateField} key="trainingCategory" fieldName="trainingCategory" label="Training Category" type="select" options={['Technical Skills', 'Soft Skills', 'Leadership', 'Compliance', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Training Topic Suggestion" type="textarea" required placeholder="Please suggest specific training topics and explain their relevance" />
      ],
      'Clarification on employee handbook policies': [
        <EnhancedInput formData={formData} updateField={updateField} key="policySection" fieldName="policySection" label="Policy Section" required placeholder="Enter specific policy section or page number" />,
        <EnhancedInput formData={formData} updateField={updateField} key="policyType" fieldName="policyType" label="Policy Type" type="select" options={['Attendance', 'Leave', 'Dress Code', 'Conduct', 'Benefits', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Question" type="textarea" required placeholder="Please provide your specific question about the policy" />
      ],
      'Inquiries about dress code or attendance policies': [
        <EnhancedInput formData={formData} updateField={updateField} key="policyType" fieldName="policyType" label="Policy Type" type="select" options={['Dress Code', 'Attendance', 'Both']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Inquiry" type="textarea" required placeholder="Please describe your specific inquiry about the policy" />
      ],
      'Report potential compliance violations': [
        <EnhancedInput formData={formData} updateField={updateField} key="violationType" fieldName="violationType" label="Violation Type" type="select" options={['Policy Violation', 'Legal Violation', 'Ethics Violation', 'Safety Violation', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="violationDate" fieldName="violationDate" label="Violation Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Violation Details" type="textarea" required placeholder="Please provide detailed information about the potential violation" />
      ],
      'Request compliance training or resources': [
        <EnhancedInput formData={formData} updateField={updateField} key="trainingType" fieldName="trainingType" label="Training Type" type="select" options={['Compliance Training', 'Ethics Training', 'Safety Training', 'Policy Training', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Training Need" type="textarea" required placeholder="Please describe your compliance training needs" />
      ],
      'Clarification on specific policy provisions': [
        <EnhancedInput formData={formData} updateField={updateField} key="policyName" fieldName="policyName" label="Policy Name" required placeholder="Enter policy name" />,
        <EnhancedInput formData={formData} updateField={updateField} key="policySection" fieldName="policySection" label="Policy Section" required placeholder="Enter specific section or provision" />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Clarification Request" type="textarea" required placeholder="Please provide your specific clarification request" />
      ],
      'Requests for updates on policy changes': [
        <EnhancedInput formData={formData} updateField={updateField} key="policyType" fieldName="policyType" label="Policy Type" type="select" options={['HR Policies', 'Benefits Policies', 'Safety Policies', 'IT Policies', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Information Request" type="textarea" required placeholder="Please specify what policy updates you need information about" />
      ],
      'Replace faulty equipment': [
        <EnhancedInput formData={formData} updateField={updateField} key="equipmentType" fieldName="equipmentType" label="Equipment Type" type="select" options={['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Printer', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="equipmentIssue" fieldName="equipmentIssue" label="Equipment Issue" type="select" options={['Hardware Failure', 'Software Issues', 'Performance Problems', 'Physical Damage', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Issue Description" type="textarea" required placeholder="Please describe the equipment issue in detail" />
      ],
      'Report issues with office facilities (e.g., air conditioning)': [
        <EnhancedInput formData={formData} updateField={updateField} key="facilityType" fieldName="facilityType" label="Facility Type" type="select" options={['Air Conditioning', 'Lighting', 'Plumbing', 'Electrical', 'Elevator', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="issueSeverity" fieldName="issueSeverity" label="Issue Severity" type="select" options={['Low', 'Medium', 'High', 'Critical']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Issue Description" type="textarea" required placeholder="Please describe the facility issue in detail" />
      ],
      'Request workspace repairs or adjustments': [
        <EnhancedInput formData={formData} updateField={updateField} key="repairType" fieldName="repairType" label="Repair Type" type="select" options={['Desk Repair', 'Chair Repair', 'Lighting Fix', 'Electrical Fix', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Repair Description" type="textarea" required placeholder="Please describe the workspace repair needed" />
      ],
      'Request ergonomic assessments': [
        <EnhancedInput formData={formData} updateField={updateField} key="assessmentType" fieldName="assessmentType" label="Assessment Type" type="select" options={['Workstation Assessment', 'Chair Assessment', 'Monitor Setup', 'Keyboard/Mouse Setup', 'Full Ergonomic Review']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Assessment Reason" type="textarea" required placeholder="Please describe why you need an ergonomic assessment" />
      ],
      'Request changes in seating arrangements or desk setups': [
        <EnhancedInput formData={formData} updateField={updateField} key="changeType" fieldName="changeType" label="Change Type" type="select" options={['Seating Location', 'Desk Setup', 'Monitor Position', 'Storage Arrangement', 'Other']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Change Request Details" type="textarea" required placeholder="Please describe the seating/desk changes you need" />
      ],
      'Inquiries about notice periods and final workdays': [
        <EnhancedInput formData={formData} updateField={updateField} key="resignationDate" fieldName="resignationDate" label="Planned Resignation Date" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Questions" type="textarea" required placeholder="Please specify your questions about notice periods and final workdays" />
      ],
      'Submit exit feedback and suggestions': [
        <EnhancedInput formData={formData} updateField={updateField} key="feedbackType" fieldName="feedbackType" label="Feedback Type" type="select" options={['Workplace Culture', 'Management', 'Processes', 'Benefits', 'Overall Experience']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="rating" fieldName="rating" label="Overall Rating" type="select" options={['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Feedback Details" type="textarea" required placeholder="Please provide your exit feedback and suggestions" />
      ],
      'Request final paycheck details': [
        <EnhancedInput formData={formData} updateField={updateField} key="lastWorkingDay" fieldName="lastWorkingDay" label="Last Working Day" type="date" required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Questions" type="textarea" required placeholder="Please specify your questions about final paycheck details" />
      ],
      'Inquiries about continuation of benefits (e.g., COBRA)': [
        <EnhancedInput formData={formData} updateField={updateField} key="benefitType" fieldName="benefitType" label="Benefit Type" type="select" options={['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance', 'All Benefits']} required />,
        <EnhancedInput formData={formData} updateField={updateField} key="reason" fieldName="reason" label="Specific Questions" type="textarea" required placeholder="Please specify your questions about benefit continuation" />
      ]
    };

    return formConfigs[title] || [];
  };

  if (title === "Downloadable Forms") {
    return <div>Redirecting to Downloadable Forms...</div>;
  }

  return (
    <div className="modern-form-container" style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          borderRadius: '8px',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '40px 35px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '380px',
            width: '90%',
            position: 'relative',
            animation: 'slideUp 0.4s ease-out'
          }}>
            {/* Animated background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #3498db, #2ecc71, #f39c12, #e74c3c, #9b59b6, #3498db)',
              backgroundSize: '300% 100%',
              animation: 'gradientShift 2s ease-in-out infinite',
              borderRadius: '16px 16px 0 0'
            }}></div>
            
            {/* Enhanced spinner */}
            <div style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              margin: '0 auto 25px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f1f3f4',
                borderTop: '4px solid #3498db',
                borderRight: '4px solid #2ecc71',
                borderRadius: '50%',
                animation: 'spin 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
                position: 'absolute'
              }}></div>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f1f3f4',
                borderBottom: '3px solid #e74c3c',
                borderLeft: '3px solid #f39c12',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite reverse',
                position: 'absolute'
              }}></div>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#9b59b6',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite',
                position: 'absolute'
              }}></div>
            </div>

            {/* Enhanced content */}
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#2c3e50', 
              fontSize: '20px',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              Processing Your Request
            </h3>
            
            <p style={{ 
              margin: '0 0 20px 0', 
              color: '#5a6c7d', 
              fontSize: '15px',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              Please wait while we securely process and submit your HRD request...
            </p>

            {/* Progress dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#3498db',
                  borderRadius: '50%',
                  animation: `bounce 1.4s ease-in-out infinite both`,
                  animationDelay: `${i * 0.16}s`
                }}></div>
              ))}
            </div>

            {/* Status message */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              marginBottom: '15px'
            }}>
              <p style={{ 
                margin: '0', 
                color: '#495057', 
                fontSize: '13px',
                fontWeight: '500'
              }}>
                ✓ Validating form data
              </p>
            </div>

            <p style={{ 
              margin: '0', 
              color: '#6c757d', 
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              This usually takes 2-5 seconds
            </p>
          </div>
        </div>
      )}
      {title === 'Submit employee referrals' ? (
        <div className="modern-referral-container">
          <div className="modern-referral-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="modern-referral-title">Submit Employee Referrals</h2>
          <p className="modern-referral-description">
            Click the button below to access the external referral submission form.
          </p>
          <button type="button" className="modern-referral-button" onClick={handleReferralClick}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Go to Referral Form
          </button>
          <button type="button" className="modern-form-button modern-form-button-secondary" onClick={onBack} style={{ marginTop: 'var(--space-4)' }}>
            Back
          </button>
        </div>
      ) : (
        <>
          <div className="modern-form-header">
            <h2 className="modern-form-title">{title}</h2>
            <p className="modern-form-subtitle">Please fill out all required fields to submit your request</p>
          </div>
          <form className="modern-form" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>
              <p className="form-section-description">Please provide your basic contact information</p>
            <div className="modern-form-layout">
              <div className="modern-form-section">
                  <EnhancedInput formData={formData} updateField={updateField} 
                  fieldName="name" 
                  label="Name" 
                  required 
                  placeholder="Enter your full name" 
                />
                
                  <EnhancedInput formData={formData} updateField={updateField} 
                  fieldName="email" 
                  label="Castotravel Email" 
                  type="email" 
                  required 
                    placeholder="Enter your @castotravel.ph email address" 
                />
              </div>
              
              <div className="modern-form-section">
                  <EnhancedInput formData={formData} updateField={updateField} 
                  fieldName="divisionmanager" 
                  label="Division Manager" 
                  type="select" 
                  options={DIVISION_MANAGERS} 
                  required 
                />

                {/* Only show attachment field if NOT Company ID form */}
                {title !== 'Request form for Company ID' && (
                  <EnhancedFileUpload 
                    fieldName="attachment" 
                    label="Attach Supporting Documents" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                )}
                </div>
              </div>
            </div>

            {/* Form-specific fields */}
            {getFormSpecificFields().length > 0 && (
              <div className="form-section">
                <h3 className="form-section-title">Request Details</h3>
                <p className="form-section-description">Please provide specific information for your request</p>
            <div className="modern-form-layout">
              <div className="modern-form-section full-width">
                {getFormSpecificFields()}
              </div>
            </div>
              </div>
            )}

            {/* Fallback description field for forms without specific configurations */}
            {!getFormSpecificFields().length && (
              <div className="form-section">
                <h3 className="form-section-title">Request Description</h3>
                <p className="form-section-description">Please provide details about your request</p>
              <div className="modern-form-layout">
                <div className="modern-form-section full-width">
                    <EnhancedInput formData={formData} updateField={updateField} 
                    fieldName="description" 
                    label={title === 'Kudos Submission Form' ? 'Reason for Kudos' : 'Description'} 
                    type="textarea" 
                    required
                    placeholder={title === 'Kudos Submission Form' ? 'Reason for Kudos' : 'Enter your description'}
                  />
                  </div>
                </div>
              </div>
            )}

            <div className="modern-form-buttons">
              <button type="submit" className="modern-form-button modern-form-button-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="modern-form-loading"></span>
                    Please wait, submitting your request...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Request
                  </>
                )}
              </button>
              <button type="button" className="modern-form-button modern-form-button-secondary" onClick={onBack}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
        </div>
      </form>
        </>
      )}
      <ErrorModal />
    </div>
  );
};

export default React.memo(Form);