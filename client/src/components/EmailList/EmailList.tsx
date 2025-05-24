import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { EmailContent } from "../EmailDetail/EmailDetail";
import "./EmailList.css";

// Email styles are now in the EmailDetail component

interface EmailHeader {
  name: string;
  value: string;
}

interface EmailPayload {
  headers: EmailHeader[];
  body?: {
    data?: string;
  };
  parts?: Array<{
    body?: {
      data?: string;
    };
  }>;
}

interface Email {
  starred: any;
  id: string;
  snippet: string;
  payload: EmailPayload;
}

interface EmailResponse {
  emails: Email[];
  nextPageToken?: string;
}

// Using EmailContent interface imported from EmailDetail

interface EmailListProps {
  folder: "inbox" | "sent";
  onSelectEmail?: (email: EmailContent) => void;
  onError?: (message: string) => void;
  searchTerm?: string;
}

const EmailList = ({ folder, onSelectEmail, onError, searchTerm = "" }: EmailListProps) => {
  const { token } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmailContent, setSelectedEmailContent] = useState<EmailContent | null>(null);
  const [, setLabels] = useState<Label[]>([]);

  // Add interface for Label
  interface Label {
    id: string;
    name: string;
    type: 'system' | 'user';
    messageListVisibility?: string;
    labelListVisibility?: string;
    color?: {
      textColor: string;
      backgroundColor: string;
    } | null;
  }

  // Fetch labels when component mounts
  useEffect(() => {
    if (!token) return;
    
    const fetchLabels = async () => {
      try {
        const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/labels`);
        
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Failed to load labels");
        
        const data = await res.json();
        setLabels(data.labels);
      } catch (err) {
        console.error("Error fetching labels:", err);
      }
    };
    
    fetchLabels();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchInitial = async () => {
      try {
        const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch`);
        url.searchParams.set("folder", folder.toUpperCase());
        
        // Add label parameter if selected
        const selectedLabel = new URLSearchParams(window.location.search).get('label');
        
        if (selectedLabel) {
          url.searchParams.set("label", selectedLabel);
        }

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          const errorMsg = "Your session has expired. Please log in again.";
          setError(errorMsg);
          if (onError) onError(errorMsg);
          return;
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to load emails");
        }

        const data: EmailResponse = await res.json();
        setEmails(data.emails);
        setNextPageToken(data.nextPageToken || null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load emails";
        setError(errorMsg);
        if (onError) onError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [token, folder, onError]);

  const loadMoreEmails = async () => {
    if (!nextPageToken) return;

    setLoading(true);
    try {
      const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch`);
      url.searchParams.set("folder", folder);
      url.searchParams.set("pageToken", nextPageToken);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        const errorMsg = "Your session has expired. Please log in again.";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load more emails");
      }

      const data: EmailResponse = await res.json();
      setEmails(prev => [...prev, ...data.emails]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load more emails";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullEmail = async (messageId: string) => {
    try {
      // Show loading state
      setLoadingEmail(true);

      // Only open modal on mobile devices
      if (window.innerWidth < 768) {
        setModalOpen(true);
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/email/detail?id=${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401 || res.status === 403) {
        const errorMsg = "Your session has expired. Please log in again.";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load email");
      }

      const { email } = await res.json();

      // Log the full email structure for debugging
      console.log(`Email structure for ${folder} email:`, JSON.stringify(email, null, 2));

      const headers = email.payload.headers;

      // Extract email body content - improved approach
      let bodyContent = "";

      // Function to recursively find content in multipart emails
      const findContent = (part: any, preferredMimeType?: string): string => {
        // If this part has body data and matches preferred mime type, use it
        if (preferredMimeType && part.mimeType === preferredMimeType && part.body && part.body.data) {
          return part.body.data;
        }

        // If this part has body data and no preferred type specified, use it
        if (!preferredMimeType && part.body && part.body.data) {
          return part.body.data;
        }

        // If this part has sub-parts, check each one
        if (part.parts && part.parts.length > 0) {
          // If preferred mime type is specified, look for it first
          if (preferredMimeType) {
            for (const subPart of part.parts) {
              if (subPart.mimeType === preferredMimeType && subPart.body && subPart.body.data) {
                return subPart.body.data;
              }

              // Check if this part has nested parts
              if (subPart.parts) {
                const nestedContent = findContent(subPart, preferredMimeType);
                if (nestedContent) return nestedContent;
              }
            }
          }

          // First try to find HTML content
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/html' && subPart.body && subPart.body.data) {
              return subPart.body.data;
            }

            // Check for HTML in nested parts
            if (subPart.parts) {
              const nestedHtml = findContent(subPart, 'text/html');
              if (nestedHtml) return nestedHtml;
            }
          }

          // Then try to find plain text content
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/plain' && subPart.body && subPart.body.data) {
              return subPart.body.data;
            }

            // Check for plain text in nested parts
            if (subPart.parts) {
              const nestedText = findContent(subPart, 'text/plain');
              if (nestedText) return nestedText;
            }
          }
        }

        return "";
      };

      // Try to extract content from the email
      console.log("Email payload:", email.payload);

      // Special handling for multipart/alternative which is common in sent emails
      if (email.payload.mimeType === 'multipart/alternative' && email.payload.parts) {
        console.log("Found multipart/alternative content");

        // First try to find HTML part
        const htmlPart = email.payload.parts.find((p: any) => p.mimeType === 'text/html');
        if (htmlPart && htmlPart.body && htmlPart.body.data) {
          console.log("Found HTML part in multipart/alternative");
          bodyContent = htmlPart.body.data;
        } else {
          // Then try to find plain text part
          const textPart = email.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          if (textPart && textPart.body && textPart.body.data) {
            console.log("Found plain text part in multipart/alternative");
            bodyContent = textPart.body.data;
          }
        }
      }
      // First try to get HTML content
      else if (email.payload.mimeType === 'text/html' && email.payload.body && email.payload.body.data) {
        console.log("Found HTML content in main payload");
        bodyContent = email.payload.body.data;
      }
      // Handle multipart/related which often contains HTML and images
      else if (email.payload.mimeType === 'multipart/related' && email.payload.parts) {
        console.log("Found multipart/related content");

        // The first part is usually the HTML content
        const firstPart = email.payload.parts[0];
        if (firstPart && firstPart.mimeType === 'text/html' && firstPart.body && firstPart.body.data) {
          console.log("Found HTML in first part of multipart/related");
          bodyContent = firstPart.body.data;
        } else {
          // If not, use our recursive function
          bodyContent = findContent(email.payload, 'text/html');
        }
      }
      // Handle multipart/mixed which may contain text and attachments
      else if (email.payload.mimeType === 'multipart/mixed' && email.payload.parts) {
        console.log("Found multipart/mixed content");

        // Look for multipart/alternative parts first (common in sent emails)
        const alternativePart = email.payload.parts.find((p: any) => p.mimeType === 'multipart/alternative');
        if (alternativePart && alternativePart.parts) {
          console.log("Found multipart/alternative within multipart/mixed");

          // Look for HTML in the alternative part
          const htmlPart = alternativePart.parts.find((p: any) => p.mimeType === 'text/html');
          if (htmlPart && htmlPart.body && htmlPart.body.data) {
            console.log("Found HTML in multipart/alternative within multipart/mixed");
            bodyContent = htmlPart.body.data;
          } else {
            // Try plain text
            const textPart = alternativePart.parts.find((p: any) => p.mimeType === 'text/plain');
            if (textPart && textPart.body && textPart.body.data) {
              console.log("Found plain text in multipart/alternative within multipart/mixed");
              bodyContent = textPart.body.data;
            }
          }
        }
        // If no multipart/alternative, look for direct HTML or text parts
        else {
          // Try to find HTML first
          const htmlPart = email.payload.parts.find((p: any) => p.mimeType === 'text/html');
          if (htmlPart && htmlPart.body && htmlPart.body.data) {
            console.log("Found HTML part in multipart/mixed");
            bodyContent = htmlPart.body.data;
          } else {
            // Try plain text
            const textPart = email.payload.parts.find((p: any) => p.mimeType === 'text/plain');
            if (textPart && textPart.body && textPart.body.data) {
              console.log("Found plain text part in multipart/mixed");
              bodyContent = textPart.body.data;
            } else {
              // Use recursive function as last resort
              bodyContent = findContent(email.payload, 'text/html') || findContent(email.payload, 'text/plain');
            }
          }
        }
      }
      // General case for emails with parts
      else if (email.payload.parts) {
        // Try to find HTML content first
        console.log("Searching for HTML content in parts");
        bodyContent = findContent(email.payload, 'text/html');

        // If no HTML content, try plain text
        if (!bodyContent) {
          console.log("No HTML content found, trying plain text");
          bodyContent = findContent(email.payload, 'text/plain');
        }
      }
      // Simple email with body
      else if (email.payload.body && email.payload.body.data) {
        console.log("Found simple email with body data");
        bodyContent = email.payload.body.data;
      }

      // Log the extracted content
      console.log("Extracted body content:", bodyContent ? bodyContent.substring(0, 100) + "..." : "No content found");

      // If still no content, use snippet as fallback
      if (!bodyContent) {
        bodyContent = email.snippet || "";
      }

      // Function to safely decode base64 content
      const decodeBase64 = (content: string): string => {
        if (!content) return "";

        try {
          // Check for specific patterns we've seen in emails

          // IMDb email pattern - exact match for the pattern we saw
          if (content.startsWith('PCEtLVtpZiBtc28gfCBJRV0')) {
            console.log("Detected IMDb email format");
            try {
              // Force decode with special handling
              // First, try direct decode
              let decoded;
              try {
                decoded = atob(content);
                if (decoded.startsWith('<!--[if mso |')) {
                  console.log("Successfully decoded IMDb email");
                  return decoded;
                }
              } catch (e) {
                console.warn("Direct IMDb decode failed, trying with padding");
              }

              // If direct decode fails, try with padding
              try {
                // Add padding if needed
                let padded = content;
                while (padded.length % 4 !== 0) {
                  padded += '=';
                }
                decoded = atob(padded);
                if (decoded.includes('<!--') || decoded.includes('<html') || decoded.includes('<head')) {
                  console.log("Successfully decoded IMDb email with padding");
                  return decoded;
                }
              } catch (e) {
                console.warn("Padded IMDb decode failed");
              }

              // If all else fails, try a different approach
              try {
                // Try with URL-safe base64 replacements
                const prepared = content.replace(/-/g, '+').replace(/_/g, '/');

                // Add padding if needed
                let padded = prepared;
                while (padded.length % 4 !== 0) {
                  padded += '=';
                }

                decoded = atob(padded);
                if (decoded.includes('<!--') || decoded.includes('<html') || decoded.includes('<head')) {
                  console.log("Successfully decoded IMDb email with URL-safe replacements");
                  return decoded;
                }
              } catch (e) {
                console.warn("URL-safe IMDb decode failed");
              }

              // If we get here, all decoding attempts failed
              console.warn("All IMDb decoding attempts failed");
            } catch (e) {
              console.warn("IMDb format decoding failed:", e);
            }
          }

          // Gmail sent email pattern
          if (content.startsWith('PGRpdiBkaXI9') ||
              content.startsWith('PGRpdiBjbGFzcz0') ||
              content.startsWith('PGRpdiBzdHlsZT0')) {
            console.log("Detected Gmail sent email format");
            try {
              // Gmail-specific URL-safe base64 replacements
              const prepared = content.replace(/-/g, '+').replace(/_/g, '/');

              // Add padding if needed
              let padded = prepared;
              const padding = prepared.length % 4;
              if (padding > 0) {
                padded += '='.repeat(4 - padding);
              }

              return atob(padded);
            } catch (e) {
              console.warn("Special format base64 decoding failed:", e);
              return content;
            }
          }

          // Gmail inbox email pattern
          if (content.startsWith('PCEtLVtpZiBtc28') ||
              content.startsWith('PGhlYWQ') ||
              content.startsWith('PCFET0NUWVBFIGh0bWw')) {
            console.log("Detected Gmail inbox email format");
            try {
              // Gmail-specific URL-safe base64 replacements
              const prepared = content.replace(/-/g, '+').replace(/_/g, '/');

              // Add padding if needed
              let padded = prepared;
              const padding = prepared.length % 4;
              if (padding > 0) {
                padded += '='.repeat(4 - padding);
              }

              return atob(padded);
            } catch (e) {
              console.warn("Gmail inbox format decoding failed:", e);
              return content;
            }
          }

          // Standard approach for any other content
          // Gmail-specific URL-safe base64 replacements
          const prepared = content.replace(/-/g, '+').replace(/_/g, '/');

          // Add padding if needed
          let padded = prepared;
          const padding = prepared.length % 4;
          if (padding > 0) {
            padded += '='.repeat(4 - padding);
          }

          // Try to decode
          console.log("Attempting to decode base64 content");
          return atob(padded);
        } catch (e) {
          console.warn("Base64 decoding failed:", e);
          return content;
        }
      };

      // Decode base64 content
      let decodedBody = "";
      try {
        // Always try to decode as base64 first, since Gmail always sends base64
        console.log("Attempting to decode content, length:", bodyContent?.length || 0);

        // For sent emails, we need to be more aggressive with base64 decoding
        if (folder === "sent") {
          // Force base64 decoding for sent emails
          try {
            // Check for the specific pattern we saw in the example
            if (bodyContent.includes('PGRpdiBkaXI9') || bodyContent.includes('PGRpdiBjbGFzcz0') || bodyContent.includes('PGRpdiBzdHlsZT0')) {
              console.log("Found specific Gmail sent email pattern");
              // This is definitely base64, force decode
              decodedBody = decodeBase64(bodyContent);
            } else {
              decodedBody = decodeBase64(bodyContent);
            }
            console.log("Sent email decoded content (first 100 chars):", decodedBody.substring(0, 100));
          } catch (e) {
            console.warn("Sent email base64 decoding failed:", e);
            decodedBody = bodyContent;
          }
        } else {
          // For inbox emails, use a more aggressive approach similar to sent emails
          try {
            // Check for common base64 patterns in inbox emails
            if (bodyContent.startsWith('PCEtLVtpZiBtc28') ||
                bodyContent.startsWith('PGhlYWQ') ||
                bodyContent.startsWith('PCFET0NUWVBFIGh0bWw')) {
              console.log("Found specific inbox email pattern");
              // This is definitely base64, force decode
              decodedBody = decodeBase64(bodyContent);
            } else {
              // Try standard decode
              decodedBody = decodeBase64(bodyContent);

              // If decoding doesn't produce HTML-like content, try one more time
              if (!decodedBody.includes('<') && !decodedBody.includes('>')) {
                console.log("First decode didn't produce HTML, trying alternative approach");
                try {
                  // Try with different padding
                  let padded = bodyContent;
                  while (padded.length % 4 !== 0) {
                    padded += '=';
                  }
                  const altDecoded = atob(padded);
                  if (altDecoded.includes('<') && altDecoded.includes('>')) {
                    decodedBody = altDecoded;
                  }
                } catch (e) {
                  console.warn("Alternative decoding failed:", e);
                }
              }
            }

            // Check if the decoded content looks like HTML
            const isHTML = decodedBody.includes('<html') ||
                          decodedBody.includes('<!DOCTYPE') ||
                          decodedBody.includes('<head') ||
                          decodedBody.includes('<body') ||
                          (decodedBody.includes('<div') && decodedBody.includes('</div>')) ||
                          (decodedBody.includes('<table') && decodedBody.includes('</table>'));

            console.log("Content appears to be HTML:", isHTML);

            // If it's HTML, use it
            if (isHTML) {
              console.log("Successfully decoded content to HTML");
            }
            // If it's not HTML but looks like valid text, still use it
            else if (decodedBody && !/[\x00-\x1F\x80-\xFF]/.test(decodedBody.substring(0, 100))) {
              console.log("Successfully decoded content to text");
            }
            // Special case for IMDb emails - if it starts with PCEtLVtpZiBtc28, force use the decoded content
            else if (bodyContent.startsWith('PCEtLVtpZiBtc28')) {
              console.log("Using decoded content for IMDb email regardless of content type");
            }
            // Otherwise, fall back to original content
            else if (bodyContent) {
              console.warn("Decoded content appears to be binary or invalid, using original");
              decodedBody = bodyContent;
            }
          } catch (e) {
            console.warn("Inbox email decoding failed:", e);
            decodedBody = bodyContent;
          }
        }
      } catch (e) {
        console.warn("Decoding error:", e);
        decodedBody = bodyContent || "";
      }

      // Log the decoded content for debugging
      console.log("Decoded email content:", decodedBody);

      // Function to clean up special characters
      function cleanupSpecialCharacters(content: string): string {
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

      // Clean up special characters in the decoded body
      decodedBody = cleanupSpecialCharacters(decodedBody);

      // Determine if content is HTML or plain text
      // More comprehensive check for HTML content
      const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(decodedBody);
      const hasHtmlStructure = /<html|<body|<div|<p|<span|<table/i.test(decodedBody);

      // For sent emails, we need to be more aggressive with HTML detection
      let isHtml;
      if (folder === "sent") {
        // For sent emails, if it has any HTML tags, treat it as HTML
        isHtml = hasHtmlTags || decodedBody.includes('<div') || decodedBody.includes('<p>');
      } else {
        // For inbox emails, use the more cautious approach
        isHtml = hasHtmlTags && (hasHtmlStructure || decodedBody.trim().startsWith('<') && decodedBody.includes('</'));
      }

      console.log("Content appears to be HTML:", isHtml);

      let formattedBody;

      // Special case for sent emails with the pattern we saw
      if (folder === "sent" && bodyContent.includes('PGRpdiBkaXI9')) {
        console.log("Using special handling for sent email content");
        // This is definitely HTML content from a sent email
        isHtml = true;

        // Make sure it's properly decoded
        if (!decodedBody.includes('<div') && !decodedBody.includes('<p>')) {
          // Try one more time with a different approach
          try {
            decodedBody = atob(bodyContent.replace(/-/g, '+').replace(/_/g, '/'));
            console.log("Re-decoded content:", decodedBody.substring(0, 100));
          } catch (e) {
            console.warn("Re-decoding failed:", e);
          }
        }

        // Format as HTML
        if (!/<html/i.test(decodedBody)) {
          formattedBody = `<!DOCTYPE html><html><body>${decodedBody}</body></html>`;
        } else {
          formattedBody = decodedBody;
        }
      }
      // Normal HTML handling
      else if (isHtml) {
        // For HTML content, use it directly but ensure it's properly sanitized
        // Check if it has HTML and BODY tags
        if (!/<html/i.test(decodedBody)) {
          // If not, wrap it in basic HTML structure
          formattedBody = `<!DOCTYPE html><html><body>${decodedBody}</body></html>`;
        } else {
          formattedBody = decodedBody;
        }
      }
      // Plain text handling
      else {
        // For plain text, format it for display
        formattedBody = decodedBody
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>')
          .replace(/\r/g, '')
          .replace(/\s{2,}/g, match => '&nbsp;'.repeat(match.length));

        formattedBody = `<div style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5;">${formattedBody}</div>`;
      }

      // Extract headers
      const to = headers.find((h: EmailHeader) => h.name === "To")?.value || "";
      const cc = headers.find((h: EmailHeader) => h.name === "Cc")?.value || "";
      const bcc = headers.find((h: EmailHeader) => h.name === "Bcc")?.value || "";

      const emailContent = {
        id: messageId,
        subject: headers.find((h: EmailHeader) => h.name === "Subject")?.value || "No Subject",
        from: headers.find((h: EmailHeader) => h.name === "From")?.value || "Unknown Sender",
        date: headers.find((h: EmailHeader) => h.name === "Date")?.value || "No Date",
        to,
        cc,
        bcc,
        body: formattedBody
      };

      // Set the selected email content for the internal state
      setSelectedEmailContent(emailContent);

      // If onSelectEmail prop is provided, call it with the email content
      if (onSelectEmail) {
        onSelectEmail(emailContent);
      }
    } catch (err) {
      console.error("Error loading email:", err);
      setError("Failed to load email details");
      // Close modal if there's an error
      setModalOpen(false);
    } finally {
      setLoadingEmail(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    // On mobile, clear the selected email when closing the modal
    // On desktop, keep the selected email visible in the side panel
    if (window.innerWidth < 768) {
      setSelectedEmailContent(null);
    }
    setLoadingEmail(false); // Reset loading state
  };

  // Add filtering based on searchTerm
  const filteredEmails = emails.filter(email => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const headers = email.payload.headers;
    const subject = headers.find(h => h.name === "Subject")?.value || "";
    const from = headers.find(h => h.name === "From")?.value || "";
    const to = headers.find(h => h.name === "To")?.value || "";
    
    return subject.toLowerCase().includes(term) || 
           from.toLowerCase().includes(term) || 
           to.toLowerCase().includes(term) ||
           email.snippet.toLowerCase().includes(term);
  });

  // Add this function to handle refresh
  const refreshEmails = async () => {
    setLoading(true);
    setEmails([]);
    setError("");
    
    try {
      const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch`);
      url.searchParams.set("folder", folder.toUpperCase());
      
      const selectedLabel = new URLSearchParams(window.location.search).get('label');
      if (selectedLabel) {
        url.searchParams.set("label", selectedLabel);
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to refresh emails");
      }

      const data = await res.json();
      setEmails(data.emails);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to refresh emails";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-list-container">
      {/* Email List Header */}
      <div className="email-list-header">
        <div className="header-left">
          <div className="checkbox-header">
            <input type="checkbox" />
          </div>
          <button className="refresh-button" onClick={refreshEmails} title="Refresh emails">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="refresh-icon">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
            </svg>
          </button>
        </div>
        <div className="pagination-info">
          {filteredEmails.length > 0 && (
            <span>1-{filteredEmails.length} of {filteredEmails.length}+</span>
          )}
        </div>
      </div>

      {/* Email List Content */}
      <div className="email-list-content">
        {loading && emails.length === 0 ? (
          <div className="loading-state">Loading emails...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : emails.length === 0 ? (
          <div className="empty-state">No emails found</div>
        ) : (
          <table className="email-table">
            <tbody>
              {filteredEmails.map((email, index) => {
                const headers = email.payload.headers;
                const subject = headers.find(h => h.name === "Subject")?.value || "No Subject";
                const from = headers.find(h => h.name === "From")?.value || "Unknown Sender";
                const to = headers.find(h => h.name === "To")?.value || "";
                const date = headers.find(h => h.name === "Date")?.value || "No Date";

                // Format the date
                const formattedDate = new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });

                // For sent emails, show recipient instead of sender
                const displayName = folder === "sent"
                  ? `To: ${to.split('<')[0].trim() || to}`
                  : (from.split('<')[0].trim() || from);

                const isSelected = selectedEmailContent && email.id === selectedEmailContent.id;

                return (
                  <tr 
                    key={`${email.id}-${index}`}
                    className={`email-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => fetchFullEmail(email.id)}
                  >
                    <td className="checkbox-cell">
                      <div className="checkbox" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" />
                      </div>
                    </td>
                    <td className="star-cell">
                      <button 
                        className={`star-button ${email.starred ? 'starred' : ''}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle star logic would go here
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </button>
                    </td>
                    <td className="sender-cell">
                      <span className="sender-name">
                        {displayName}
                      </span>
                    </td>
                    <td className="content-cell">
                      <div className="email-content">
                        <span className="subject">{subject}</span>
                        <span className="snippet">{email.snippet}</span>
                      </div>
                    </td>
                    <td className="date-cell">
                      <span className="date">{formattedDate}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {nextPageToken && (
          <div className="load-more">
            <button
              onClick={loadMoreEmails}
              className="load-more-button"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Email Modal - functionality unchanged */}
      {modalOpen && selectedEmailContent && (
        <div className="email-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>×</button>
            {loadingEmail ? (
              <div className="modal-loading">Loading email...</div>
            ) : selectedEmailContent ? (
              <div className="modal-email-content">
                <h2 className="modal-subject">{selectedEmailContent.subject}</h2>
                <div className="modal-sender">
                  <div className="sender-avatar">
                    {folder === "sent"
                      ? (selectedEmailContent.to?.charAt(0) || "T").toUpperCase()
                      : selectedEmailContent.from.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="sender-info">
                    {folder === "sent" ? (
                      <div className="sender-name">To: <span>{selectedEmailContent.to}</span></div>
                    ) : (
                      <div className="sender-name">From: <span>{selectedEmailContent.from}</span></div>
                    )}
                    <div className="sender-date">
                      {new Date(selectedEmailContent.date).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="view-full-message">Click "View Full Email" to see the complete message</p>
              </div>
            ) : (
              <div className="modal-error">Failed to load email</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;

