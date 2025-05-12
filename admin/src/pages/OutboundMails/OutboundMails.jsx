"use client"

import { useState } from "react"
import { Search, ArrowDownAZ, CheckCircle, Calendar } from "lucide-react"
import "./OutboundMails.css"

const OutboundMails = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAll, setSelectedAll] = useState(false)

  const outboundMails = [
    {
      receiver: "Jacob Davis",
      subject: "Memorandum",
      status: "Read",
      dateReceived: "23/04/2021",
      preview: "Ipsum esse proide",
    },
    {
      receiver: "Angel Gomez",
      subject: "Official Letter",
      status: "Read",
      dateReceived: "12/11/2020",
      preview: "Voluptate proiden",
    },
    {
      receiver: "Christopher Brown",
      subject: "Compliance Notice",
      status: "Read",
      dateReceived: "14/07/2024",
      preview: "Commodo nulla et",
    },
    {
      receiver: "Jessica Gonzalez",
      subject: "Audit Summary",
      status: "Read",
      dateReceived: "14/05/2021",
      preview: "Reprehenderit ma",
    },
    {
      receiver: "Sarah Walker",
      subject: "Request for Information",
      status: "Read",
      dateReceived: "02/10/2022",
      preview: "Sint magna Lorem",
    },
    {
      receiver: "Ryan Young",
      subject: "Formal Complaint",
      status: "Unread",
      dateReceived: "03/08/2023",
      preview: "Id esse officia occ",
    },
    {
      receiver: "Anthony Taylor",
      subject: "Incident Report",
      status: "Unread",
      dateReceived: "19/06/2021",
      preview: "Laboris occaecat i",
    },
    {
      receiver: "Justin Martinez",
      subject: "Legal Notice",
      status: "Unread",
      dateReceived: "19/01/2023",
      preview: "Dolore laboris te",
    },
    {
      receiver: "John Davis",
      subject: "Employee Notice",
      status: "Unread",
      dateReceived: "09/11/2020",
      preview: "Excepteur et nulla",
    },
  ]

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll)
  }

  return (
    <div className="outbound-mails-container">
      <h1>Outbound Mails</h1>

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
              <th>Receiver</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date Received</th>
              <th>Message Preview</th>
            </tr>
          </thead>
          <tbody>
            {outboundMails.map((mail, index) => (
              <tr key={index} className={mail.status === "Unread" ? "unread" : ""}>
                <td>{mail.receiver}</td>
                <td>{mail.subject}</td>
                <td>
                  <span className={`status-badge ${mail.status.toLowerCase()}`}>{mail.status}</span>
                </td>
                <td>{mail.dateReceived}</td>
                <td>{mail.preview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OutboundMails

