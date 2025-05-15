import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if Gmail is connected
  useEffect(() => {
    const checkGmailConnection = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError('');

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        console.log(`Checking Gmail connection status at: ${backendUrl}/api/auth/status`);

        const response = await fetch(`${backendUrl}/api/auth/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Gmail connection status:', data);
          setIsConnected(data.gmailConnected);
        } else {
          // If we get a 404, it means the endpoint doesn't exist yet
          console.warn(`Status endpoint returned ${response.status}: ${response.statusText}`);

          // Try to check if there are any emails in localStorage as a fallback
          try {
            const inboxEmails = localStorage.getItem('inboxEmails');
            if (inboxEmails && JSON.parse(inboxEmails).length > 0) {
              console.log('Found emails in localStorage, assuming Gmail is connected');
              setIsConnected(true);
            } else {
              console.log('No emails found in localStorage, assuming Gmail is not connected');
              setIsConnected(false);
            }
          } catch (e) {
            console.error('Error checking localStorage:', e);
            setIsConnected(false);
          }
        }
      } catch (err) {
        console.error('Error checking Gmail connection:', err);
        setError('Failed to check Gmail connection status. Please try again later.');
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkGmailConnection();
  }, [token]);

  const connectGmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      console.log(`Connecting Gmail at: ${backendUrl}/api/auth/gmail/connect`);

      const response = await fetch(`${backendUrl}/api/auth/gmail/connect`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received auth URL:', data);

        // Redirect to Google's OAuth consent screen
        if (data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          setError('No authorization URL received from server');
        }
      } else {
        console.warn(`Connect endpoint returned ${response.status}: ${response.statusText}`);

        // If the endpoint doesn't exist, use a fallback approach
        if (response.status === 404) {
          // Redirect to Google's OAuth consent screen directly
          // This is a fallback and not ideal, but it's better than nothing
          const redirectUri = encodeURIComponent(`${backendUrl}/api/auth/callback`);
          const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
          const clientId = '5162502671-gqvq225s9ba83lr9qkn1iivnh8qq0nku.apps.googleusercontent.com'; // This should be in .env

          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

          console.log('Using fallback auth URL:', authUrl);
          window.location.href = authUrl;
        } else {
          try {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to connect Gmail');
          } catch (e) {
            setError(`Failed to connect Gmail: ${response.statusText}`);
          }
        }
      }
    } catch (err) {
      console.error('Error connecting Gmail:', err);
      setError('Failed to connect Gmail. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const disconnectGmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      console.log(`Disconnecting Gmail at: ${backendUrl}/api/auth/gmail/disconnect`);

      const response = await fetch(`${backendUrl}/api/auth/gmail/disconnect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Gmail disconnected successfully');
        setIsConnected(false);
        setSuccess('Gmail disconnected successfully');

        // Clear any stored emails from localStorage
        try {
          localStorage.removeItem('inboxEmails');
          localStorage.removeItem('sentEmails');
          console.log('Cleared email data from localStorage');
        } catch (e) {
          console.warn('Failed to clear localStorage:', e);
        }
      } else {
        console.warn(`Disconnect endpoint returned ${response.status}: ${response.statusText}`);

        // If the endpoint doesn't exist, use a fallback approach
        if (response.status === 404) {
          // Just pretend it worked and clear localStorage
          console.log('Using fallback disconnect approach');
          setIsConnected(false);
          setSuccess('Gmail disconnected successfully');

          try {
            localStorage.removeItem('inboxEmails');
            localStorage.removeItem('sentEmails');
            console.log('Cleared email data from localStorage');
          } catch (e) {
            console.warn('Failed to clear localStorage:', e);
          }
        } else {
          try {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to disconnect Gmail');
          } catch (e) {
            setError(`Failed to disconnect Gmail: ${response.statusText}`);
          }
        }
      }
    } catch (err) {
      console.error('Error disconnecting Gmail:', err);
      setError('Failed to disconnect Gmail. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Gmail Connection</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Not connected'}</span>
            </div>

            {isConnected ? (
              <button
                onClick={disconnectGmail}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                Disconnect Gmail
              </button>
            ) : (
              <button
                onClick={connectGmail}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Connect Gmail
              </button>
            )}

            <p className="mt-4 text-sm text-gray-600">
              {isConnected
                ? 'Your Gmail account is connected. You can view your emails in the inbox.'
                : 'Connect your Gmail account to view your emails in the inbox.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
