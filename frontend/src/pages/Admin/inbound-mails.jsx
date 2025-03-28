"use client"

import { useState } from "react"
import Sidebar from "../../components/sidebar.jsx"
import { Search, Calendar, Mail, CheckCircle } from "lucide-react"

const InboundMails = () => {
  const [emailTypeOpen, setEmailTypeOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)

  const inboundMails = [
    {
      sender: "Jacob Davis",
      mailType: "Memorandum",
      deadline: "Dec 03, 2024",
      status: "Complete",
      dateSent: "23/04/2021",
    },
    {
      sender: "Angel Gomez",
      mailType: "Official Letter",
      deadline: "May 27, 2023",
      status: "Complete",
      dateSent: "12/11/2020",
    },
    {
      sender: "Christopher Brown",
      mailType: "Compliance Notice",
      deadline: "May 24, 2023",
      status: "Pending",
      dateSent: "14/07/2024",
    },
    {
      sender: "Jessica Gonzalez",
      mailType: "Audit Summary",
      deadline: "Dec 25, 2023",
      status: "Overdue",
      dateSent: "14/05/2021",
    },
    {
      sender: "Sarah Walker",
      mailType: "Request for Information",
      deadline: "Jul 05, 2022",
      status: "Complete",
      dateSent: "02/10/2022",
    },
    {
      sender: "Ryan Young",
      mailType: "Formal Complaint",
      deadline: "Jun 18, 2020",
      status: "Complete",
      dateSent: "03/08/2023",
    },
    {
      sender: "Anthony Taylor",
      mailType: "Incident Report",
      deadline: "Mar 08, 2022",
      status: "Overdue",
      dateSent: "19/06/2021",
    },
    {
      sender: "Justin Martinez",
      mailType: "Legal Notice",
      deadline: "Mar 10, 2024",
      status: "Pending",
      dateSent: "19/01/2023",
    },
    {
      sender: "John Davis",
      mailType: "Employee Notice",
      deadline: "Dec 27, 2023",
      status: "Complete",
      dateSent: "09/11/2020",
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Inbound Mails</h1>
            <div className="flex items-center">
              <input type="checkbox" id="selectAll" className="mr-2" />
              <label htmlFor="selectAll" className="text-sm">
                Select All
              </label>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <input type="text" placeholder="Search Name" className="w-full p-2 pl-10 border rounded-md" />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 border rounded-md bg-white"
                onClick={() => setEmailTypeOpen(!emailTypeOpen)}
              >
                <Mail className="h-5 w-5" />
                <span>Email Type</span>
                <span className="ml-2">▼</span>
              </button>
              {emailTypeOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">Memorandum</div>
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">Letter</div>
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">Notice</div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 border rounded-md bg-white"
                onClick={() => setStatusOpen(!statusOpen)}
              >
                <CheckCircle className="h-5 w-5" />
                <span>Status</span>
                <span className="ml-2">▼</span>
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">Completed</div>
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">Pending</div>
                  <div className="p-2 hover:bg-gray-100 cursor-pointer">Overdue</div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 border rounded-md bg-white"
                onClick={() => setDateRangeOpen(!dateRangeOpen)}
              >
                <Calendar className="h-5 w-5" />
                <span>Date Range</span>
                <span className="ml-2">▼</span>
              </button>
              {dateRangeOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="text-center font-medium mb-2">January 2022</h3>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      <div className="text-xs text-gray-500">Su</div>
                      <div className="text-xs text-gray-500">Mo</div>
                      <div className="text-xs text-gray-500">Tu</div>
                      <div className="text-xs text-gray-500">We</div>
                      <div className="text-xs text-gray-500">Th</div>
                      <div className="text-xs text-gray-500">Fr</div>
                      <div className="text-xs text-gray-500">Sa</div>

                      {/* Calendar days */}
                      {Array.from({ length: 31 }, (_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-200 rounded-full cursor-pointer"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Sender</th>
                  <th className="text-left p-4 font-medium text-gray-600">Mail Type</th>
                  <th className="text-left p-4 font-medium text-gray-600">Deadline</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Date Sent</th>
                  <th className="text-left p-4 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {inboundMails.map((mail, index) => (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="p-4">{mail.sender}</td>
                    <td className="p-4">{mail.mailType}</td>
                    <td className="p-4">{mail.deadline}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          mail.status === "Complete"
                            ? "bg-green-100 text-green-800"
                            : mail.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {mail.status}
                      </span>
                    </td>
                    <td className="p-4">{mail.dateSent}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <span className="text-sm">✏️ Update</span>
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <span className="text-sm">🗑️ Delete</span>
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <span className="text-sm">👤 Assign To Employee</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InboundMails
