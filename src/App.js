import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Form from './components/Form';
import DownloadableForms from './components/DownloadableForms';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './components/ThemeProvider';
import ProfessionalHeader from './components/ProfessionalHeader';
import ProfessionalSidebar from './components/ProfessionalSidebar';
import ProfessionalServiceCard from './components/ProfessionalServiceCard';
import ProfessionalBreadcrumb from './components/ProfessionalBreadcrumb';
import ModernSplashScreen from './components/ModernSplashScreen';
import FeedbackModal from './components/FeedbackModal';
import { MAIN_BUTTONS } from './constants/data';
import './App.css';
import './components.css';
import './styles/design-system.css';
import './styles/professional-design.css';
import './styles/splash-screen.css';
import './styles/modern-forms.css';
import './styles/accessibility.css';

const FormVisibleResult = ({ onBack }) => (
    <div className="modern-form-container">
    <div className="modern-referral-container">
      <div className="modern-referral-icon" style={{ background: 'var(--success-100)', color: 'var(--success-500)' }}>
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
  </div>
      <h2 className="modern-referral-title">Request Submitted Successfully!</h2>
      <p className="modern-referral-description">
        Your HR request has been submitted and will be processed shortly. 
        You will receive a confirmation email with your request details.
      </p>
      <button 
        className="modern-form-button modern-form-button-primary accessible-button" 
        onClick={onBack}
        aria-label="Return to home page"
        title="Click to return to the main HR services page"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Back to Home
            </button>
          </div>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [subButtonsVisible, setSubButtonsVisible] = useState(false);
  const [detailButtonsVisible, setDetailButtonsVisible] = useState(false);
  const [currentDetailButtons, setCurrentDetailButtons] = useState([]);
  const [currentSubCategory, setCurrentSubCategory] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [formVisibleResult, setFormVisibleResult] = useState(false);
  const [currentFormTitle, setCurrentFormTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState([]);
  const [quickAccessVisible, setQuickAccessVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const handleSplashComplete = useCallback(() => {
      setLoading(false);
    setButtonsVisible(true);
  }, []);

  // Helper functions for service data
  const getServiceDescription = useCallback((serviceName) => {
    const descriptions = {
      'Payroll and Compensation Inquiries': 'Manage salary, overtime, and compensation-related requests',
      'Benefits and Leave Management': 'Handle leave applications, HMO benefits, and leave inquiries',
      'Employee Relations and Grievances': 'Report workplace issues, provide feedback, and request mediation',
      'Employee Data and Records': 'Update personal information, access records, and employment verification',
      'Recruitment and Onboarding': 'Track applications, submit referrals, and onboarding queries',
      'Employee Reassignment Form': 'Request employee reassignments and department transfers',
      'Policy and Compliance Inquiries': 'Get policy clarifications, report compliance issues, and request guidance',
      'Equipment and Facilities Request': 'Request office equipment, report maintenance issues, and workspace changes',
      'Exit and Offboarding': 'Submit resignation, schedule exit interviews, and final paycheck processing',
      'Other HR Service Request': 'Additional HR services and special requests',
      'Downloadable Forms': 'Access and download HR forms and documents',
      'EO Branch Referral Slip': 'Request referral slips for EO branch services',
      'ComPsych Assistance': 'Access employee assistance program services',
      'Transfer for Operations': 'Request transfers to operations department',
      'NBS/Worksched Concerns': 'Handle timesheet corrections and work schedule issues',
      'Loans': 'SSS, Pag-IBIG, and RCBC corporate loan services',
      'Contributions': 'SSS, PhilHealth, and Pag-IBIG contribution inquiries',
      'Government Statutory Benefits': 'Government-mandated benefits and statutory requirements'
    };
    return descriptions[serviceName] || 'Access HR services and support';
  }, []);

  const getServiceIcon = useCallback((serviceName) => {
    const icons = {
      'Payroll and Compensation Inquiries': '💰',
      'Benefits and Leave Management': '🏥',
      'Employee Relations and Grievances': '🤝',
      'Employee Data and Records': '📋',
      'Recruitment and Onboarding': '👥',
      'Employee Reassignment Form': '🔄',
      'Policy and Compliance Inquiries': '📜',
      'Equipment and Facilities Request': '🏢',
      'Exit and Offboarding': '🚪',
      'Other HR Service Request': '📞',
      'Downloadable Forms': '📄',
      'EO Branch Referral Slip': '📋',
      'ComPsych Assistance': '💬',
      'Transfer for Operations': '🔄',
      'NBS/Worksched Concerns': '⏰',
      'Loans': '💳',
      'Contributions': '📊',
      'Government Statutory Benefits': '🏛️'
    };
    return icons[serviceName] || '📋';
  }, []);

  const getServiceIconType = useCallback((serviceName) => {
    const iconTypes = {
      'Payroll and Compensation Inquiries': 'payroll',
      'Benefits and Leave Management': 'benefits',
      'Employee Relations and Grievances': 'relations',
      'Employee Data and Records': 'records',
      'Recruitment and Onboarding': 'recruitment',
      'Employee Reassignment Form': 'recruitment',
      'Policy and Compliance Inquiries': 'policy',
      'Equipment and Facilities Request': 'facilities',
      'Exit and Offboarding': 'offboarding',
      'Other HR Service Request': 'payroll',
      'Downloadable Forms': 'records',
      'EO Branch Referral Slip': 'records',
      'ComPsych Assistance': 'relations',
      'Transfer for Operations': 'recruitment',
      'NBS/Worksched Concerns': 'payroll',
      'Loans': 'benefits',
      'Contributions': 'benefits',
      'Government Statutory Benefits': 'policy'
    };
    return iconTypes[serviceName] || 'payroll';
  }, []);


  // Data maps (defined before search functionality that uses them)
  const subButtonsMap = useMemo(() => ({
    'Employee Data and Records': [
      { text: "Updating Personal Information" },
      { text: "Employment Verification Request" },
      { text: "Access to Employee Records" },
      { text: "Employee information Access" },
      { text: "Floating Status Request Form" },
      { text: "Request for Company ID" },
    ],
    'Payroll and Compensation Inquiries': [
      { text: "Salary Concerns" },
      { text: "Overtime Calculations" },
      { text: "Payslip Requests" },
      { text: "Tax-Related Questions" },
      { text: "Payroll Dispute Form" },
      { text: "Team Fund Request Form" },
      { text: "NBS/Worksched Concerns" },
      { text: "Loans" },
      { text: "Contributions" },
      { text: "Government Statutory Benefits" },
    ],
    'Benefits and Leave Management': [
      { text: "Leave Applications" },
      { text: "HMO Benefits and Other Related Concerns" },
      { text: "Leave Balance Inquiries" },
    ],
    'Policy and Compliance Inquiries': [
      { text: "Questions About Company Policies" },
      { text: "Compliance Issues and Concerns" },
      { text: "Requests for Policy Clarification" },
    ],
    'Employee Relations and Grievances': [
      { text: "Reporting Workplace Issue or Conflicts" },
      { text: "Feedback and Suggestions" },
      { text: "Requests for Mediation or Counseling" },
    ],
    'Recruitment and Onboarding': [
      { text: "Application Status Inquiries" },
      { text: "Referrals and recommendations" },
      { text: "Onboarding Queries and Documentation" },
    ],
    'Exit and Offboarding': [
      { text: "Resignation Submissions" },
      { text: "Exit Interviews" },
      { text: "Final Paycheck and Benefits Processing" },
    ],
    'Employee Reassignment Form': [
      { text: "Employee Reassignment Request" },
    ],
    'Equipment and Facilities Request': [
      { text: "Requests for Office Equipment" },
      { text: "Maintenance Issues and Repairs" },
      { text: "Workspace Changes or Adjustments" },
      { text: "Application for Lounge" },
    ],
    'Other HR Service Request': [
      { text: "Advance for service request" },
      { text: "Downloadable Forms" },
      { text: "EO Branch Referral Slip" },
      { text: "ComPsych Assistance" },
    ],
  }), []);

  const detailButtonsMap = useMemo(() => ({
    'Updating Personal Information': [
      { text: "Change of address or contact number" },
      { text: "Update emergency contact details" }
    ],
    'Employment Verification Request': [
      { text: "Request employment certificate" },
      { text: "Verification of employment for external purposes" }
    ],
    'Access to Employee Records': [
      { text: "Request performance review copies" },
      { text: "Access historical payroll records" }
    ],
    'Employee information Access': [
      { text: "Request Employee Information Access" }
    ],
    'Floating Status Request Form': [
      { text: "Request Floating Status Request Form" }
    ],
    'Request for Company ID': [
      { text: "Request form for Company ID" }
    ],
    'Salary Concerns': [
      { text: "Requests for salary breakdown and components" },
      { text: "Inquiries about salary adjustments or increments" }
    ],
    'Overtime Calculations': [
      { text: "Discrepancies in overtime pay" },
      { text: "Requests for overtime approval status" }
    ],
    'Payslip Requests': [
      { text: "Access to digital payslips" },
      { text: "Correction requests for payslip errors" }
    ],
    'Tax-Related Questions': [
      { text: "Queries about tax deductions and exemptions" },
      { text: "Requests for tax documents (e.g., BIR Form 2316)" }
    ],
    'Payroll Dispute Form': [
      { text: "Request for Payroll Dispute Form" },
    ],
    'Team Fund Request Form': [
      { text: "Team Fund Request Form" },
    ],
    'NBS/Worksched Concerns': [
      { text: "Timesheet Correction" },
      { text: "Change of Approver" },
      { text: "Other Concerns related to Worksched" },
    ],
    'Loans': [
      { text: "SSS Calamity and Salary Loan" },
      { text: "Pag-ibig and Salary Loan" },
      { text: "RCBC Corporate Loan" },
    ],
    'Contributions': [
      { text: "SSS Contributions" },
      { text: "PHILHEALTH Contributions" },
      { text: "PAG-IBIG Contributions" },
      { text: "Modified Pag-IBIG (MP2)" },
    ],
    'Government Statutory Benefits': [
      { text: "Government Statutory Benefits" },
    ],
    'Leave Applications': [
      { text: "Bereavement Leave" },
      { text: "Solo Parent Leave" },
      { text: "Maternity/Paternity leave applications" },
      { text: "Other (Special) Leave" }
    ],
    'HMO Benefits and Other Related Concerns': [
      { text: "Enrollment in health insurance plans" },
      { text: "Updates to beneficiary information" },
      { text: "Changes in retirement plan contributions" },
    ],
    'Leave Balance Inquiries': [
      { text: "Requests for current leave balance status" },
      { text: "Queries about leave accrual rates" }
    ],
    'Reporting Workplace Issue or Conflicts': [
      { text: "Incident reports for workplace disputes" },
      { text: "Requests for anonymous reporting options" }
    ],
    'Feedback and Suggestions': [
      { text: "Suggestions for workplace improvements" },
      { text: "Feedback on HR policies or initiatives" }
    ],
    'Requests for Mediation or Counseling': [
      { text: "Appointments with employee assistance programs (EAP)" },
      { text: "Mediation requests for resolving conflicts" }
    ],
    'Application Status Inquiries': [
      { text: "Follow-up on job application status" },
      { text: "Feedback request for unsuccessful candidates" } 
    ],
    'Referrals and recommendations': [
      { text: "Submit employee referrals"},
      { text: "Inquiries about referral program rewards" }
    ],
    'Onboarding Queries and Documentation': [
      { text: "Request onboarding schedule and agenda" },
      { text: "Submit required documents (e.g., IDs, bank details)" }
    ],
    'Questions About Company Policies': [
      { text: "Clarification on employee handbook policies" },
      { text: "Inquiries about dress code or attendance policies" }
    ],
    'Compliance Issues and Concerns': [
      { text: "Report potential compliance violations" },
      { text: "Request compliance training or resources" }
    ],
    'Requests for Policy Clarification': [
      { text: "Clarification on specific policy provisions" },
      { text: "Requests for updates on policy changes" }
    ],
    'Requests for Office Equipment': [
      { text: "Request new hardware (e.g., laptops, monitors)" },
      { text: "Replace faulty equipment" }
    ],
    'Maintenance Issues and Repairs': [
      { text: "Report issues with office facilities (e.g., air conditioning)" },
      { text: "Request workspace repairs or adjustments" }
    ],
    'Workspace Changes or Adjustments': [
      { text: "Request ergonomic assessments" },
      { text: "Request changes in seating arrangements or desk setups" }
    ],
    'Application for Lounge': [
      { text: "Request for Lounge Space" },  
    ],
    'Resignation Submissions': [
      { text: "Submit resignation letter" },
      { text: "Inquires about notice period and final workdays" }
    ],
    'Exit Interviews': [
      { text: "Schedule exit interview appointment" },
      { text: "Submit exit feedback and suggestions" }
    ],
    'Final Paycheck and Benefits Processing': [
      { text: "Request final paycheck details" },
      { text: "Inquiries about continuation of benefits (e.g., COBRA)" }
    ],
    'Advance for service request': [
      { text: "Verification of Medical Certificate"},
      { text: "Kudos Submission Form" },
    ],
    'Downloadable Forms': [
      { text: "Downloadable Forms" },
    ],
    'EO Branch Referral Slip': [
      { text: "EO Branch Referral Slip" },
    ],
    'ComPsych Assistance': [
      { text: "ComPsych Assistance form" },
    ],
    'Employee Reassignment Request': [
      { text: "Employee Reassignment Form" },
    ],
    'Timesheet Correction': [
      { text: "Timesheet Correction" },
    ],
    'Change of Approver': [
      { text: "Change of Approver" },
    ],
    'Other Concerns related to Worksched': [
      { text: "Other Concerns related to Worksched" },
    ],
    'SSS Calamity and Salary Loan': [
      { text: "SSS Calamity and Salary Loan" },
    ],
    'Pag-ibig and Salary Loan': [
      { text: "Pag-ibig and Salary Loan" },
    ],
    'RCBC Corporate Loan': [
      { text: "RCBC Corporate Loan" },
    ],
    'SSS Contributions': [
      { text: "SSS Contributions" },
    ],
    'PHILHEALTH Contributions': [
      { text: "PHILHEALTH Contributions" },
    ],
    'PAG-IBIG Contributions': [
      { text: "PAG-IBIG Contributions" },
    ],
    'Modified Pag-IBIG (MP2)': [
      { text: "Modified Pag-IBIG (MP2)" },
    ],
    'Government Statutory Benefits': [
      { text: "Government Statutory Benefits" },
    ],
  }), []);

  const handleNavigate = useCallback((path) => {
    setCurrentPath(path);
    
    if (path.length === 0) {
      // Go to home
      setButtonsVisible(true);
      setSubButtonsVisible(false);
      setDetailButtonsVisible(false);
      setFormVisible(false);
      setFormVisibleResult(false);
      setCurrentFormTitle('');
      setCurrentSubCategory('');
      setCurrentDetailButtons([]);
    } else if (path.length === 1) {
      // Go to main button (show sub-buttons)
      const mainCategory = path[0];
      setButtonsVisible(false);
      setSubButtonsVisible(true);
      setDetailButtonsVisible(false);
      setFormVisible(false);
      setFormVisibleResult(false);
      setCurrentFormTitle('');
      setCurrentSubCategory(mainCategory);
      setCurrentDetailButtons([]);
    } else if (path.length === 2) {
      // Go to sub-button (show detail buttons)
      const mainCategory = path[0];
      const subCategory = path[1];
      setButtonsVisible(false);
      setSubButtonsVisible(false);
      setDetailButtonsVisible(true);
      setFormVisible(false);
      setFormVisibleResult(false);
      setCurrentFormTitle('');
      setCurrentSubCategory(mainCategory);
      setCurrentDetailButtons(detailButtonsMap[subCategory] || []);
    } else if (path.length === 3) {
      // Go to detail button (show form)
      const mainCategory = path[0];
      const subCategory = path[1];
      const detailButton = path[2];
      setButtonsVisible(false);
      setSubButtonsVisible(false);
      setDetailButtonsVisible(false);
      setFormVisible(true);
      setFormVisibleResult(false);
      setCurrentFormTitle(detailButton);
      setCurrentSubCategory(mainCategory);
      setCurrentDetailButtons(detailButtonsMap[subCategory] || []);
    }
  }, [detailButtonsMap]);

  // Event handlers (defined after handleNavigate)
  const handleMainButtonClick = useCallback((buttonText) => {
    console.log('Main button clicked:', buttonText);
    
    // Services that go directly to forms without sub/detail buttons
    const directToFormServices = [
      'Downloadable Forms',
      'EO Branch Referral Slip', 
      'ComPsych Assistance',
      'Employee Reassignment Request',
      'Timesheet Correction',
      'Change of Approver',
      'Other Concerns related to Worksched',
      'SSS Calamity and Salary Loan',
      'Pag-ibig and Salary Loan',
      'RCBC Corporate Loan',
      'SSS Contributions',
      'PHILHEALTH Contributions',
      'PAG-IBIG Contributions',
      'Modified Pag-IBIG (MP2)',
      'Government Statutory Benefits',
      'Request for Lounge Space'
    ];
    
    if (directToFormServices.includes(buttonText)) {
      // Go directly to the form
      setCurrentFormTitle(buttonText);
      setFormVisible(true);
      setButtonsVisible(false);
      setSubButtonsVisible(false);
      setDetailButtonsVisible(false);
      setCurrentPath([buttonText]);
    } else {
      // Use normal navigation for services with sub-buttons
      handleNavigate([buttonText]);
    }
  }, [handleNavigate]);

  const handleSubButtonClick = useCallback((mainCategory, subButtonText) => {
    // Services that go directly to forms without detail buttons
    const directToFormServices = [
      'Downloadable Forms',
      'EO Branch Referral Slip', 
      'ComPsych Assistance',
      'Employee Reassignment Request',
      'Timesheet Correction',
      'Change of Approver',
      'Other Concerns related to Worksched',
      'SSS Calamity and Salary Loan',
      'Pag-ibig and Salary Loan',
      'RCBC Corporate Loan',
      'SSS Contributions',
      'PHILHEALTH Contributions',
      'PAG-IBIG Contributions',
      'Modified Pag-IBIG (MP2)',
      'Government Statutory Benefits',
      'Request for Lounge Space'
    ];
    
    if (directToFormServices.includes(subButtonText)) {
      // Go directly to the form
      setCurrentFormTitle(subButtonText);
      setFormVisible(true);
      setButtonsVisible(false);
      setSubButtonsVisible(false);
      setDetailButtonsVisible(false);
      setCurrentPath([mainCategory, subButtonText]);
    } else {
      // Use normal navigation for services with detail buttons
      handleNavigate([mainCategory, subButtonText]);
    }
  }, [handleNavigate]);

  const handleDetailButtonClick = useCallback((text, component) => {
    // Services that go directly to forms from detail buttons
    const directToFormDetailServices = [
      'Request new hardware (e.g., laptops, monitors)',
      'Replace faulty equipment',
      'Report issues with office facilities (e.g., air conditioning)',
      'Request workspace repairs or adjustments',
      'Request ergonomic assessments',
      'Request changes in seating arrangements or desk setups'
    ];
    
    if (directToFormDetailServices.includes(text)) {
      // Go directly to the form
      setCurrentFormTitle(text);
      setFormVisible(true);
      setDetailButtonsVisible(false);
      setButtonsVisible(false);
      setSubButtonsVisible(false);
      setCurrentPath([...currentPath, text]);
    } else {
      // Use normal form handling
      setCurrentFormTitle(text);
      setFormVisible(true);
      setDetailButtonsVisible(false);
      setCurrentPath([...currentPath, text]);
    }
  }, [currentPath]);

  // Enhanced search functionality
  const searchAllContent = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return { mainButtons: [], subButtons: [], detailButtons: [] };
    
    const term = searchTerm.toLowerCase();
    const results = {
      mainButtons: [],
      subButtons: [],
      detailButtons: []
    };

    // Search main buttons
    MAIN_BUTTONS.forEach(button => {
      if (button.text.toLowerCase().includes(term)) {
        results.mainButtons.push({
          type: 'main',
          text: button.text,
          description: getServiceDescription(button.text),
          icon: getServiceIcon(button.text),
          onClick: () => handleMainButtonClick(button.text)
        });
      }
    });

    // Search sub-buttons
    Object.entries(subButtonsMap).forEach(([mainCategory, subButtons]) => {
      subButtons.forEach(subButton => {
        if (subButton.text.toLowerCase().includes(term)) {
          results.subButtons.push({
            type: 'sub',
            text: subButton.text,
            mainCategory: mainCategory,
            description: `Under ${mainCategory}`,
            icon: getServiceIcon(mainCategory),
            onClick: () => handleSubButtonClick(mainCategory, subButton.text)
          });
        }
      });
    });

    // Search detail buttons
    Object.entries(detailButtonsMap).forEach(([subCategory, detailButtons]) => {
      detailButtons.forEach(detailButton => {
        if (detailButton.text.toLowerCase().includes(term)) {
          // Find the main category for this sub-category
          const mainCategory = Object.keys(subButtonsMap).find(main => 
            subButtonsMap[main].some(sub => sub.text === subCategory)
          );
          
          results.detailButtons.push({
            type: 'detail',
            text: detailButton.text,
            subCategory: subCategory,
            mainCategory: mainCategory,
            description: `Form: ${detailButton.text}`,
            icon: '📝',
            onClick: () => handleDetailButtonClick(detailButton.text)
          });
        }
      });
    });

    return results;
  }, [getServiceDescription, getServiceIcon, handleMainButtonClick, handleSubButtonClick, handleDetailButtonClick, subButtonsMap, detailButtonsMap]);

  // Get search results
  const searchResults = useMemo(() => {
    return searchAllContent(searchTerm);
  }, [searchTerm, searchAllContent]);

  // Check if we have search results
  const hasSearchResults = useMemo(() => {
    return searchResults.mainButtons.length > 0 || 
           searchResults.subButtons.length > 0 || 
           searchResults.detailButtons.length > 0;
  }, [searchResults]);

  const filteredButtons = useMemo(() => {
    const buttonsWithHandlers = MAIN_BUTTONS.map(button => ({
      ...button,
      onClick: () => handleMainButtonClick(button.text)
    }));

    // If we have a search term, show search results instead of filtered main buttons
    if (searchTerm && hasSearchResults) {
      return [
        ...searchResults.mainButtons,
        ...searchResults.subButtons,
        ...searchResults.detailButtons
      ];
    }

    // If search term but no results, return empty array
    if (searchTerm && !hasSearchResults) {
      return [];
    }

    // No search term, return all main buttons
    return buttonsWithHandlers;
  }, [searchTerm, hasSearchResults, searchResults, handleMainButtonClick]);

  const handleBackClick = useCallback(() => {
    if (formVisible) {
      setFormVisible(false);
      setDetailButtonsVisible(true);
      setCurrentPath(prev => prev.slice(0, -1));
    } else if (detailButtonsVisible) {
      setDetailButtonsVisible(false);
      setSubButtonsVisible(true);
      setCurrentPath(prev => prev.slice(0, -1));
    } else if (subButtonsVisible) {
      setSubButtonsVisible(false);
      setButtonsVisible(true);
      setCurrentPath([]);
      setSearchTerm(''); // Clear search when going back to home
    }
  }, [formVisible, detailButtonsVisible, subButtonsVisible]);

  const handleFormSubmitSuccess = useCallback(() => {
    setFormVisible(false);
    setFormVisibleResult(true);
  }, []);

  const handleBackToHome = useCallback(() => {
    // Reset all form and navigation states
    setFormVisibleResult(false);
    setFormVisible(false);
    setButtonsVisible(true);
    setSubButtonsVisible(false);
    setDetailButtonsVisible(false);
    setCurrentPath([]);
    setCurrentFormTitle('');
    setCurrentSubCategory('');
    setCurrentDetailButtons([]);
    setSearchTerm('');
    setQuickAccessVisible(false);
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleQuickAccessClick = useCallback(() => {
    setQuickAccessVisible(!quickAccessVisible);
  }, [quickAccessVisible]);

  useEffect(() => {
    if (buttonsVisible) {
      setTimeout(() => {
        document.querySelectorAll('.button-container').forEach((button, index) => {
          setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 100);
    }
  }, [buttonsVisible]);

  if (loading) {
    return (
      <ThemeProvider>
        <ModernSplashScreen onComplete={handleSplashComplete} />
      </ThemeProvider>
    );
  }

  if (formVisibleResult) {
    return (
      <ThemeProvider>
        <ErrorBoundary>
          <div className="professional-app">
            <ProfessionalHeader 
              onSearch={handleSearch}
              searchTerm={searchTerm}
              onHomeClick={handleBackToHome}
              onQuickAccessClick={handleQuickAccessClick}
            />
            <div className="professional-main no-sidebar">
              <main className="professional-content">
                <FormVisibleResult onBack={handleBackToHome} />
              </main>
            </div>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="professional-app">
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <ProfessionalHeader 
            onSearch={handleSearch}
            searchTerm={searchTerm}
            onHomeClick={handleBackToHome}
            onQuickAccessClick={handleQuickAccessClick}
          />
          
          <div className="professional-main no-sidebar">
            
            <main id="main-content" className="professional-content" role="main">
              <ProfessionalBreadcrumb 
                path={currentPath} 
                onNavigate={handleNavigate}
                currentPath={currentPath}
              />
              
              {buttonsVisible && (
                <>
                  <div className="content-header">
                    <h1 className="content-title">
                      {searchTerm ? `Search Results for "${searchTerm}"` : 'HR Services'}
                    </h1>
                    <p className="content-subtitle">
                      {searchTerm ? `Found ${filteredButtons.length} result${filteredButtons.length !== 1 ? 's' : ''}` : 'Access all your HR needs in one place'}
                    </p>
          </div>
          
          {searchTerm && hasSearchResults && (
            <div className="search-results-counter">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>
                {searchResults.mainButtons.length} Main Services, {searchResults.subButtons.length} Sub Services, {searchResults.detailButtons.length} Forms
              </span>
          </div>
          )}
          
                  <div className="services-grid">
                    {searchTerm && !hasSearchResults ? (
                      <div className="search-no-results">
                        <div className="search-no-results-icon">
                          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
          </div>
                        <h3>No results found</h3>
                        <p>Try searching for different keywords or browse our services below</p>
                        <button 
                          className="modern-form-button modern-form-button-secondary"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear Search
            </button>
          </div>
                    ) : (
                      filteredButtons.map((button, index) => (
                        <ProfessionalServiceCard
                          key={`${button.type || 'main'}-${index}`}
                          title={button.text}
                          description={button.description || getServiceDescription(button.text)}
                          icon={button.icon || getServiceIcon(button.text)}
                          iconType={getServiceIconType(button.text)}
                          onClick={button.onClick}
                          grid={button.grid}
                          searchResult={!!searchTerm}
                          resultType={button.type}
                          mainCategory={button.mainCategory}
                          subCategory={button.subCategory}
                        />
                      ))
                    )}
        </div>
                </>
              )}

          {subButtonsVisible && (
                <>
                  <div className="content-header">
                    <h1 className="content-title">{currentSubCategory}</h1>
                    <p className="content-subtitle">Select a specific service</p>
          </div>
                  
                  <div className="services-grid">
                    {subButtonsMap[currentSubCategory]?.map((button, index) => (
                      <ProfessionalServiceCard
                        key={index}
                        title={button.text}
                        description={getServiceDescription(button.text)}
                        icon={getServiceIcon(button.text)}
                        iconType={getServiceIconType(button.text)}
                        onClick={() => handleSubButtonClick(currentSubCategory, button.text)}
                      />
                    ))}
                  </div>
                </>
              )}
            
          {detailButtonsVisible && (
                <>
                  <div className="content-header">
                    <h1 className="content-title">{currentPath[currentPath.length - 1]}</h1>
                    <p className="content-subtitle">Choose your specific request</p>
                  </div>
                  
                  <div className="services-grid">
                    {currentDetailButtons.map((button, index) => (
                      <ProfessionalServiceCard
        key={index} 
                        title={button.text}
                        description={getServiceDescription(button.text)}
                        icon={getServiceIcon(button.text)}
                        iconType={getServiceIconType(button.text)}
                        onClick={() => handleDetailButtonClick(button.text, button.component)}
                      />
                    ))}
  </div>
        </>
      )}

              {formVisible && (
                <>
                  {currentFormTitle === "Downloadable Forms" ? (
                    <DownloadableForms onBack={handleBackToHome} />
                  ) : (
                    <Form 
                      title={currentFormTitle}
                      onBack={handleBackClick}
                      onSubmitSuccess={handleFormSubmitSuccess}
                    />
                  )}
                </>
              )}
            </main>
          </div>
          
          {/* Suggestions and Feedback Button */}
          <div className="suggestions-feedback-container">
            <button 
              className="suggestions-feedback-button accessible-button"
              onClick={() => setFeedbackModalVisible(true)}
              title="Share your feedback and suggestions"
              aria-label="Open feedback and suggestions modal"
              aria-describedby="feedback-description"
            >
              💬 Suggestions & Feedback
            </button>
            <span id="feedback-description" className="sr-only">
              Click to open a form where you can share feedback and suggestions with the HR team
            </span>
          </div>
          
          {/* Quick Access Dropdown */}
          {quickAccessVisible && (
            <div className="quick-access-dropdown">
              <div className="quick-access-dropdown-header">
                <h3>Quick Access</h3>
                <button 
                  className="quick-access-close"
                  onClick={() => setQuickAccessVisible(false)}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="quick-access-dropdown-content">
                {MAIN_BUTTONS.map((button, index) => (
                  <button
                    key={index}
                    className="quick-access-dropdown-item"
                    onClick={() => {
                      handleMainButtonClick(button.text);
                      setQuickAccessVisible(false);
                    }}
                  >
                    <span className="quick-access-item-icon">{getServiceIcon(button.text)}</span>
                    <span className="quick-access-item-text">{button.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Feedback Modal */}
        <FeedbackModal 
          isOpen={feedbackModalVisible}
          onClose={() => setFeedbackModalVisible(false)}
        />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;