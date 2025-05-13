import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmailAnalytics } from '../../services/analyticsService';
import type { EmailAnalytics } from '../../services/analyticsService';

// Helper function to get the current month name
const getCurrentMonthName = (): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[new Date().getMonth()];
};

// Direct import of the fetch function to get emails
const fetchEmails = async (token: string, folder: 'inbox' | 'sent'): Promise<any[]> => {
  try {
    console.log(`Directly fetching ${folder} emails for analytics`);

    // Use the backend API to fetch emails
    const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch`);
    url.searchParams.set("folder", folder.toUpperCase());

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`Failed to fetch ${folder} emails: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();

    if (!data.emails || !Array.isArray(data.emails)) {
      console.log(`No ${folder} emails found`);
      return [];
    }

    console.log(`Successfully fetched ${data.emails.length} ${folder} emails`);

    // Store in localStorage for future use
    try {
      localStorage.setItem(`${folder}Emails`, JSON.stringify(data.emails));
    } catch (e) {
      console.warn(`Failed to store ${folder} emails in localStorage:`, e);
    }

    return data.emails;
  } catch (error) {
    console.error(`Error fetching ${folder} emails:`, error);
    return [];
  }
};

const AnalyticsDashboard: React.FC = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);

  // First, fetch the emails directly
  useEffect(() => {
    const fetchAllEmails = async () => {
      if (!token) return;

      setLoading(true);

      try {
        // Try to get emails from localStorage first
        let inbox: any[] = [];
        let sent: any[] = [];

        try {
          const storedInbox = localStorage.getItem('inboxEmails');
          if (storedInbox) {
            inbox = JSON.parse(storedInbox);
            console.log(`Found ${inbox.length} inbox emails in localStorage`);
          }

          const storedSent = localStorage.getItem('sentEmails');
          if (storedSent) {
            sent = JSON.parse(storedSent);
            console.log(`Found ${sent.length} sent emails in localStorage`);
          }
        } catch (e) {
          console.warn('Error reading from localStorage:', e);
        }

        // If we don't have emails in localStorage, fetch them directly
        if (inbox.length === 0) {
          console.log('Fetching inbox emails directly');
          inbox = await fetchEmails(token, 'inbox');
        }

        if (sent.length === 0) {
          console.log('Fetching sent emails directly');
          sent = await fetchEmails(token, 'sent');
        }

        setInboxEmails(inbox);
        setSentEmails(sent);

        console.log(`Analytics has ${inbox.length} inbox emails and ${sent.length} sent emails`);
      } catch (err) {
        console.error('Error fetching emails for analytics:', err);
        setError('Failed to load email data');
      }
    };

    fetchAllEmails();
  }, [token]);

  // Then, calculate analytics once we have the emails
  useEffect(() => {
    const calculateAnalytics = async () => {
      if (!token) return;

      try {
        // Only proceed if we have emails or we've tried to fetch them
        if (loading) return;

        console.log('Calculating analytics from fetched emails');
        console.log(`Raw inbox email count: ${inboxEmails.length}`);
        console.log(`Raw sent email count: ${sentEmails.length}`);

        // Log the first few emails for debugging
        if (inboxEmails.length > 0) {
          console.log('First inbox email:', {
            id: inboxEmails[0].id,
            snippet: inboxEmails[0].snippet,
            headers: inboxEmails[0].payload?.headers || []
          });
        }

        if (sentEmails.length > 0) {
          console.log('First sent email:', {
            id: sentEmails[0].id,
            snippet: sentEmails[0].snippet,
            headers: sentEmails[0].payload?.headers || []
          });
        }

        // Calculate simple counts directly here for comparison
        const inboxCount = inboxEmails.length;
        const sentCount = sentEmails.length;

        // Pass the emails we've already fetched to the analytics service
        const data = await getEmailAnalytics(token, inboxEmails, sentEmails);

        // Log the comparison between raw counts and analytics
        console.log('Raw counts vs Analytics:');
        console.log(`Inbox: ${inboxCount} vs Analytics received: ${data.totalMessagesReceived}`);
        console.log(`Sent: ${sentCount} vs Analytics sent: ${data.messagesSent}`);

        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Error calculating analytics:', err);
        setError('Failed to calculate analytics data');
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
  }, [token, inboxEmails, sentEmails, loading]);

  if (loading) {
    return <div className="p-4">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!analytics) {
    return <div className="p-4">No analytics data available</div>;
  }

  // Check if we have any data
  const hasData = analytics.totalMessagesReceived > 0 || analytics.messagesSent > 0;

  if (!hasData) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
          <h3 className="text-lg font-medium text-yellow-700">No Email Data Available</h3>
          <p className="text-yellow-600 mt-2">
            We couldn't find any emails in your account. The analytics dashboard will display metrics once you have emails in your inbox or sent folder.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Total Inbox Messages</h3>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-purple-600">0</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              All messages in your inbox
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Total Sent Messages</h3>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-purple-600">0</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              All messages in your sent folder
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Pending Messages</h3>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-purple-600">0</span>
              <span className="ml-2 text-sm text-gray-500">scheduled or awaiting reply</span>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Response Time Average</h3>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-purple-600">0</span>
              <span className="ml-2 text-sm text-gray-500">hrs</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">average reply time</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Messages Received */}
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Inbox Messages</h3>
          <div className="flex items-end mt-2">
            <span className="text-3xl font-bold text-purple-600">{analytics.totalMessagesReceived}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            All messages in your inbox
          </div>
        </div>

        {/* Messages Sent */}
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Sent Messages</h3>
          <div className="flex items-end mt-2">
            <span className="text-3xl font-bold text-purple-600">{analytics.messagesSent}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            All messages in your sent folder
          </div>
        </div>

        {/* Pending Messages */}
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Pending Messages</h3>
          <div className="flex items-end mt-2">
            <span className="text-3xl font-bold text-purple-600">{analytics.pendingMessages}</span>
            <span className="ml-2 text-sm text-gray-500">scheduled or awaiting reply</span>
          </div>
        </div>

        {/* Response Time Average */}
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Response Time Average</h3>
          <div className="flex items-end mt-2">
            <span className="text-3xl font-bold text-purple-600">{analytics.responseTimeAverage}</span>
            <span className="ml-2 text-sm text-gray-500">hrs</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">average reply time</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Insights and Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Message Volume Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Message Volume Over Time</h3>

          {/* Legend */}
          <div className="flex items-center justify-center mb-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Messages Sent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-sm text-gray-600">Messages Received</span>
            </div>
          </div>

          {/* Simple line chart representation */}
          <div className="h-64 flex items-end justify-between">
            {analytics.messageVolumeOverTime.weeks.map((week, index) => (
              <div key={week} className="flex flex-col items-center w-1/4">
                <div className="relative h-48 w-full flex justify-center">
                  {/* Sent bar */}
                  <div
                    className="absolute bottom-0 w-6 bg-blue-500 rounded-t"
                    style={{
                      height: `${(analytics.messageVolumeOverTime.sent[index] /
                        Math.max(...analytics.messageVolumeOverTime.sent, ...analytics.messageVolumeOverTime.received)) * 100}%`
                    }}
                  ></div>

                  {/* Received dot */}
                  <div
                    className="absolute w-4 h-4 rounded-full bg-yellow-400"
                    style={{
                      bottom: `${(analytics.messageVolumeOverTime.received[index] /
                        Math.max(...analytics.messageVolumeOverTime.sent, ...analytics.messageVolumeOverTime.received)) * 100}%`,
                      left: 'calc(50% + 10px)'
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{week}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Rate Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Response Rate Distribution</h3>

          {/* Simple pie chart representation */}
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 rounded-full bg-blue-500 flex items-center justify-center relative">
              {/* Pending slice */}
              <div
                className="absolute inset-0 bg-yellow-400"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * analytics.responseRateDistribution.pending / 100)}% ${50 - 50 * Math.sin(2 * Math.PI * analytics.responseRateDistribution.pending / 100)}%, 50% 50%)`
                }}
              ></div>

              {/* Ignored slice */}
              <div
                className="absolute inset-0 bg-red-400"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * analytics.responseRateDistribution.pending / 100)}% ${50 - 50 * Math.sin(2 * Math.PI * analytics.responseRateDistribution.pending / 100)}%, ${50 + 50 * Math.cos(2 * Math.PI * (analytics.responseRateDistribution.pending + analytics.responseRateDistribution.ignored) / 100)}% ${50 - 50 * Math.sin(2 * Math.PI * (analytics.responseRateDistribution.pending + analytics.responseRateDistribution.ignored) / 100)}%, 50% 50%)`
                }}
              ></div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Replied ({analytics.responseRateDistribution.replied}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-sm text-gray-600">Pending ({analytics.responseRateDistribution.pending}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
              <span className="text-sm text-gray-600">Ignored ({analytics.responseRateDistribution.ignored}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Communication Channels */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Top Communication Channels</h3>

        <div className="flex justify-center space-x-12">
          {/* Email */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 bg-blue-500 rounded-t"
              style={{ height: `${analytics.topCommunicationChannels.email * 2}px` }}
            ></div>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Email</span>
            </div>
          </div>

          {/* SMS */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 bg-yellow-400 rounded-t"
              style={{ height: `${analytics.topCommunicationChannels.sms * 2}px` }}
            ></div>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-sm text-gray-600">SMS Channel</span>
            </div>
          </div>

          {/* In-App */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 bg-red-400 rounded-t"
              style={{ height: `${analytics.topCommunicationChannels.inApp * 2}px` }}
            ></div>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
              <span className="text-sm text-gray-600">In-App</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
