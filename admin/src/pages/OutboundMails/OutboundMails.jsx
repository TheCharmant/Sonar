"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import {
  Search,
  ArrowDownAZ,
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Tag,
  Filter,
  X,
  ChevronUp,
  Download,
  Eye
} from "lucide-react";
import "./OutboundMails.css";
import EmailDetail from "../../components/AdminEmailDetail";

const OutboundMails = () => {
  const { token, role } = useAuth();
  const [outboundMails, setOutboundMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [selectedEmailContent, setSelectedEmailContent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showStatusLabelDropdown, setShowStatusLabelDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [recipientFilter, setRecipientFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [hasAttachmentFilter, setHasAttachmentFilter] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Add this state for the modal
  const [showModal, setShowModal] = useState(false);

  // Add this state for storing label metadata
  const [labelMetadata, setLabelMetadata] = useState({});

  useEffect(() => {
    if (!token) return;
    fetchOutboundEmails();
<<<<<<< HEAD
    fetchLabelMetadata();
=======
    // fetchLabelMetadata(); // Removed
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617
  }, [token]);

  const fetchOutboundEmails = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch emails");
      }

      const data = await res.json();
      
      // Transform the data to match the outboundMails format, but only use sent emails
      const allOutboundMails = data.users.flatMap(user => 
        user.sent.map(email => {
          const subject = email.payload.headers.find(h => h.name === "Subject")?.value || "No Subject";
          const to = email.payload.headers.find(h => h.name === "To")?.value || "Unknown Recipient";
          const date = email.payload.headers.find(h => h.name === "Date")?.value;
          const messageId = email.payload.headers.find(h => h.name === "Message-ID")?.value;
          const inReplyTo = email.payload.headers.find(h => h.name === "In-Reply-To")?.value;
          const references = email.payload.headers.find(h => h.name === "References")?.value;
          
          // Format the recipient to show name first, then email without <>
          let recipientName = "";
          let recipientEmail = "";
          
          if (to.includes("<")) {
            // Format: "Name <email@example.com>"
            const parts = to.split("<");
            recipientName = parts[0].trim();
            recipientEmail = parts[1].replace(">", "").trim();
          } else {
            // Format: just email
            recipientEmail = to.trim();
          }
          
          // Calculate email size (placeholder - would come from actual API)
          const emailSize = Math.floor(Math.random() * 1000) + 1; // 1-1000 KB
          
          // Check for attachments (placeholder - would come from actual API)
          const hasAttachments = email.payload.parts && email.payload.parts.some(part => part.filename);
          const attachments = hasAttachments ? 
            email.payload.parts.filter(part => part.filename).map(part => ({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body?.size || 0,
              attachmentId: part.body?.attachmentId
            })) : [];
          
          return {
            recipient: recipientName || recipientEmail,
            recipientEmail: recipientEmail,
            subject: subject,
            status: "Sent",
            dateSent: date ? new Date(date) : null, // Keep as Date object for filtering
            dateFormatted: date ? new Date(date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : "No date",
            dateUTC: date ? new Date(date).toISOString() : null,
            preview: email.snippet,
            id: email.id,
            userId: user.uid,
            labels: email.labels || [],
            size: `${emailSize} KB`,
            hasAttachments,
            attachments,
            headers: {
              messageId,
              inReplyTo,
              references
            }
          };
        })
      );
      
      setOutboundMails(allOutboundMails);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to map your email data to the format expected by EmailDetail
  const mapEmailToDetailFormat = (email) => {
    return {
      id: email.id,
      subject: email.subject || "No Subject",
      to: email.recipient || "Unknown Recipient",
      date: email.dateUTC || new Date().toISOString(),
      from: email.sender || "",
      cc: email.cc || "",
      bcc: email.bcc || "",
      body: email.preview || "No content available"
    };
  };

  // Add a function to fetch the full email content
  const fetchFullEmailContent = async (email) => {
    if (!email || !email.id) {
      console.error("No email ID provided");
      setError("Cannot view email: No ID provided");
      return;
    }
    
    setDetailLoading(true);
    
    try {
      // Include the userId in the request to help the backend find the right tokens
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/email/detail?id=${email.id}&userId=${email.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch email details");
      }

      const { email: message } = await res.json();
      
      // Extract all required headers and body content
      const emailContent = {
        id: email.id,
        subject: email.subject || "No Subject",
        to: email.recipient || "Unknown Recipient",
        date: email.dateUTC || new Date().toISOString(),
        from: message.from || "",
        cc: email.cc || "",
        bcc: email.bcc || "",
        body: message.body || message.snippet || email.preview || "No content available"
      };
      
      setSelectedEmailContent(emailContent);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching email details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch email details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    if (!email) {
      console.error("No email provided");
      setError("Cannot view email: No data provided");
      return;
    }
    
    console.log(`Handling click for email:`, email.id);
    fetchFullEmailContent(email);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmailContent(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRecipientFilter("");
    setSubjectFilter("");
    setStatusFilter("");
    setLabelFilter("");
    setSelectedDate(null);
    setDateRange({ start: null, end: null });
    setHasAttachmentFilter(false);
    setSelectedLabels([]);
  };

  const toggleLabelFilter = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  // Add this function to fetch label metadata
<<<<<<< HEAD
  const fetchLabelMetadata = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/labels`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        console.error("Failed to fetch label metadata");
        return;
      }
      
      const { labels } = await res.json();
      
      // Convert to object with label ID as key
      const labelMap = {};
      labels.forEach(label => {
        labelMap[label.id] = label;
      });
      
      setLabelMetadata(labelMap);
    } catch (err) {
      console.error("Error fetching label metadata:", err);
    }
  };
=======
  // const fetchLabelMetadata = async () => {
  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/labels`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     
  //     if (!res.ok) {
  //       console.error("Failed to fetch label metadata");
  //       return;
  //     }
  //     
  //     const { labels } = await res.json();
  //     
  //     // Convert to object with label ID as key
  //     const labelMap = {};
  //     labels.forEach(label => {
  //       labelMap[label.id] = label;
  //     });
  //     
  //     setLabelMetadata(labelMap);
  //   } catch (err) {
  //     console.error("Error fetching label metadata:", err);
  //   }
  // };
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617

  if (role !== "admin") return <p className="p-6 text-red-500">Access denied. Admins only.</p>;
  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading outbound emails...</p>
      </div>
    </div>
  );
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Filter and sort emails based on user selections
  let filteredMails = [...outboundMails];
  
  // Apply search filter
  if (searchTerm) {
    filteredMails = filteredMails.filter(mail => 
      mail.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply recipient filter
  if (recipientFilter) {
    filteredMails = filteredMails.filter(mail => 
      mail.recipient.toLowerCase().includes(recipientFilter.toLowerCase()) ||
      mail.recipientEmail.toLowerCase().includes(recipientFilter.toLowerCase())
    );
  }
  
  // Apply subject filter
  if (subjectFilter) {
    filteredMails = filteredMails.filter(mail => 
      mail.subject.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  }
  
  // Apply status filter
  if (statusFilter) {
    filteredMails = filteredMails.filter(mail => 
      mail.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  // Apply label filter
  if (labelFilter) {
    filteredMails = filteredMails.filter(mail => 
      mail.labels.some(label => 
        (label.name === labelFilter || label.id === labelFilter)
      )
    );
  }
  
  // Apply date filter (single date)
  if (selectedDate) {
    const dateStr = selectedDate.toDateString();
    filteredMails = filteredMails.filter(mail => {
      if (!mail.dateSent) return false;
      return mail.dateSent.toDateString() === dateStr;
    });
  }
  
  // Apply date range filter
  if (dateRange.start && dateRange.end) {
    filteredMails = filteredMails.filter(mail => {
      if (!mail.dateSent) return false;
      return mail.dateSent >= dateRange.start && mail.dateSent <= dateRange.end;
    });
  }
  
  // Apply attachment filter
  if (hasAttachmentFilter) {
    filteredMails = filteredMails.filter(mail => mail.hasAttachments);
  }
  
  // Apply label filters
  if (selectedLabels.length > 0) {
    filteredMails = filteredMails.filter(mail => 
      selectedLabels.every(label => 
        mail.labels.some(l => l.name === label || l.id === label)
      )
    );
  }
  
  // Apply sorting
  filteredMails.sort((a, b) => {
    if (!a.dateSent || !b.dateSent) return 0;
    return sortOption === "asc" ? a.dateSent - b.dateSent : b.dateSent - a.dateSent;
  });
  
  // Apply pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMails.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMails.length / itemsPerPage);

  // Get all unique labels for filter dropdown
  const allLabels = Array.from(new Set(
    outboundMails.flatMap(mail => mail.labels.map(label => label.name || label.id))
  ));

  // Add a function to handle status/label selection
  const handleStatusLabelSelect = (type, value) => {
    if (type === 'status') {
      setStatusFilter(value);
      setLabelFilter(""); // Clear label filter when selecting status
    } else if (type === 'label') {
      setLabelFilter(value);
      setStatusFilter(""); // Clear status filter when selecting label
    }
    setShowStatusLabelDropdown(false);
  };

  return (
    <div className="inbound-mails-container">
      <div className="page-header">
        <div className="header-actions">
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="refresh-icon-btn" onClick={fetchOutboundEmails} title="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="refresh-icon">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h2>Search & Filter</h2>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset All
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Recipient Email</label>
              <div className="search-container">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by recipient..."
                  value={recipientFilter}
                  onChange={(e) => setRecipientFilter(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Subject Keywords</label>
              <div className="search-container">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by subject..."
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value ? new Date(e.target.value) : null})}
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value ? new Date(e.target.value) : null})}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <div className="status-filter-options">
                <div className="checkbox-input">
                  <input
                    type="checkbox"
                    id="status-sent"
                    checked={statusFilter === "Sent"}
                    onChange={(e) => setStatusFilter(e.target.checked ? "Sent" : "")}
                  />
                  <label htmlFor="status-sent">Sent</label>
                </div>
                <div className="checkbox-input">
                  <input
                    type="checkbox"
                    id="status-delivered"
                    checked={statusFilter === "Delivered"}
                    onChange={(e) => setStatusFilter(e.target.checked ? "Delivered" : "")}
                  />
                  <label htmlFor="status-delivered">Delivered</label>
                </div>
                <div className="checkbox-input">
                  <input
                    type="checkbox"
                    id="status-failed"
                    checked={statusFilter === "Failed"}
                    onChange={(e) => setStatusFilter(e.target.checked ? "Failed" : "")}
                  />
                  <label htmlFor="status-failed">Failed</label>
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Has Attachments</label>
              <div className="checkbox-input">
                <input
                  type="checkbox"
                  id="has-attachments"
                  checked={hasAttachmentFilter}
                  onChange={(e) => setHasAttachmentFilter(e.target.checked)}
                />
                <label htmlFor="has-attachments">With Attachments</label>
              </div>
            </div>
            
            <div className="filter-group labels-filter">
              <label>Labels</label>
              <div className="labels-container">
                {Object.values(labelMetadata).map((label) => (
                  <div
                    key={label.id}
                    className={`label-chip ${selectedLabels.includes(label.id) ? 'selected' : ''}`}
                    onClick={() => toggleLabelFilter(label.id)}
                    style={
                      selectedLabels.includes(label.id) && label.color
                        ? {
                            backgroundColor: label.color.backgroundColor || '#4a6cf7',
                            color: label.color.textColor || 'white',
                          }
                        : {}
                    }
                  >
                    {label.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Removing the search-filter-panel with search bar and blue refresh button */}
      
      <div className="mails-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Size</th>
              <th>Labels</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No outbound emails found.
                </td>
              </tr>
            ) : (
              currentItems.map((mail, index) => (
                <tr 
                  key={index} 
                  onClick={() => handleEmailClick(mail)}
                >
                  <td>{mail.dateFormatted}</td>
                  <td>
                    <div className="sender-info">
                      <div className="sender-name">{mail.recipient}</div>
                      {mail.recipientEmail && mail.recipient !== mail.recipientEmail && (
                        <div className="sender-email">{mail.recipientEmail}</div>
                      )}
                    </div>
                  </td>
                  <td>{mail.subject}</td>
                  <td>
                    <div className="status-container">
                      <span className={`status-badge ${mail.status.toLowerCase()}`}>
                        {mail.status}
                      </span>
                      {mail.hasAttachments && (
                        <span className="attachment-badge" title="Has attachments">
                          <Paperclip size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{mail.size}</td>
                  <td>
                    <div className="status-container">
                      {mail.labels && mail.labels.map((label, i) => {
                        const labelId = typeof label === 'object' ? label.id : label;
                        const labelName = typeof label === 'object' ? label.name : label;
                        const metadata = labelMetadata[labelId];
                        
                        // Default styling
                        let style = {
                          backgroundColor: "#e5e7eb", // gray-200
                          color: "#374151", // gray-700
                        };
                        
                        // Apply custom styling if available
                        if (metadata?.color) {
                          style = {
                            backgroundColor: metadata.color.backgroundColor || style.backgroundColor,
                            color: metadata.color.textColor || style.color,
                          };
                        } else {
                          // Apply predefined styles for system labels
                          switch (labelName) {
                            case "INBOX":
                              style = { backgroundColor: "#dbeafe", color: "#1e40af" }; // blue
                              break;
                            case "SENT":
                              style = { backgroundColor: "#dcfce7", color: "#166534" }; // green
                              break;
                            case "IMPORTANT":
                              style = { backgroundColor: "#fee2e2", color: "#b91c1c" }; // red
                              break;
                            case "STARRED":
                              style = { backgroundColor: "#fef3c7", color: "#92400e" }; // amber
                              break;
                            case "DRAFT":
                              style = { backgroundColor: "#f3e8ff", color: "#6b21a8" }; // purple
                              break;
                            case "SPAM":
                              style = { backgroundColor: "#ffedd5", color: "#c2410c" }; // orange
                              break;
                            case "TRASH":
                              style = { backgroundColor: "#f3f4f6", color: "#4b5563" }; // gray
                              break;
                            default:
                              break;
                          }
                        }
                        
                        return (
                          <span 
                            key={i} 
                            className="status-badge"
                            style={style}
                          >
                            {labelName}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {totalPages || 1}
        </span>
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-button"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* Email detail modal */}
      {showModal && selectedEmailContent && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <div className="email-modal-header">
              <h2>Email Details</h2>
              <button className="close-modal-button" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="email-modal-content">
              <EmailDetail email={selectedEmailContent} />
            </div>
          </div>
        </div>
      )}
      
      {detailLoading && (
        <div className="loading-spinner">
          Loading email content...
        </div>
      )}
    </div>
  );
};

export default OutboundMails;
