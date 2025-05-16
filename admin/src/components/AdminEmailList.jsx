// Email Modal with modern header design
{modalOpen && selectedEmailContent && (
  <div className="email-modal">
    <div className="email-modal-content">
      {/* Modern Email Header */}
      <div className="email-header">
        <div className="email-header-top">
          <h2 className="email-subject">{selectedEmailContent.subject || "No Subject"}</h2>
          <button 
            onClick={closeModal}
            className="close-button"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="email-meta">
          <div className="email-sender">
            <div className="avatar">
              {(selectedEmail?.category === "SENT" 
                ? selectedEmailContent.to?.split('<')[0].trim().charAt(0) 
                : selectedEmailContent.from?.split('<')[0].trim().charAt(0)) || "?"}
            </div>
            <div className="sender-details">
              <div className="sender-name">
                {selectedEmail?.category === "SENT" 
                  ? selectedEmailContent.to?.split('<')[0].trim() || "Recipient"
                  : selectedEmailContent.from?.split('<')[0].trim() || "Sender"}
              </div>
              <div className="sender-email">
                {selectedEmail?.category === "SENT"
                  ? (selectedEmailContent.to?.match(/<(.+)>/) ? selectedEmailContent.to.match(/<(.+)>/)[1] : "")
                  : (selectedEmailContent.from?.match(/<(.+)>/) ? selectedEmailContent.from.match(/<(.+)>/)[1] : "")}
              </div>
            </div>
          </div>
          
          <div className="email-date">
            {selectedEmailContent.date ? new Date(selectedEmailContent.date).toLocaleString(undefined, {
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit', 
              minute: '2-digit'
            }) : ""}
          </div>
        </div>
        
        {/* Additional recipients info */}
        <div className="recipients-info">
          {selectedEmail?.category === "INBOX" && selectedEmailContent.to && (
            <div className="recipient-row">
              <span className="recipient-label">To:</span>
              <span className="recipient-value">{selectedEmailContent.to}</span>
            </div>
          )}
          
          {selectedEmailContent.cc && (
            <div className="recipient-row">
              <span className="recipient-label">Cc:</span>
              <span className="recipient-value">{selectedEmailContent.cc}</span>
            </div>
          )}
          
          {selectedEmailContent.bcc && (
            <div className="recipient-row">
              <span className="recipient-label">Bcc:</span>
              <span className="recipient-value">{selectedEmailContent.bcc}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Email Content */}
      <div className="email-body">
        <div 
          className="email-content"
          dangerouslySetInnerHTML={{ __html: selectedEmailContent.body || '<p>No content available</p>' }}
        />
      </div>
      
      {/* Email Actions */}
      <div className="email-actions">
        <button className="action-button reply-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17L4 12M4 12L9 7M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reply
        </button>
        <button className="action-button forward-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17L20 12M20 12L15 7M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Forward
        </button>
        <button className="action-button delete-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
)}