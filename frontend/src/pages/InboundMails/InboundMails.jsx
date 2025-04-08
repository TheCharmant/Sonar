"use client"

import { useState } from "react"
import { Search, ArrowDownAZ, CheckCircle, Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import "./InboundMails.css"

const InboundMails = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAll, setSelectedAll] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [sortOption, setSortOption] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const inboundMails = [
    {
      sender: "Jacob Davis",
      subject: "Memorandum",
      status: "Read",
      dateSent: "23/04/2021",
      preview: "Dolore do adipisici",
    },
    {
      sender: "Angel Gomez",
      subject: "Official Letter",
      status: "Read",
      dateSent: "12/11/2020",
      preview: "Ea amet Lorem eu",
    },
    {
      sender: "Christopher Brown",
      subject: "Compliance Notice",
      status: "Read",
      dateSent: "14/07/2024",
      preview: "Laborum est ulla",
    },
    {
      sender: "Jessica Gonzalez",
      subject: "Audit Summary",
      status: "Read",
      dateSent: "14/05/2021",
      preview: "Labore minim ut o",
    },
    {
      sender: "Sarah Walker",
      subject: "Request for Information",
      status: "Read",
      dateSent: "02/10/2022",
      preview: "Lorem consecteteu",
    },
    {
      sender: "Ryan Young",
      subject: "Formal Complaint",
      status: "Unread",
      dateSent: "03/08/2023",
      preview: "Ex sint fugiat quis",
    },
    {
      sender: "Anthony Taylor",
      subject: "Incident Report",
      status: "Unread",
      dateSent: "19/06/2021",
      preview: "Culpa minim sunt",
    },
    {
      sender: "Justin Martinez",
      subject: "Legal Notice",
      status: "Unread",
      dateSent: "19/01/2023",
      preview: "Ut sunt aliquip ex",
    },
    {
      sender: "John Davis",
      subject: "Employee Notice",
      status: "Unread",
      dateSent: "09/11/2020",
      preview: "In ut id do occaeca",
    },
  ]

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll)
  }

  const handleSortSelect = (option) => {
    setSortOption(option)
    setShowSortDropdown(false)
  }

  const handleStatusSelect = (status) => {
    setStatusFilter(status)
    setShowStatusDropdown(false)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setShowDateDropdown(false)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const monthName = currentMonth.toLocaleString("default", { month: "long" })

    const days = []
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    // Add day headers
    dayNames.forEach((day) => {
      days.push(
        <div key={`header-${day}`} className="calendar-day-header">
          {day}
        </div>,
      )
    })

    // Add empty days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day other-month"></div>)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isSelected = selectedDate && selectedDate.getTime() === date.getTime()
      const isToday = new Date().toDateString() === date.toDateString()
      days.push(
        <div
          key={i}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
          onClick={() => handleDateSelect(date)}
        >
          {i}
        </div>,
      )
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <div className="calendar-title">
              {monthName} {year}
            </div>
            <button onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="calendar-grid">{days}</div>
      </div>
    )
  }

  return (
    <div className="inbound-mails-container">
      <h1>Inbound Mails</h1>

      <div className="mails-actions">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter">
            <button className="filter-button" onClick={() => setShowSortDropdown(!showSortDropdown)}>
              <div className="filter-label">
                <ArrowDownAZ size={18} />
                <span>Sort</span>
              </div>
              <ChevronDown size={16} />
            </button>
            {showSortDropdown && (
              <div className="filter-dropdown">
                <div className="filter-option" onClick={() => handleSortSelect("asc")}>
                  Ascending
                </div>
                <div className="filter-option" onClick={() => handleSortSelect("desc")}>
                  Descending
                </div>
              </div>
            )}
          </div>

          <div className="filter">
            <button className="filter-button" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
              <div className="filter-label">
                <CheckCircle size={18} />
                <span>Status</span>
              </div>
              <ChevronDown size={16} />
            </button>
            {showStatusDropdown && (
              <div className="filter-dropdown">
                <div className="filter-option" onClick={() => handleStatusSelect("read")}>
                  Read
                </div>
                <div className="filter-option" onClick={() => handleStatusSelect("unread")}>
                  Unread
                </div>
              </div>
            )}
          </div>

          <div className="filter">
            <button className="filter-button" onClick={() => setShowDateDropdown(!showDateDropdown)}>
              <div className="filter-label">
                <Calendar size={18} />
                <span>Date Range</span>
              </div>
              <ChevronDown size={16} />
            </button>
            {showDateDropdown && <div className="filter-dropdown calendar-dropdown">{renderCalendar()}</div>}
          </div>
        </div>
      </div>

      <div className="select-all-container">
        <input type="checkbox" id="selectAll" checked={selectedAll} onChange={handleSelectAll} />
        <label htmlFor="selectAll">Select All</label>
      </div>

      <div className="mails-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date Sent</th>
              <th>Message Preview</th>
            </tr>
          </thead>
          <tbody>
            {inboundMails.map((mail, index) => (
              <tr key={index} className={mail.status === "Unread" ? "unread" : ""}>
                <td>{mail.sender}</td>
                <td>{mail.subject}</td>
                <td>
                  <span className={`status-badge ${mail.status.toLowerCase()}`}>{mail.status}</span>
                </td>
                <td>{mail.dateSent}</td>
                <td>{mail.preview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InboundMails

