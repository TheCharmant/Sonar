"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Calendar, Download, Filter, Users, Tag, ArrowUpDown, X } from "lucide-react"
import { useAuth } from '../../AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import "./Reports.css"

const Reports = () => {
  const { token } = useAuth()
  const [exportFormat, setExportFormat] = useState("pdf")
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailData, setEmailData] = useState([])
  
  // Report filters
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [userFilter, setUserFilter] = useState("")
  const [directionFilters, setDirectionFilters] = useState([])
  const [tagFilters, setTagFilters] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Report data
  const [emailsPerDay, setEmailsPerDay] = useState([])
  const [userActivity, setUserActivity] = useState([])
  const [labelBreakdown, setLabelBreakdown] = useState([])
  const [reportStats, setReportStats] = useState({
    totalEmails: 0,
    inbound: 0,
    outbound: 0,
    unread: 0,
    read: 0,
    withAttachments: 0,
    responseRate: 0
  })
  const [starredBreakdown, setStarredBreakdown] = useState([
    { name: 'Starred', value: 0 },
    { name: 'Unstarred', value: 0 }
  ])

  // Fetch email data
  useEffect(() => {
    fetchEmailData()
  }, [token])

  const fetchEmailData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch email data")
      }

      const data = await res.json()
      
      // Process all emails (both inbox and sent)
      const allEmails = data.users.flatMap(user => [
        ...user.inbox.map(email => ({
          ...email,
          userId: user.uid,
          category: "INBOX",
          direction: "Incoming"
        })),
        ...user.sent.map(email => ({
          ...email,
          userId: user.uid,
          category: "SENT",
          direction: "Outgoing"
        }))
      ])
      
      // Transform emails to a more usable format
      const processedEmails = allEmails.map(email => {
        const headers = email.payload.headers || []
        const date = headers.find(h => h.name === "Date")?.value
        const subject = headers.find(h => h.name === "Subject")?.value || "No Subject"
        const from = headers.find(h => h.name === "From")?.value || "Unknown"
        const to = headers.find(h => h.name === "To")?.value || "Unknown"
        const messageId = headers.find(h => h.name === "Message-ID")?.value
        const threadId = email.threadId
        
        // Check for attachments
        const hasAttachments = email.payload.parts && email.payload.parts.some(part => part.filename)
        
        return {
          id: email.id,
          timestamp: date ? new Date(date) : new Date(),
          direction: email.direction,
          from,
          to,
          subject,
          labels: email.labels || [],
          threadId,
          messageId,
          hasAttachments,
          userId: email.userId,
          status: email.isUnread ? "Unread" : "Read"
        }
      })
      
      setEmailData(processedEmails)
      generateReportData(processedEmails)
    } catch (err) {
      console.error("Error fetching email data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Generate report data based on filters
  const generateReportData = (emails) => {
    // Apply filters
    let filteredEmails = [...emails]
    
    if (dateRange.start && dateRange.end) {
      filteredEmails = filteredEmails.filter(email => 
        email.timestamp >= dateRange.start && email.timestamp <= dateRange.end
      )
    }
    
    if (userFilter) {
      filteredEmails = filteredEmails.filter(email => 
        email.userId === userFilter || 
        email.from.toLowerCase().includes(userFilter.toLowerCase()) || 
        email.to.toLowerCase().includes(userFilter.toLowerCase())
      )
    }
    
    if (directionFilters.length > 0) {
      filteredEmails = filteredEmails.filter(email => 
        directionFilters.includes(email.direction)
      )
    }
    
    if (tagFilters.length > 0) {
      filteredEmails = filteredEmails.filter(email => 
        email.labels.some(label => 
          tagFilters.includes(typeof label === 'string' ? label : label.name)
        )
      )
    }
    
    // Calculate stats
    const totalEmails = filteredEmails.length
    const inbound = filteredEmails.filter(email => email.direction === "Incoming").length
    const outbound = filteredEmails.filter(email => email.direction === "Outgoing").length
    const unread = filteredEmails.filter(email => email.status === "Unread").length
    const read = filteredEmails.filter(email => email.status === "Read").length
    const withAttachments = filteredEmails.filter(email => email.hasAttachments).length
    
    // Calculate response rate (emails replied / total received)
    const receivedThreadIds = new Set(
      filteredEmails.filter(email => email.direction === "Incoming").map(email => email.threadId)
    )
    const repliedThreadIds = new Set(
      filteredEmails.filter(email => 
        email.direction === "Outgoing" && 
        (email.headers?.inReplyTo || email.inReplyTo)
      ).map(email => email.threadId)
    )
    
    const responseRate = receivedThreadIds.size > 0 
      ? (repliedThreadIds.size / receivedThreadIds.size) * 100 
      : 0
    
    setReportStats({
      totalEmails,
      inbound,
      outbound,
      unread,
      read,
      withAttachments,
      responseRate: Math.round(responseRate)
    })
    
    // Generate emails per day chart data
    const emailsByDay = {}
    filteredEmails.forEach(email => {
      const day = email.timestamp.toISOString().split('T')[0]
      if (!emailsByDay[day]) {
        emailsByDay[day] = { date: day, inbound: 0, outbound: 0 }
      }
      
      if (email.direction === "Incoming") {
        emailsByDay[day].inbound++
      } else {
        emailsByDay[day].outbound++
      }
    })
    
    setEmailsPerDay(Object.values(emailsByDay).sort((a, b) => a.date.localeCompare(b.date)))
    
    // Generate user activity chart data
    const userCounts = {}
    filteredEmails.forEach(email => {
      const userId = email.userId
      if (!userCounts[userId]) {
        userCounts[userId] = 0
      }
      userCounts[userId]++
    })
    
    setUserActivity(
      Object.entries(userCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    )
    
    // Generate label breakdown
    const labelCounts = {}
    filteredEmails.forEach(email => {
      if (!email.labels) return
      
      email.labels.forEach(label => {
        const labelName = typeof label === 'string' ? label : label.name
        if (!labelName) return
        
        if (!labelCounts[labelName]) {
          labelCounts[labelName] = 0
        }
        labelCounts[labelName]++
      })
    })
    
    setLabelBreakdown(
      Object.entries(labelCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    )

    // Calculate starred vs unstarred breakdown
    const starredCount = filteredEmails.filter(email => 
      email.labels && email.labels.some(label => 
        (typeof label === 'string' && label === 'STARRED') || 
        (typeof label === 'object' && label.name === 'STARRED')
      )
    ).length;

    setStarredBreakdown([
      { name: 'Starred', value: starredCount },
      { name: 'Unstarred', value: filteredEmails.length - starredCount }
    ]);
  }

  // Toggle direction filter
  const toggleDirectionFilter = (direction) => {
    if (directionFilters.includes(direction)) {
      setDirectionFilters(directionFilters.filter(d => d !== direction))
    } else {
      setDirectionFilters([...directionFilters, direction])
    }
  }
  
  // Toggle tag filter
  const toggleTagFilter = (tag) => {
    if (tagFilters.includes(tag)) {
      setTagFilters(tagFilters.filter(t => t !== tag))
    } else {
      setTagFilters([...tagFilters, tag])
    }
  }
  
  // Reset filters
  const resetFilters = () => {
    setDateRange({ start: null, end: null })
    setUserFilter("")
    setDirectionFilters([])
    setTagFilters([])
    // Immediately regenerate report data with reset filters
    generateReportData(emailData)
  }
  
  // Apply filters
  const applyFilters = () => {
    generateReportData(emailData)
    setShowFilters(false) // Optionally hide filters after applying
  }

  // Handle date range change
  const handleDateRangeChange = (e, field) => {
    const date = e.target.value ? new Date(e.target.value) : null
    setDateRange({
      ...dateRange,
      [field]: date
    })
  }

  // Export report
  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportToPDF()
    } else if (exportFormat === "excel") {
      exportToExcel()
    } else if (exportFormat === "csv") {
      exportToCSV()
    }
  }
  
  // Export to PDF with improved corporate formatting
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add company logo/header
    doc.setFontSize(18)
    doc.setTextColor(66, 108, 247) // Brand color
    doc.text("Email System Analytics Report", 105, 15, { align: "center" })
    
    // Add report metadata
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const today = new Date().toLocaleDateString()
    doc.text(`Generated: ${today}`, 105, 22, { align: "center" })
    
    // Add date range
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    const dateText = dateRange.start && dateRange.end 
      ? `Date Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
      : "Date Range: All Time"
    doc.text(dateText, 105, 30, { align: "center" })
    
    // Add filters applied
    let filterText = "Filters Applied: "
    if (userFilter) filterText += `User/Email: ${userFilter}; `
    if (directionFilters.length > 0) filterText += `Direction: ${directionFilters.join(', ')}; `
    if (tagFilters.length > 0) filterText += `Tags: ${tagFilters.join(', ')}; `
    if (filterText === "Filters Applied: ") filterText += "None"
    
    doc.setFontSize(10)
    doc.text(filterText, 105, 38, { align: "center" })
    
    // Add executive summary
    doc.setFontSize(14)
    doc.setTextColor(66, 108, 247)
    doc.text("Executive Summary", 20, 50)
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`This report provides an analysis of ${reportStats.totalEmails} emails processed through the system.`, 20, 58)
    doc.text(`The system has handled ${reportStats.inbound} incoming and ${reportStats.outbound} outgoing emails.`, 20, 65)
    doc.text(`Response rate is currently at ${reportStats.responseRate}%, with ${reportStats.unread} emails remaining unread.`, 20, 72)
    
    // Add stats section
    doc.setFontSize(14)
    doc.setTextColor(66, 108, 247)
    doc.text("Key Metrics", 20, 85)
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Emails: ${reportStats.totalEmails}`, 20, 93)
    doc.text(`Inbound: ${reportStats.inbound}`, 20, 100)
    doc.text(`Outbound: ${reportStats.outbound}`, 20, 107)
    doc.text(`Unread: ${reportStats.unread}`, 20, 114)
    doc.text(`Read: ${reportStats.read}`, 20, 121)
    doc.text(`With Attachments: ${reportStats.withAttachments}`, 20, 128)
    doc.text(`Response Rate: ${reportStats.responseRate}%`, 20, 135)
    
    // Add top users section
    doc.setFontSize(14)
    doc.setTextColor(66, 108, 247)
    doc.text("Top Users by Activity", 20, 150)
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    let yPos = 158
    userActivity.forEach((user, index) => {
      doc.text(`${index + 1}. User ID: ${user.name} - ${user.value} emails (${((user.value / reportStats.totalEmails) * 100).toFixed(1)}%)`, 20, yPos)
      yPos += 7
    })
    
    // Add email list (limited to first 20)
    doc.addPage()
    
    doc.setFontSize(14)
    doc.setTextColor(66, 108, 247)
    doc.text("Email System Analytics Report - Continued", 105, 15, { align: "center" })
    
    doc.setFontSize(14)
    doc.text("Email Details", 20, 30)
    
    // Table headers
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("Date", 20, 40)
    doc.text("Direction", 60, 40)
    doc.text("From", 90, 40)
    doc.text("Subject", 150, 40)
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 42, 190, 42)
    
    // Table data
    const filteredEmails = emailData.filter(email => {
      let include = true
      
      if (dateRange.start && dateRange.end) {
        include = include && (email.timestamp >= dateRange.start && email.timestamp <= dateRange.end)
      }
      
      if (userFilter) {
        include = include && (email.userId === userFilter || email.from.includes(userFilter) || email.to.includes(userFilter))
      }
      
      if (directionFilters.length > 0) {
        include = include && directionFilters.includes(email.direction)
      }
      
      if (tagFilters.length > 0) {
        include = include && email.labels.some(label => 
          tagFilters.includes(typeof label === 'string' ? label : label.name)
        )
      }
      
      return include
    })
    
    let y = 50
    filteredEmails.slice(0, 20).forEach(email => {
      if (y > 280) {
        doc.addPage()
        y = 20
        
        // Add headers on new page
        doc.setFontSize(14)
        doc.setTextColor(66, 108, 247)
        doc.text("Email System Analytics Report - Continued", 105, 15, { align: "center" })
        
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text("Date", 20, y)
        doc.text("Direction", 60, y)
        doc.text("From", 90, y)
        doc.text("Subject", 150, y)
        
        // Add horizontal line
        doc.setDrawColor(200, 200, 200)
        doc.line(20, y + 2, 190, y + 2)
        
        y += 10
      }
      
      doc.text(email.timestamp.toLocaleDateString(), 20, y)
      doc.text(email.direction, 60, y)
      doc.text(email.from.substring(0, 30), 90, y)
      doc.text(email.subject.substring(0, 40), 150, y)
      
      y += 7
    })
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${pageCount} | Confidential - For Internal Use Only`, 105, 290, { align: "center" })
    }
    
    doc.save("email-system-analytics-report.pdf")
  }
  
  // Export to Excel with improved corporate formatting
  const exportToExcel = () => {
    const filteredEmails = emailData.filter(email => {
      let include = true
      
      if (dateRange.start && dateRange.end) {
        include = include && (email.timestamp >= dateRange.start && email.timestamp <= dateRange.end)
      }
      
      if (userFilter) {
        include = include && (email.userId === userFilter || email.from.includes(userFilter) || email.to.includes(userFilter))
      }
      
      if (directionFilters.length > 0) {
        include = include && directionFilters.includes(email.direction)
      }
      
      if (tagFilters.length > 0) {
        include = include && email.labels.some(label => 
          tagFilters.includes(typeof label === 'string' ? label : label.name)
        )
      }
      
      return include
    })
    
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new()
    
    // Add metadata sheet
    const metadataWS = XLSX.utils.aoa_to_sheet([
      ["Email System Analytics Report"],
      [""],
      ["Report Generated", new Date().toLocaleString()],
      ["Date Range", dateRange.start && dateRange.end ? 
        `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` : 
        "All Time"],
      ["Total Emails", reportStats.totalEmails],
      ["Inbound Emails", reportStats.inbound],
      ["Outbound Emails", reportStats.outbound],
      ["Unread Emails", reportStats.unread],
      ["Read Emails", reportStats.read],
      ["Emails with Attachments", reportStats.withAttachments],
      ["Response Rate", `${reportStats.responseRate}%`],
      [""],
      ["Filters Applied"],
      ["User/Email", userFilter || "None"],
      ["Direction", directionFilters.length > 0 ? directionFilters.join(", ") : "None"],
      ["Tags", tagFilters.length > 0 ? tagFilters.join(", ") : "None"]
    ])
    
    // Set column widths for metadata
    const metadataCols = [
      { wch: 25 }, // Column A width
      { wch: 50 }  // Column B width
    ]
    metadataWS['!cols'] = metadataCols
    
    XLSX.utils.book_append_sheet(workbook, metadataWS, "Report Summary")
    
    // Add emails sheet
    const emailsWS = XLSX.utils.json_to_sheet(filteredEmails.map(email => ({
      Date: email.timestamp.toLocaleString(),
      Direction: email.direction,
      From: email.from,
      To: email.to,
      Subject: email.subject,
      Status: email.status,
      Labels: email.labels.map(label => typeof label === 'string' ? label : label.name).join(', '),
      "Has Attachments": email.hasAttachments ? 'Yes' : 'No',
      "User ID": email.userId
    })))
    
    // Set column widths for emails
    const emailsCols = [
      { wch: 20 }, // Date
      { wch: 10 }, // Direction
      { wch: 30 }, // From
      { wch: 30 }, // To
      { wch: 40 }, // Subject
      { wch: 10 }, // Status
      { wch: 20 }, // Labels
      { wch: 15 }, // Has Attachments
      { wch: 10 }  // User ID
    ]
    emailsWS['!cols'] = emailsCols
    
    XLSX.utils.book_append_sheet(workbook, emailsWS, "Email Details")
    
    // Add user activity sheet
    const userActivityWS = XLSX.utils.json_to_sheet(userActivity.map(user => ({
      "User ID": user.name,
      "Email Count": user.value,
      "Percentage": `${((user.value / reportStats.totalEmails) * 100).toFixed(1)}%`
    })))
    
    XLSX.utils.book_append_sheet(workbook, userActivityWS, "User Activity")
    
    // Add label breakdown sheet
    const labelBreakdownWS = XLSX.utils.json_to_sheet(labelBreakdown.map(label => ({
      "Label": label.name,
      "Count": label.value,
      "Percentage": `${((label.value / reportStats.totalEmails) * 100).toFixed(1)}%`
    })))
    
    XLSX.utils.book_append_sheet(workbook, labelBreakdownWS, "Label Breakdown")
    
    // Add emails per day sheet
    const emailsPerDayWS = XLSX.utils.json_to_sheet(emailsPerDay.map(day => ({
      "Date": day.date,
      "Inbound": day.inbound,
      "Outbound": day.outbound,
      "Total": day.inbound + day.outbound
    })))
    
    XLSX.utils.book_append_sheet(workbook, emailsPerDayWS, "Daily Activity")
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    saveAs(blob, "email-system-analytics-report.xlsx")
  }
  
  // Export to CSV with improved corporate formatting
  const exportToCSV = () => {
    const filteredEmails = emailData.filter(email => {
      let include = true
      
      if (dateRange.start && dateRange.end) {
        include = include && (email.timestamp >= dateRange.start && email.timestamp <= dateRange.end)
      }
      
      if (userFilter) {
        include = include && (email.userId === userFilter || email.from.includes(userFilter) || email.to.includes(userFilter))
      }
      
      if (directionFilters.length > 0) {
        include = include && directionFilters.includes(email.direction)
      }
      
      if (tagFilters.length > 0) {
        include = include && email.labels.some(label => 
          tagFilters.includes(typeof label === 'string' ? label : label.name)
        )
      }
      
      return include
    })
    
    const csvData = filteredEmails.map(email => ({
      timestamp: email.timestamp.toLocaleString(),
      direction: email.direction,
      from: email.from,
      to: email.to,
      subject: email.subject,
      labels: email.labels.map(label => typeof label === 'string' ? label : label.name).join(', '),
      threadId: email.threadId,
      messageId: email.messageId,
      hasAttachments: email.hasAttachments ? 'Yes' : 'No',
      status: email.status
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet)
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, "email-report.csv")
  }

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading report data...</p>
      </div>
    </div>
  )

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-left">
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button className="refresh-icon-btn" onClick={fetchEmailData} title="Refresh Data">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="refresh-icon">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        
        <div className="export-dropdown">
          <button className="filter" onClick={() => setShowExportOptions(!showExportOptions)}>
            <Download size={18} />
            <span>Export Format: {exportFormat.toUpperCase()}</span>
          </button>

          {showExportOptions && (
            <div className="export-options">
              <div
                className={`export-option ${exportFormat === "pdf" ? "selected" : ""}`}
                onClick={() => {
                  setExportFormat("pdf")
                  setShowExportOptions(false) // Close dropdown after selection
                }}
              >
                PDF
              </div>
              <div
                className={`export-option ${exportFormat === "csv" ? "selected" : ""}`}
                onClick={() => {
                  setExportFormat("csv")
                  setShowExportOptions(false) // Close dropdown after selection
                }}
              >
                CSV
              </div>
              <div
                className={`export-option ${exportFormat === "excel" ? "selected" : ""}`}
                onClick={() => {
                  setExportFormat("excel")
                  setShowExportOptions(false) // Close dropdown after selection
                }}
              >
                Excel
              </div>
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="reports-filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label><Calendar size={16} /> Date Range</label>
              <div className="date-inputs">
                <input 
                  type="date" 
                  value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''} 
                  onChange={(e) => handleDateRangeChange(e, 'start')}
                  placeholder="Start Date"
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''} 
                  onChange={(e) => handleDateRangeChange(e, 'end')}
                  placeholder="End Date"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label><Users size={16} /> User/Email</label>
              <input 
                type="text" 
                value={userFilter} 
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter by user or email"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label><ArrowUpDown size={16} /> Direction</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="direction-incoming" 
                    checked={directionFilters.includes("Incoming")}
                    onChange={() => toggleDirectionFilter("Incoming")}
                  />
                  <label htmlFor="direction-incoming">Incoming</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="direction-outgoing" 
                    checked={directionFilters.includes("Outgoing")}
                    onChange={() => toggleDirectionFilter("Outgoing")}
                  />
                  <label htmlFor="direction-outgoing">Outgoing</label>
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <label><Tag size={16} /> Tags/Labels</label>
              <div className="checkbox-group">
                {["INBOX", "SENT", "IMPORTANT", "STARRED", "SPAM"].map(tag => (
                  <div className="checkbox-item" key={tag}>
                    <input 
                      type="checkbox" 
                      id={`tag-${tag.toLowerCase()}`} 
                      checked={tagFilters.includes(tag)}
                      onChange={() => toggleTagFilter(tag)}
                    />
                    <label htmlFor={`tag-${tag.toLowerCase()}`}>{tag}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="apply-filters" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="reset-filters" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Active filters */}
      {(directionFilters.length > 0 || tagFilters.length > 0 || userFilter || (dateRange.start && dateRange.end)) && (
        <div className="active-filters-container">
          <span className="active-filters-label">Active Filters:</span>
          
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
          
          {userFilter && (
            <div className="active-filter-tag">
              User/Email: {userFilter}
              <X 
                size={14} 
                className="remove-filter" 
                onClick={() => setUserFilter("")} 
              />
            </div>
          )}
          
          {directionFilters.map(direction => (
            <div key={direction} className="active-filter-tag">
              Direction: {direction}
              <X 
                size={14} 
                className="remove-filter" 
                onClick={() => toggleDirectionFilter(direction)} 
              />
            </div>
          ))}
          
          {tagFilters.map(tag => (
            <div key={tag} className="active-filter-tag">
              Tag: {tag}
              <X 
                size={14} 
                className="remove-filter" 
                onClick={() => toggleTagFilter(tag)} 
              />
            </div>
          ))}
          
          <button className="clear-all-filters" onClick={resetFilters}>
            Clear All
          </button>
        </div>
      )}

      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Emails</h3>
          <p className="summary-value">{reportStats.totalEmails}</p>
        </div>
        <div className="summary-card">
          <h3>Inbound</h3>
          <p className="summary-value">{reportStats.inbound}</p>
        </div>
        <div className="summary-card">
          <h3>Outbound</h3>
          <p className="summary-value">{reportStats.outbound}</p>
        </div>
        <div className="summary-card">
          <h3>Unread</h3>
          <p className="summary-value">{reportStats.unread}</p>
        </div>
        <div className="summary-card">
          <h3>With Attachments</h3>
          <p className="summary-value">{reportStats.withAttachments}</p>
        </div>
        <div className="summary-card">
          <h3>Response Rate</h3>
          <p className="summary-value">{reportStats.responseRate}%</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Emails Per Day</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={emailsPerDay}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" name="Inbound" fill="#4a6cf7" />
                <Bar dataKey="outbound" name="Outbound" fill="#6c757d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>User Activity</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userActivity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Starred vs Unstarred</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={starredBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#FFD700" /> {/* Gold for Starred */}
                  <Cell fill="#6c757d" /> {/* Gray for Unstarred */}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Label Breakdown</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={labelBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {labelBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tables-container">
        <div className="table-card">
          <h3>Top Users</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {userActivity.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.value}</td>
                  <td>{((user.value / reportStats.totalEmails) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="export-section">
        <h3>Export Report</h3>
        <p>Export the current filtered data in your preferred format.</p>
        <button className="export-button" onClick={handleExport}>
          <Download size={16} />
          Export as {exportFormat.toUpperCase()}
        </button>
      </div>
    </div>
  )
}

export default Reports

