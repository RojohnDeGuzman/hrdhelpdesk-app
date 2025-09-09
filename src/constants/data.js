export const DEPARTMENTS = [
  'Accounting SSD', 'Acendas - US Daytime', 'Admin', 'Accounting - FCTG FCM', 
  'Back Office - Accounting SSD', 'Accounting - Balboa', 'Blockskye - Afterhours', 
  'Brownell', 'Accounting - Cadence', 'Cadence - Afterhours', 'Cadence - US Daytime',
  'Casto Pool', 'CCRA - Afterhours', 'Classic Vacations', 'Coastline - US Daytime',
  'Corporate Travel Management', 'FCTG CT CA - Daytime', 'FCTG CT US Afterhours - Email',
  'FCTG CT US Afterhours - Chat', 'FCTG CT CA - Afterhours', 'DT East', 'DT West',
  'Executive Travel - US Daytime', 'Accounting - FCTG S&C', 'Accounting - Cruising',
  'FCTG FCM - Shell Afterhours', 'FCTG FCM - ECC Afterhours', 'FCTG FCM - Support Desk',
  'Finance', 'Blockskye - Mid Office', 'Accounting - Gant', 'Gant - Afterhours',
  'Gant - US Daytime', 'Gant - US Daytime / Recon Desk', 'Global Escapes - US Daytime',
  'Human Resources', 'IT', 'Lake Shore - US Daytime', 'Largay', 'FCTG Liberty - Afterhours',
  'FCTG Liberty Groups - US Daytime', 'McCabe - US Daytime', 'Omega - US Daytime',
  'Omega - Afterhours', 'Operations', 'SHTG - Afterhours', 'Solace Travel - US Daytime',
  'Tangerine', 'Accounting - Tangerine', 'Training', 'Travel & Cruise Desk - US Daytime',
  'TravelBank', 'Accounting - TravelBank', 'Travelstore', 'Accounting - TravelStore',
  'Uniglobe Rotterdam', 'Uniglobe US', 'Vacation Planners', 'World Travel Service'
];

export const LOCATIONS = [
  'Makati Lounge (Female)', 'Makati Lounge (Male)', 'Travelbank Lounge (for Travelbank employees)',
  'QC Lounge', 'Cebu Lounge (Female)', 'Cebu Lounge (Male)', 'Bacolod Lounge (Female)',
  'Bacolod Lounge (Male)', 'Alabang Lounge (Female)', 'Alabang Lounge (Male)'
];

export const DIVISION_MANAGERS = [
  'Elaine Randrup (Operations)', 'April Fara Guiteng', 'Beulah Agapito', 'Jackie Sebastian',
  'Robert Del Villar', 'Joshua Cruz', 'George Anzures (IT)',
  'Alwin Benedicto (Finance)', 'Ma. Berdandina Galvez (HR)'
];

export const DOWNLOADABLE_FORMS = [
  {
    name: "PAG-IBIG MULTI-PURPOSE LOAN APPLICATION FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/PAG-IBIG MULTI-PURPOSE LOAN APPLICATION FORM.pdf",
    description: "Standard form for PAG-IBIG MULTI-PURPOSE LOAN"
  },
  {
    name: "PAG-IBIG CALAMITY LOAN APPLICATION FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/PAG-IBIG CALAMITY LOAN APPLICATION FORM.pdf",
    description: "Standard form for PAG-IBIG CALAMITY LOAN"
  },
  {
    name: "RCBC CORPORATE SALARY LOAN APPLICATION",
    fileUrl: process.env.PUBLIC_URL + "/forms/RCBC CORPORATE SALARY LOAN APPLICATION.pdf",
    description: "Standard Form for RCBC CORPORATE SALARY LOAN APPLICATION"
  },
  {
    name: "SSS SICKNESS MEDICAL CERTIFICATE FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/SSS SICKNESS MEDICAL CERTIFICATE FORM.pdf",
    description: "Form for SSS SICKNESS MEDICAL CERTIFICATE FORM"
  },
  {
    name: "SSS SICKNESS NOTIFICATION FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/SSS SICKNESS NOTIFICATION FORM.pdf",
    description: "Standard Form for SSS SICKNESS NOTIFICATION FORM"
  },
  {
    name: "SSS SICKNESS REIMBURSEMENT FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/SSS SICKNESS REIMBURSEMENT FORM.pdf",
    description: "Standard Form for SSS SICKNESS REIMBURSEMENT FORM"
  },
  {
    name: "SSS MATERNITY REIMBURSEMENT APPLICATION FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/SSS MATERNITY REIMBURSEMENT APPLICATION FORM.pdf",
    description: "Standard Form for SSS MATERNITY REIMBURSEMENT APPLICATION FORM"
  },
  {
    name: "SSS MATERNITY NOTIFICATION FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/SSS MATERNITY NOTIFICATION FORM.pdf",
    description: "Standard Form for SSS MATERNITY NOTIFICATION FORM"
  },
  {
    name: "CASTO LOAN FORM",
    fileUrl: process.env.PUBLIC_URL + "/forms/CASTO LOAN FORM.pdf",
    description: "Standard Form for CASTO LOAN FORM"
  }
];

export const MAIN_BUTTONS = [
  { text: "Recruitment and Onboarding", imageSrc: "hiring.gif", category: 'recruitment' },
  { text: "Exit and Offboarding", imageSrc: "offboarding.gif", category: 'offboarding' },
  { text: "Payroll and Compensation Inquiries", imageSrc: "payroll.gif", category: 'payroll' },
  { text: "Employee Data and Records", imageSrc: "employeerecords.gif", category: 'records' },
  { text: "Benefits and Leave Management", imageSrc: "benefits.gif", category: 'benefits' },
  { text: "Policy and Compliance Inquiries", imageSrc: "policy.gif", category: 'policy' },
  { text: "Employee Relations and Grievances", imageSrc: "employeerelations.gif", category: 'relations' },
  { text: "Employee Reassignment Form", imageSrc: "transfer.gif", category: 'transfer' },
  { text: "Equipment and Facilities Request", imageSrc: "facilities.gif", category: 'facilities' },
  { text: "Other HR Service Request", imageSrc: "otherrequest.gif", category: 'other' }
];

export const EMAILJS_CONFIG = {
  serviceId: 'service_zwiz46q',
  templateId: 'template_ixdghor',
  publicKey: 'Kd-X-TB6CDLGtM7ir'
};

export const UPLOAD_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
