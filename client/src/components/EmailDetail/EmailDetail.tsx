import React from 'react';

// Add comprehensive styles for email content
const emailStyles = `
  .email-content {
    font-family: Arial, sans-serif;
    line-height: 1.5;
    color: #333;
    width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  /* Style for email addresses to ensure they wrap properly */
  .email-address {
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
  }

  .email-content img {
    max-width: 100%;
    height: auto;
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

  .email-content a {
    color: #0066cc;
    text-decoration: underline;
    word-break: break-all;
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

  return (
    <div className="h-full flex flex-col">
      {/* Add email styles */}
      <style dangerouslySetInnerHTML={{ __html: emailStyles }} />

      {isMobile && (
        <div className="p-2 border-b flex justify-between items-center">
          <button
            onClick={onClose}
            className="p-2 text-gray-500"
          >
            ← Back
          </button>
        </div>
      )}

      <div className="p-4 h-full flex flex-col overflow-auto">
        <div className="mb-4">
          <h1 className="text-xl font-bold mb-3">{cleanupEmailContent(emailContent.subject)}</h1>

          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-3">
              {folder === "sent"
                ? (emailContent.to?.charAt(0) || "T").toUpperCase()
                : emailContent.from.charAt(0).toUpperCase()
              }
            </div>
            <div>
              {folder === "sent" ? (
                <>
                  <div className="font-medium">To: <span className="email-address">{cleanupEmailContent(emailContent.to || "")}</span></div>
                  <div className="text-xs text-gray-500">
                    {new Date(emailContent.date).toLocaleString()}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium"><span className="email-address">{cleanupEmailContent(emailContent.from)}</span></div>
                  <div className="text-xs text-gray-500">
                    {new Date(emailContent.date).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>

          {folder === "inbox" && emailContent.to && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">To:</span> <span className="email-address">{cleanupEmailContent(emailContent.to || "")}</span>
            </div>
          )}

          {folder === "sent" && emailContent.from && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">From:</span> <span className="email-address">{cleanupEmailContent(emailContent.from)}</span>
            </div>
          )}

          {emailContent.cc && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Cc:</span> <span className="email-address">{cleanupEmailContent(emailContent.cc || "")}</span>
            </div>
          )}

          {emailContent.bcc && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Bcc:</span> <span className="email-address">{cleanupEmailContent(emailContent.bcc || "")}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 flex-grow overflow-auto">
          <div className="max-h-[calc(100vh-250px)] overflow-auto border rounded p-4 bg-white">
            {processedBody ? (
              <div
                className="email-content"
                dangerouslySetInnerHTML={{ __html: processedBody }}
                style={{ maxWidth: '100%', overflowX: 'auto', wordBreak: 'break-word' }}
              />
            ) : (
              <div className="text-gray-500">No content available for this email.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
