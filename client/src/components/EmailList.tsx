import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { EmailContent } from "./EmailDetail";

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
}

const EmailList = ({ folder, onSelectEmail, onError }: EmailListProps) => {
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
        setLoading(true);
        setError(null);
        
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
      } catch (error) {
        console.error("Error fetching emails:", error);
        const errorMsg = error instanceof Error ? error.message : "Failed to load emails";
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

  if (loading && emails.length === 0) return <div className="p-4">Loading emails...</div>;
  if (error && emails.length === 0) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="h-full">

      <div className="flex h-full">
        {/* Email List Panel */}
        <div className="w-full overflow-hidden flex flex-col h-full">
          {/* Email list header */}
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <h1 className="font-semibold text-gray-700 uppercase text-sm">
              {folder === "inbox" ? "Inbox" : "Sent"}
            </h1>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-auto flex-grow p-2">
            <ul className="space-y-2">
            {emails.map((email, index) => {
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
                ? (to.split('<')[0].trim() || to)
                : (from.split('<')[0].trim() || from);

              return (
                <li
                  key={`${email.id}-${index}`}
                  className={`border-b py-2 px-3 hover:bg-gray-100 cursor-pointer ${
                    selectedEmailContent && email.id === selectedEmailContent.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => fetchFullEmail(email.id)}>
                  <div className="flex items-start">
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm truncate max-w-[200px] inline-block">
                          {folder === "sent" ? `To: ${displayName}` : displayName}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formattedDate}</span>
                      </div>
                      <div className="text-sm font-medium truncate">{subject}</div>
                      <p className="text-xs text-gray-500 truncate">{email.snippet}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {nextPageToken && (
            <div className="text-center mt-4">
              <button
                onClick={loadMoreEmails}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Emails"}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* For mobile, we'll use the onSelectEmail prop instead of showing a modal */}
      {modalOpen && selectedEmailContent && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
          <div className="p-2 border-b flex justify-between items-center">
            <button
              onClick={() => {
                closeModal();
                // This will trigger navigation to the detail view if onSelectEmail is provided
                if (onSelectEmail) {
                  onSelectEmail(selectedEmailContent);
                }
              }}
              className="p-2 text-gray-500 flex items-center">
              <span>View Full Email</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={closeModal}
              className="p-2 text-gray-500">
              Close
            </button>
          </div>

          {loadingEmail ? (
            <div className="flex-grow flex justify-center items-center">
              <p>Loading email...</p>
            </div>
          ) : selectedEmailContent ? (
            <div className="flex-grow overflow-auto p-4">
              <h1 className="text-xl font-bold mb-3">{selectedEmailContent.subject}</h1>
              <p className="text-gray-500 mb-4">Click "View Full Email" to see the complete message</p>

              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-3">
                  {folder === "sent"
                    ? (selectedEmailContent.to?.charAt(0) || "T").toUpperCase()
                    : selectedEmailContent.from.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  {folder === "sent" ? (
                    <div className="font-medium">To: <span>{selectedEmailContent.to}</span></div>
                  ) : (
                    <div className="font-medium">From: <span>{selectedEmailContent.from}</span></div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(selectedEmailContent.date).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex justify-center items-center">
              <p className="text-red-500">Failed to load email</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailList;

