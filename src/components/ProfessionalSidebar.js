import React from 'react';

const ProfessionalSidebar = ({ onNavigate, currentPath }) => {
  const quickLinks = [
    { id: 'recruitment', label: 'Recruitment and Onboarding', icon: '👥' },
    { id: 'payroll', label: 'Payroll and Compensation Inquiries', icon: '💰' },
    { id: 'records', label: 'Employee Data and Records', icon: '📋' },
    { id: 'benefits', label: 'Benefits and Leave Management', icon: '🏥' },
    { id: 'policy', label: 'Policy and Compliance Inquiries', icon: '📜' },
    { id: 'relations', label: 'Employee Relations and Grievances', icon: '🤝' },
    { id: 'transfer', label: 'Employee Reassignment Form', icon: '🔄' },
    { id: 'facilities', label: 'Equipment and Facilities Request', icon: '🏢' },
    { id: 'other', label: 'Other HR Service Request', icon: '📞' },
    { id: 'offboarding', label: 'Exit and Offboarding', icon: '🚪' },
  ];


  return (
    <aside className="professional-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Access</h3>
        <ul className="quick-links">
          {quickLinks.map((link) => (
            <li key={link.id} className="quick-link">
              <button 
                className="quick-link-button"
                onClick={() => onNavigate([link.label])}
              >
                <span className="quick-link-icon">{link.icon}</span>
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default React.memo(ProfessionalSidebar);
