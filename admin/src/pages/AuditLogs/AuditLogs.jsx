import { useState, useEffect } from "react"
import { ChevronDown, Search, Filter, X } from "lucide-react"
import { useAuth } from "../../AuthContext"
import "./AuditLogs.css"

const AuditLogs = () => {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    user: "",
    type: "",
    action: "",
    startDate: "",
    endDate: ""
  })

  // Available log types and actions from backend
  const logTypes = [
    { value: "", label: "All Types" },
    { value: "authentication", label: "Authentication" },
    { value: "user_management", label: "User Management" },
    { value: "system", label: "System" },
    { value: "data", label: "Data" },
    { value: "email", label: "Email" }
  ]

  const logActions = [
    { value: "", label: "All Actions" },
    { value: "login_success", label: "Login Success" },
    { value: "login_failed", label: "Login Failed" },
    { value: "logout", label: "Logout" },
    { value: "user_created", label: "User Created" },
    { value: "user_updated", label: "User Updated" },
    { value: "user_deleted", label: "User Deleted" },
    { value: "email_read", label: "Email Read" }
  ]

  useEffect(() => {
    if (token) {
      fetchAuditLogs()
    }
  }, [token])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.action) params.append('action', filters.action)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      
      // Use the same URL format as in Dashboard
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/auditlogs?${params.toString()}`
      
      // Use the same authorization header format as in Dashboard
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch audit logs")
      }

      const data = await res.json()
      console.log("Audit logs response:", data)
      setLogs(data.logs || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching audit logs:", err)
      setError(`Failed to load audit logs: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const applyFilters = () => {
    fetchAuditLogs()
    setShowFilters(false)
  }

  const resetFilters = () => {
    setFilters({
      user: "",
      type: "",
      action: "",
      startDate: "",
      endDate: ""
    })
    setShowFilters(false)
  }

  // Filter logs by user (client-side filtering)
  const filteredLogs = logs.filter(log => {
    if (!filters.user) return true
    return log.user?.toLowerCase().includes(filters.user.toLowerCase())
  })

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper function to determine the class for action badges
  const getActionClass = (action) => {
    if (action.includes("created") || action.includes("Created")) return "created"
    if (action.includes("updated") || action.includes("Updated")) return "updated"
    if (action.includes("deleted") || action.includes("Deleted")) return "deleted"
    if (action.includes("login") || action.includes("Login")) return "login"
    if (action.includes("failed") || action.includes("Failed")) return "failed"
    return ""
  }

  if (loading && logs.length === 0) return <div className="loading">Loading audit logs...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="audit-logs-container">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <button className="refresh-button" onClick={fetchAuditLogs}>
          Refresh
        </button>
      </div>

      <div className="filters-container">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by user"
            value={filters.user}
            onChange={(e) => handleFilterChange({ target: { name: 'user', value: e.target.value } })}
            className="search-input"
          />
        </div>

        <button 
          className="filter-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Log Type</label>
              <select 
                name="type" 
                value={filters.type}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {logTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Action</label>
              <select 
                name="action" 
                value={filters.action}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {logActions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Start Date</label>
              <input 
                type="date" 
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input 
                type="date" 
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="apply-filter-btn" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="reset-filter-btn" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="logs-table-container">
        {filteredLogs.length === 0 ? (
          <p className="no-results">No audit logs found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Role</th>
                <th>Type</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        <img src={`/placeholder.svg?height=30&width=30`} alt={log.user} />
                      </div>
                      <span>{log.user || log.performedBy}</span>
                    </div>
                  </td>
                  <td>{log.role}</td>
                  <td>{log.type}</td>
                  <td>
                    <span className={`action-badge ${getActionClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <button 
                        className="details-button"
                        onClick={() => alert(JSON.stringify(log.metadata || log.details, null, 2))}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AuditLogs

