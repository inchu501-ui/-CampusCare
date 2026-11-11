import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import {
  LayoutDashboard, ClipboardList, Bell,
  User, LogOut, Clock,
  CheckCircle2, AlertCircle, ArrowUpRight
} from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
const [complaints, setComplaints] = useState([]);
const [stats, setStats] = useState({
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0
});
useEffect(() => {
  const fetchComplaints = async () => {
    try {
      const response = await API.get("/api/complaints/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setComplaints(response.data.complaints);
      setStats(response.data.stats);
    } catch (error) {
      console.log("Error fetching complaints:", error);
    }
  };

  fetchComplaints();
}, []);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="student-dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>✳ CampusCare</h2>
        <p className="side-label">MENU</p>

        <div className="side-link active">
          <LayoutDashboard size={19} /> Dashboard
        </div>

        

       <Link to="/notifications" className="side-link">
    <Bell size={19} /> Notifications
</Link>

       <Link to="/my-complaints" className="side-link">
  <ClipboardList size={19} /> My Complaints
</Link>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dash-header">
          <div>
            <span className="dash-date">STUDENT PORTAL / OVERVIEW</span>
            <h1>Good to see you, {user.name || "Student"}!</h1>
            <p>Let's make your campus a better place.</p>
          </div>

          <div className="profile-circle">
            <User size={22} />
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="welcome-banner">
          <div>
            <span>YOUR VOICE MATTERS</span>
            <h2>See a problem?<br />Let's get it fixed.</h2>
            <p>Report campus issues and keep track of every update.</p>
          </div>

          <div className="banner-icon">
            <ClipboardList size={65} />
          </div>
        </section>

        {/* STATISTICS */}
        <section className="stats-section">
          <div className="section-title">
            <h2>Complaint Overview</h2>
            <span>YOUR ACTIVITY</span>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <ClipboardList />
              <h2>{stats.total}</h2>
              <p>Total Complaints</p>
            </div>

            <div className="stat-card">
              <AlertCircle />
             <h2>{stats.pending}</h2>
              <p>Pending</p>
            </div>

            <div className="stat-card">
              <Clock />
              <h2>{stats.inProgress}</h2>
              <p>In Progress</p>
            </div>

            <div className="stat-card">
              <CheckCircle2 />
              <h2>{stats.resolved}</h2>
              <p>Resolved</p>
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="recent-section">
          <div className="section-title">
            <h2>Recent Complaints</h2>
            <span>YOUR REPORTS</span>
          </div>

          {complaints.length === 0 ? (
  <div className="empty-state">
    <ClipboardList size={35} />
    <h3>No complaints yet</h3>
    <p>Your submitted complaints will appear here.</p>
  </div>
) : (
  <div className="complaint-list">
    {complaints.map((item) => (
      <div className="stat-card" key={item.complaint_id}>
        <h3>{item.category_name}</h3>
        <p>{item.tracking_code}</p>
        <p>{item.location}</p>
        <p>Status: {item.status}</p>
        <p>Priority: {item.priority}</p>
      </div>
    ))}
  </div>
)}
        </section>

        {/* QUICK ACTION */}
        <section className="quick-action">
          <div>
            <h3>Something needs attention?</h3>
            <p>Every improvement begins with reporting a problem.</p>
          </div>
<Link to="/submit-complaint" className="quick-action-link">
  Report an issue <ArrowUpRight size={18} />
</Link>        </section>

      </main>
    </div>
  );
}

export default StudentDashboard;