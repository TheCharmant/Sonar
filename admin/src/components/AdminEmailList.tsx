import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import EmailDetail from "./AdminEmailDetail";
// Types
interface EmailHeader {
  name: string;
  value: string;
}

interface EmailPayload {
  headers: EmailHeader[];
}

interface Email {
  id: string;
  snippet: string;
  payload: EmailPayload;
  isUnread: boolean;
  labels: {
    id: string;
    name: string;
  }[];
  // Add new fields for communication type
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

interface UserEmails {
  uid: string;
  inbox: Email[];
  sent: Email[];
}

interface EmailContent {
  id: string;
  subject: string;
  from: string;
  date: string;
  to?: string;
  cc?: string;
  bcc?: string;
  body: string;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  // Add other env vars as needed
}


const AdminEmailList = () => {
  const { token } = useAuth();
  const [userEmails, setUserEmails] = useState<UserEmails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmailContent, setSelectedEmailContent] = useState<EmailContent | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetchAllEmails();
  }, [token]);

  const fetchAllEmails = async () => {
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
        throw new Error(data.error || "Failed to fetch all emails");
      }

      const data = await res.json();
      setUserEmails(data.users);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullEmail = async (messageId: string, email: any) => {
    try {
      // Store the selected email for category reference
      setSelectedEmail(email);
      
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/email/detail?id=${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch full email");
      }

      const { email: message } = await res.json();
      
      // Extract all required headers
      const subjectHeader = message.payload.headers.find((h: any) => h.name === "Subject");
      const fromHeader = message.payload.headers.find((h: any) => h.name === "From");
      const dateHeader = message.payload.headers.find((h: any) => h.name === "Date");
      const toHeader = message.payload.headers.find((h: any) => h.name === "To");
      const ccHeader = message.payload.headers.find((h: any) => h.name === "Cc");
      const bccHeader = message.payload.headers.find((h: any) => h.name === "Bcc");

      setSelectedEmailContent({
        id: message.id,
        subject: subjectHeader?.value || "No Subject",
        from: fromHeader?.value || "Unknown Sender",
        date: dateHeader?.value || new Date().toISOString(),
        to: toHeader?.value || "",
        cc: ccHeader?.value || "",
        bcc: bccHeader?.value || "",
        body: message.body || "No content",
      });

      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching full email:", err);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmailContent(null);
  };

  if (loading) return <p className="p-4">Loading all emails...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Flatten all emails into a single array with additional metadata
  const allEmails = userEmails.flatMap(user => [
    ...user.inbox.map(email => ({
      ...email,
      userId: user.uid,
      category: "INBOX"
    })),
    ...user.sent.map(email => ({
      ...email,
      userId: user.uid,
      category: "SENT"
    }))
  ]);

  // Add a function to extract email subject for the modal title
  const getEmailSubject = (email: any): string => {
    const subjectHeader = email.payload.headers.find((h: any) => h.name === "Subject");
    return subjectHeader?.value || "No Subject";
  };

  // Add utility functions for date formatting and email categorization
  const formatDateToUTC = (dateStr: string): string => {
    if (!dateStr) return 'No date';
    try {
      const date = new Date(dateStr);
      return date.toISOString(); // ISO format includes date and time with seconds in UTC
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'No date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      console.error("Error formatting display date:", e);
      return dateStr;
    }
  };

  const getCommunicationType = (email: any): string => {
    // Check for reply indicators in headers
    const references = email.payload.headers.find(h => h.name === "References")?.value;
    const inReplyTo = email.payload.headers.find(h => h.name === "In-Reply-To")?.value;
    
    if (inReplyTo || references) {
      return "Reply";
    }
    
    // Check if it's a forward (common subject prefixes)
    const subject = email.payload.headers.find(h => h.name === "Subject")?.value || "";
    if (subject.toLowerCase().startsWith("fw:") || subject.toLowerCase().startsWith("fwd:")) {
      return "Forward";
    }
    
    return "Original";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All User Emails (Admin View)</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local Time</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labels</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allEmails.map((email, index) => {
              const dateHeader = email.payload.headers.find(h => h.name === "Date")?.value;
              const utcTimestamp = formatDateToUTC(dateHeader);
              const localTime = formatDisplayDate(dateHeader);
              const communicationType = getCommunicationType(email);
              
              // Determine email direction (incoming/outgoing)
              const direction = email.category === "SENT" ? "Outgoing" : "Incoming";
              
              return (
                <tr key={`${email.userId}-${email.category}-${email.id}-${index}`} 
                    className={`hover:bg-gray-50 ${email.isUnread ? 'font-semibold' : ''}`}>
                  <td className="py-3 px-4 text-xs font-mono text-gray-500">{utcTimestamp}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{localTime}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{email.userId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      direction === "Outgoing" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {direction}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {communicationType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {email.labels?.map(label => {
                        // Customize label colors based on type
                        let colorClass = "bg-blue-100 text-blue-800";
                        
                        if (label.name === "IMPORTANT") {
                          colorClass = "bg-red-100 text-red-800";
                        } else if (label.name === "STARRED") {
                          colorClass = "bg-yellow-100 text-yellow-800";
                        } else if (label.name === "UNREAD") {
                          colorClass = "bg-gray-100 text-gray-800";
                        } else if (label.name === "SPAM") {
                          colorClass = "bg-orange-100 text-orange-800";
                        }
                        
                        return (
                          <span 
                            key={label.id} 
                            className={`px-2 py-1 text-xs rounded-full ${colorClass}`}
                            title={label.id}
                          >
                            {label.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => fetchFullEmail(email.id, email)}
                      className="text-left hover:underline text-sm text-gray-700 group flex items-center"
                    >
                      <span className="truncate max-w-md">{email.snippet}</span>
                      <span className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Improved Email modal */}
      {modalOpen && selectedEmailContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modern Email Header */}
            <div className="p-6 border-b border-gray-200">
              {/* Subject and Close Button */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 pr-8">
                  {selectedEmailContent.subject}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Sender Info with Avatar */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                    {selectedEmail?.category === "SENT" 
                      ? (selectedEmailContent.to?.split('<')[0].trim().charAt(0) || "R")
                      : (selectedEmailContent.from?.split('<')[0].trim().charAt(0) || "S")}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedEmail?.category === "SENT" 
                        ? selectedEmailContent.to?.split('<')[0].trim() || "Recipient"
                        : selectedEmailContent.from?.split('<')[0].trim() || "Sender"}
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
                      {selectedEmail?.category === "SENT"
                        ? (selectedEmailContent.to?.match(/<(.+)>/) ? selectedEmailContent.to.match(/<(.+)>/)[1] : "")
                        : (selectedEmailContent.from?.match(/<(.+)>/) ? selectedEmailContent.from.match(/<(.+)>/)[1] : "")}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
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
              
              {/* Recipients Info */}
              <div className="text-sm text-gray-600 space-y-1">
                {selectedEmail?.category === "INBOX" && selectedEmailContent.to && (
                  <div className="flex">
                    <span className="font-medium w-8">To:</span>
                    <span className="flex-1">{selectedEmailContent.to}</span>
                  </div>
                )}
                
                {selectedEmail?.category === "SENT" && selectedEmailContent.from && (
                  <div className="flex">
                    <span className="font-medium w-8">From:</span>
                    <span className="flex-1">{selectedEmailContent.from}</span>
                  </div>
                )}
                
                {selectedEmailContent.cc && (
                  <div className="flex">
                    <span className="font-medium w-8">Cc:</span>
                    <span className="flex-1">{selectedEmailContent.cc}</span>
                  </div>
                )}
                
                {selectedEmailContent.bcc && (
                  <div className="flex">
                    <span className="font-medium w-8">Bcc:</span>
                    <span className="flex-1">{selectedEmailContent.bcc}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Email Content */}
            <div className="flex-grow overflow-auto">
              <EmailDetail 
                emailContent={selectedEmailContent}
                folder={selectedEmail?.category === "SENT" ? "sent" : "inbox"}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailList;
