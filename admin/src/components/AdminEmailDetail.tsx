import React from 'react';

// Add comprehensive styles for email content
const emailStyles = `
  .email-content {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
    width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    font-size: 14px;
  }

  /* Style for email addresses to ensure they wrap properly */
  .email-address {
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    color: #555;
  }

  .email-content img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  .email-content a {
    color: #3b82f6;
    text-decoration: none;
    border-bottom: 1px solid #dbeafe;
  }

  .email-content a:hover {
    border-bottom-color: #3b82f6;
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
    border: 1px solid #ddd;
    word-break: break-word;
  }

  .email-content p {
    margin-bottom: 10px;
    max-width: 100%;
  }

  .email-content ul,
  .email-content ol {
    margin-left: 20px;
    margin-bottom: 10px;
  }

  .email-content blockquote {
    border-left: 3px solid #ddd;
    padding-left: 10px;
    margin-left: 10px;
    color: #666;
  }

  /* Fix for Gmail quoted content */
  .email-content .gmail_quote {
    border-left: 2px solid #ddd;
    padding-left: 10px;
    margin-left: 0;
    color: #666;
  }

  /* Fix for common email client specific elements */
  .email-content div[style] {
    max-width: 100% !important;
  }

  .email-content span[style] {
    max-width: 100% !important;
    display: inline-block;
  }

  /* Force all images to be responsive */
  .email-content img[width] {
    max-width: 100% !important;
    height: auto !important;
  }

  /* Handle pre-formatted text */
  .email-content pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }

  /* Email content container */
  .email-content-container {
    max-height: calc(100vh - 280px);
    overflow-y: auto;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 20px;
    background-color: white;
    font-size: 14px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  }

  /* Email header section */
  .email-header {
    margin-bottom: 16px;
  }

  .email-header h1 {
    font-size: 18px;
    margin-bottom: 12px;
    color: #111;
    font-weight: 600;
  }

  /* Plain text email formatting */
  .plain-text-email {
    white-space: pre-wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.5;
    background-color: #f9fafb;
    padding: 16px;
    border-radius: 6px;
    color: #374151;
  }
  
  /* Avatar styling */
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 600;
    color: white;
  }
  
  /* Link styling */
  .email-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }
  
  .email-link:hover {
    text-decoration: underline;
  }
  
  /* Metadata styling */
  .email-metadata {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
  }
  
  .email-metadata-item {
    display: flex;
    align-items: baseline;
  }
  
  .email-metadata-label {
    font-weight: 500;
    width: 40px;
    color: #4b5563;
  }
`;

export interface EmailContent {
  id: string;
  subject: string;
  from: string;
  date: string;
  to?: string;
  cc?: string;
  bcc?: string;
  body: string;
}

interface EmailDetailProps {
  emailContent: EmailContent | null;
  folder: "inbox" | "sent";
  onClose?: () => void;
  isMobile?: boolean;
}

const EmailDetail: React.FC<EmailDetailProps> = ({
  emailContent,
  folder,
  onClose,
  isMobile = false
}) => {
  // Simple function to decode base64 content
  const tryDecodeBase64 = (content: string): string => {
    if (!content) return "";

    // Special case for IMDb emails
    if (content.startsWith('PCEtLVtpZiBtc28gfCBJRV0')) {
      console.log("EmailDetail: Detected IMDb email format");
      try {
        // Try direct decode
        const decoded = atob(content);
        if (decoded.startsWith('<!--[if mso |')) {
          console.log("EmailDetail: Successfully decoded IMDb email");
          return decoded;
        }

        // If direct decode fails, try with padding
        let padded = content;
        while (padded.length % 4 !== 0) {
          padded += '=';
        }
        const paddedDecoded = atob(padded);
        if (paddedDecoded.includes('<!--') || paddedDecoded.includes('<html')) {
          console.log("EmailDetail: Successfully decoded IMDb email with padding");
          return paddedDecoded;
        }
      } catch (e) {
        console.warn("EmailDetail: IMDb decode failed:", e);
      }
    }

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
  };

  // Process the email body
  let processedBody = emailContent?.body || "";
  if (emailContent?.body) {
    // First try to decode base64 content
    processedBody = tryDecodeBase64(emailContent.body);

    // Then clean up common special characters that appear in emails
    processedBody = cleanupEmailContent(processedBody);
  }

  // Function to clean up common special characters in emails
  function cleanupEmailContent(content: string): string {
    if (!content) return "";

    // Replace common problematic characters
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

    // Remove unnecessary quotation marks at the beginning and end of the content
    cleaned = cleaned.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }

    // Remove any standalone quotation marks that appear on their own lines
    cleaned = cleaned.replace(/^"\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*"\s*$/gm, '');

    // Remove any other unnecessary characters
    cleaned = cleaned
      // Remove zero-width spaces
      .replace(/\u200B/g, '')
      // Remove zero-width non-joiners
      .replace(/\u200C/g, '')
      // Remove zero-width joiners
      .replace(/\u200D/g, '')
      // Remove left-to-right marks
      .replace(/\u200E/g, '')
      // Remove right-to-left marks
      .replace(/\u200F/g, '')
      // Remove other common invisible characters
      .replace(/[\u2000-\u200F\u2028-\u202F\u205F-\u206F]/g, '');

    return cleaned;
  }

  if (!emailContent) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Select an email to view
      </div>
    );
  }

  // Update the formatEmailBody function
  const formatEmailBody = (content: string): string => {
    if (!content) return "";
    
    let formatted = content;
    
    // Check if content is just a long string without HTML tags
    if (!/<[a-z][\s\S]*>/i.test(formatted)) {
      // Convert URLs to clickable links with better styling
      formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="email-link">$1</a>'
      );
      
      // Convert line breaks to <br> tags
      formatted = formatted.replace(/\n/g, '<br>');
      
      // Wrap in a div with plain text styling
      formatted = `<div class="plain-text-email">${formatted}</div>`;
    }
    
    return formatted;
  };

  // Update the EmailDetail component to work with the new header
  // Remove the existing EmailHeader component since we're handling that in AdminEmailList

  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Add email styles */}
      <style dangerouslySetInnerHTML={{ __html: emailStyles }} />
      
      {/* Email content with proper padding */}
      <div className="p-6 h-full flex flex-col overflow-auto">
        <div className="email-content-container flex-grow">
          {processedBody ? (
            <div
              className="email-content rounded-lg border border-gray-200 p-4 shadow-sm"
              dangerouslySetInnerHTML={{ __html: formatEmailBody(processedBody) }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 text-sm italic p-4 text-center">
                No content available for this email.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
