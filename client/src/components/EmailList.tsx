import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

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
}

interface EmailResponse {
  emails: Email[];
  nextPageToken?: string;
}

interface EmailContent {
  subject: string;
  from: string;
  body: string;
}

const EmailList = ({ folder }: { folder: "inbox" | "sent" }) => {
  const { token } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmailContent, setSelectedEmailContent] = useState<EmailContent | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchEmails();
  }, [token, folder]);

  const fetchEmails = async (pageToken: string | null = null) => {
    setLoading(true);
    setError("");

    try {
      const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch`);
      url.searchParams.set("folder", folder);
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch emails");
      }

      const data: EmailResponse = await res.json();
      setEmails((prev) => [...prev, ...data.emails]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullEmail = async (messageId: string) => {
    try {
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
      const subjectHeader = message.payload.headers.find((h: any) => h.name === "Subject");
      const fromHeader = message.payload.headers.find((h: any) => h.name === "From");

      setSelectedEmailContent({
        subject: subjectHeader?.value || "No Subject",
        from: fromHeader?.value || "Unknown Sender",
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

  if (loading && emails.length === 0) return <p className="p-4">Loading emails...</p>;
  if (error && emails.length === 0) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 space-y-4">
      <ul className="space-y-4">
        {emails.map((email, index) => {
          const headers = email.payload.headers;
          const subjectHeader = headers.find((h) => h.name === "Subject");
          const fromHeader = headers.find((h) => h.name === "From");
          const uniqueKey = `${email.id}-${folder}-${index}`;

          return (
            <li key={uniqueKey} className="border rounded p-3 shadow">
              <h2 className="text-lg font-semibold">{subjectHeader?.value || "No Subject"}</h2>
              <p className="text-sm text-gray-600">{fromHeader?.value || "Unknown Sender"}</p>
              <p className="text-gray-700 mt-2">{email.snippet}</p>
              <button
                onClick={() => fetchFullEmail(email.id)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Expand
              </button>
            </li>
          );
        })}
      </ul>

      {nextPageToken && (
        <div className="text-center">
          <button
            onClick={() => fetchEmails(nextPageToken)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedEmailContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedEmailContent.subject}</h2>
            <p className="text-sm text-gray-500 mb-4">From: {selectedEmailContent.from}</p>
            <div className="whitespace-pre-wrap text-gray-800 max-h-[60vh] overflow-y-auto">
              {selectedEmailContent.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;
