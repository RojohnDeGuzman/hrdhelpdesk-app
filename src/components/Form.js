import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from '../hooks/useForm';
import { LOCATIONS, DIVISION_MANAGERS, EMAILJS_CONFIG, UPLOAD_SERVER_URL } from '../constants/data';
import axios from 'axios';
import '../styles/modern-forms.css';

const Form = ({ title, onBack, onSubmitSuccess }) => {
  const [attachment, setAttachment] = useState(null);
  const [picture, setPicture] = useState(null);
  const [signature, setSignature] = useState(null);
  const [medicalCertificate, setMedicalCertificate] = useState(null);
  const [supportingDocuments, setSupportingDocuments] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isValidating, setIsValidating] = useState({});

  const initialValues = {
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
    kudosCategory: ''
  };

  const { formData, loading, setLoading, updateField, validateForm } = useForm(initialValues);

  const validationRules = useMemo(() => ({
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    divisionmanager: { required: true },
    description: { required: true, minLength: 10 },
    employeeId: { required: true, pattern: /^[A-Z0-9]+$/ },
    phoneNumber: { required: true, pattern: /^[0-9+\-\s()]+$/ },
    amount: { required: true, pattern: /^\d+(\.\d{2})?$/ },
    startDate: { required: true },
    endDate: { required: true },
    resignationDate: { required: true },
    lastWorkingDay: { required: true }
  }), []);

  // Real-time validation
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    if (rules.required && (!value || value.trim() === '')) {
      return `${fieldName} is required`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return `Please enter a valid ${fieldName}`;
    }

    return null;
  }, [validationRules]);

  // Debounced validation
  const debouncedValidation = useCallback((fieldName, value) => {
    setIsValidating(prev => ({ ...prev, [fieldName]: true }));
    
    const timeoutId = setTimeout(() => {
      const error = validateField(fieldName, value);
      setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
      setIsValidating(prev => ({ ...prev, [fieldName]: false }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [validateField]);

  // Enhanced input change handler
  const handleFieldChange = useCallback((fieldName, value) => {
    updateField(fieldName, value);
    debouncedValidation(fieldName, value);
  }, [updateField, debouncedValidation]);

  // Auto-save functionality
  useEffect(() => {
    const saveDraft = () => {
      const draftData = {
        formData,
        attachment: attachment?.name,
        picture: picture?.name,
        signature: signature?.name,
        medicalCertificate: medicalCertificate?.name,
        supportingDocuments: supportingDocuments?.name,
        timestamp: Date.now()
      };
      localStorage.setItem(`form_draft_${title}`, JSON.stringify(draftData));
    };

    const timeoutId = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, attachment, picture, signature, medicalCertificate, supportingDocuments, title]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`form_draft_${title}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.timestamp && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          Object.keys(draft.formData).forEach(key => {
            if (draft.formData[key] !== undefined) {
              updateField(key, draft.formData[key]);
            }
          });
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [title, updateField]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm(validationRules)) {
      return;
    }

    setLoading(true);

    let uploadedFileUrls = {
      attachment: null,
      picture: null,
      signature: null
    };

    try {
      // Handle regular attachment upload
      if (attachment && attachment instanceof File && attachment.size > 0) {
        const formData = new FormData();
        formData.append('file', attachment);
        try {
          const uploadResponse = await axios.post(`${UPLOAD_SERVER_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadResponse.data.fileUrl) {
            uploadedFileUrls.attachment = uploadResponse.data.fileUrl;
          }
        } catch (uploadError) {
          console.error('Error uploading attachment:', uploadError);
        }
      }

      // Handle picture and signature uploads for Company ID form
      if (title === 'Request form for Company ID') {
        if (picture && picture instanceof File && picture.size > 0) {
          const pictureFormData = new FormData();
          pictureFormData.append('file', picture);
          try {
            const pictureResponse = await axios.post(`${UPLOAD_SERVER_URL}/upload?type=picture`, pictureFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (pictureResponse.data.fileUrl) {
              uploadedFileUrls.picture = pictureResponse.data.fileUrl;
            }
          } catch (uploadError) {
            console.error('Error uploading picture:', uploadError);
          }
        }

        if (signature && signature instanceof File && signature.size > 0) {
          const signatureFormData = new FormData();
          signatureFormData.append('file', signature);
          try {
            const signatureResponse = await axios.post(`${UPLOAD_SERVER_URL}/upload?type=signature`, signatureFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (signatureResponse.data.fileUrl) {
              uploadedFileUrls.signature = signatureResponse.data.fileUrl;
            }
          } catch (uploadError) {
            console.error('Error uploading signature:', uploadError);
          }
        }
      }

      // Prepare the email data
      const data = {
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          from_name: formData.name,
          from_email: formData.email,
          from_divisionmanager: `Division Manager: ${formData.divisionmanager}`,
          to_name: 'HRD Helpdesk',
          message: formData.description,
          detail_title: title,
          ...(uploadedFileUrls.attachment && {
            attachment_url: uploadedFileUrls.attachment,
            attachment_text: 'Download Attachment',
          }),
          ...(title === 'Request form for Company ID' && {
            emergency_contact: `Emergency Contact: ${formData.emergencyContact}`,
            contact_number: `Contact Number: ${formData.contactNumber}`,
            address: `Address: ${formData.address}`,
            ...(uploadedFileUrls.picture && {
              picture_url: uploadedFileUrls.picture,
              picture_text: 'Download Picture',
            }),
            ...(uploadedFileUrls.signature && {
              signature_url: uploadedFileUrls.signature,
              signature_text: 'Download Signature',
            }),
          }),
          ...(title === 'Transfer for Operations Department' && {
            agent_name: `Agent: ${formData.agentName}`,
            from_dept: `From Department: ${formData.fromDept}`,
            to_dept: `To Department: ${formData.toDept}`,
          }),
          ...(title === 'Kudos Submission Form' && {
            agent_name: `Agent: ${formData.agentName}`,
          }),
          ...(title === 'Request for Lounge Space' && {
            location: `Location of Reservation: ${formData.location}`,
            ...(formData.ccEmail && { cc_email: formData.ccEmail }),
            date_from: `Date from: ${formData.fromDate}`,
            date_to: `Date to: ${formData.toDate}`,
          }),
          ...(title === 'Request Floating Status Request Form' && {
            employee_Name: `Employee Name: ${formData.employeeName}`,
            current_Dept: `Current Department: ${formData.currentDept}`,
            effective_Date: `Effective Date: ${formData.effectiveDate}`,
          }),
          ...(title === 'Request Employee Information Access' && {
            requested_Agent: `Employee Name: ${formData.requestedAgent}`,
          }),
          ...(title === 'Team Fund Request Form' && {
            fund_department: `Fund Department: ${formData.funddepartment}`,
          }),
        },
      };

      // Send email using EmailJS
      const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", data);
      console.log('Email Response:', response.data);

      onSubmitSuccess();
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      alert('Failed to submit the form. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [formData, attachment, picture, signature, title, validateForm, validationRules, setLoading, onSubmitSuccess]);

  const handleReferralClick = () => {
    window.location.href = "https://forms.office.com/Pages/ResponsePage.aspx?id=OCfYxf2Iu0mwFJhfjf-8IwIdX7N3k2xEvvPK_rTQuKZUMDc3NlZTUjFLUElZT0VFUVRCUjVKM0E0Mi4u";
  };

  // Enhanced input components
  const EnhancedInput = ({ fieldName, label, type = "text", required = false, placeholder, options = null, ...props }) => {
    const hasError = fieldErrors[fieldName];
    const isValidatingField = isValidating[fieldName];
    const value = formData[fieldName] || '';

    return (
      <div className="modern-form-group">
        <label className="modern-form-label">
          {label} {required && <span className="required">*</span>}
        </label>
        {type === 'select' ? (
          <select
            className={`modern-form-select ${hasError ? 'error' : ''} ${isValidatingField ? 'validating' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
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
            className={`modern-form-textarea ${hasError ? 'error' : ''} ${isValidatingField ? 'validating' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={placeholder}
            required={required}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={`modern-form-input ${hasError ? 'error' : ''} ${isValidatingField ? 'validating' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={placeholder}
            required={required}
            {...props}
          />
        )}
        {isValidatingField && <span className="modern-form-validating">Validating...</span>}
        {hasError && <span className="modern-form-error">{hasError}</span>}
        {!hasError && value && !isValidatingField && <span className="modern-form-success">✓</span>}
      </div>
    );
  };

  // Enhanced file upload component
  const EnhancedFileUpload = ({ fieldName, label, accept, required = false, multiple = false }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrag = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    }, []);

    const handleDrop = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        setFile(droppedFile);
        if (fieldName === 'attachment') setAttachment(droppedFile);
        if (fieldName === 'picture') setPicture(droppedFile);
        if (fieldName === 'signature') setSignature(droppedFile);
        if (fieldName === 'medicalCertificate') setMedicalCertificate(droppedFile);
        if (fieldName === 'supportingDocuments') setSupportingDocuments(droppedFile);
      }
    }, [fieldName]);

    const handleFileChange = useCallback((e) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (fieldName === 'attachment') setAttachment(selectedFile);
        if (fieldName === 'picture') setPicture(selectedFile);
        if (fieldName === 'signature') setSignature(selectedFile);
        if (fieldName === 'medicalCertificate') setMedicalCertificate(selectedFile);
        if (fieldName === 'supportingDocuments') setSupportingDocuments(selectedFile);
      }
    }, [fieldName]);

  return (
      <div className="modern-form-group">
        <label className="modern-form-label">
          {label} {required && <span className="required">*</span>}
        </label>
        <div 
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
          <label htmlFor={`file-${fieldName}`} className="modern-form-file-label">
            <div className="modern-form-file-text">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {file ? (
                <div>
                  <strong>{file.name}</strong>
                  <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <span>Click to select file or drag and drop</span>
              )}
            </div>
          </label>
        </div>
      </div>
    );
  };

  // Form-specific field configurations
  const getFormSpecificFields = () => {
    const formConfigs = {
      // Personal Information Forms
      'Change of address or contact number': [
        <EnhancedInput key="employeeId" fieldName="employeeId" label="Employee ID" required placeholder="Enter your employee ID" />,
        <EnhancedInput key="phoneNumber" fieldName="phoneNumber" label="New Phone Number" type="tel" required placeholder="Enter new phone number" />,
        <EnhancedInput key="address" fieldName="address" label="New Address" type="textarea" required placeholder="Enter your new address" />
      ],
      'Update emergency contact details': [
        <EnhancedInput key="emergencyContact" fieldName="emergencyContact" label="Emergency Contact Name" required placeholder="Enter emergency contact name" />,
        <EnhancedInput key="contactNumber" fieldName="contactNumber" label="Emergency Contact Number" type="tel" required placeholder="Enter emergency contact number" />,
        <EnhancedInput key="relationship" fieldName="relationship" label="Relationship" required placeholder="e.g., Spouse, Parent, Sibling" />
      ],
      
      // Leave Forms
      'Bereavement Leave': [
        <EnhancedInput key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Bereavement Leave']} required />,
        <EnhancedInput key="startDate" fieldName="startDate" label="Start Date" type="date" required />,
        <EnhancedInput key="endDate" fieldName="endDate" label="End Date" type="date" required />,
        <EnhancedInput key="reason" fieldName="reason" label="Reason for Leave" type="textarea" required placeholder="Please provide details about the bereavement" />
      ],
      'Maternity/Paternity leave applications': [
        <EnhancedInput key="leaveType" fieldName="leaveType" label="Leave Type" type="select" options={['Maternity Leave', 'Paternity Leave']} required />,
        <EnhancedInput key="startDate" fieldName="startDate" label="Expected Start Date" type="date" required />,
        <EnhancedInput key="endDate" fieldName="endDate" label="Expected End Date" type="date" required />,
        <EnhancedInput key="medicalCertificate" fieldName="medicalCertificate" label="Medical Certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
      ],
      
      // Loan Forms
      'SSS Calamity and Salary Loan': [
        <EnhancedInput key="loanType" fieldName="loanType" label="Loan Type" type="select" options={['SSS Calamity Loan', 'SSS Salary Loan']} required />,
        <EnhancedInput key="loanAmount" fieldName="loanAmount" label="Loan Amount" type="number" required placeholder="Enter loan amount" />,
        <EnhancedInput key="loanPurpose" fieldName="loanPurpose" label="Purpose of Loan" type="textarea" required placeholder="Describe the purpose of the loan" />,
        <EnhancedInput key="repaymentPeriod" fieldName="repaymentPeriod" label="Preferred Repayment Period" type="select" options={['6 months', '12 months', '18 months', '24 months']} required />
      ],
      'Pag-ibig and Salary Loan': [
        <EnhancedInput key="loanType" fieldName="loanType" label="Loan Type" type="select" options={['Pag-IBIG Salary Loan', 'Pag-IBIG Multi-Purpose Loan']} required />,
        <EnhancedInput key="loanAmount" fieldName="loanAmount" label="Loan Amount" type="number" required placeholder="Enter loan amount" />,
        <EnhancedInput key="loanPurpose" fieldName="loanPurpose" label="Purpose of Loan" type="textarea" required placeholder="Describe the purpose of the loan" />
      ],
      
      // Equipment and Facilities
      'Request new hardware (e.g., laptops, monitors)': [
        <EnhancedInput key="equipmentType" fieldName="equipmentType" label="Equipment Type" type="select" options={['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Other']} required />,
        <EnhancedInput key="equipmentSpecs" fieldName="equipmentSpecs" label="Specifications" type="textarea" required placeholder="Please specify the required specifications" />,
        <EnhancedInput key="reason" fieldName="reason" label="Business Justification" type="textarea" required placeholder="Explain why this equipment is needed" />
      ],
      
      // Exit and Offboarding
      'Submit resignation letter': [
        <EnhancedInput key="resignationDate" fieldName="resignationDate" label="Resignation Date" type="date" required />,
        <EnhancedInput key="lastWorkingDay" fieldName="lastWorkingDay" label="Last Working Day" type="date" required />,
        <EnhancedInput key="reason" fieldName="reason" label="Reason for Resignation" type="textarea" required placeholder="Please provide your reason for resigning" />
      ],
      'Schedule exit interview appointment': [
        <EnhancedInput key="exitInterviewDate" fieldName="exitInterviewDate" label="Preferred Date" type="date" required />,
        <EnhancedInput key="exitInterviewTime" fieldName="exitInterviewTime" label="Preferred Time" type="time" required />,
        <EnhancedInput key="reason" fieldName="reason" label="Additional Comments" type="textarea" placeholder="Any specific topics you'd like to discuss during the exit interview" />
      ],
      
      // Kudos and Recognition
      'Kudos Submission Form': [
        <EnhancedInput key="kudosRecipient" fieldName="kudosRecipient" label="Recipient Name" required placeholder="Enter the name of the person you want to recognize" />,
        <EnhancedInput key="kudosCategory" fieldName="kudosCategory" label="Category" type="select" options={['Customer Service Excellence', 'Team Collaboration', 'Innovation', 'Going Above and Beyond', 'Leadership', 'Other']} required />,
        <EnhancedInput key="kudosReason" fieldName="kudosReason" label="Reason for Kudos" type="textarea" required placeholder="Describe why this person deserves recognition" />
      ],
      
      // Medical and Health
      'Verification of Medical Certificate': [
        <EnhancedInput key="medicalCertType" fieldName="medicalCertType" label="Medical Certificate Type" type="select" options={['Sick Leave', 'Medical Clearance', 'Health Check-up', 'Other']} required />,
        <EnhancedInput key="startDate" fieldName="startDate" label="Start Date" type="date" required />,
        <EnhancedInput key="endDate" fieldName="endDate" label="End Date" type="date" required />,
        <EnhancedFileUpload key="medicalCertificate" fieldName="medicalCertificate" label="Medical Certificate" accept=".pdf,.jpg,.jpeg,.png" required />
      ],
      
      // Transfer and Department Changes
      'Transfer for Operations Department': [
        <EnhancedInput key="agentName" fieldName="agentName" label="Agent for Transfer" required placeholder="Enter agent name" />,
        <EnhancedInput key="fromDept" fieldName="fromDept" label="From Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput key="toDept" fieldName="toDept" label="To Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput key="reason" fieldName="reason" label="Reason for Transfer" type="textarea" required placeholder="Please provide the reason for the transfer" />
      ],
      
      // Lounge and Facilities
      'Request for Lounge Space': [
        <EnhancedInput key="ccEmail" fieldName="ccEmail" label="Immediate Supervisor Email" type="email" required placeholder="Enter supervisor email" />,
        <EnhancedInput key="location" fieldName="location" label="Location of the Reservation" type="select" options={['Makati Lounge (Female)','Makati Lounge (Male)','Travelbank Lounge (for Travelbank employees)','QC Lounge','Cebu Lounge (Female)','Cebu Lounge (Male)','Bacolod Lounge (Female)', 'Bacolod Lounge (Male)','Alabang Lounge (Female)','Alabang Lounge (Male)']} required />,
        <EnhancedInput key="fromDate" fieldName="fromDate" label="Date Range - From" type="date" required />,
        <EnhancedInput key="toDate" fieldName="toDate" label="Date Range - To" type="date" required />,
        <EnhancedInput key="description" fieldName="description" label="Details of the Reservation" type="textarea" required placeholder="Enter details of the reservation" />
      ],
      
      // Company ID Request
      'Request form for Company ID': [
        <EnhancedInput key="emergencyContact" fieldName="emergencyContact" label="Emergency Contact Person" required placeholder="Enter emergency contact person" />,
        <EnhancedInput key="contactNumber" fieldName="contactNumber" label="Contact Number" type="tel" required placeholder="Enter contact number" />,
        <EnhancedInput key="address" fieldName="address" label="Address" type="textarea" required placeholder="Enter complete address" />,
        <EnhancedFileUpload key="picture" fieldName="picture" label="Upload Picture (Rename the file using your last name first, then your first name.)" accept="image/*" required />,
        <EnhancedFileUpload key="signature" fieldName="signature" label="Upload Signature (Rename the file using your last name first, then your first name.)" accept="image/*" required />
      ],
      
      // Floating Status Request
      'Request Floating Status Request Form': [
        <EnhancedInput key="employeeName" fieldName="employeeName" label="Employee Name (to be placed on Floating Status)" required placeholder="Enter employee's name" />,
        <EnhancedInput key="currentDept" fieldName="currentDept" label="Current Department of the Employee" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput key="effectiveDate" fieldName="effectiveDate" label="Effective Date of Floating Status" type="date" required />,
        <EnhancedInput key="reason" fieldName="reason" label="Reason for Requesting Floating Status" type="textarea" required placeholder="Enter the reason for floating status request" />
      ],
      
      // Employee Information Access
      'Request Employee Information Access': [
        <EnhancedInput key="requestedAgent" fieldName="requestedAgent" label="Name of the requested agent" required placeholder="Enter agent name" />,
        <EnhancedInput key="description" fieldName="description" label="Details requested for the agent" type="textarea" required placeholder="Enter details" />
      ],
      
      // Team Fund Request
      'Team Fund Request Form': [
        <EnhancedInput key="funddepartment" fieldName="funddepartment" label="Department" type="select" options={['Accounting SSD','Acendas - US Daytime','Admin','Accounting - FCTG FCM', 'Back Office - Accounting SSD', 'Accounting - Balboa','Blockskye - Afterhours', 'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours','Cadence - US Daytime', 'Casto Pool','CCRA - Afterhours','Classic Vacations','Coastline - US Daytime','Corporate Travel Management','FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email','FCTG CT US Afterhours - Chat','FCTG CT CA - Afterhours','DT East','DT West', 'Executive Travel - US Daytime','Accounting - FCTG S&C', 'Accounting - Cruising','FCTG FCM - Shell Afterhours','FCTG FCM - ECC Afterhours','FCTG FCM - Support Desk', 'Finance','Blockskye - Mid Office','Accounting - Gant','Gant - Afterhours','Gant - US Daytime','Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime','Human Resources','IT','Lake Shore - US Daytime','Largay','FCTG Liberty - Afterhours','FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime','Omega - US Daytime','Omega - Afterhours','Omega - US Daytime','Operations', 'SHTG - Afterhours','Solace Travel - US Daytime','Tangerine','Accounting - Tangerine','Training','Travel & Cruise Desk - US Daytime', 'TravelBank','Accounting - TravelBank','Travelstore','Accounting - TravelStore','Uniglobe Rotterdam','Uniglobe US','Vacation Planners','World Travel Service']} required />,
        <EnhancedInput key="description" fieldName="description" label="Details of the Request" type="textarea" required placeholder="Details" />
      ],
      
      // Payroll Dispute
      'Request for Payroll Dispute Form': [
        <EnhancedInput key="description" fieldName="description" label="Details of the Dispute" type="textarea" required placeholder="Enter details of the dispute" />
      ]
    };

    return formConfigs[title] || [];
  };

  if (title === "Downloadable Forms") {
    return <div>Redirecting to Downloadable Forms...</div>;
  }

  return (
    <div className="modern-form-container">
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
            <div className="modern-form-layout">
              <div className="modern-form-section">
                <EnhancedInput 
                  fieldName="name" 
                  label="Name" 
                  required 
                  placeholder="Enter your full name" 
                />
                
                <EnhancedInput 
                  fieldName="email" 
                  label="Castotravel Email" 
                  type="email" 
                  required 
                  placeholder="Enter your email address" 
                />
              </div>
              
              <div className="modern-form-section">
                <EnhancedInput 
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

            {/* Form-specific fields */}
            <div className="modern-form-layout">
              <div className="modern-form-section full-width">
                {getFormSpecificFields()}
              </div>
            </div>


            {/* Fallback description field for forms without specific configurations */}
            {!getFormSpecificFields().length && (
              <div className="modern-form-layout">
                <div className="modern-form-section full-width">
                  <EnhancedInput 
                    fieldName="description" 
                    label={title === 'Kudos Submission Form' ? 'Reason for Kudos' : 'Description'} 
                    type="textarea" 
                    required
                    placeholder={title === 'Kudos Submission Form' ? 'Reason for Kudos' : 'Enter your description'}
                  />
                </div>
              </div>
            )}

            <div className="modern-form-buttons">
              <button type="submit" className="modern-form-button modern-form-button-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="modern-form-loading"></span>
                    Submitting...
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
    </div>
  );
};

export default React.memo(Form);