import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmailAnalytics } from '../../services/analyticsService';
import type { EmailAnalytics } from '../../services/analyticsService';
import AnalyticsSummary from './AnalyticsSummary';
import MessageVolumeChart from './MessageVolumeChart';

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
        <AnalyticsSummary analytics={{
          totalMessagesReceived: 0,
          messagesSent: 0,
          pendingMessages: 0,
          responseTimeAverage: 0,
          messageVolumeOverTime: { weeks: [], received: [], sent: [] },
          responseRateDistribution: { replied: 0, pending: 0, ignored: 0 },
          topCommunicationChannels: { email: 0, sms: 0, inApp: 0 }
        }} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Messages Received */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-gray-800 font-medium mb-2">Total Messages Received</h3>
          <div>
            <span className="text-5xl font-bold text-purple-600">150</span>
            <span className="text-sm text-gray-500 ml-2">this month</span>
          </div>
        </div>

        {/* Messages Sent */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-gray-800 font-medium mb-2">Messages Sent</h3>
          <div>
            <span className="text-5xl font-bold text-purple-600">243</span>
          </div>
        </div>

        {/* Pending Messages */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-gray-800 font-medium mb-2">Pending Messages</h3>
          <div>
            <span className="text-5xl font-bold text-purple-600">6</span>
            <div className="text-sm text-gray-500 mt-1">scheduled or awaiting reply</div>
          </div>
        </div>

        {/* Response Time Average */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-gray-800 font-medium mb-2">Response Time Average</h3>
          <div>
            <span className="text-5xl font-bold text-purple-600">2.5</span>
            <span className="text-2xl font-bold text-purple-600 ml-2">hrs</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">average reply time</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Insights and Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Message Volume Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-400 mb-4 text-center">Message Volume Over Time</h3>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Messages Sent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-sm text-gray-600">Messages Received</span>
            </div>
          </div>
          
          <div className="h-64">
            <MessageVolumeChart 
              data={{
                weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
                sent: [20, 40, 60, 30],
                received: [10, 30, 70, 50]
              }} 
            />
          </div>
        </div>

        {/* Response Rate Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-400 mb-4 text-center">Response Rate Distribution</h3>
          
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <svg viewBox="0 0 100 100">
                {/* Blue section (Replied) - 70.6% */}
                <path 
                  d="M 50 50 L 50 10 A 40 40 0 1 1 10 50 Z" 
                  fill="#5B67F0" 
                />
                
                {/* Yellow section (Pending) - 11.8% */}
                <path 
                  d="M 50 50 L 10 50 A 40 40 0 0 1 20 20 Z" 
                  fill="#F0D15B" 
                />
                
                {/* Red section (Ignored) - 17.6% */}
                <path 
                  d="M 50 50 L 20 20 A 40 40 0 0 1 50 10 Z" 
                  fill="#F05B5B" 
                />
                
                {/* Percentage labels */}
                <text x="65" y="65" textAnchor="middle" fill="#5B67F0" fontWeight="bold" fontSize="5">
                  70.6%
                </text>
                
                <text x="25" y="35" textAnchor="middle" fill="#F0D15B" fontWeight="bold" fontSize="5">
                  11.8%
                </text>
                
                <text x="35" y="20" textAnchor="middle" fill="#F05B5B" fontWeight="bold" fontSize="5">
                  17.6%
                </text>
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Replied</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Ignored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
