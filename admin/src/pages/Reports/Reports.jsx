"use client"

import { useState } from "react"
import { CheckCircle, Calendar, Download } from "lucide-react"
import "./Reports.css"

const Reports = () => {
  const [exportFormat, setExportFormat] = useState("pdf")
  const [showExportOptions, setShowExportOptions] = useState(false)

  const handleExport = () => {
    // In a real app, this would generate and download the report
    alert(`Exporting report as ${exportFormat.toUpperCase()}`)
  }

  return (
    <div className="reports-container">
      <h1>Reports</h1>

      <div className="reports-filters">
        <div className="filter">
          <CheckCircle size={18} />
          <span>Status</span>
        </div>

        <div className="filter">
          <Calendar size={18} />
          <span>Date Range</span>
        </div>

        <div className="export-dropdown">
          <button className="filter" onClick={() => setShowExportOptions(!showExportOptions)}>
            <Download size={18} />
            <span>Export Format</span>
          </button>

          {showExportOptions && (
            <div className="export-options">
              <div
                className={`export-option ${exportFormat === "pdf" ? "selected" : ""}`}
                onClick={() => setExportFormat("pdf")}
              >
                PDF
              </div>
              <div
                className={`export-option ${exportFormat === "csv" ? "selected" : ""}`}
                onClick={() => setExportFormat("csv")}
              >
                CSV
              </div>
              <div
                className={`export-option ${exportFormat === "excel" ? "selected" : ""}`}
                onClick={() => setExportFormat("excel")}
              >
                Excel
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="report-preview">
        <h2>Preview</h2>

        <div className="report-content">
          <h3>Compliance Department Email Report</h3>
          <div className="report-metadata">
            <p>Date: March 1, 2025 - March 15, 2025</p>
            <p>By: Admin (Digital Department)</p>
            <p>Department: Compliance</p>
          </div>

          <div className="report-section">
            <h4>1. General Email Activity Report</h4>
            <ul>
              <li>Total Number of Emails(Sent/Received)</li>
              <li>Emails Sent</li>
              <li>Emails Received</li>
              <li>Unread Emails</li>
              <li>Read Emails</li>
              <li>Response Rate (Emails Replied/Total Received)</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>2. Sender-Wise Report</h4>
            <ul>
              <li>Emails by Sender</li>
              <li>Top Senders</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>3. Receiver-Wise Report</h4>
            <ul>
              <li>Emails by Receiver</li>
              <li>Top Receiver</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>4. Time-Based Report</h4>
            <ul>
              <li>Emails Sent and Received by Date & Time</li>
              <li>Peak Hours of Email Activity</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>5. Subject and Content Report</h4>
            <ul>
              <li>Emails Categorized by Subject</li>
              <li>Top Email Subjects</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>6. User Interaction Report</h4>
            <ul>
              <li>Emails Viewed and Opened</li>
              <li>Emails with Attachments</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>7. Security and Compliance Report</h4>
            <ul>
              <li>Security Alerts</li>
            </ul>
          </div>

          <div className="report-section">
            <h4>8. Email Chain (Threading) Report</h4>
            <ul>
              <li>Email Threaded Discussions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="export-button-container">
        <button className="export-button" onClick={handleExport}>
          EXPORT
        </button>
      </div>
    </div>
  )
}

export default Reports

