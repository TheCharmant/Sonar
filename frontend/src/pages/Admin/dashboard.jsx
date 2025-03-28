import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import "../../styles/dashboard.css";

function AdminDashboard({ user, onLogout }) {
  const emailStats = {
    total: 300,
    pending: 12,
    completed: 283,
    overdue: 5,
  };

  const logs = [
    { time: "04:43 PM", date: "23/04/2021", user: "Jacob Davis", action: "Assigned email #E-2050 to Employee ID 789" },
    { time: "10:11 PM", date: "12/11/2020", user: "Angel Gomez", action: "Edited email #E-2045 (Updated Status: Pending → Completed)" },
    { time: "11:08 PM", date: "14/07/2024", user: "Christopher Brown", action: "Created new inbound email (Subject: Client Compliance Inquiry)" },
    { time: "07:03 PM", date: "14/05/2021", user: "Jessica Gonzalez", action: "Deleted outbound email #E-2032" },
    { time: "12:15 AM", date: "02/10/2022", user: "Sarah Walker", action: "Generated email compliance report for February 2025" },
    { time: "02:01 PM", date: "03/08/2023", user: "Ryan Young", action: "Updated email #E-2028 (Changed recipient from John Doe → Jane Smith)" },
    { time: "02:31 AM", date: "19/06/2021", user: "Anthony Taylor", action: "Forwarded email #E-2020 to Legal Department" },
    { time: "07:20 AM", date: "19/01/2023", user: "Justin Martinez", action: "Bulk imported 50 emails from HR Compliance Team" },
    { time: "03:08 AM", date: "09/11/2020", user: "John Davis", action: "Tagged email #E-2015 as High Priority" },
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar onLogout={onLogout} />

        <div className="top-section">
          <h2>Dashboard</h2>
          <div className="buttons">
            <button className="btn primary">NEW EMAIL COMMUNICATION</button>
            <button className="btn secondary">GENERATE EMAIL REPORT</button>
          </div>
        </div>

        <div className="stats-cards">
          <Card title="Total Emails">
            <h1>{emailStats.total}</h1>
          </Card>
          <Card title="Pending">
            <h2>{emailStats.pending}</h2>
            <a href="#">See All</a>
          </Card>
          <Card title="Completed">
            <h2>{emailStats.completed}</h2>
            <a href="#">See All</a>
          </Card>
          <Card title="Overdue">
            <h2>{emailStats.overdue}</h2>
            <a href="#">See All</a>
          </Card>
        </div>

        <div className="logs-section">
          <h3>Recent Logs</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
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
    </div>
  );
}

export default AdminDashboard;