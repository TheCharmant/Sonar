"use client"

import { useState } from "react"
import { Search, ArrowDownAZ, CheckCircle, Calendar } from "lucide-react"
import "./InboundMails.css"

const InboundMails = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAll, setSelectedAll] = useState(false)

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
            <ArrowDownAZ size={18} />
            <span>Sort</span>
          </div>

          <div className="filter">
            <CheckCircle size={18} />
            <span>Status</span>
          </div>

          <div className="filter">
            <Calendar size={18} />
            <span>Date Range</span>
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

