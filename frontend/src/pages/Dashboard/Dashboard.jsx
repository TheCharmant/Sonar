import { Link } from "react-router-dom"
import "./Dashboard.css"

const Dashboard = () => {
  const recentLogs = [
    { time: "04:43 PM", date: "23/04/2021", user: "Jacob Davis", action: "Assigned email #E-2050 to Employee ID 789" },
    {
      time: "10:11 PM",
      date: "12/11/2020",
      user: "Angel Gomez",
      action: "Edited email #E-2045 (Updated Status: Pending → Completed)",
    },
    {
      time: "11:08 PM",
      date: "14/07/2024",
      user: "Christopher Brown",
      action: "Created new inbound email (Subject: Client Compliance Inquiry)",
    },
    { time: "07:03 PM", date: "14/05/2021", user: "Jessica Gonzalez", action: "Deleted outbound email #E-2032" },
    {
      time: "12:15 AM",
      date: "02/10/2022",
      user: "Sarah Walker",
      action: "Generated email compliance report for February 2025",
    },
    {
      time: "02:01 PM",
      date: "03/08/2023",
      user: "Ryan Young",
      action: "Updated email #E-2028 (Changed recipient from John Doe → Jane Smith)",
    },
    {
      time: "02:31 AM",
      date: "19/06/2021",
      user: "Anthony Taylor",
      action: "Forwarded email #E-2020 to Legal Department",
    },
    {
      time: "07:20 AM",
      date: "19/01/2023",
      user: "Justin Martinez",
      action: "Bulk imported 50 emails from HR Compliance Team",
    },
    { time: "03:08 AM", date: "09/11/2020", user: "John Davis", action: "Tagged email #E-2015 as High Priority" },
  ]

  return (
    <div className="dashboard-container">
      <button className="generate-report-button">GENERATE REPORT</button>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Emails</h3>
          <div className="stat-value">300</div>
        </div>

        <div className="stat-card">
          <h3>Read</h3>
          <div className="stat-value">12</div>
          <Link to="/inbound-mails" className="see-all">
            See All
          </Link>
        </div>

        <div className="stat-card">
          <h3>Unread</h3>
          <div className="stat-value">283</div>
          <Link to="/inbound-mails" className="see-all">
            See All
          </Link>
        </div>
      </div>

      <div className="recent-logs-container">
        <h2>Recent Logs</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.time}</td>
                <td>{log.date}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard

