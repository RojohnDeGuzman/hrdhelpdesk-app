// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';

// Mock data for demonstration (moved outside component)
const mockHRStaff = [
  { id: 'hr001', name: 'Sarah Johnson', department: 'HR', email: 'sarah.johnson@company.com' },
  { id: 'hr002', name: 'Mike Chen', department: 'HR', email: 'mike.chen@company.com' },
  { id: 'hr003', name: 'Lisa Wang', department: 'HR', email: 'lisa.wang@company.com' },
  { id: 'hr004', name: 'David Lee', department: 'HR', email: 'david.lee@company.com' },
  { id: 'hr005', name: 'Jennifer Martinez', department: 'HR', email: 'jennifer.martinez@company.com' }
];

// Mock users data for user management
const mockUsers = [
  { id: 'user001', name: 'John Smith', email: 'john.smith@company.com', department: 'IT', role: 'member', status: 'active', lastLogin: '2 hours ago' },
  { id: 'user002', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'HR', role: 'admin', status: 'active', lastLogin: '1 hour ago' },
  { id: 'user003', name: 'Mike Chen', email: 'mike.chen@company.com', department: 'HR', role: 'member', status: 'active', lastLogin: '30 minutes ago' },
  { id: 'user004', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Marketing', role: 'member', status: 'active', lastLogin: '1 day ago' },
  { id: 'user005', name: 'Robert Brown', email: 'robert.brown@company.com', department: 'Sales', role: 'member', status: 'inactive', lastLogin: '1 week ago' },
  { id: 'user006', name: 'Lisa Wang', email: 'lisa.wang@company.com', department: 'HR', role: 'member', status: 'active', lastLogin: '3 hours ago' },
  { id: 'user007', name: 'David Lee', email: 'david.lee@company.com', department: 'Finance', role: 'member', status: 'active', lastLogin: '2 days ago' },
  { id: 'user008', name: 'Maria Garcia', email: 'maria.garcia@company.com', department: 'Finance', role: 'member', status: 'active', lastLogin: '4 hours ago' },
  { id: 'user009', name: 'Jennifer Martinez', email: 'jennifer.martinez@company.com', department: 'HR', role: 'admin', status: 'active', lastLogin: '1 hour ago' }
];

const mockTickets = [
    {
      id: 'TKT-001',
      title: 'Payroll Inquiry - Salary Adjustment',
      description: 'Employee requesting clarification on recent salary adjustment',
      status: 'open',
      priority: 'high',
      category: 'Payroll',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      employee: {
        name: 'John Smith',
        department: 'IT',
        email: 'john.smith@company.com'
      },
      attachments: [
        { name: 'payroll_document.pdf', size: '1.5 MB' },
        { name: 'salary_comparison.xlsx', size: '850 KB' }
      ]
    },
    {
      id: 'TKT-002',
      title: 'Leave Request - Vacation',
      description: 'Requesting 5 days vacation leave for family trip',
      status: 'pending',
      priority: 'medium',
      category: 'Leave Management',
      assignedTo: 'Mike Chen',
      createdAt: '2024-01-14T11:15:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      employee: {
        name: 'Emily Davis',
        department: 'Marketing',
        email: 'emily.davis@company.com'
      },
      attachments: [
        { name: 'vacation_request_form.pdf', size: '2.1 MB' },
        { name: 'travel_itinerary.pdf', size: '1.8 MB' }
      ]
    },
    {
      id: 'TKT-003',
      title: 'Benefits Enrollment - Health Insurance',
      description: 'Need assistance with health insurance enrollment process',
      status: 'resolved',
      priority: 'low',
      category: 'Benefits',
      assignedTo: 'Lisa Wang',
      createdAt: '2024-01-13T08:45:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      employee: {
        name: 'Robert Brown',
        department: 'Sales',
        email: 'robert.brown@company.com'
      }
    },
    {
      id: 'TKT-004',
      title: 'Training Request - Software Certification',
      description: 'Requesting approval for software certification training',
      status: 'open',
      priority: 'medium',
      category: 'Training',
      assignedTo: 'David Lee',
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-12T14:20:00Z',
      employee: {
        name: 'Maria Garcia',
        department: 'Finance',
        email: 'maria.garcia@company.com'
      }
    },
    {
      id: 'TKT-005',
      title: 'Policy Question - Remote Work',
      description: 'Clarification needed on remote work policy guidelines',
      status: 'pending',
      priority: 'low',
      category: 'Policy',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-01-11T16:30:00Z',
      updatedAt: '2024-01-11T16:30:00Z',
      employee: {
        name: 'Alex Thompson',
        department: 'HR',
        email: 'alex.thompson@company.com'
      }
    },
    {
      id: 'TKT-006',
      title: 'Equipment Request - Laptop Replacement',
      description: 'Requesting replacement laptop for damaged device',
      status: 'open',
      priority: 'high',
      category: 'IT Support',
      assignedTo: 'Mike Davis',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
      employee: {
        name: 'Sarah Wilson',
        department: 'Marketing',
        email: 'sarah.wilson@company.com'
      }
    },
    {
      id: 'TKT-007',
      title: 'Performance Review - Mid-Year',
      description: 'Scheduling mid-year performance review meeting',
      status: 'resolved',
      priority: 'medium',
      category: 'Performance',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-01-13T14:20:00Z',
      updatedAt: '2024-01-13T14:20:00Z',
      employee: {
        name: 'Michael Chen',
        department: 'Engineering',
        email: 'michael.chen@company.com'
      }
    },
    {
      id: 'TKT-008',
      title: 'Expense Reimbursement - Travel',
      description: 'Submit travel expenses for business trip',
      status: 'pending',
      priority: 'medium',
      category: 'Finance',
      assignedTo: 'Mike Davis',
      createdAt: '2024-01-14T11:45:00Z',
      updatedAt: '2024-01-14T11:45:00Z',
      employee: {
        name: 'Lisa Rodriguez',
        department: 'Sales',
        email: 'lisa.rodriguez@company.com'
      }
    },
    {
      id: 'TKT-009',
      title: 'Training Request - Leadership Skills',
      description: 'Requesting leadership development training program',
      status: 'open',
      priority: 'low',
      category: 'Training',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-01-15T16:30:00Z',
      updatedAt: '2024-01-15T16:30:00Z',
      employee: {
        name: 'James Taylor',
        department: 'Operations',
        email: 'james.taylor@company.com'
      }
    },
    {
      id: 'TKT-010',
      title: 'Benefits Question - Dental Coverage',
      description: 'Inquiry about dental coverage options and costs',
      status: 'resolved',
      priority: 'low',
      category: 'Benefits',
      assignedTo: 'Mike Davis',
      createdAt: '2024-01-16T10:15:00Z',
      updatedAt: '2024-01-16T10:15:00Z',
      employee: {
        name: 'Amanda White',
        department: 'Customer Service',
        email: 'amanda.white@company.com'
      }
    },
    {
      id: 'TKT-011',
      title: 'Office Space - Desk Assignment',
      description: 'Request for specific desk location in new office layout',
      status: 'open',
      priority: 'medium',
      category: 'Facilities',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-01-17T13:20:00Z',
      updatedAt: '2024-01-17T13:20:00Z',
      employee: {
        name: 'Kevin Johnson',
        department: 'Engineering',
        email: 'kevin.johnson@company.com'
      }
    },
    {
      id: 'TKT-012',
      title: 'Payroll Issue - Overtime Calculation',
      description: 'Discrepancy in overtime hours calculation for last pay period',
      status: 'pending',
      priority: 'high',
      category: 'Payroll',
      assignedTo: 'Mike Davis',
      createdAt: '2024-01-18T08:45:00Z',
      updatedAt: '2024-01-18T08:45:00Z',
      employee: {
        name: 'Rachel Green',
        department: 'Operations',
        email: 'rachel.green@company.com'
      }
    }
  ];

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
    dateRange: '',
    startDate: '',
    endDate: ''
  });

  const [stats, setStats] = useState({
    openTickets: 0,
    urgentTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0
  });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedHRStaff, setSelectedHRStaff] = useState('');
  
  // User Management States
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserPassword, setEditUserPassword] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  
  // Group Management States
  const [groups, setGroups] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    members: []
  });
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  
  // System Settings States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState('medium');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [activeSettingsTab, setActiveSettingsTab] = useState('users');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [autoCloseInactive, setAutoCloseInactive] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [theme, setTheme] = useState('light');
  const [assignmentNotifications, setAssignmentNotifications] = useState(true);
  const [statusUpdateNotifications, setStatusUpdateNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  
  // Create User Form States
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    status: 'active'
  });

  // Mock Groups Data
  const mockGroups = [
    {
      id: 'group001',
      name: 'HR Team',
      description: 'Human Resources department team',
      members: ['user001', 'user002'],
      createdAt: '2024-01-15',
      createdBy: 'admin'
    },
    {
      id: 'group002',
      name: 'IT Support',
      description: 'Technical support and maintenance team',
      members: ['user003', 'user004', 'user005'],
      createdAt: '2024-01-20',
      createdBy: 'admin'
    },
    {
      id: 'group003',
      name: 'Management',
      description: 'Senior management and executives',
      members: ['user006', 'user007'],
      createdAt: '2024-02-01',
      createdBy: 'admin'
    }
  ];

  // Load tickets on component mount
  useEffect(() => {
    const loadTickets = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTickets(mockTickets);
        setFilteredTickets(mockTickets);
        
        // Calculate stats
        setStats({
          openTickets: mockTickets.filter(t => t.status === 'open').length,
          urgentTickets: mockTickets.filter(t => t.priority === 'high').length,
          resolvedToday: mockTickets.filter(t => t.status === 'resolved').length,
          avgResponseTime: 2.5
        });
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    };

    loadTickets();
  }, []);

  // Load users and groups on component mount
  useEffect(() => {
    setUsers(mockUsers);
    setGroups(mockGroups);
  }, []);


  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'tickets'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.employee.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === '' || ticket.status === filters.status;
      const matchesPriority = filters.priority === '' || ticket.priority === filters.priority;
      const matchesCategory = filters.category === '' || ticket.category === filters.category;
      
      // Date filtering
      let matchesDate = true;
      if (filters.dateRange !== '') {
        const ticketDate = new Date(ticket.createdAt);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            matchesDate = ticketDate.toDateString() === now.toDateString();
            break;
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            matchesDate = ticketDate.toDateString() === yesterday.toDateString();
            break;
          case 'thisWeek':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            matchesDate = ticketDate >= startOfWeek;
            break;
          case 'thisMonth':
            matchesDate = ticketDate.getMonth() === now.getMonth() && 
                        ticketDate.getFullYear() === now.getFullYear();
            break;
          case 'lastMonth':
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            matchesDate = ticketDate.getMonth() === lastMonth.getMonth() && 
                        ticketDate.getFullYear() === lastMonth.getFullYear();
            break;
          case 'custom':
            if (filters.startDate && filters.endDate) {
              const startDate = new Date(filters.startDate);
              const endDate = new Date(filters.endDate);
              endDate.setHours(23, 59, 59, 999); // Include end of day
              matchesDate = ticketDate >= startDate && ticketDate <= endDate;
            }
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDate;
    });
    
    setFilteredTickets(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tickets, searchTerm, filters]);

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  const handlePickUpTicket = (ticketId) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { 
        ...ticket, 
        assignedTo: user.name,
        status: 'open',
        updatedAt: new Date().toISOString()
      } : ticket
    ));
  };

  const handleAssignTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedHRStaff) {
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicketId ? { 
          ...ticket, 
          assignedTo: selectedHRStaff,
          status: 'open',
          updatedAt: new Date().toISOString()
        } : ticket
      ));
    }
    setShowAssignmentModal(false);
    setSelectedTicketId(null);
    setSelectedHRStaff('');
  };

  const handleCancelAssignment = () => {
    setShowAssignmentModal(false);
    setSelectedTicketId(null);
    setSelectedHRStaff('');
  };

  // User Management Handlers
  const handleCreateUser = () => {
    if (newUser.name && newUser.email && newUser.department) {
      const user = {
        id: `user${Date.now()}`,
        ...newUser
      };
      setUsers([...users, user]);
      setNewUser({
        name: '',
        email: '',
        department: '',
        role: 'member',
        status: 'active'
      });
      setShowCreateUserModal(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserPassword('');
    setShowEditUserModal(true);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setShowEditUserModal(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };


  const handleCancelCreateUser = () => {
    setShowCreateUserModal(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'member',
      status: 'active'
    });
  };

  const handleCancelEditUser = () => {
    setShowEditUserModal(false);
    setEditingUser(null);
    setEditUserPassword('');
  };

  // Group Management Functions
  const handleCreateGroup = () => {
    if (newGroup.name.trim()) {
      const group = {
        id: `group${Date.now()}`,
        ...newGroup,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin'
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', description: '', members: [] });
      setShowCreateGroupModal(false);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowEditGroupModal(true);
  };

  const handleUpdateGroup = () => {
    if (editingGroup) {
      setGroups(groups.map(group => 
        group.id === editingGroup.id ? editingGroup : group
      ));
      setShowEditGroupModal(false);
      setEditingGroup(null);
    }
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      setGroups(groups.filter(group => group.id !== groupId));
    }
  };

  const handleCancelCreateGroup = () => {
    setShowCreateGroupModal(false);
    setNewGroup({ name: '', description: '', members: [] });
  };

  const handleCancelEditGroup = () => {
    setShowEditGroupModal(false);
    setEditingGroup(null);
  };

  const toggleGroupMember = (userId) => {
    if (editingGroup) {
      const isMember = editingGroup.members.includes(userId);
      setEditingGroup({
        ...editingGroup,
        members: isMember 
          ? editingGroup.members.filter(id => id !== userId)
          : [...editingGroup.members, userId]
      });
    }
  };

  // Filtered users based on search, role, and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = !userRoleFilter || user.role === userRoleFilter;
    const matchesStatus = !userStatusFilter || user.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered groups based on search
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(groupSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic for tickets
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleTicketClick = (ticket) => {
    navigate(`/ticket/${ticket.id}`);
  };


  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Theme toggle function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`dashboard ${theme}-theme`}>
      {/* Floating Geometry Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
        <div className="shape shape-7"></div>
        <div className="shape shape-8"></div>
        <div className="shape shape-9"></div>
        <div className="shape shape-10"></div>
        <div className="shape shape-11"></div>
        <div className="shape shape-12"></div>
        <div className="shape shape-13"></div>
        <div className="shape shape-14"></div>
        <div className="shape shape-15"></div>
      </div>
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            
            <h1>HR Portal</h1>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search tickets, employees, or content..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">🔍</button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="notifications">
            <button className="notification-btn">
              ��
              <span className="notification-badge">3</span>
            </button>
          </div>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Welcome, {user.name}</span>
              <span className="user-role">HR Staff</span>
            </div>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          📋 Tickets
        </button>
        <button 
          className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>{stats.openTickets}</h3>
                  <p>Open Tickets</p>
                </div>
              </div>
              <div className="stat-card urgent">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <h3>{stats.urgentTickets}</h3>
                  <p>Urgent Tickets</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{stats.resolvedToday}</h3>
                  <p>Resolved Today</p>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <h3>{stats.avgResponseTime}h</h3>
                  <p>Avg Response Time</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-sections">
              <div className="section">
                <h2>Recent Tickets</h2>
                <div className="ticket-list">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className={`ticket-priority priority-${ticket.priority}`}></div>
                      <div className="ticket-info">
                        <h4>{ticket.title}</h4>
                        <p>{ticket.employee.name} • {ticket.employee.department}</p>
                      </div>
                      <div className="ticket-status">
                        <span className={`status-badge status-${ticket.status}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                  <button className="action-btn">
                    <span className="action-icon">➕</span>
                    New Ticket
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">��</span>
                    Generate Report
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">📧</span>
                    Send Email
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">��</span>
                    Manage Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tickets-tab">
            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select 
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <select 
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Benefits">Benefits</option>
                  <option value="Leave Management">Leave Management</option>
                  <option value="Training">Training</option>
                  <option value="Policy">Policy</option>
                </select>

                <select 
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <div className="custom-date-range">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="date-input"
                    placeholder="Start Date"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="date-input"
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>

            {/* Tickets Table */}
            <div className="tickets-table">
              <div className="table-header">
                <h2>All Tickets ({filteredTickets.length})</h2>
                <div className="table-actions">
                  <button className="btn-secondary">Export</button>
                  <button className="btn-primary">Bulk Actions</button>
                </div>
              </div>
              
              <div className="table-content">
                {paginatedTickets.map(ticket => (
                  <div key={ticket.id} className="table-row" onClick={() => handleTicketClick(ticket)} style={{ cursor: 'pointer' }}>
                    <div className={`ticket-priority-indicator priority-${ticket.priority}`}></div>
                    <div className="ticket-details">
                      <h4>{ticket.title}</h4>
                      <p>{ticket.employee.name} • {ticket.employee.department} • {ticket.id}</p>
                      <p className="ticket-date">
                        📅 {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} at {new Date(ticket.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div className="ticket-status-center">
                      <span className={`status-badge status-${ticket.status}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="ticket-assigned">
                      <span className="assigned-to">Assigned to: {ticket.assignedTo}</span>
                    </div>
                    <div className="ticket-actions" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {ticket.assignedTo !== user.name && (
                        <button 
                          className={`action-btn-small pickup-btn ${(ticket.status === 'resolved' || ticket.status === 'closed') ? 'disabled' : ''}`}
                          onClick={(ticket.status === 'resolved' || ticket.status === 'closed') ? undefined : () => handlePickUpTicket(ticket.id)}
                          title={(ticket.status === 'resolved' || ticket.status === 'closed') ? 'Cannot pick up resolved/closed tickets' : 'Take ownership of this ticket'}
                          disabled={ticket.status === 'resolved' || ticket.status === 'closed'}
                        >
                          📋 Pick Up
                        </button>
                      )}
                      <button 
                        className="action-btn-small assign-btn"
                        onClick={() => handleAssignTicket(ticket.id)}
                        title="Assign ticket to HR staff"
                      >
                        👤 Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} tickets
                  </div>
                  <div className="pagination-controls">
                    <button 
                      className="pagination-btn"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // Show first page, last page, current page, and pages around current page
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 || 
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="pagination-ellipsis">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button 
                      className="pagination-btn"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h2>Reports & Analytics</h2>
            <p>Reports functionality will be implemented here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-header">
              <div className="header-content">
                <h2>⚙️ System Settings</h2>
                <p>Manage users, roles, system configuration, and preferences</p>
              </div>
              <div className="header-stats">
                <div className="stat-card">
                  <div className="stat-number">{users.length}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{tickets.length}</div>
                  <div className="stat-label">Total Tickets</div>
                </div>
              </div>
            </div>
            
            <div className="settings-navigation">
              <button 
                className={`settings-nav-btn ${activeSettingsTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('users')}
              >
                👥 User Management
              </button>
              <button 
                className={`settings-nav-btn ${activeSettingsTab === 'groups' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('groups')}
              >
                👥 Group Management
              </button>
              <button 
                className={`settings-nav-btn ${activeSettingsTab === 'system' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('system')}
              >
                ⚙️ System Configuration
              </button>
              <button 
                className={`settings-nav-btn ${activeSettingsTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('notifications')}
              >
                🔔 Notifications
              </button>
              <button 
                className={`settings-nav-btn ${activeSettingsTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('security')}
              >
                🔒 Security & Privacy
              </button>
              <button 
                className={`settings-nav-btn ${activeSettingsTab === 'integrations' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('integrations')}
              >
                🔗 Integrations
              </button>
            </div>

            <div className="settings-content">
              {/* User Management Tab */}
              {activeSettingsTab === 'users' && (
                <div className="settings-panel">
                  <div className="panel-header">
                    <h3>👥 User Management</h3>
                    <button 
                      className="add-user-btn"
                      onClick={() => setShowCreateUserModal(true)}
                    >
                      <span className="btn-icon">➕</span>
                      Add New User
                    </button>
                  </div>
                  
                  <div className="users-table-container">
                    <div className="table-header">
                      <div className="search-filter">
                        <div className="search-box">
                          <span className="search-icon">🔍</span>
                          <input
                            type="text"
                            placeholder="Search users by name, email, or department..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="search-input"
                          />
                        </div>
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="role-filter"
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                        <select
                          value={userStatusFilter}
                          onChange={(e) => setUserStatusFilter(e.target.value)}
                          className="status-filter"
                        >
                          <option value="">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="users-table">
                      <div className="table-row header">
                        <div className="col-avatar">Avatar</div>
                        <div className="col-name">Name & Department</div>
                        <div className="col-email">Email</div>
                        <div className="col-role">Role</div>
                        <div className="col-status">Status</div>
                        <div className="col-last-login">Last Login</div>
                        <div className="col-actions">Actions</div>
                      </div>
                      
                      {filteredUsers.map(user => (
                        <div key={user.id} className="table-row">
                          <div className="col-avatar">
                            <div className="user-avatar">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="col-name">
                            <div className="user-name">{user.name}</div>
                            <div className="user-department">{user.department}</div>
                          </div>
                          <div className="col-email">{user.email}</div>
                          <div className="col-role">
                            <span className={`role-badge role-${user.role}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="col-status">
                            <span className={`status-badge status-${user.status}`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="col-last-login">
                            {user.lastLogin || 'Never'}
                          </div>
                          <div className="col-actions">
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Group Management Tab */}
              {activeSettingsTab === 'groups' && (
                <div className="settings-panel">
                  <div className="panel-header">
                    <h3>👥 Group Management</h3>
                    <button 
                      className="add-user-btn"
                      onClick={() => setShowCreateGroupModal(true)}
                    >
                      ➕ Create Group
                    </button>
                  </div>
                  
                  <div className="search-filter">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search groups..."
                        value={groupSearchTerm}
                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="groups-table-container">
                    <div className="table-header">
                      <div className="col-name">Group Name</div>
                      <div className="col-description">Description</div>
                      <div className="col-members">Members</div>
                      <div className="col-created">Created</div>
                      <div className="col-actions">Actions</div>
                    </div>
                    
                    <div className="groups-table">
                      {filteredGroups.map(group => {
                        const groupMembers = users.filter(user => group.members.includes(user.id));
                        return (
                          <div key={group.id} className="table-row">
                            <div className="col-name">
                              <div className="group-name">{group.name}</div>
                            </div>
                            <div className="col-description">
                              <div className="group-description">{group.description}</div>
                            </div>
                            <div className="col-members">
                              <div className="members-count">
                                {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
                              </div>
                              <div className="members-list">
                                {groupMembers.slice(0, 3).map(member => (
                                  <span key={member.id} className="member-tag">
                                    {member.name.split(' ')[0]}
                                  </span>
                                ))}
                                {groupMembers.length > 3 && (
                                  <span className="member-tag more">
                                    +{groupMembers.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-created">
                              {group.createdAt}
                            </div>
                            <div className="col-actions">
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => handleEditGroup(group)}
                                title="Edit Group"
                              >
                                ✏️
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteGroup(group.id)}
                                title="Delete Group"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* System Configuration Tab */}
              {activeSettingsTab === 'system' && (
                <div className="settings-panel">
                  <div className="panel-header">
                    <h3>⚙️ System Configuration</h3>
                    <p>Configure system-wide settings and preferences</p>
                  </div>
                  
                  <div className="settings-grid">
                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>🎯 Ticket Management</h4>
                        <p>Configure ticket handling and assignment rules</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Auto-Assignment</h5>
                            <p>Automatically assign tickets based on workload</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={autoAssignment}
                                onChange={(e) => setAutoAssignment(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Default Priority</h5>
                            <p>Default priority for new tickets</p>
                          </div>
                          <div className="setting-control">
                            <select 
                              value={defaultPriority}
                              onChange={(e) => setDefaultPriority(e.target.value)}
                              className="priority-select"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Auto-Close Inactive</h5>
                            <p>Auto-close tickets after 30 days of inactivity</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={autoCloseInactive}
                                onChange={(e) => setAutoCloseInactive(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>⏰ Session & Timeout</h4>
                        <p>Configure user session and security settings</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Session Timeout</h5>
                            <p>Auto-logout after inactivity (minutes)</p>
                          </div>
                          <div className="setting-control">
                            <input 
                              type="number" 
                              value={sessionTimeout}
                              onChange={(e) => setSessionTimeout(e.target.value)}
                              className="timeout-input"
                              min="5"
                              max="480"
                            />
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Remember Me</h5>
                            <p>Allow users to stay logged in for 30 days</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>📊 Dashboard & Display</h4>
                        <p>Customize dashboard appearance and data display</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Items Per Page</h5>
                            <p>Number of items to display per page</p>
                          </div>
                          <div className="setting-control">
                            <select 
                              value={itemsPerPage}
                              onChange={(e) => setItemsPerPage(e.target.value)}
                              className="items-select"
                            >
                              <option value="10">10</option>
                              <option value="25">25</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Theme</h5>
                            <p>Choose your preferred theme</p>
                          </div>
                          <div className="setting-control">
                            <select 
                              value={theme}
                              onChange={(e) => setTheme(e.target.value)}
                              className="theme-select"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeSettingsTab === 'notifications' && (
                <div className="settings-panel">
                  <div className="panel-header">
                    <h3>🔔 Notification Settings</h3>
                    <p>Configure how and when you receive notifications</p>
                  </div>
                  
                  <div className="settings-grid">
                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>📧 Email Notifications</h4>
                        <p>Manage email notification preferences</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>New Ticket Alerts</h5>
                            <p>Get notified when new tickets are created</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Assignment Notifications</h5>
                            <p>Get notified when tickets are assigned to you</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={assignmentNotifications}
                                onChange={(e) => setAssignmentNotifications(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Status Updates</h5>
                            <p>Get notified when ticket status changes</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={statusUpdateNotifications}
                                onChange={(e) => setStatusUpdateNotifications(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>🔔 In-App Notifications</h4>
                        <p>Manage notifications within the application</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Desktop Notifications</h5>
                            <p>Show desktop notifications for important updates</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={desktopNotifications}
                                onChange={(e) => setDesktopNotifications(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Sound Alerts</h5>
                            <p>Play sound for new notifications</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={soundAlerts}
                                onChange={(e) => setSoundAlerts(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Privacy Tab */}
              {activeSettingsTab === 'security' && (
                <div className="settings-panel">
                  <div className="panel-header">
                    <h3>🔒 Security & Privacy</h3>
                    <p>Manage security settings and data privacy preferences</p>
                  </div>
                  
                  <div className="settings-grid">
                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>🔐 Authentication</h4>
                        <p>Configure login and authentication settings</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Two-Factor Authentication</h5>
                            <p>Add an extra layer of security to your account</p>
                          </div>
                          <div className="setting-control">
                            <button className="btn-secondary">Enable 2FA</button>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Password Policy</h5>
                            <p>Enforce strong password requirements</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={passwordPolicy}
                                onChange={(e) => setPasswordPolicy(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>🛡️ Data Privacy</h4>
                        <p>Control how your data is used and stored</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Data Encryption</h5>
                            <p>Encrypt sensitive data at rest</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={dataEncryption}
                                onChange={(e) => setDataEncryption(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Audit Logging</h5>
                            <p>Log all user actions for security auditing</p>
                          </div>
                          <div className="setting-control">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={auditLogging}
                                onChange={(e) => setAuditLogging(e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeSettingsTab === 'integrations' && (
                <div className="settings-panel">
                  <div className="panel-header">
                    <h3>🔗 Integrations</h3>
                    <p>Connect with external services and tools</p>
                  </div>
                  
                  <div className="settings-grid">
                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>📧 Email Services</h4>
                        <p>Configure email service integrations</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>SMTP Server</h5>
                            <p>Configure SMTP settings for email notifications</p>
                          </div>
                          <div className="setting-control">
                            <button className="btn-secondary">Configure</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="setting-card">
                      <div className="setting-header">
                        <h4>📊 Analytics</h4>
                        <p>Connect analytics and reporting tools</p>
                      </div>
                      <div className="setting-items">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h5>Google Analytics</h5>
                            <p>Track usage and performance metrics</p>
                          </div>
                          <div className="setting-control">
                            <button className="btn-secondary">Connect</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign Ticket</h3>
              <button 
                className="modal-close"
                onClick={handleCancelAssignment}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Select an HR staff member to assign this ticket to:</p>
              <select 
                value={selectedHRStaff}
                onChange={(e) => setSelectedHRStaff(e.target.value)}
                className="hr-staff-select"
              >
                <option value="">Select HR Staff</option>
                {mockHRStaff.map(staff => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} - {staff.department}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={handleCancelAssignment}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmAssignment}
                disabled={!selectedHRStaff}
              >
                Assign Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Create User Modal */}
    {showCreateUserModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Create New User</h3>
            <button 
              className="modal-close"
              onClick={handleCancelCreateUser}
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="user-name">Full Name *</label>
              <input
                type="text"
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Enter full name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="user-email">Email Address *</label>
              <input
                type="email"
                id="user-email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Enter email address"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="user-password">Password *</label>
              <input
                type="password"
                id="user-password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Enter password (min. 8 characters)"
                className="form-input"
                minLength="8"
              />
              <small className="form-help">Password must be at least 8 characters long</small>
            </div>
            <div className="form-group">
              <label htmlFor="user-role">Role *</label>
              <select
                id="user-role"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="form-select"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="user-status">Status</label>
              <select
                id="user-status"
                value={newUser.status}
                onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                className="form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={handleCancelCreateUser}
            >
              Cancel
            </button>
            <button 
              className="create-btn"
              onClick={handleCreateUser}
            >
              Create User
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {showEditUserModal && editingUser && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Edit User</h3>
            <button 
              className="modal-close"
              onClick={handleCancelEditUser}
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="edit-user-name">Full Name *</label>
              <input
                type="text"
                id="edit-user-name"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                placeholder="Enter full name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-user-email">Email Address *</label>
              <input
                type="email"
                id="edit-user-email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                placeholder="Enter email address"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-user-password">Change Password</label>
              <input
                type="password"
                id="edit-user-password"
                value={editUserPassword}
                onChange={(e) => setEditUserPassword(e.target.value)}
                placeholder="Enter new password (leave blank to keep current)"
                className="form-input"
                minLength="8"
              />
              <small className="form-help">Leave blank to keep current password. Minimum 8 characters if changing.</small>
            </div>
            <div className="form-group">
              <label htmlFor="edit-user-role">Role *</label>
              <select
                id="edit-user-role"
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                className="form-select"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-user-status">Status</label>
              <select
                id="edit-user-status"
                value={editingUser.status}
                onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                className="form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={handleCancelEditUser}
            >
              Cancel
            </button>
            <button 
              className="update-btn"
              onClick={handleUpdateUser}
            >
              Update User
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Create Group Modal */}
    {showCreateGroupModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Create Group</h3>
            <button 
              className="modal-close"
              onClick={handleCancelCreateGroup}
            >
              ✕
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="group-name">Group Name *</label>
              <input
                type="text"
                id="group-name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                placeholder="Enter group name"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                placeholder="Enter group description"
                className="form-input"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <div className="members-section-header">
                <label className="members-label">Add Members</label>
                <div className="members-count">
                  {newGroup.members.length} member{newGroup.members.length !== 1 ? 's' : ''} selected
                </div>
              </div>
              
              <div className="members-search">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="members-search-input"
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
              
              <div className="members-selection">
                {users
                  .filter(user => 
                    user.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(groupSearchTerm.toLowerCase())
                  )
                  .map(user => (
                    <label key={user.id} className="member-checkbox">
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={newGroup.members.includes(user.id)}
                          onChange={() => {
                            const isSelected = newGroup.members.includes(user.id);
                            setNewGroup({
                              ...newGroup,
                              members: isSelected
                                ? newGroup.members.filter(id => id !== user.id)
                                : [...newGroup.members, user.id]
                            });
                          }}
                        />
                        <div className="custom-checkbox"></div>
                      </div>
                      <div className="member-info">
                        <div className="member-avatar">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="member-details">
                          <span className="member-name">{user.name}</span>
                          <span className="member-email">{user.email}</span>
                          <span className="member-role">{user.role}</span>
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={handleCancelCreateGroup}
            >
              Cancel
            </button>
            <button 
              className="create-btn"
              onClick={handleCreateGroup}
              disabled={!newGroup.name.trim()}
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Group Modal */}
    {showEditGroupModal && editingGroup && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Edit Group</h3>
            <button 
              className="modal-close"
              onClick={handleCancelEditGroup}
            >
              ✕
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="edit-group-name">Group Name *</label>
              <input
                type="text"
                id="edit-group-name"
                value={editingGroup.name}
                onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                placeholder="Enter group name"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-group-description">Description</label>
              <textarea
                id="edit-group-description"
                value={editingGroup.description}
                onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                placeholder="Enter group description"
                className="form-input"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <div className="members-section-header">
                <label className="members-label">Manage Members</label>
                <div className="members-count">
                  {editingGroup.members.length} member{editingGroup.members.length !== 1 ? 's' : ''} selected
                </div>
              </div>
              
              <div className="members-search">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="members-search-input"
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
              
              <div className="members-selection">
                {users
                  .filter(user => 
                    user.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(groupSearchTerm.toLowerCase())
                  )
                  .map(user => (
                    <label key={user.id} className="member-checkbox">
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={editingGroup.members.includes(user.id)}
                          onChange={() => toggleGroupMember(user.id)}
                        />
                        <div className="custom-checkbox"></div>
                      </div>
                      <div className="member-info">
                        <div className="member-avatar">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="member-details">
                          <span className="member-name">{user.name}</span>
                          <span className="member-email">{user.email}</span>
                          <span className="member-role">{user.role}</span>
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={handleCancelEditGroup}
            >
              Cancel
            </button>
            <button 
              className="update-btn"
              onClick={handleUpdateGroup}
              disabled={!editingGroup.name.trim()}
            >
              Update Group
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Theme Toggle Button */}
      <button
        className={`theme-toggle-btn ${theme}`}
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
      >
        {theme === 'light' ? (
          <>
            <span className="theme-icon">☀️</span>
            <span className="theme-text">Light</span>
          </>
        ) : (
          <>
            <span className="theme-icon">🌙</span>
            <span className="theme-text">Dark</span>
          </>
        )}
      </button>

    </div>
  );
};

export default Dashboard;