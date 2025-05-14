"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, ChevronDown, Edit, UserCog, Trash2, Plus } from "lucide-react"
import { useAuth } from "../../AuthContext"
import "./UserManagement.css"

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roleFilter, setRoleFilter] = useState("all")
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showActivateConfirmDialog, setShowActivateConfirmDialog] = useState(false);
  const [userToActivate, setUserToActivate] = useState(null);

  useEffect(() => {
    // Get the token from localStorage
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      console.log("Using token from localStorage:", storedToken.substring(0, 10) + "...");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    fetchUsersWithJWT();
  }, []);

  const fetchUsersWithJWT = async () => {
    try {
      const storedToken = localStorage.getItem('adminToken');
      
      if (!storedToken) {
        throw new Error("No authentication token found");
      }
      
      console.log("Fetching users with JWT endpoint:", storedToken.substring(0, 10) + "...");
      
      // Use the JWT endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users with JWT:", err);
      // Fall back to original fetch method
      fetchUsersWithStoredToken();
    }
  };

  const fetchUsersWithStoredToken = async () => {
    setLoading(true);
    try {
      // Always use the token from localStorage
      const storedToken = localStorage.getItem('adminToken');
      
      if (!storedToken) {
        throw new Error("No authentication token found");
      }
      
      console.log("Fetching users with token from localStorage:", storedToken.substring(0, 10) + "...");
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user.status === "active") {
      setUserToDeactivate(user);
      setShowConfirmDialog(true);
    } else {
      setUserToActivate(user);
      setShowActivateConfirmDialog(true);
    }
  };

  const activateUser = async (userId) => {
    try {
      // Get the token directly from localStorage
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      console.log("Using token for activation:", token.substring(0, 10) + "...");
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate user");
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: "active" } : user
      ));
      
      setSuccessMessage("User activated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error activating user:", err);
      setError(err.message);
    }
  };

  const confirmDeactivate = () => {
    deactivateUserWithJWT(userToDeactivate.id).catch(() => {
      // Fall back to the original method if JWT fails
      deactivateUser(userToDeactivate.id);
    });
    setShowConfirmDialog(false);
    setUserToDeactivate(null);
  };

  const confirmActivate = () => {
    // Try the JWT endpoint first, fall back to original if it fails
    activateUserWithJWT(userToActivate.id).catch(() => {
      activateUser(userToActivate.id);
    });
    setShowActivateConfirmDialog(false);
    setUserToActivate(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  useEffect(() => {
    if (error) {
      setShowErrorToast(true);
      const timer = setTimeout(() => {
        setShowErrorToast(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Add this function to test authentication
  const testAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        setError("No authentication token found");
        return;
      }
      
      console.log("Testing authentication with token:", token.substring(0, 10) + "...");
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/test-auth`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication test failed");
      }
      
      const data = await response.json();
      console.log("Authentication test successful:", data);
      setSuccessMessage("Authentication test successful");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Authentication test failed:", err);
      setError(err.message);
    }
  };

  // Add this function to use JWT for activation
  const activateUserWithJWT = async (userId) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt/${userId}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate user");
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: "active" } : user
      ));
      
      setSuccessMessage("User activated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error activating user with JWT:", err);
      setError(err.message);
    }
  };

  // Add this function to use JWT for deactivation
  const deactivateUserWithJWT = async (userId) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deactivate user");
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: "inactive" } : user
      ));
      
      setSuccessMessage("User deactivated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deactivating user with JWT:", err);
      setError(err.message);
    }
  };

  return (
    <div className="user-management-container">
      {showErrorToast && error && (
        <div className="error-toast">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {successMessage}
        </div>
      )}
      <div className="user-filters">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="role-filter">
          <button 
            className="filter-button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            <span>{roleFilter === "all" ? "All Roles" : roleFilter === "admin" ? "Admins" : "Users"}</span>
            <ChevronDown size={16} />
          </button>
          
          {showRoleDropdown && (
            <div className="role-dropdown">
              <div 
                className={`role-option ${roleFilter === "all" ? "selected" : ""}`}
                onClick={() => {
                  setRoleFilter("all")
                  setShowRoleDropdown(false)
                }}
              >
                All Roles
              </div>
              <div 
                className={`role-option ${roleFilter === "admin" ? "selected" : ""}`}
                onClick={() => {
                  setRoleFilter("admin")
                  setShowRoleDropdown(false)
                }}
              >
                Admins
              </div>
              <div 
                className={`role-option ${roleFilter === "user" ? "selected" : ""}`}
                onClick={() => {
                  setRoleFilter("user")
                  setShowRoleDropdown(false)
                }}
              >
                Users
              </div>
            </div>
          )}
        </div>
        
        <Link to="/add-user" className="add-user-button">
          <Plus size={16} className="add-user-icon" />
          <span>Add New User</span>
        </Link>
        <button 
          className="test-auth-button"
          onClick={testAuthentication}
          style={{ marginLeft: '10px', padding: '8px 12px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          Test Auth
        </button>
      </div>

      {/* Move error message to a toast notification instead of displaying in the page */}
      
      {loading ? (
        <div className="loading-indicator">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>User</th>
                <th>Status</th>
                <th>Activate/Deactivate</th>
                <th colSpan="2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-users">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.role}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          <img src={`/placeholder.svg?height=30&width=30`} alt={user.name} />
                        </div>
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <label className="toggle">
                        <input 
                          type="checkbox" 
                          checked={user.status === "active"} 
                          onChange={() => handleToggleActive(user.id)} 
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      <Link to={`/edit-user/${user.id}`} className="action-button">
                        <Edit size={16} />
                        <span>Edit User</span>
                      </Link>
                    </td>
                    <td>
                      <Link to={`/edit-user/${user.id}`} className="action-button">
                        <UserCog size={16} />
                        <span>Change role</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <div className="warning-icon">⚠️</div>
              <h3>Deactivate User</h3>
            </div>
            <p className="confirm-dialog-message">
              Are you sure you want to deactivate {userToDeactivate?.name}?
            </p>
            <div className="confirm-dialog-actions">
              <button 
                className="cancel-button" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-button" 
                onClick={confirmDeactivate}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivateConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <div className="info-icon">ℹ️</div>
              <h3>Activate User</h3>
            </div>
            <p className="confirm-dialog-message">
              Are you sure you want to activate {userToActivate?.name}?
            </p>
            <div className="confirm-dialog-actions">
              <button 
                className="cancel-button" 
                onClick={() => {
                  setShowActivateConfirmDialog(false);
                  setUserToActivate(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="confirm-button confirm-activate" 
                onClick={confirmActivate}
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement;
