import React, { useState, useRef, useEffect } from 'react';
import './EmailDetail.css';

export interface EmailContent {
  id: string;
  subject: string;
  from: string;
  date: string;
  to?: string;
  cc?: string;
  bcc?: string;
  body: string;
  mailedBy?: string;
  signedBy?: string;
}

interface EmailDetailProps {
  emailContent: EmailContent | null;
  folder: "inbox" | "sent";
  onClose?: () => void;
  isMobile?: boolean;
}

const EmailDetail: React.FC<EmailDetailProps> = ({
  emailContent,
  folder}) => {
  const [showPopupDetails, setShowPopupDetails] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  
  // Add click outside handler to close the popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        toggleButtonRef.current && 
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setShowPopupDetails(false);
      }
    }
    
    // Add event listener when popup is open
    if (showPopupDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopupDetails]);

  // Process the email body
  let processedBody = emailContent?.body || "";
  if (emailContent?.body) {
    // First try to decode base64 content
    processedBody = tryDecodeBase64(emailContent.body);
    // Then clean up common special characters that appear in emails
    processedBody = cleanupEmailContent(processedBody);
  }

  // Simple function to decode base64 content
  function tryDecodeBase64(content: string): string {
    if (!content) return "";
    // Base64 decoding logic (unchanged)
    try {
      // Check if this looks like base64
      if (/^[A-Za-z0-9+/=_-]+$/.test(content) && content.length > 20) {
        // Try to decode
        const decoded = atob(content);
        // Check if the decoded content looks like HTML
        if (decoded.includes('<html') ||
            decoded.includes('<!DOCTYPE') ||
            decoded.includes('<body') ||
            (decoded.includes('<div') && decoded.includes('</div>'))) {
          return decoded;
        }
      }
      return content;
    } catch (e) {
      console.warn("Base64 decoding failed:", e);
      return content;
    }
  }

  // Function to clean up common special characters in emails
  function cleanupEmailContent(content: string): string {
    if (!content) return "";
    // Character replacement logic (unchanged)
    let cleaned = content
      // Non-breaking spaces and special spaces
      .replace(/Â/g, ' ')
      .replace(/\u00A0/g, ' ')
      // Smart quotes
      .replace(/â/g, '"')
      .replace(/â/g, '"')
      .replace(/â/g, "'")
      .replace(/â/g, "'")
      // Em dash and en dash
      .replace(/â/g, '-')
      .replace(/â/g, '-')
      // Ellipsis
      .replace(/â¦/g, '...')
      // Bullet points
      .replace(/â¢/g, '•')
      // Other common replacements
      .replace(/Ã©/g, 'é')
      .replace(/Ã¨/g, 'è')
      .replace(/Ã«/g, 'ë')
      .replace(/Ã¯/g, 'ï')
      .replace(/Ã®/g, 'î')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã¹/g, 'ù')
      .replace(/Ã»/g, 'û')
      .replace(/Ã§/g, 'ç')
      .replace(/Ã/g, 'à');

    return cleaned;
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Format: "Fri, May 9, 4:57 PM (1 day ago)"
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      
      let formattedDate = date.toLocaleString('en-US', options);
      
      // Add time ago
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        formattedDate += " (1 day ago)";
      } else if (diffDays > 1 && diffDays < 30) {
        formattedDate += ` (${diffDays} days ago)`;
      }
      
      return formattedDate;
    } catch (e) {
      return dateString;
    }
  };

  if (!emailContent) {
    return (
      <div className="email-empty-state">
        Select an email to view
      </div>
    );
  }

  // Extract email domain for display
  const getEmailDomain = (email: string) => {
    const match = email.match(/<([^>]+)>/);
    if (match && match[1]) {
      return match[1];
    }
    return email;
  };

  // Extract display name
  const getDisplayName = (email: string) => {
    const match = email.match(/^([^<]+)</);
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // If no display name, use the part before @ in email
    const emailMatch = email.match(/<([^>]+)>/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1].split('@')[0];
    }
    
    return email.split('@')[0];
  };

  // Toggle popup details function
  const togglePopupDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopupDetails(!showPopupDetails);
  };

  // Add this CSS to the component or in a style tag
  const emailStyles = `
    .email-content table,
    .email-content table * {
      border: none !important;
    }

    .email-content table {
      max-width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      table-layout: fixed;
      width: 100%;
    }

    .email-content table td,
    .email-content table th {
      padding: 5px;
      word-break: break-word;
    }
  `;

  return (
    <div className="email-detail-container">
      {/* Add email styles */}
      <style dangerouslySetInnerHTML={{ __html: emailStyles }} />
      
      {/* Email subject with folder label */}
      <div className="email-subject-container">
        <h1 className="email-subject">{cleanupEmailContent(emailContent.subject)}</h1>
        <span className="folder-label">{folder === "inbox" ? "Inbox" : "Sent"}</span>
      </div>
      
      {/* Sender info with avatar */}
      <div className="sender-container">
        <div className="sender-avatar">
          {getDisplayName(emailContent.from).charAt(0).toUpperCase()}
        </div>
        <div className="sender-details">
          <div className="sender-name-line">
            <span className="sender-name">{getDisplayName(emailContent.from)}</span>
            <span className="sender-email">&lt;{getEmailDomain(emailContent.from)}&gt;</span>
          </div>
          <div className="recipient-line">
            to {folder === "sent" ? emailContent.to : "me"}
            <button 
              ref={toggleButtonRef}
              className="details-toggle" 
              onClick={togglePopupDetails}
              aria-label="Show email details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            
            {/* Popup details view */}
            {showPopupDetails && (
              <div className="email-popup-details" ref={popupRef}>
                <table className="popup-details-table">
                  <tbody>
                    <tr>
                      <td className="popup-details-label">from:</td>
                      <td className="popup-details-value">{getDisplayName(emailContent.from)} &lt;{getEmailDomain(emailContent.from)}&gt;</td>
                    </tr>
                    <tr>
                      <td className="popup-details-label">to:</td>
                      <td className="popup-details-value">{emailContent.to}</td>
                    </tr>
                    <tr>
                      <td className="popup-details-label">date:</td>
                      <td className="popup-details-value">{new Date(emailContent.date).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}</td>
                    </tr>
                    <tr>
                      <td className="popup-details-label">subject:</td>
                      <td className="popup-details-value">{emailContent.subject}</td>
                    </tr>
                    {emailContent.mailedBy && (
                      <tr>
                        <td className="popup-details-label">mailed-by:</td>
                        <td className="popup-details-value">{emailContent.mailedBy}</td>
                      </tr>
                    )}
                    {emailContent.signedBy && (
                      <tr>
                        <td className="popup-details-label">signed-by:</td>
                        <td className="popup-details-value">{emailContent.signedBy}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="popup-details-label">security:</td>
                      <td className="popup-details-value">
                        <span className="security-icon">🔒</span> Standard encryption (TLS) 
                        <a href="#" className="learn-more">Learn more</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="email-date">
          {formatDate(emailContent.date)}
        </div>
      </div>

      {/* Email body */}
      <div className="email-body">
        <div
          className="email-content"
          dangerouslySetInnerHTML={{ __html: processedBody }}
        />
      </div>
    </div>
  );
};

export default EmailDetail;
