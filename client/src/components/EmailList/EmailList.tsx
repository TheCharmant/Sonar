import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { EmailContent } from "../EmailDetail/EmailDetail";

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
        // Get the backend URL from environment variables, with a fallback
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        console.log('Using backend URL:', backendUrl);

        const url = new URL(`${backendUrl}/api/email/labels`);

        console.log(`Fetching labels from ${url.toString()}`);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error fetching labels:", errorData);

          // Don't throw an error for "No tokens found" as we'll handle it in the email fetch
          if (errorData.error !== "No tokens found") {
            throw new Error(errorData.error || "Failed to load labels");
          }
          return;
        }

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
<<<<<<< HEAD:client/src/components/EmailList.tsx
<<<<<<< HEAD
        // Get the backend URL from environment variables, with a fallback
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

        const url = new URL(`${backendUrl}/api/email/fetch`);
=======
        setLoading(true);
        setError(null);
        
=======
>>>>>>> 2cf35c51c88c70b47be69f35d6637dec0954b75d:client/src/components/EmailList/EmailList.tsx
        const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch`);
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617
        url.searchParams.set("folder", folder.toUpperCase());

        // Add label parameter if selected
        const selectedLabel = new URLSearchParams(window.location.search).get('label');

        if (selectedLabel) {
          url.searchParams.set("label", selectedLabel);
        }

        console.log(`Fetching emails from ${url.toString()}`);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

<<<<<<< HEAD
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error:", errorData);

          // Check if this is a "No tokens found" error
          if (errorData.error === "No tokens found") {
            setError("Gmail account not connected. Please connect your Gmail account in settings.");
          }
          // Check if this is an "Error processing emails" error
          else if (errorData.error === "Error processing emails" || errorData.error === "Error fetching emails") {
            // Use the detailed message if available
            const detailedMessage = errorData.message || "There was a problem processing your emails";
            console.error("Detailed error message:", detailedMessage);

            // Check if the error is related to authentication or token issues
            if (detailedMessage.includes("auth") ||
                detailedMessage.includes("token") ||
                detailedMessage.includes("credentials") ||
                detailedMessage.includes("unauthorized") ||
                detailedMessage.includes("permission")) {
              setError("There was a problem with your Gmail authentication. Please reconnect your Gmail account in settings.");
            } else {
              setError("There was a problem processing your emails. This could be due to an expired or invalid token. Please reconnect your Gmail account in settings.");
            }
          }
          else {
            throw new Error(errorData.error || "Failed to load emails");
          }
          return;
        }
=======
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
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617

        const data: EmailResponse = await res.json();

        // Store emails in localStorage for analytics to use
        try {
          localStorage.setItem(`${folder}Emails`, JSON.stringify(data.emails));
          console.log(`Stored ${data.emails.length} emails in localStorage for ${folder} folder`);
        } catch (storageError) {
          console.warn('Failed to store emails in localStorage:', storageError);
        }

        setEmails(data.emails);
        setNextPageToken(data.nextPageToken || null);
<<<<<<< HEAD:client/src/components/EmailList.tsx
<<<<<<< HEAD
      } catch (err) {
        console.error("Error fetching emails:", err);
        setError(err instanceof Error ? err.message : "Failed to load emails");
=======
      } catch (error) {
        console.error("Error fetching emails:", error);
        const errorMsg = error instanceof Error ? error.message : "Failed to load emails";
=======
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load emails";
>>>>>>> 2cf35c51c88c70b47be69f35d6637dec0954b75d:client/src/components/EmailList/EmailList.tsx
        setError(errorMsg);
        if (onError) onError(errorMsg);
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617
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
      // Get the backend URL from environment variables, with a fallback
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const url = new URL(`${backendUrl}/api/email/fetch`);
      url.searchParams.set("folder", folder);
      url.searchParams.set("pageToken", nextPageToken);

      console.log(`Loading more emails from ${url.toString()}`);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

<<<<<<< HEAD
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error loading more emails:", errorData);

        // Check if this is a "No tokens found" error
        if (errorData.error === "No tokens found") {
          setError("Gmail account not connected. Please connect your Gmail account in settings.");
          return;
        }
        // Check if this is an "Error processing emails" error
        else if (errorData.error === "Error processing emails" || errorData.error === "Error fetching emails") {
          // Use the detailed message if available
          const detailedMessage = errorData.message || "There was a problem processing your emails";
          console.error("Detailed error message:", detailedMessage);

          // Check if the error is related to authentication or token issues
          if (detailedMessage.includes("auth") ||
              detailedMessage.includes("token") ||
              detailedMessage.includes("credentials") ||
              detailedMessage.includes("unauthorized") ||
              detailedMessage.includes("permission")) {
            setError("There was a problem with your Gmail authentication. Please reconnect your Gmail account in settings.");
          } else {
            setError("There was a problem processing your emails. This could be due to an expired or invalid token. Please reconnect your Gmail account in settings.");
          }
          return;
        }

=======
      if (res.status === 401 || res.status === 403) {
        const errorMsg = "Your session has expired. Please log in again.";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617
        throw new Error(errorData.error || "Failed to load more emails");
      }

      const data: EmailResponse = await res.json();

      // Update emails state
      const updatedEmails = [...emails, ...data.emails];
      setEmails(updatedEmails);

      // Store updated emails in localStorage for analytics to use
      try {
        localStorage.setItem(`${folder}Emails`, JSON.stringify(updatedEmails));
        console.log(`Updated localStorage with ${updatedEmails.length} emails for ${folder} folder`);
      } catch (storageError) {
        console.warn('Failed to update emails in localStorage:', storageError);
      }

      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
<<<<<<< HEAD
      console.error("Error loading more emails:", err);
      setError(err instanceof Error ? err.message : "Failed to load more emails");
=======
      const errorMsg = err instanceof Error ? err.message : "Failed to load more emails";
      setError(errorMsg);
      if (onError) onError(errorMsg);
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617
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

      // Get the backend URL from environment variables, with a fallback
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const url = `${backendUrl}/api/email/detail?id=${messageId}`;
      console.log(`Fetching email detail from ${url}`);

      const res = await fetch(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );

<<<<<<< HEAD
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error fetching email detail:", errorData);

        // Check if this is a "No tokens found" error
        if (errorData.error === "No tokens found") {
          throw new Error("Gmail account not connected. Please connect your Gmail account in settings.");
        }
        // Check if this is an error with a detailed message
        else if (errorData.message) {
          console.error("Detailed error message:", errorData.message);

          // Check if the error is related to authentication or token issues
          if (errorData.message.includes("auth") ||
              errorData.message.includes("token") ||
              errorData.message.includes("credentials") ||
              errorData.message.includes("unauthorized") ||
              errorData.message.includes("permission")) {
            throw new Error("There was a problem with your Gmail authentication. Please reconnect your Gmail account in settings.");
          }
        }

=======
      if (res.status === 401 || res.status === 403) {
        const errorMsg = "Your session has expired. Please log in again.";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
>>>>>>> c8f6452b3e36cb399db6d68438137550c9519617
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

  if (error && emails.length === 0) {
    // Check if this is a "Gmail account not connected" error or token issue
    if (error.includes("Gmail account not connected") || error.includes("reconnect your Gmail account")) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Gmail Account Not Connected</h2>
          <p className="text-gray-600 mb-4">You need to connect your Gmail account to view your emails.</p>
          <a href="/settings" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Go to Settings
          </a>
        </div>
      );
    }

    // For server errors
    if (error.includes("500") || error.includes("Server Error")) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Server Error</h2>
          <p className="text-gray-600 mb-4">There was a problem connecting to the server. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // Generic error
    return (
      <div className="p-8 text-center">
        <div className="mb-4 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Error Loading Emails</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

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

