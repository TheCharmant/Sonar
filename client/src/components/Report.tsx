import { useEffect, useState } from "react";
import axios from "axios";

type EmailReport = {
  senderStats: Record<string, number>;
  subjectStats: Record<string, number>;
  totalEmails: number;
  estimatedTotalSizeKB: number;
  recentEmails: {
    subject: string;
    from: string;
    date: string;
  }[];
};

type InsightsProps = {
  token: string;
  folder: "INBOX" | "SENT";
};

const EmailInsights = ({ token, folder }: InsightsProps) => {
  const [report, setReport] = useState<EmailReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get<{ report: EmailReport }>(
          `/api/email/report?folder=${folder}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReport(response.data.report);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || error.message);
        } else {
          setError("Unknown error occurred.");
        }
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [folder, token]);

  if (loading) return <div className="p-4">Loading insights...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!report) return <div className="p-4 text-red-600">No report data available.</div>;

  return (
    <div className="p-4 space-y-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold">📊 Email Insights ({folder})</h2>
  
      <div>Total Emails: <strong>{report.totalEmails}</strong></div>
      <div>
        Estimated Size:{" "}
        <strong>
          {report.estimatedTotalSizeKB != null 
            ? report.estimatedTotalSizeKB.toFixed(1) 
            : "N/A"}{" "}
          KB
        </strong>
      </div>
  
      <div>
        <h3 className="mt-4 font-semibold">Top Senders:</h3>
        <ul className="list-disc ml-5">
          {Object.entries(report.senderStats).slice(0, 5).map(([sender, count]) => (
            <li key={sender}>{sender}: {count}</li>
          ))}
        </ul>
      </div>
  
      <div>
        <h3 className="mt-4 font-semibold">Top Subjects:</h3>
        <ul className="list-disc ml-5">
          {Object.entries(report.subjectStats).slice(0, 5).map(([subject, count]) => (
            <li key={subject}>{subject}: {count}</li>
          ))}
        </ul>
      </div>
  
      <div>
        <h3 className="mt-4 font-semibold">Recent Emails:</h3>
        <ul className="list-disc ml-5">
          {report.recentEmails.map((email, idx) => (
            <li key={idx}>
              <strong>{email.subject}</strong> from {email.from} on{" "}
              {new Date(email.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );  
};

export default EmailInsights;
