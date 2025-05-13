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
import EmailDetail from "../../components/AdminEmailDetail"; // Import the EmailDetail component

const InboundMails = () => {
  const { token, role } = useAuth();
  const [inboundMails, setInboundMails] = useState([]);
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
  const [senderFilter, setSenderFilter] = useState("");
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
    fetchInboundEmails();
    fetchLabelMetadata();
  }, [token]);

  const fetchInboundEmails = async () => {
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
      
      // Transform the data to match the inboundMails format
      const allInboundMails = data.users.flatMap(user => 
        user.inbox.map(email => {
          const subject = email.payload.headers.find(h => h.name === "Subject")?.value || "No Subject";
          const from = email.payload.headers.find(h => h.name === "From")?.value || "Unknown Sender";
          const date = email.payload.headers.find(h => h.name === "Date")?.value;
          const messageId = email.payload.headers.find(h => h.name === "Message-ID")?.value;
          const inReplyTo = email.payload.headers.find(h => h.name === "In-Reply-To")?.value;
          const references = email.payload.headers.find(h => h.name === "References")?.value;
          
          // Format the sender to show name first, then email without <>
          let senderName = "";
          let senderEmail = "";
          
          if (from.includes("<")) {
            // Format: "Name <email@example.com>"
            const parts = from.split("<");
            senderName = parts[0].trim();
            senderEmail = parts[1].replace(">", "").trim();
          } else {
            // Format: just email
            senderEmail = from.trim();
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
            sender: senderName || senderEmail,
            senderEmail: senderEmail,
            subject: subject,
            status: email.isUnread ? "Unread" : "Read",
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
      
      setInboundMails(allInboundMails);
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
      from: email.sender || "Unknown Sender",
      date: email.dateUTC || new Date().toISOString(),
      to: email.recipient || "",
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
        from: email.sender || "Unknown Sender",
        date: email.dateUTC || new Date().toISOString(),
        to: email.recipient || "",
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
    setSenderFilter("");
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
  const fetchLabelMetadata = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/admin/labels`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch label metadata");
      }

      const { labels } = await res.json();
      
      // Convert array to object for easier lookup
      const labelMap = {};
      labels.forEach(label => {
        labelMap[label.id] = label;
      });
      
      setLabelMetadata(labelMap);
    } catch (err) {
      console.error("Error fetching label metadata:", err);
    }
  };

  if (role !== "admin") return <p className="p-6 text-red-500">Access denied. Admins only.</p>;
  if (loading) return <p className="p-4">Loading inbound emails...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Filter and sort emails based on user selections
  let filteredMails = [...inboundMails];
  
  // Apply search filter
  if (searchTerm) {
    filteredMails = filteredMails.filter(mail => 
      mail.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply sender filter
  if (senderFilter) {
    filteredMails = filteredMails.filter(mail => 
      mail.sender.toLowerCase().includes(senderFilter.toLowerCase()) ||
      mail.senderEmail.toLowerCase().includes(senderFilter.toLowerCase())
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
    inboundMails.flatMap(mail => mail.labels.map(label => label.name || label.id))
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
          <button className="refresh-icon-btn" onClick={fetchInboundEmails} title="Refresh">
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
              <label>Sender Email</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter by sender..."
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Subject Keywords</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter by subject..."
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    start: e.target.value ? new Date(e.target.value) : null
                  })}
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    end: e.target.value ? new Date(e.target.value) : null
                  })}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Status/Label</label>
              <div className="dropdown">
                <button 
                  className="dropdown-toggle"
                  onClick={() => setShowStatusLabelDropdown(!showStatusLabelDropdown)}
                >
                  {statusFilter || labelFilter || "All"}
                  <ChevronDown size={16} />
                </button>
                {showStatusLabelDropdown && (
                  <div className="dropdown-menu status-label-dropdown">
                    <div className="dropdown-section">
                      <div className="dropdown-section-title">Status</div>
                      <div className="dropdown-item" onClick={() => handleStatusLabelSelect('status', "")}>
                        All Statuses
                      </div>
                      <div className="dropdown-item" onClick={() => handleStatusLabelSelect('status', "Unread")}>
                        Unread
                      </div>
                      <div className="dropdown-item" onClick={() => handleStatusLabelSelect('status', "Read")}>
                        Read
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div className="dropdown-section">
                      <div className="dropdown-section-title">Labels</div>
                      <div className="dropdown-item" onClick={() => handleStatusLabelSelect('label', "")}>
                        All Labels
                      </div>
                      {allLabels.map(label => (
                        <div 
                          key={label} 
                          className="dropdown-item"
                          onClick={() => handleStatusLabelSelect('label', label)}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="filter-group">
              <label>Attachments</label>
              <div className="checkbox-input">
                <input
                  type="checkbox"
                  id="hasAttachments"
                  checked={hasAttachmentFilter}
                  onChange={(e) => setHasAttachmentFilter(e.target.checked)}
                />
                <label htmlFor="hasAttachments">Has Attachments</label>
              </div>
            </div>
            
            <div className="filter-group labels-filter">
              <label>Labels</label>
              <div className="labels-container">
                {allLabels.map(label => (
                  <div 
                    key={label}
                    className={`label-chip ${selectedLabels.includes(label) ? 'selected' : ''}`}
                    onClick={() => toggleLabelFilter(label)}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mails-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date/Time (UTC)</th>
              <th>Sender</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Size</th>
              <th>Labels</th>
              {/* Actions column removed */}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((mail, index) => (
              <tr 
                key={index} 
                className={mail.status === "Unread" ? "unread" : ""}
                onClick={() => handleEmailClick(mail)}
                style={{ cursor: 'pointer' }}
              >
                <td>{mail.dateUTC}</td>
                <td>
                  <div className="sender-info">
                    <div className="sender-name">{mail.sender}</div>
                    {mail.senderEmail && mail.sender !== mail.senderEmail && (
                      <div className="sender-email">{mail.senderEmail}</div>
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
                      <span className="attachment-badge">
                        <Paperclip size={14} />
                      </span>
                    )}
                  </div>
                </td>
                <td>{mail.size}</td>
                <td>
                  <div className="labels-container">
                    {mail.labels.map((label, i) => {
                      const labelId = label.id || label;
                      const labelName = label.name || label;
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
                          case "UNREAD":
                            style = { backgroundColor: "#e0f2fe", color: "#0369a1" }; // light blue
                            break;
                          case "CATEGORY_PERSONAL":
                            style = { backgroundColor: "#dbeafe", color: "#1e40af" }; // blue
                            break;
                          case "CATEGORY_SOCIAL":
                            style = { backgroundColor: "#fae8ff", color: "#86198f" }; // pink
                            break;
                          case "CATEGORY_PROMOTIONS":
                            style = { backgroundColor: "#fef9c3", color: "#854d0e" }; // yellow
                            break;
                          case "CATEGORY_UPDATES":
                            style = { backgroundColor: "#d1fae5", color: "#065f46" }; // emerald
                            break;
                          case "CATEGORY_FORUMS":
                            style = { backgroundColor: "#e0e7ff", color: "#3730a3" }; // indigo
                            break;
                        }
                      }
                      
                      return (
                        <span 
                          key={i} 
                          className="label-badge"
                          style={style}
                          title={metadata?.type === 'system' ? `System: ${labelName}` : labelName}
                        >
                          {labelName.replace(/^CATEGORY_/, '')}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMails.length)} of {filteredMails.length} emails
        </div>
        <div className="pagination-buttons">
          <button 
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span className="current-page">{currentPage}</span>
          <button 
            className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Email Detail Modal */}
      {showModal && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <div className="email-modal-header">
              <h3>{selectedEmailContent?.subject || "Email Details"}</h3>
              <button
                onClick={closeModal}
                className="close-modal-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="email-modal-content">
              {detailLoading ? (
                <div className="loading-spinner">Loading email content...</div>
              ) : selectedEmailContent ? (
                <EmailDetail 
                  emailContent={selectedEmailContent}
                  folder="inbox"
                />
              ) : (
                <div className="loading-spinner">No email content available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundMails;
