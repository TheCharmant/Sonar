import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { X, ChevronDown, Filter } from 'react-feather';
import './Dashboard.css';

const Dashboard = () => {
  const { token } = useAuth();
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailStats, setEmailStats] = useState({
    total: 0,
    totalThisWeek: 0,
    totalToday: 0,
    topSenders: 0,
    unreadPercentage: 0,
    starredPercentage: 0,
    importantPercentage: 0,
    totalUsers: 0
  });
  const [trafficData, setTrafficData] = useState([]);
  const [topSenders, setTopSenders] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    quotaRemaining: 95,
    lastSyncTime: new Date().toLocaleString()
  });
  
  // Add filters similar to AdminEmailList
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    if (!token) return;
    fetchEmailActivity();
  }, [token]);

  const fetchEmailActivity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch email activity");
      }

      const data = await res.json();
      
      // Process all emails (both inbox and sent)
      const allEmails = data.users.flatMap(user => [
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
      
      // Sort by date (newest first)
      allEmails.sort((a, b) => {
        const dateA = new Date(a.payload.headers.find(h => h.name === "Date")?.value || 0);
        const dateB = new Date(b.payload.headers.find(h => h.name === "Date")?.value || 0);
        return dateB - dateA;
      });
      
      // Take the 10 most recent emails
      const recentActivity = allEmails.slice(0, 9).map(email => {
        const date = new Date(email.payload.headers.find(h => h.name === "Date")?.value || "");
        const subject = email.payload.headers.find(h => h.name === "Subject")?.value || "No Subject";
        const from = email.payload.headers.find(h => h.name === "From")?.value || "Unknown";
        const to = email.payload.headers.find(h => h.name === "To")?.value || "Unknown";
        
        // Format sender name to show name first, then email without <>
        let senderName = "";
        let senderEmail = "";
        
        if (from.includes("<")) {
          // Format: "Name <email@example.com>"
          const parts = from.split("<");
          senderName = parts[0].trim();
          senderEmail = parts[1].replace(">", "").trim();
        } else {
          // Format: just email
          senderEmail = from.trim();
        }
        
        return {
          id: email.id,
          timestamp: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          direction: email.category === "INBOX" ? "Incoming" : "Outgoing",
          subject: subject,
          sender: senderName || senderEmail,
          senderEmail: senderEmail,
          status: email.isUnread ? "Unread" : "Read",
          labels: email.labels || [],
          userId: email.userId,
          dateUTC: date.toISOString()
        };
      });
      
      setRecentEmails(recentActivity);
      
      // Calculate email traffic data (last 7 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();
      
      const trafficByDay = last7Days.map(day => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayEmails = allEmails.filter(email => {
          const emailDate = new Date(email.payload.headers.find(h => h.name === "Date")?.value || 0);
          return emailDate >= day && emailDate < nextDay;
        });
        
        const inbound = dayEmails.filter(email => email.category === "INBOX").length;
        const outbound = dayEmails.filter(email => email.category === "SENT").length;
        
        return {
          date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          inbound,
          outbound
        };
      });
      
      setTrafficData(trafficByDay);
      
      // Calculate top senders
      const senderCounts = {};
      allEmails.forEach(email => {
        const from = email.payload.headers.find(h => h.name === "From")?.value || "Unknown";
        let senderName = from;
        
        if (from.includes("<")) {
          const parts = from.split("<");
          senderName = parts[0].trim() || parts[1].replace(">", "").trim();
        }
        
        senderCounts[senderName] = (senderCounts[senderName] || 0) + 1;
      });
      
      const topSendersList = Object.entries(senderCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      setTopSenders(topSendersList);
      
      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const thisWeekEmails = allEmails.filter(email => {
        const emailDate = new Date(email.payload.headers.find(h => h.name === "Date")?.value || 0);
        return emailDate >= oneWeekAgo;
      });
      
      const todayEmails = allEmails.filter(email => {
        const emailDate = new Date(email.payload.headers.find(h => h.name === "Date")?.value || 0);
        return emailDate >= todayStart;
      });
      
      // Count unread, starred, important emails (using labels if available)
      const unreadCount = allEmails.filter(email => 
        email.isUnread || (email.labels && email.labels.some(label => 
          (typeof label === 'string' && label === 'UNREAD') || 
          (label && label.name === 'UNREAD')
        ))
      ).length;

      const starredCount = allEmails.filter(email => 
        email.labels && email.labels.some(label => 
          (typeof label === 'string' && label === 'STARRED') || 
          (label && label.name === 'STARRED')
        )
      ).length;

      const importantCount = allEmails.filter(email => 
        email.labels && email.labels.some(label => 
          (typeof label === 'string' && label === 'IMPORTANT') || 
          (label && label.name === 'IMPORTANT')
        )
      ).length;
      
      setEmailStats({
        total: allEmails.length,
        totalThisWeek: thisWeekEmails.length,
        totalToday: todayEmails.length,
        topSenders: new Set(allEmails.map(email => 
          email.payload.headers.find(h => h.name === "From")?.value || ""
        )).size,
        unreadPercentage: allEmails.length ? Math.round((unreadCount / allEmails.length) * 100) : 0,
        starredPercentage: allEmails.length ? Math.round((starredCount / allEmails.length) * 100) : 0,
        importantPercentage: allEmails.length ? Math.round((importantCount / allEmails.length) * 100) : 0,
        totalUsers: data.users.length
      });
      
      // Update system health
      setSystemHealth({
        quotaRemaining: 95, // Placeholder - would come from API
        lastSyncTime: new Date().toLocaleString()
      });
      
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Filter handling functions
  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateRange({ start: null, end: null });
  };

  // Apply filters to recent emails
  const getFilteredEmails = () => {
    let filtered = [...recentEmails];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(term) ||
        email.sender.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(email => email.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(email => {
        const emailDate = new Date(email.dateUTC);
        return emailDate >= dateRange.start && emailDate <= dateRange.end;
      });
    }
    
    return filtered;
  };

  const filteredEmails = getFilteredEmails();

  return (
    <div className="dashboard-container">
      {loading ? (
        <p>Loading dashboard data...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {/* Email Traffic Chart */}
          <div className="chart-container">
            <h2>Email Traffic (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inbound" stroke="#8884d8" name="Inbound" />
                <Line type="monotone" dataKey="outbound" stroke="#82ca9d" name="Outbound" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Email Summary Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total Emails</h3>
              <div className="stat-value">{emailStats.total}</div>
              <div className="stat-details">
                <div>This week: {emailStats.totalThisWeek}</div>
                <div>Today: {emailStats.totalToday}</div>
              </div>
            </div>

            <div className="stat-card">
              <h3>Users</h3>
              <div className="stat-value">{emailStats.totalUsers}</div>
            </div>

            <div className="stat-card">
              <h3>Email Status</h3>
              <div className="stat-details">
                <div>Unread: {emailStats.unreadPercentage}%</div>
                <div>Starred: {emailStats.starredPercentage}%</div>
                <div>Important: {emailStats.importantPercentage}%</div>
              </div>
            </div>

            <div className="stat-card">
              <h3>System Health</h3>
              <div className="stat-value">100%</div>
              <div className="stat-details">
                <div>API Quota: {systemHealth.quotaRemaining}%</div>
                <div>Last Sync: {systemHealth.lastSyncTime}</div>
              </div>
            </div>
          </div>

          {/* Top Senders */}
          <div className="top-senders-container">
            <div className="top-senders-table">
              <h2>Top Senders</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topSenders.map((sender, index) => (
                    <tr key={index}>
                      <td>{sender.name}</td>
                      <td>{sender.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="top-senders-chart">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topSenders}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {topSenders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Feed - Enhanced with AdminEmailList features */}
          <div className="recent-logs-container">
            <div className="recent-logs-header">
              <h2>Recent Activity Feed</h2>
              <button 
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filters
              </button>
            </div>

            {/* Filters panel - moved here before the activity feed */}
            {showFilters && (
              <div className="filters-panel">
                <div className="filters-header">
                  <h2>Filter Dashboard Data</h2>
                  <button className="reset-filters-btn" onClick={resetFilters}>
                    Reset All
                  </button>
                </div>
                
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Search</label>
                    <input
                      type="text"
                      placeholder="Search by subject or sender..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>Status</label>
                    <div className="dropdown">
                      <button 
                        className="dropdown-toggle"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      >
                        {statusFilter || "All"}
                        <ChevronDown size={16} />
                      </button>
                      {showStatusDropdown && (
                        <div className="dropdown-menu">
                          <div className="dropdown-item" onClick={() => handleStatusSelect("")}>
                            All
                          </div>
                          <div className="dropdown-item" onClick={() => handleStatusSelect("Unread")}>
                            Unread
                          </div>
                          <div className="dropdown-item" onClick={() => handleStatusSelect("Read")}>
                            Read
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <label>Date Range</label>
                    <div className="date-range-inputs">
                      <input
                        type="date"
                        value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                        onChange={(e) => setDateRange({
                          ...dateRange,
                          start: e.target.value ? new Date(e.target.value) : null
                        })}
                        className="filter-input date-input"
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                        onChange={(e) => setDateRange({
                          ...dateRange,
                          end: e.target.value ? new Date(e.target.value) : null
                        })}
                        className="filter-input date-input"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Active filters */}
                {(statusFilter || searchTerm || (dateRange.start && dateRange.end)) && (
                  <div className="active-filters-container">
                    <span className="active-filters-label">Active Filters:</span>
                    
                    {statusFilter && (
                      <div className="active-filter-tag">
                        Status: {statusFilter}
                        <X 
                          size={14} 
                          className="remove-filter" 
                          onClick={() => setStatusFilter("")} 
                        />
                      </div>
                    )}
                    
                    {searchTerm && (
                      <div className="active-filter-tag">
                        Search: {searchTerm}
                        <X 
                          size={14} 
                          className="remove-filter" 
                          onClick={() => setSearchTerm("")} 
                        />
                      </div>
                    )}
                    
                    {dateRange.start && dateRange.end && (
                      <div className="active-filter-tag">
                        Date: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                        <X 
                          size={14} 
                          className="remove-filter" 
                          onClick={() => setDateRange({ start: null, end: null })} 
                        />
                      </div>
                    )}
                    
                    <button className="clear-all-filters" onClick={resetFilters}>
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="recent-emails-count">
              Showing {filteredEmails.length} of {recentEmails.length} recent emails
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Direction</th>
                  <th>Status</th>
                  <th>Subject</th>
                  <th>Sender</th>
                  <th>User ID</th>
                  <th>Labels</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email, index) => (
                  <tr key={index} className={email.status === "Unread" ? "unread-row" : ""}>
                    <td>{email.timestamp}</td>
                    <td>
                      <span className={`direction-badge ${email.direction.toLowerCase()}`}>
                        {email.direction}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${email.status.toLowerCase()}`}>
                        {email.status}
                      </span>
                    </td>
                    <td className="subject-cell">{email.subject}</td>
                    <td>{email.sender}</td>
                    <td>{email.userId}</td>
                    <td>
                      <div className="labels-container">
                        {email.labels && email.labels.map((label, i) => (
                          <span key={i} className="label-badge">
                            {typeof label === 'string' ? label : label.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard
