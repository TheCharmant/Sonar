import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

// Types for dashboard data
interface EmailStats {
  totalReceived: number;
  totalSent: number;
  pending: number;
  responseTime: string;
}

interface TrafficData {
  week: number;
  received: number;
  sent: number;
}

interface ResponseRateData {
  replied: number;
  pending: number;
  ignored: number;
}

const Dashboard = () => {
  useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error] = useState("");
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
    navigate("/sentbox");
  };

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = () => {
      setTimeout(() => {
        setEmailStats({
          totalReceived: 20,
          totalSent: 20,
          pending: 2,
          responseTime: "2.5 hrs"
        });
        
        setTrafficData([
          { week: 1, received: 5, sent: 4 },
          { week: 2, received: 7, sent: 6 },
          { week: 3, received: 4, sent: 5 },
          { week: 4, received: 8, sent: 5 }
        ]);
        
        setResponseRateData({
          replied: 70,
          pending: 10,
          ignored: 20
        });
        
        setLoading(false);
      }, 1500);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-main">
      <h1>Dashboard</h1>
      
      {loading ? (
        <div className="loading-state">Loading dashboard data...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          {/* Stats Cards */}
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
          
          {/* Analytics Section */}
          <div className="analytics-section">
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
                    <span key={index}>Week {week.week}</span>
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

export default Dashboard;
