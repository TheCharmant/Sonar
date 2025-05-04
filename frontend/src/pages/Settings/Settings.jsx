"use client"

import { useState } from "react"
import {
  Bell,
  Mail,
  Lock,
  Globe,
  Shield,
  Users,
  Database,
  Monitor,
  Smartphone,
  Laptop,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  Download,
} from "lucide-react"
import "./Settings.css"

const Settings = () => {
  // Add the 2FA state variables and functions at the beginning of the Settings component
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState("sms")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showQRModal, setShowQRModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  const [activeTab, setActiveTab] = useState("security")
  const [activeSecuritySection, setActiveSecuritySection] = useState("")
  const [activeNotificationSection, setActiveNotificationSection] = useState("")
  const [activeLoggingSection, setActiveLoggingSection] = useState("")
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false)
  const [showPasswordNew, setShowPasswordNew] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [showRetentionDropdown, setShowRetentionDropdown] = useState(false)
  const [showExportFormatDropdown, setShowExportFormatDropdown] = useState(false)
  const [showSensitivityDropdown, setShowSensitivityDropdown] = useState(false)

  const [retentionPeriod, setRetentionPeriod] = useState("30 days")
  const [exportFormat, setExportFormat] = useState("CSV")
  const [sensitivityLevel, setSensitivityLevel] = useState("Medium")

  const [ipRestriction, setIpRestriction] = useState(true)
  const [roleRestriction, setRoleRestriction] = useState(true)

  const [emailNotifications, setEmailNotifications] = useState({
    systemUpdates: true,
    messageTracking: true,
    securityAlerts: false,
    dailySummary: false,
  })

  const [pushNotifications, setPushNotifications] = useState({
    newMessages: true,
    systemWarnings: true,
    failedDelivery: false,
  })

  const [activityLogging, setActivityLogging] = useState({
    loginAttempts: true,
    messageActivity: false,
    userSettings: true,
  })

  const devices = [
    { name: 'Dell 24"', location: "London, UK", date: "May 12, 2024 at 2:30 AM", type: "desktop" },
    { name: "Macbook Air", location: "London, UK", date: "May 12, 2024 at 2:30 AM", type: "laptop" },
    { name: "iPhone 16 Pro Max", location: "London, UK", date: "May 12, 2024 at 2:30 AM", type: "mobile" },
    { name: "Samsung Galaxy S 22 Ultra", location: "London, UK", date: "May 12, 2024 at 2:30 AM", type: "mobile" },
    { name: "Macbook Pro", location: "London, UK", date: "May 12, 2024 at 2:30 AM", type: "laptop" },
  ]

  const handleCheckboxChange = (category, name) => {
    if (category === "email") {
      setEmailNotifications({
        ...emailNotifications,
        [name]: !emailNotifications[name],
      })
    } else if (category === "push") {
      setPushNotifications({
        ...pushNotifications,
        [name]: !pushNotifications[name],
      })
    } else if (category === "activity") {
      setActivityLogging({
        ...activityLogging,
        [name]: !activityLogging[name],
      })
    }
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case "desktop":
        return <Monitor size={18} />
      case "laptop":
        return <Laptop size={18} />
      case "mobile":
        return <Smartphone size={18} />
      default:
        return <Monitor size={18} />
    }
  }

  // Add this function to handle 2FA toggle
  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  // Add this function to handle 2FA method selection
  const handle2FAMethodChange = (method) => {
    setTwoFactorMethod(method)
  }

  // Add this function to handle enabling 2FA
  const handleEnable2FA = () => {
    if (twoFactorMethod === "authenticator") {
      setShowQRModal(true)
    } else {
      // In a real app, this would send an SMS verification code
      alert("SMS verification code sent to your phone")
    }
  }

  // Add this function to handle QR code verification
  const handleVerifyQRCode = () => {
    // In a real app, this would verify the entered code
    setShowQRModal(false)
    alert("Two-Factor Authentication enabled successfully")
  }

  // Add this new function to render the 2FA content
  const renderTwoFactorContent = () => {
    if (activeSecuritySection === "2fa") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Two-Factor Authentication (2FA)</h2>
            <p>To enhance your account security, enable Two-Factor Authentication (2FA).</p>
            <p>
              This adds an extra layer of protection by requiring a secondary authentication method when logging in.
            </p>
            <p>You can choose to receive a one-time password (OTP) via SMS or use an authenticator app.</p>
          </div>

          <div className="settings-form">
            <div className="toggle-container">
              <span>Enable Two-Factor Authentication (2FA)</span>
              <label className="toggle">
                <input type="checkbox" checked={twoFactorEnabled} onChange={handleToggle2FA} />
                <span className="slider round"></span>
              </label>
            </div>

            {twoFactorEnabled && (
              <>
                <div className="options-section">
                  <h3>Options:</h3>
                  <div className="option-buttons">
                    <button
                      className={`option-button ${twoFactorMethod === "sms" ? "active" : ""}`}
                      onClick={() => handle2FAMethodChange("sms")}
                    >
                      SMS OTP (One-Time Password)
                    </button>
                    <button
                      className={`option-button ${twoFactorMethod === "authenticator" ? "active" : ""}`}
                      onClick={() => handle2FAMethodChange("authenticator")}
                    >
                      Authenticator App (Google Authenticator, Authy)
                    </button>
                  </div>
                </div>

                {twoFactorMethod === "sms" && (
                  <div className="input-fields-section">
                    <h3>Input Fields (if enabled):</h3>
                    <div className="form-group">
                      <div className="phone-input-container">
                        <span className="phone-icon">📱</span>
                        <input
                          type="text"
                          placeholder="+691234567890"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <p className="input-help-text">Text Input - Required for SMS OTP, Format: +Country Code</p>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="primary-button" onClick={handleEnable2FA}>
                    Enable 2FA
                  </button>
                </div>
              </>
            )}
          </div>

          {showQRModal && (
            <div className="modal-overlay">
              <div className="qr-modal">
                <div className="qr-header">
                  <h2>Scan QR Code</h2>
                  <p>Scan this QR code in-app to verify a device.</p>
                </div>

                <div className="qr-code-container">
                  <div className="qr-code">
                    <img src="/placeholder.svg?height=150&width=150" alt="QR Code" />
                  </div>
                </div>

                <div className="qr-divider">
                  <span>Or enter the code manually.</span>
                </div>

                <div className="verification-code-container">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <button className="copy-button">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>

                <div className="modal-actions">
                  <button className="primary-button" onClick={handleVerifyQRCode}>
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  const renderSecurityContent = () => {
    if (activeSecuritySection === "password") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Change Password</h2>
            <p>To change your password, please fill in the fields below.</p>
            <p className="password-requirements">
              Your password must contain at least 8 characters, it must also include at least one upper case letter, one
              lower case letter, one number and one special character.
            </p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input-container">
                <input type={showPasswordCurrent ? "text" : "password"} placeholder="Current password" />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                >
                  {showPasswordCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-container">
                <input type={showPasswordNew ? "text" : "password"} placeholder="New password" />
                <button type="button" className="password-toggle" onClick={() => setShowPasswordNew(!showPasswordNew)}>
                  {showPasswordNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-container">
                <input type={showPasswordConfirm ? "text" : "password"} placeholder="Confirm password" />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="devices-section">
              <div className="devices-header">
                <h3>Your Devices</h3>
                <p>Your devices linked to this account.</p>
                <button className="logout-all-button">Log out from all devices</button>
              </div>

              <div className="devices-list">
                {devices.map((device, index) => (
                  <div key={index} className="device-item">
                    <div className="device-info">
                      {getDeviceIcon(device.type)}
                      <div className="device-details">
                        <h4>{device.name}</h4>
                        <p>
                          {device.location} - {device.date}
                        </p>
                      </div>
                    </div>
                    <button className="logout-device-button">
                      <LogOut size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button">
                Change Password
              </button>
            </div>
          </div>
        </div>
      )
    } else if (activeSecuritySection === "access") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Access Restrictions</h2>
            <p>Control who can access the system by setting up restrictions.</p>
            <p>You can limit access to specific IP addresses or allow only certain user roles to log in.</p>
            <p>This helps prevent unauthorized access and enhances security.</p>
          </div>

          <div className="settings-form">
            <div className="checkbox-group">
              <label className="checkbox-container">
                <input type="checkbox" checked={ipRestriction} onChange={() => setIpRestriction(!ipRestriction)} />
                <span className="checkmark"></span>
                Restrict access to specific IP addresses
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={roleRestriction}
                  onChange={() => setRoleRestriction(!roleRestriction)}
                />
                <span className="checkmark"></span>
                Limit access based on user roles
              </label>
            </div>

            {ipRestriction && (
              <div className="ip-restriction-section">
                <div className="form-group">
                  <label>Input Field (if IP restriction enabled):</label>
                  <input type="text" placeholder="192.122.56.10" />
                </div>

                <h3>Allowed IP Addresses</h3>
                <div className="ip-list">
                  <div className="ip-item">
                    <label className="radio-container">
                      <input type="radio" name="ip1" />
                      <span className="radio-mark"></span>
                      192.122.56.10
                    </label>
                    <label className="radio-container">
                      <input type="radio" name="ip1" />
                      <span className="radio-mark"></span>
                      192.122.56.10
                    </label>
                  </div>
                  <div className="ip-item">
                    <label className="radio-container">
                      <input type="radio" name="ip2" />
                      <span className="radio-mark"></span>
                      192.122.56.10
                    </label>
                    <label className="radio-container">
                      <input type="radio" name="ip2" />
                      <span className="radio-mark"></span>
                      192.122.56.10
                    </label>
                  </div>
                  <div className="ip-item">
                    <label className="radio-container">
                      <input type="radio" name="ip3" />
                      <span className="radio-mark"></span>
                      192.122.56.10
                    </label>
                    <label className="radio-container">
                      <input type="radio" name="ip3" />
                      <span className="radio-mark"></span>
                      192.122.56.10
                    </label>
                  </div>
                </div>
              </div>
            )}

            {roleRestriction && (
              <div className="role-restriction-section">
                <div className="form-group">
                  <label>If role restriction enabled</label>
                  <div className="select-container">
                    <div className="custom-select">
                      <span>Select user roles with access</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="primary-button">
                Save Restrictions
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="settings-content">
          <h2>Authentication & Security</h2>

          <div className="settings-list">
            <div className="settings-item" onClick={() => setActiveSecuritySection("password")}>
              <div className="settings-item-content">
                <h3>Change Password</h3>
                <p>Allows users to update their password securely.</p>
              </div>
              <ChevronRight size={20} />
            </div>

            <div className="settings-item" onClick={() => setActiveSecuritySection("2fa")}>
              <div className="settings-item-content">
                <h3>Two-Factor Authentication (2FA)</h3>
                <p>Adds an extra security layer for user logins.</p>
              </div>
              <ChevronRight size={20} />
            </div>

            <div className="settings-item" onClick={() => setActiveSecuritySection("access")}>
              <div className="settings-item-content">
                <h3>Access Restrictions</h3>
                <p>Restrict system access based on IP or role-based permissions.</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      )
    }
  }

  const renderNotificationsContent = () => {
    if (activeNotificationSection === "email") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Email Notifications</h2>
            <p>Stay informed with email notifications for important system updates.</p>
            <p>You can enable alerts for security warnings, message tracking, and system changes.</p>
            <p>Customize which alerts you want to receive to avoid unnecessary emails.</p>
          </div>

          <div className="settings-form">
            <div className="toggle-container">
              <span>Turn on email notifications</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={emailNotifications.systemUpdates}
                  onChange={() => handleCheckboxChange("email", "systemUpdates")}
                />
                <span className="checkmark"></span>
                System updates
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={emailNotifications.messageTracking}
                  onChange={() => handleCheckboxChange("email", "messageTracking")}
                />
                <span className="checkmark"></span>
                Message tracking status
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={emailNotifications.securityAlerts}
                  onChange={() => handleCheckboxChange("email", "securityAlerts")}
                />
                <span className="checkmark"></span>
                Security alerts (failed logins, unauthorized access)
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={emailNotifications.dailySummary}
                  onChange={() => handleCheckboxChange("email", "dailySummary")}
                />
                <span className="checkmark"></span>
                Daily summary reports
              </label>
            </div>

            <div className="form-group">
              <label>Email Address for Alerts</label>
              <input type="email" defaultValue="powerpuff.cuties@gmail.com" />
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )
    } else if (activeNotificationSection === "push") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Push Notifications</h2>
            <p>Enable push notifications to receive real-time updates directly in the app.</p>
            <p>You can choose to get alerts for new messages, system warnings, or failed message deliveries.</p>
            <p>This ensures you never miss critical updates.</p>
          </div>

          <div className="settings-form">
            <div className="toggle-container">
              <span>Turn on push notifications</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={pushNotifications.newMessages}
                  onChange={() => handleCheckboxChange("push", "newMessages")}
                />
                <span className="checkmark"></span>
                New messages
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={pushNotifications.systemWarnings}
                  onChange={() => handleCheckboxChange("push", "systemWarnings")}
                />
                <span className="checkmark"></span>
                System warnings
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={pushNotifications.failedDelivery}
                  onChange={() => handleCheckboxChange("push", "failedDelivery")}
                />
                <span className="checkmark"></span>
                Failed message delivery alerts
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )
    } else if (activeNotificationSection === "error") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Error & Warning Logs</h2>
            <p>Configure how the system notifies you about errors and security warnings.</p>
            <p>
              You can set sensitivity levels and receive alerts for failed message deliveries or unauthorized login
              attempts.
            </p>
            <p>This helps you quickly address potential issues.</p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Error & Warning Alerts</label>
              <div className="select-container">
                <div className="custom-select" onClick={() => setShowSensitivityDropdown(!showSensitivityDropdown)}>
                  <span>Error Sensitivity Level</span>
                  <ChevronRight size={16} />
                </div>

                {showSensitivityDropdown && (
                  <div className="select-dropdown">
                    <div
                      className="select-option"
                      onClick={() => {
                        setSensitivityLevel("Low")
                        setShowSensitivityDropdown(false)
                      }}
                    >
                      Low
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setSensitivityLevel("Medium")
                        setShowSensitivityDropdown(false)
                      }}
                    >
                      Medium
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setSensitivityLevel("High")
                        setShowSensitivityDropdown(false)
                      }}
                    >
                      High
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-container">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Notify me of failed message deliveries
              </label>

              <label className="checkbox-container">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Notify me of unauthorized login attempts
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="settings-content">
          <h2>Notifications & Alerts</h2>

          <div className="settings-list">
            <div className="settings-item" onClick={() => setActiveNotificationSection("email")}>
              <div className="settings-item-content">
                <h3>Manage Email Alerts</h3>
                <p>Configure email notifications for system events.</p>
              </div>
              <ChevronRight size={20} />
            </div>

            <div className="settings-item" onClick={() => setActiveNotificationSection("push")}>
              <div className="settings-item-content">
                <h3>Push Notifications</h3>
                <p>Enable real-time alerts in the app.</p>
              </div>
              <ChevronRight size={20} />
            </div>

            <div className="settings-item" onClick={() => setActiveNotificationSection("error")}>
              <div className="settings-item-content">
                <h3>Error & Warning Logs</h3>
                <p>Configure alerts for system errors or security warnings.</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      )
    }
  }

  const renderLoggingContent = () => {
    if (activeLoggingSection === "retention") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Log Retention Policy</h2>
            <p>Define how long the system should store logs before automatic deletion.</p>
            <p>You can choose from predefined durations or set a custom retention period.</p>
            <p>This helps manage storage and ensures compliance with data policies.</p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Log Retention Period</label>
              <div className="select-container">
                <div className="custom-select" onClick={() => setShowRetentionDropdown(!showRetentionDropdown)}>
                  <span>{retentionPeriod}</span>
                  <ChevronRight size={16} />
                </div>

                {showRetentionDropdown && (
                  <div className="select-dropdown">
                    <div
                      className="select-option"
                      onClick={() => {
                        setRetentionPeriod("30 days")
                        setShowRetentionDropdown(false)
                      }}
                    >
                      30 days
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setRetentionPeriod("60 days")
                        setShowRetentionDropdown(false)
                      }}
                    >
                      60 days
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setRetentionPeriod("90 days")
                        setShowRetentionDropdown(false)
                      }}
                    >
                      90 days
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setRetentionPeriod("1 year")
                        setShowRetentionDropdown(false)
                      }}
                    >
                      1 year
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setRetentionPeriod("Custom")
                        setShowRetentionDropdown(false)
                      }}
                    >
                      Custom
                    </div>
                  </div>
                )}
              </div>
            </div>

            {retentionPeriod === "Custom" && (
              <div className="form-group">
                <label>Input Field (if Custom selected):</label>
                <input type="number" placeholder="Number of Days (Numeric Input - Min: 1, Max: 3650)" />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="primary-button">
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )
    } else if (activeLoggingSection === "activity") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Activity Tracking</h2>
            <p>Monitor user actions such as logins, sent messages, and setting modifications.</p>
            <p>Activity tracking helps maintain accountability and detect unusual behavior.</p>
            <p>You can enable or disable specific types of logs based on your needs.</p>
          </div>

          <div className="settings-form">
            <h3>Activity Logging</h3>
            <div className="checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={activityLogging.loginAttempts}
                  onChange={() => handleCheckboxChange("activity", "loginAttempts")}
                />
                <span className="checkmark"></span>
                Log login attempts
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={activityLogging.messageActivity}
                  onChange={() => handleCheckboxChange("activity", "messageActivity")}
                />
                <span className="checkmark"></span>
                Log sent and received messages
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={activityLogging.userSettings}
                  onChange={() => handleCheckboxChange("activity", "userSettings")}
                />
                <span className="checkmark"></span>
                Log changes to user settings
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button">
                Save Tracking Settings
              </button>
            </div>
          </div>
        </div>
      )
    } else if (activeLoggingSection === "export") {
      return (
        <div className="settings-detail-content">
          <div className="settings-detail-header">
            <h2>Export Logs</h2>
            <p>Download system logs for review, auditing, or compliance purposes.</p>
            <p>You can export logs in various formats such as CSV, PDF, or JSON.</p>
            <p>Select a date range to filter the logs before exporting them.</p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Export System Logs</label>
              <div className="select-container">
                <div className="custom-select" onClick={() => setShowExportFormatDropdown(!showExportFormatDropdown)}>
                  <span>Export Format</span>
                  <ChevronRight size={16} />
                </div>

                {showExportFormatDropdown && (
                  <div className="select-dropdown">
                    <div
                      className="select-option"
                      onClick={() => {
                        setExportFormat("CSV")
                        setShowExportFormatDropdown(false)
                      }}
                    >
                      CSV
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setExportFormat("PDF")
                        setShowExportFormatDropdown(false)
                      }}
                    >
                      PDF
                    </div>
                    <div
                      className="select-option"
                      onClick={() => {
                        setExportFormat("JSON")
                        setShowExportFormatDropdown(false)
                      }}
                    >
                      JSON
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Date Range Picker</label>
              <div className="date-range-picker">
                <div className="date-input">
                  <input type="text" defaultValue="From: February 1, 2025" />
                </div>
                <div className="date-input">
                  <input type="text" defaultValue="To: February 28, 2025" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button">
                <Download size={16} />
                Download Logs
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="settings-content">
          <h2>Logging Preferences</h2>

          <div className="settings-list">
            <div className="settings-item" onClick={() => setActiveLoggingSection("retention")}>
              <div className="settings-item-content">
                <h3>Log Retention Policy</h3>
                <p>Set how long logs are stored before deletion.</p>
              </div>
              <ChevronRight size={20} />
            </div>

            <div className="settings-item" onClick={() => setActiveLoggingSection("activity")}>
              <div className="settings-item-content">
                <h3>Activity Tracking</h3>
                <p>Track user actions like logins, message sending, and data modifications.</p>
              </div>
              <ChevronRight size={20} />
            </div>

            <div className="settings-item" onClick={() => setActiveLoggingSection("export")}>
              <div className="settings-item-content">
                <h3>Export Logs</h3>
                <p>Allow users to download logs for compliance review.</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      )
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "security":
        return renderSecurityContent()
      case "notifications":
        return renderNotificationsContent()
      case "logging":
        return renderLoggingContent()
      default:
        return (
          <div className="settings-content">
            <h2>Select a settings category</h2>
          </div>
        )
    }
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div
            className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("security")
              setActiveSecuritySection("")
            }}
          >
            <Shield size={20} />
            <span>Authentication & Security</span>
          </div>

          <div
            className={`settings-tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("notifications")
              setActiveNotificationSection("")
            }}
          >
            <Bell size={20} />
            <span>Notifications & Alerts</span>
          </div>

          <div
            className={`settings-tab ${activeTab === "logging" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("logging")
              setActiveLoggingSection("")
            }}
          >
            <Database size={20} />
            <span>Logging Preferences</span>
          </div>

          <div
            className={`settings-tab ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <Users size={20} />
            <span>Account</span>
          </div>

          <div
            className={`settings-tab ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            <Mail size={20} />
            <span>Email</span>
          </div>

          <div
            className={`settings-tab ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <Lock size={20} />
            <span>Password</span>
          </div>

          <div
            className={`settings-tab ${activeTab === "language" ? "active" : ""}`}
            onClick={() => setActiveTab("language")}
          >
            <Globe size={20} />
            <span>Language</span>
          </div>
        </div>

        <div className="settings-main">{renderContent()}</div>
      </div>
    </div>
  )
}

export default Settings

