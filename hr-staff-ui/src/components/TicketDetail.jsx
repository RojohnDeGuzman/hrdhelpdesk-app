import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TicketDetail.css';

const TicketDetail = ({ user }) => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCannedDropdown, setShowCannedDropdown] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [activeInfoTab, setActiveInfoTab] = useState('info');

  // Mock HR staff data
  const mockHRStaff = [
    { id: 'hr001', name: 'Sarah Johnson', department: 'HR', email: 'sarah.johnson@company.com' },
    { id: 'hr002', name: 'Mike Chen', department: 'HR', email: 'mike.chen@company.com' },
    { id: 'hr003', name: 'Emily Davis', department: 'HR', email: 'emily.davis@company.com' },
    { id: 'hr004', name: 'David Wilson', department: 'HR', email: 'david.wilson@company.com' },
    { id: 'hr005', name: 'Lisa Brown', department: 'HR', email: 'lisa.brown@company.com' }
  ];

  // Canned response templates
  const cannedResponses = [
    {
      id: 'resolved',
      title: 'Resolved Ticket Response',
      content: 'Thank you for contacting HR. Your issue has been resolved. If you have any further questions or concerns, please don\'t hesitate to reach out to us. We appreciate your patience and look forward to assisting you in the future.',
      category: 'Resolution'
    },
    {
      id: 'in_progress',
      title: 'In Progress Response',
      content: 'Thank you for your inquiry. We are currently working on resolving your issue and will provide you with an update within 24 hours. We appreciate your patience.',
      category: 'Status Update'
    },
    {
      id: 'information_needed',
      title: 'Information Needed',
      content: 'Thank you for contacting HR. To better assist you, we need some additional information. Could you please provide [specific details needed]? Once we receive this information, we will be able to process your request promptly.',
      category: 'Follow-up'
    },
    {
      id: 'escalated',
      title: 'Escalated Response',
      content: 'Thank you for bringing this matter to our attention. Your case has been escalated to our senior HR team for review. We will contact you within 2 business days with a resolution.',
      category: 'Escalation'
    },
    {
      id: 'follow_up',
      title: 'Follow-up Response',
      content: 'We wanted to follow up on your recent inquiry. How are things going? Is there anything else we can assist you with regarding this matter?',
      category: 'Follow-up'
    },
    {
      id: 'policy_clarification',
      title: 'Policy Clarification',
      content: 'Thank you for your question about our company policies. Based on our current policy, [policy details]. If you need further clarification or have additional questions, please let us know.',
      category: 'Policy'
    }
  ];


  useEffect(() => {
    // Mock data - moved inside useEffect to prevent dependency warnings
    const mockTickets = [
      {
        id: 'TKT-001',
        title: 'Payroll Inquiry - Salary Adjustment',
        description: 'Employee requesting clarification on recent salary adjustment. The employee noticed a discrepancy in their monthly salary and wants to understand the calculation method used for the recent adjustment. They have provided their previous salary statements for comparison.',
        status: 'open',
        priority: 'high',
        assignedTo: 'Sarah Johnson',
        createdAt: '2024-01-15T09:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        employee: {
          name: 'John Smith',
          department: 'IT',
          email: 'john.smith@company.com',
          id: 'EMP001'
        },
        attachments: [
          { name: 'payroll_document.pdf', size: '1.5 MB' },
          { name: 'salary_comparison.xlsx', size: '850 KB' }
        ]
      },
      {
        id: 'TKT-002',
        title: 'Leave Request - Vacation',
        description: 'Requesting 5 days vacation leave for family trip. The employee needs to attend a family wedding and requires time off from work. They have provided the necessary documentation and have ensured their work will be covered during their absence.',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'Mike Chen',
        createdAt: '2024-01-14T11:15:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        employee: {
          name: 'Emily Davis',
          department: 'Marketing',
          email: 'emily.davis@company.com',
          id: 'EMP002'
        },
        attachments: [
          { name: 'vacation_request_form.pdf', size: '2.1 MB' },
          { name: 'travel_itinerary.pdf', size: '1.8 MB' }
        ]
      },
      {
        id: 'TKT-003',
        title: 'Benefits Enrollment - Health Insurance',
        description: 'Need assistance with health insurance enrollment process. The employee is new to the company and needs help understanding the available health insurance options and completing the enrollment process.',
        status: 'resolved',
        priority: 'low',
        assignedTo: 'Lisa Wang',
        createdAt: '2024-01-13T08:45:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        employee: {
          name: 'Robert Brown',
          department: 'Sales',
          email: 'robert.brown@company.com',
          id: 'EMP003'
        }
      },
      {
        id: 'TKT-004',
        title: 'IT Support - Laptop Issue',
        description: 'Laptop is running very slowly and frequently crashes. The employee has tried restarting and basic troubleshooting but the issue persists. They need IT support to diagnose and fix the problem.',
        status: 'open',
        priority: 'high',
        assignedTo: 'Unassigned',
        createdAt: '2024-01-12T14:20:00Z',
        updatedAt: '2024-01-12T14:20:00Z',
        employee: {
          name: 'Maria Garcia',
          department: 'Finance',
          email: 'maria.garcia@company.com',
          id: 'EMP004'
        }
      }
    ];

    const mockTicketHistory = [
      {
        id: 'hist001',
        type: 'created',
        description: 'Ticket created by employee',
        user: 'John Smith',
        userRole: 'Employee',
        timestamp: '2024-01-15T09:30:00Z',
        details: 'Initial ticket submission'
      },
      {
        id: 'hist002',
        type: 'assigned',
        description: 'Ticket assigned to HR staff',
        user: 'Sarah Johnson',
        userRole: 'HR Manager',
        timestamp: '2024-01-15T10:15:00Z',
        details: 'Assigned to Sarah Johnson for review'
      },
      {
        id: 'hist003',
        type: 'status_changed',
        description: 'Status changed to Open',
        user: 'Sarah Johnson',
        userRole: 'HR Manager',
        timestamp: '2024-01-15T10:16:00Z',
        details: 'Ticket status updated from Pending to Open'
      },
      {
        id: 'hist004',
        type: 'priority_changed',
        description: 'Priority changed to High',
        user: 'Sarah Johnson',
        userRole: 'HR Manager',
        timestamp: '2024-01-15T10:17:00Z',
        details: 'Priority escalated due to urgency'
      },
      {
        id: 'hist005',
        type: 'comment_added',
        description: 'Comment added',
        user: 'Sarah Johnson',
        userRole: 'HR Manager',
        timestamp: '2024-01-15T11:30:00Z',
        details: 'Initial response to employee inquiry'
      },
      {
        id: 'hist006',
        type: 'reassigned',
        description: 'Ticket reassigned',
        user: 'Mike Chen',
        userRole: 'HR Specialist',
        timestamp: '2024-01-15T14:20:00Z',
        details: 'Reassigned to Mike Chen for specialized handling'
      },
      {
        id: 'hist007',
        type: 'status_changed',
        description: 'Status changed to Pending',
        user: 'Mike Chen',
        userRole: 'HR Specialist',
        timestamp: '2024-01-15T14:21:00Z',
        details: 'Status updated while gathering additional information'
      }
    ];

    const mockComments = [
      {
        id: 1,
        author: 'Sarah Johnson',
        authorRole: 'HR Manager',
        content: 'I\'ve reviewed the payroll documents and will get back to you with clarification by end of day.',
        timestamp: '2024-01-15T10:30:00Z',
        replies: [
          {
            id: 11,
            author: 'John Smith',
            authorRole: 'Employee',
            content: 'Thank you Sarah, I appreciate the quick response.',
            timestamp: '2024-01-15T11:15:00Z'
          }
        ]
      },
      {
        id: 2,
        author: 'Mike Chen',
        authorRole: 'HR Assistant',
        content: 'I\'ve forwarded this to the payroll team for detailed analysis. We should have an answer within 24 hours.',
        timestamp: '2024-01-15T14:20:00Z',
        replies: []
      }
    ];

    // Simulate API call
    const fetchTicket = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundTicket = mockTickets.find(t => t.id === ticketId);
      setTicket(foundTicket);
      setComments(mockComments);
      setTicketHistory(mockTicketHistory);
      setResolution(foundTicket?.resolution || '');
      setLoading(false);
    };

    fetchTicket();
  }, [ticketId]);

  const handleBack = () => {
    navigate('/dashboard?tab=tickets');
  };

  const handleAssignTicket = (assigneeName) => {
    if (ticket) {
      // Update local ticket state
      setTicket(prevTicket => ({
        ...prevTicket,
        assignedTo: assigneeName,
        status: 'open',
        updatedAt: new Date().toISOString()
      }));
      
      setShowAssignDropdown(false);
      // In a real app, this would make an API call to update the ticket
      console.log('Ticket assigned to:', assigneeName);
    }
  };

  const toggleAssignDropdown = () => {
    setShowAssignDropdown(!showAssignDropdown);
  };

  const handleStatusChange = (newStatus) => {
    if (ticket) {
      // Check if resolution is required for resolved/closed status
      if ((newStatus === 'resolved' || newStatus === 'closed') && !resolution.trim()) {
        setPendingStatusChange(newStatus);
        setModalStatus(newStatus);
        setShowResolutionModal(true);
        return;
      }
      
      setTicket(prevTicket => ({
        ...prevTicket,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  const handlePriorityChange = (newPriority) => {
    if (ticket) {
      setTicket(prevTicket => ({
        ...prevTicket,
        priority: newPriority,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Current User',
        authorRole: 'HR Staff',
        content: newComment,
        timestamp: new Date().toISOString(),
        replies: []
      };
      
      if (replyingTo) {
        // Add as reply
        setComments(comments.map(c => 
          c.id === replyingTo 
            ? { ...c, replies: [...c.replies, comment] }
            : c
        ));
        setReplyingTo(null);
      } else {
        // Add as new comment
        setComments([...comments, comment]);
      }
      
      setNewComment('');
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleCannedResponse = (response) => {
    setNewComment(response.content);
    setReplyingTo('all');
    setShowCannedDropdown(false);
  };


  const handleSaveResolution = () => {
    if (resolution.trim()) {
      setTicket(prevTicket => ({
        ...prevTicket,
        resolution: resolution.trim(),
        status: modalStatus || pendingStatusChange,
        updatedAt: new Date().toISOString()
      }));
      setShowResolutionModal(false);
      setPendingStatusChange(null);
      setModalStatus('');
    }
  };

  const handleCancelResolution = () => {
    setShowResolutionModal(false);
    setPendingStatusChange(null);
    setModalStatus('');
  };


  if (loading) {
    return (
      <div className="ticket-detail-container">
        <div className="loading-spinner">
          <div className="bubble-loader">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
          </div>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-container">
        <div className="error-state">
          <h2>Ticket Not Found</h2>
          <p>The ticket you're looking for doesn't exist or has been removed.</p>
          <button className="back-btn" onClick={handleBack}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ticket-detail-container">
      {/* Header */}
      <div className="ticket-detail-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBack}>
            <span className="back-icon">←</span>
            <span className="back-text">Back to Tickets</span>
          </button>
          
          <div className="title-section">
            <h1>{ticket.title}</h1>
            <div className="ticket-id">#{ticket.id}</div>
          </div>
          
          <div className="header-actions">
            <div className="assign-dropdown">
              <button className="assign-btn" onClick={toggleAssignDropdown}>
                <span className="btn-icon">👤</span>
                {ticket.assignedTo === user.name ? 'Assigned to You' : 'Assign'}
              </button>
              {showAssignDropdown && (
                <div className="assign-dropdown-menu">
                  {mockHRStaff.map(staff => (
                    <button
                      key={staff.id}
                      className="assign-option"
                      onClick={() => handleAssignTicket(staff.name)}
                    >
                      <span className="staff-avatar">{staff.name.charAt(0)}</span>
                      <div className="staff-info">
                        <div className="staff-name">{staff.name}</div>
                        <div className="staff-department">{staff.department}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select 
              value={ticket.priority} 
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="priority-select"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select 
              value={ticket.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="ticket-badges">
            <span className={`status-badge status-${ticket.status}`}>
              {ticket.status}
            </span>
            <span className={`priority-badge priority-${ticket.priority}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ticket-detail-content">
        <div className="ticket-detail-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Conversation Thread */}
            <div className="detail-section">
              <h3>Conversation Thread</h3>
              <div className="conversation-thread">
                      {/* User's Original Message */}
                      <div className="message-item user-message">
                        <div className="message-header">
                          <div className="message-author">
                            <span className="author-avatar">{ticket.employee.name.split(' ').map(n => n[0]).join('')}</span>
                            <div className="author-info">
                              <span className="author-name">{ticket.employee.name}</span>
                              <span className="author-role">Employee</span>
                            </div>
                          </div>
                          <span className="message-time">
                            {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="message-content">
                          <p>{ticket.description}</p>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="outlook-attachments">
                              {ticket.attachments.map((attachment, index) => (
                          <div key={index} className="outlook-attachment-item">
                            <div className="attachment-icon-outlook">📎</div>
                            <div className="attachment-details">
                              <div className="attachment-name-outlook">{attachment.name}</div>
                              <div className="attachment-size">{attachment.size || 'Unknown size'}</div>
                            </div>
                            <div className="attachment-actions-outlook">
                              <button 
                                className="attachment-action-outlook download-btn-outlook"
                                onClick={() => console.log('Downloading:', attachment.name)}
                                title="Download"
                              >
                                📥
                              </button>
                              <button 
                                className="attachment-action-outlook preview-btn-outlook"
                                onClick={() => console.log('Previewing:', attachment.name)}
                                title="Preview"
                              >
                                👁️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                    <div className="message-actions">
                      <button 
                        className={`reply-btn ${replyingTo === 'user' ? 'active' : ''}`}
                        onClick={() => handleReply('user')}
                        title="Reply to this message"
                      >
                        <span className="reply-icon">↩️</span>
                        {replyingTo === 'user' ? 'Replying...' : 'Reply'}
                      </button>
                    </div>
                </div>

                {/* HR Responses */}
                {comments.map(comment => (
                  <div key={comment.id} className="message-item hr-message">
                    <div className="message-header">
                      <span className="message-time">
                        {new Date(comment.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div className="message-author">
                        <div className="author-info">
                          <span className="author-name">{comment.author}</span>
                          <span className="author-role">{comment.authorRole}</span>
                        </div>
                        <span className="author-avatar">{comment.author.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="message-content">
                      <p>{comment.content}</p>
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="outlook-attachments">
                          {comment.attachments.map((attachment, index) => (
                            <div key={index} className="outlook-attachment-item">
                              <div className="attachment-icon-outlook">📎</div>
                              <div className="attachment-details">
                                <div className="attachment-name-outlook">{attachment.name}</div>
                                <div className="attachment-size">{attachment.size || 'Unknown size'}</div>
                              </div>
                              <div className="attachment-actions-outlook">
                                <button 
                                  className="attachment-action-outlook download-btn-outlook"
                                  onClick={() => console.log('Downloading:', attachment.name)}
                                  title="Download"
                                >
                                  📥
                                </button>
                                <button 
                                  className="attachment-action-outlook preview-btn-outlook"
                                  onClick={() => console.log('Previewing:', attachment.name)}
                                  title="Preview"
                                >
                                  👁️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="message-actions">
                      <button 
                        className={`reply-btn ${replyingTo === comment.id ? 'active' : ''}`}
                        onClick={() => handleReply(comment.id)}
                        title="Reply to this message"
                      >
                        <span className="reply-icon">↩️</span>
                        {replyingTo === comment.id ? 'Replying...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Response Input */}
                <div className="response-input">
                  {replyingTo && (
                    <div className="reply-context">
                      <div className="reply-context-header">
                        <span className="reply-context-label">Replying to:</span>
                        <button 
                          className="close-reply-btn"
                          onClick={() => setReplyingTo(null)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="reply-context-content">
                        {replyingTo === 'user' ? (
                          <div className="reply-preview">
                            <span className="reply-author">{ticket.employee.name}</span>
                            <span className="reply-text">{ticket.description.length > 100 ? ticket.description.substring(0, 100) + '...' : ticket.description}</span>
                          </div>
                        ) : (
                          <div className="reply-preview">
                            <span className="reply-author">{comments.find(c => c.id === replyingTo)?.author}</span>
                            <span className="reply-text">{comments.find(c => c.id === replyingTo)?.content.length > 100 ? comments.find(c => c.id === replyingTo)?.content.substring(0, 100) + '...' : comments.find(c => c.id === replyingTo)?.content}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <textarea 
                    placeholder={replyingTo ? `Reply to ${replyingTo === 'user' ? ticket.employee.name : comments.find(c => c.id === replyingTo)?.author}...` : "Reply to employee concern..."}
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={replyingTo ? 'replying' : ''}
                  ></textarea>
                  
                  <div className="attachment-section">
                    <input 
                      type="file" 
                      id="attachment-input" 
                      multiple 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        // Handle file attachment
                        console.log('Files selected:', e.target.files);
                      }}
                    />
                    <button 
                      className="attach-btn"
                      onClick={() => document.getElementById('attachment-input').click()}
                    >
                      <span className="attach-icon">📎</span>
                      Attach Files
                    </button>
                    <span className="attachment-hint">Max 5 files, 10MB each</span>
                  </div>
                  
                  <div className="response-actions">
                    <div className="response-info">
                      {replyingTo && (
                        <span className="reply-mode-indicator">
                          <span className="reply-icon">↩️</span>
                          Reply Mode
                        </span>
                      )}
                    </div>
                    <div className="response-buttons">
                      {replyingTo && (
                        <button 
                          className="cancel-reply-btn"
                          onClick={() => {
                            setReplyingTo(null);
                            setNewComment('');
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        className="send-response-btn"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <span className="send-icon">📤</span>
                        {replyingTo ? 'Send Reply' : 'Send Response'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Ticket Information Tabs */}
            <div className="detail-section ticket-info-tabs">
              <div className="tabs-header">
                <div className="tabs-nav">
                  <button 
                    className={`tab-btn ${activeInfoTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveInfoTab('info')}
                  >
                    <span className="tab-icon">ℹ️</span>
                    Ticket Information
                  </button>
                  <button 
                    className={`tab-btn ${activeInfoTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveInfoTab('history')}
                  >
                    <span className="tab-icon">📋</span>
                    History
                  </button>
                </div>
              </div>
              
              <div className="tabs-content">
                {activeInfoTab === 'info' && (
                  <div className="tab-panel">
                    <div className="ticket-info-simple">
                      <div className="info-line">
                        <span className="info-label">Ticket ID:</span>
                        <span className="info-value">#{ticket.id}</span>
                      </div>
                      <div className="info-line">
                        <span className="info-label">Created:</span>
                        <span className="info-value">
                          {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      <div className="info-line">
                        <span className="info-label">Last Updated:</span>
                        <span className="info-value">
                          {new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      <div className="info-line">
                        <span className="info-label">Assigned To:</span>
                        <span className="info-value">{ticket.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeInfoTab === 'history' && (
                  <div className="tab-panel">
                    <div className="history-timeline-compact">
                      {ticketHistory.length > 0 ? (
                        ticketHistory.slice(0, 5).map((event, index) => (
                          <div key={event.id} className="history-item-compact">
                            <div className="history-timeline-marker-compact">
                              <div className={`timeline-dot-compact timeline-${event.type}`}>
                                {event.type === 'created' && '📝'}
                                {event.type === 'assigned' && '👤'}
                                {event.type === 'reassigned' && '🔄'}
                                {event.type === 'status_changed' && '🔄'}
                                {event.type === 'priority_changed' && '⚡'}
                                {event.type === 'comment_added' && '💬'}
                              </div>
                              {index < Math.min(ticketHistory.length, 5) - 1 && <div className="timeline-line-compact"></div>}
                            </div>
                            <div className="history-content-compact">
                              <div className="history-description-compact">{event.description}</div>
                              <div className="history-time-compact">
                                {new Date(event.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-history">
                          <span className="no-history-icon">📋</span>
                          <span className="no-history-text">No history available</span>
                        </div>
                      )}
                      
                      {ticketHistory.length > 5 && (
                        <div className="view-more-history">
                          <button 
                            className="view-more-btn"
                            onClick={() => setShowHistoryModal(true)}
                          >
                            <span className="view-more-icon">📋</span>
                            View All {ticketHistory.length} Events
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Card */}
            <div className="detail-section resolution-card">
              <h3>Resolution</h3>
              <div className="resolution-content">
                {ticket.resolution ? (
                  <div className="resolution-display">
                    <div className="resolution-text-container">
                      <span className="resolution-label">Resolution Details:</span>
                      <span className="resolution-text">{ticket.resolution}</span>
                    </div>
                    <button 
                      className="edit-resolution-btn"
                      onClick={() => {
                        setResolution(ticket.resolution);
                        setShowResolutionModal(true);
                      }}
                      title="Edit Resolution"
                    >
                      ✏️
                    </button>
                  </div>
                ) : (
                  <button 
                    className="add-resolution-btn"
                    onClick={() => setShowResolutionModal(true)}
                  >
                    <span className="add-icon">➕</span>
                    Add Resolution
                  </button>
                )}
              </div>
            </div>

            {/* Employee Information */}
            <div className="detail-section">
              <h3>Employee Information</h3>
              <div className="employee-card-simple">
                <div className="employee-avatar">
                  {ticket.employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="employee-details-simple">
                  <div className="employee-name">{ticket.employee.name}</div>
                  <div className="employee-email">{ticket.employee.email}</div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="detail-section compact-attachments">
                <div className="attachments-header-compact">
                  <h3>Attachments ({ticket.attachments.length})</h3>
                  <button 
                    className="download-all-btn-compact"
                    onClick={() => console.log('Downloading all attachments...')}
                    title="Download All"
                  >
                    📥
                  </button>
                </div>
                <div className="attachments-list-compact">
                  {ticket.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item-compact">
                      <span className="attachment-icon-compact">📎</span>
                      <span className="attachment-name-compact" title={attachment.name}>
                        {attachment.name.length > 20 ? attachment.name.substring(0, 20) + '...' : attachment.name}
                      </span>
                      <button 
                        className="download-btn-compact"
                        onClick={() => console.log('Downloading:', attachment.name)}
                        title="Download"
                      >
                        📥
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="detail-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button 
                  className="quick-action-btn reply-to-all-btn"
                  onClick={() => {
                    // Handle reply to all functionality
                    setReplyingTo('all');
                    setNewComment('');
                  }}
                >
                  💬 Reply to All
                </button>
                <div className="canned-response-dropdown">
                  <button 
                    className="quick-action-btn canned-response-btn"
                    onClick={() => setShowCannedDropdown(!showCannedDropdown)}
                  >
                    📝 Canned Response
                  </button>
                  {showCannedDropdown && (
                    <div className="canned-dropdown-menu">
                      {cannedResponses.map((response) => (
                        <button
                          key={response.id}
                          className="canned-option"
                          onClick={() => handleCannedResponse(response)}
                        >
                          <div className="canned-option-content">
                            <div className="canned-option-title">{response.title}</div>
                            <div className="canned-option-category">{response.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {ticket.status === 'resolved' && (
                  <button 
                    className="quick-action-btn resolved-response-btn"
                    onClick={() => {
                      // Handle resolved ticket response
                      console.log('Opening resolved ticket response...');
                    }}
                  >
                    ✅ Resolved Response
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ticket History</h3>
              <button 
                className="modal-close"
                onClick={() => setShowHistoryModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="history-timeline">
                {ticketHistory.map((event, index) => (
                  <div key={event.id} className="history-item">
                    <div className="history-timeline-marker">
                      <div className={`timeline-dot timeline-${event.type}`}>
                        {event.type === 'created' && '📝'}
                        {event.type === 'assigned' && '👤'}
                        {event.type === 'reassigned' && '🔄'}
                        {event.type === 'status_changed' && '🔄'}
                        {event.type === 'priority_changed' && '⚡'}
                        {event.type === 'comment_added' && '💬'}
                      </div>
                      {index < ticketHistory.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-description">{event.description}</span>
                        <span className="history-time">
                          {new Date(event.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="history-user">
                        <span className="history-user-name">{event.user}</span>
                        <span className="history-user-role">{event.userRole}</span>
                      </div>
                      <div className="history-details">{event.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div className="modal-overlay" onClick={handleCancelResolution}>
          <div className="modal-content resolution-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {pendingStatusChange ? 
                  `Add Resolution to ${pendingStatusChange === 'resolved' ? 'Resolve' : 'Close'} Ticket` : 
                  'Edit Resolution'
                }
              </h3>
              <button 
                className="modal-close"
                onClick={handleCancelResolution}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="resolution-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-status-select">Status *</label>
                    <select
                      id="modal-status-select"
                      value={modalStatus || pendingStatusChange || ticket?.status || ''}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="modal-status-select"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="resolution-textarea">Resolution Details *</label>
                  <textarea
                    id="resolution-textarea"
                    placeholder="Describe how the issue was resolved or why the ticket is being closed..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows="4"
                    className="resolution-textarea"
                  />
                </div>
                
                <div className="resolution-requirements">
                  <p className="requirement-text">
                    <span className="requirement-icon">ℹ️</span>
                    Resolution is required before resolving or closing this ticket. You can change the status above.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={handleCancelResolution}
              >
                Cancel
              </button>
              <button 
                className="save-resolution-btn"
                onClick={handleSaveResolution}
                disabled={!resolution.trim() || !modalStatus}
              >
                {modalStatus === 'resolved' ? 'Resolve Ticket' : 
                 modalStatus === 'closed' ? 'Close Ticket' : 
                 modalStatus === 'pending' ? 'Set to Pending' :
                 modalStatus === 'open' ? 'Set to Open' :
                 'Save Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default TicketDetail;
