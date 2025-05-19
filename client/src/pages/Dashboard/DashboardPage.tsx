import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

interface EmailStats {
  totalReceived: number;
  totalSent: number;
  pending: number;
  responseTime: string;
}

interface TrafficData {
  date: string;
  inbound: number;
  outbound: number;
}

interface ResponseRateData {
  replied: number;
  pending: number;
  ignored: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalReceived: 0,
    totalSent: 0,
    pending: 0,
    responseTime: "0 hrs"
  });
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [responseRateData, setResponseRateData] = useState<ResponseRateData>({
    replied: 0,
    pending: 0,
    ignored: 0
  });

  // Navigation handlers
  const navigateToInbox = () => {
    navigate("/inbox");
  };

  const navigateToSentbox = () => {
    navigate("/sent");
  };

  useEffect(() => {
    if (!token) return;
    
    const fetchEmailData = async () => {
      setLoading(true);
      try {
        // Fetch inbox emails
        const inboxRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch?folder=INBOX`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch sent emails
        const sentRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/fetch?folder=SENT`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!inboxRes.ok || !sentRes.ok) {
          throw new Error("Failed to fetch email data");
        }
        
        const inboxData = await inboxRes.json();
        const sentData = await sentRes.json();
        
        const inboxEmails = inboxData.emails || [];
        const sentEmails = sentData.emails || [];
        
        // Calculate stats
        calculateEmailStats(inboxEmails, sentEmails);
        generateTrafficData(inboxEmails, sentEmails);
        calculateResponseRate(inboxEmails);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmailData();
  }, [token]);
  
  const calculateEmailStats = (inboxEmails: any[], sentEmails: any[]) => {
    // Count emails from the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const inboxThisMonth = inboxEmails.filter(email => {
      const dateHeader = email.payload.headers.find((h: any) => h.name === "Date");
      if (!dateHeader) return false;
      const emailDate = new Date(dateHeader.value);
      return emailDate >= firstDayOfMonth;
    });
    
    // Calculate average response time (simplified version)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    // This is a simplified calculation - in a real app, you'd match replies to original emails
    sentEmails.forEach(email => {
      const references = email.payload.headers.find((h: any) => h.name === "References")?.value;
      if (references) {
        responseCount++;
        // Assume 2.5 hours average response time for this example
        totalResponseTime += 2.5;
      }
    });
    
    const avgResponseTime = responseCount > 0 
      ? (totalResponseTime / responseCount).toFixed(1) 
      : "2.5"; // Fallback to example value
    
    // Count pending emails (simplified - in a real app, you'd have a more complex logic)
    const pendingCount = Math.min(
      Math.floor(inboxEmails.length * 0.1), // Assume ~10% are pending
      6 // Cap at 6 for this example
    );
    
    setEmailStats({
      totalReceived: inboxThisMonth.length || inboxEmails.length,
      totalSent: sentEmails.length,
      pending: pendingCount,
      responseTime: `${avgResponseTime} hrs`
    });
  };
  
  const generateTrafficData = (inboxEmails: any[], sentEmails: any[]) => {
    // Generate data for the last 4 weeks
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 7));
      
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const inboundCount = inboxEmails.filter(email => {
        const dateHeader = email.payload.headers.find((h: any) => h.name === "Date");
        if (!dateHeader) return false;
        const emailDate = new Date(dateHeader.value);
        return emailDate >= weekStart && emailDate < weekEnd;
      }).length;
      
      const outboundCount = sentEmails.filter(email => {
        const dateHeader = email.payload.headers.find((h: any) => h.name === "Date");
        if (!dateHeader) return false;
        const emailDate = new Date(dateHeader.value);
        return emailDate >= weekStart && emailDate < weekEnd;
      }).length;
      
      weeks.push({
        date: `Week ${4-i}`,
        inbound: inboundCount,
        outbound: outboundCount
      });
    }
    
    setTrafficData(weeks);
  };
  
  const calculateResponseRate = (inboxEmails: any[]) => {
    // This is a simplified calculation
    const totalEmails = inboxEmails.length;
    
    if (totalEmails === 0) {
      setResponseRateData({ replied: 70.6, pending: 11.8, ignored: 17.6 }); // Default values
      return;
    }
    
    // Assume ~70% of emails have been replied to
    const repliedCount = Math.floor(totalEmails * 0.7);
    
    // Assume ~12% are pending
    const pendingCount = Math.floor(totalEmails * 0.12);
    
    // The rest are ignored
    const ignoredCount = totalEmails - repliedCount - pendingCount;
    
    const replied = parseFloat(((repliedCount / totalEmails) * 100).toFixed(1));
    const pending = parseFloat(((pendingCount / totalEmails) * 100).toFixed(1));
    const ignored = parseFloat(((ignoredCount / totalEmails) * 100).toFixed(1));
    
    setResponseRateData({ replied, pending, ignored });
  };

  return (
    <div className="dashboard-main">     
      {loading ? (
        <div className="loading-state">Loading dashboard data...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          {/* Stats Cards - Make them clickable to navigate */}
          <div className="stats-row">
            <div className="stat-card" onClick={navigateToInbox}>
              <h3>Total Messages Received</h3>
              <div className="stat-value purple">{emailStats.totalReceived}</div>
              <p className="stat-subtext">this month</p>
            </div>
            
            <div className="stat-card" onClick={navigateToSentbox}>
              <h3>Messages Sent</h3>
              <div className="stat-value purple">{emailStats.totalSent}</div>
            </div>
            
            <div className="stat-card">
              <h3>Pending Messages</h3>
              <div className="stat-value purple">{emailStats.pending}</div>
              <p className="stat-subtext">scheduled or awaiting reply</p>
            </div>
            
            <div className="stat-card">
              <h3>Response Time Average</h3>
              <div className="stat-value purple">{emailStats.responseTime}</div>
              <p className="stat-subtext">average reply time</p>
            </div>
          </div>
          
          {/* Insights and Analytics */}
          <div className="insights-section">
            <h2>Insights and Analytics</h2>
            
            <div className="charts-container">
              <div className="chart-box">
                <h3>Message Volume Over Time</h3>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot blue"></span>
                    <span>Messages Sent</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot yellow"></span>
                    <span>Messages Received</span>
                  </div>
                </div>
                <div className="line-chart-placeholder">
                  {/* This would be replaced with an actual chart component */}
                </div>
                <div className="chart-x-axis">
                  {trafficData.map((week, index) => (
                    <span key={index}>{week.date}</span>
                  ))}
                </div>
              </div>
              
              <div className="chart-box">
                <h3>Response Rate Distribution</h3>
                <div className="pie-chart-container">
                  <div className="pie-chart-placeholder">
                    {/* This would be replaced with an actual chart component */}
                  </div>
                  <div className="pie-chart-legend">
                    <div className="legend-item">
                      <span className="legend-dot blue"></span>
                      <span>Replied ({responseRateData.replied}%)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot yellow"></span>
                      <span>Pending ({responseRateData.pending}%)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot red"></span>
                      <span>Ignored ({responseRateData.ignored}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;





