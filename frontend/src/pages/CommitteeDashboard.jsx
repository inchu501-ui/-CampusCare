import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, History, LogOut,
  Search, Bell, CheckCircle2, Clock3, AlertCircle,
  Menu, RefreshCw
} from "lucide-react";
import API from "../services/api";

function CommitteeDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [history, setHistory] = useState([]);
const [showHistory, setShowHistory] = useState(false);
  const [remarks, setRemarks] = useState({});
  const [statuses, setStatuses] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/api/committee/complaints", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(res.data);
      setError("");
    } catch (err) {
      setError("Unable to load assigned complaints.");
    } finally {
      setLoading(false);
    }
  };
  const fetchHistory = async () => {
  try {
    const response = await API.get("/api/committee/history");
    setHistory(response.data);
  } catch (error) {
    console.error("Failed to fetch complaint history", error);
  }
};

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdate = async (id) => {
    const status = statuses[id];
    const remark = remarks[id];

    if (!status || !remark?.trim()) {
      setError("Please select a status and enter remarks.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/api/committee/status/${id}`,
        { status, remarks: remark },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Complaint updated successfully!");
      setError("");

      setStatuses(prev => ({ ...prev, [id]: "" }));
      setRemarks(prev => ({ ...prev, [id]: "" }));

      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
      setMessage("");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const progress = complaints.filter(c => c.status === "In Progress").length;
  const pending = total - resolved - progress;

  const filteredComplaints = complaints.filter(item => {
    const matchesSearch =
      `${item.tracking_code} ${item.student_name} ${item.category_name} ${item.location}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Pending" &&
        item.status !== "In Progress" && item.status !== "Resolved") ||
      item.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="cc-layout">

      {/* SIDEBAR */}
      <aside className={`cc-sidebar ${menuOpen ? "cc-sidebar-open" : ""}`}>
        <div className="cc-brand">
          <div className="cc-brand-icon">C</div>
          <div>
            <h2>CampusCare</h2>
            <span>OPERATIONS HUB</span>
          </div>
        </div>

        <p className="cc-nav-label">WORKSPACE</p>

      <button
  className={`cc-nav-item ${!showHistory ? "active" : ""}`}
  onClick={() => {
    setShowHistory(false);
    setMenuOpen(false);
  }}
>
  <LayoutDashboard size={19} />
  Overview
</button>

        <button
          className="cc-nav-item"
          onClick={() => {
            setShowHistory(false);
            setFilter("All");
            setMenuOpen(false);
            document.getElementById("cc-complaints")?.scrollIntoView({
              behavior: "smooth"
            });
          }}
        >
          <ClipboardList size={19} />
          My Complaints
        </button>

       <button
  className={`cc-nav-item ${showHistory ? "active" : ""}`}
  onClick={() => {
    setShowHistory(true);
    fetchHistory();
    setMenuOpen(false);
  }}
>
  <History size={19} />
  Complaint History
</button>

        <div className="cc-sidebar-bottom">
          <div className="cc-profile">
            <div className="cc-avatar">
              {(user.name || "C").charAt(0).toUpperCase()}
            </div>
            <div className="cc-profile-info">
              <strong>{user.name || "Committee Member"}</strong>
              <span>Committee Member</span>
            </div>
          </div>

          <button className="cc-logout" onClick={logout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="cc-main">

        <header className="cc-topbar">
          <button
            className="cc-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={22} />
          </button>

          <span className="cc-breadcrumb">Workspace / Overview</span>

          <div className="cc-top-actions">
            <span className="cc-online">
              <span></span> Online
            </span>
            <div className="cc-notification">
              <Bell size={19} />
            </div>
          </div>
        </header>

        <section className="cc-content">

          <div className="cc-welcome">
            <div>
              <span className="cc-eyebrow">COMMITTEE WORKSPACE</span>
              <h1>Good to see you, {user.name?.split(" ")[0] || "Member"}!</h1>
              <p>Here's an overview of your assigned campus issues.</p>
            </div>

            <button className="cc-refresh" onClick={fetchComplaints}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* STATISTICS */}
{!showHistory && (
  <div className="cc-stats">
            <div className="cc-stat-card">
              <div className="cc-stat-top">
                <span>Total Assigned</span>
                <div className="cc-stat-icon green">
                  <ClipboardList size={20} />
                </div>
              </div>
              <h2>{total}</h2>
              <p>Complaints received</p>
            </div>

            <div className="cc-stat-card">
              <div className="cc-stat-top">
                <span>Pending</span>
                <div className="cc-stat-icon orange">
                  <AlertCircle size={20} />
                </div>
              </div>
              <h2>{pending}</h2>
              <p>Awaiting action</p>
            </div>

            <div className="cc-stat-card">
              <div className="cc-stat-top">
                <span>In Progress</span>
                <div className="cc-stat-icon blue">
                  <Clock3 size={20} />
                </div>
              </div>
              <h2>{progress}</h2>
              <p>Currently being handled</p>
            </div>

            <div className="cc-stat-card">
              <div className="cc-stat-top">
                <span>Resolved</span>
                <div className="cc-stat-icon lime">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <h2>{resolved}</h2>
              <p>Successfully completed</p>
            </div>

  </div>
)}          {/* COMPLAINT HISTORY */}
{showHistory && (
  <section className="cc-complaints">
    <div className="cc-section-heading">
      <div>
        <span className="cc-eyebrow">RECORDS & ACTIVITY</span>
        <h2>Complaint History</h2>
        <p>Track all status updates made to your assigned complaints.</p>
      </div>
      <span className="cc-count">{history.length} Records</span>
    </div>

    {history.length === 0 ? (
      <div className="cc-empty">
        <History size={35} />
        <h3>No history available</h3>
        <p>Updates to your assigned complaints will appear here.</p>
      </div>
    ) : (
      <div className="cc-table-wrapper">
        <table className="cc-table">
          <thead>
            <tr>
              <th>COMPLAINT ID</th>
              <th>STATUS CHANGE</th>
              <th>REMARKS</th>
              <th>UPDATED BY</th>
              <th>DATE & TIME</th>
            </tr>
          </thead>

          <tbody>
            {history.map(item => (
              <tr key={item.history_id}>
                <td>
                  <strong>{item.tracking_code}</strong>
                  <span className="cc-description">
                    {item.category_name}
                  </span>
                </td>

                <td>
                  {item.old_status || "New"} → {item.new_status}
                </td>

                <td>{item.remarks || "No remarks"}</td>

                <td>{item.changed_by_name || "Unknown"}</td>

                <td>
                  {new Date(item.changed_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}
{!showHistory && (
  <>

          {/* PROGRESS */}
          <div className="cc-progress-card">
            <div>
              <h3>Resolution Overview</h3>
              <p>Your committee's complaint resolution progress</p>
            </div>

            <div className="cc-progress-info">
              <strong>
                {total ? Math.round((resolved / total) * 100) : 0}%
              </strong>
              <span>Resolved</span>
            </div>

            <div className="cc-progress-track">
              <div
                className="cc-progress-fill"
                style={{
                  width: `${total ? (resolved / total) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          {/* COMPLAINTS */}
          <section className="cc-complaints" id="cc-complaints">

            <div className="cc-section-heading">
              <div>
                <span className="cc-eyebrow">TASK MANAGEMENT</span>
                <h2>Assigned Complaints</h2>
                <p>Review and manage issues assigned to your committee.</p>
              </div>
              <span className="cc-count">{total} Total</span>
            </div>

            {message && <div className="cc-message">{message}</div>}
            {error && <div className="cc-error">{error}</div>}

            <div className="cc-table-toolbar">
              <div className="cc-search">
                <Search size={18} />
                <input
                  placeholder="Search complaints..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="cc-filter"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="All">All Complaints</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {loading ? (
              <p className="cc-empty">Loading complaints...</p>
            ) : filteredComplaints.length === 0 ? (
              <div className="cc-empty">
                <ClipboardList size={35} />
                <h3>No complaints found</h3>
                <p>Try changing your search or filter.</p>
              </div>
            ) : (

              <div className="cc-table-wrapper">
                <table className="cc-table">
                  <thead>
                    <tr>
                     <th>COMPLAINT</th>
<th>STUDENT</th>
<th>PHOTO</th>
<th>LOCATION</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>UPDATE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredComplaints.map(item => (
                      <tr key={item.complaint_id}>
                        <td>
                          <strong>{item.tracking_code}</strong>
                          <span className="cc-description">
                            {item.category_name} · {item.description}
                          </span>
                        </td>

                       <td>{item.student_name}</td>

<td>
  {item.photo_path ? (
    <a
      href={`http://localhost:5000${item.photo_path}`}
      target="_blank"
      rel="noreferrer"
    >
      View Photo
    </a>
  ) : (
    "No Photo"
  )}
</td>

<td>{item.location}</td>

                        <td>
                          <span className={`cc-priority ${String(item.priority).toLowerCase()}`}>
                            {item.priority}
                          </span>
                        </td>

                        <td>
                          <span className={`cc-status ${item.status === "Resolved" ? "resolved" : item.status === "In Progress" ? "progress" : "pending"}`}>
                            {item.status}
                          </span>
                        </td>

                        <td>
                          {item.status !== "Resolved" ? (
                            <div className="cc-update-box">
                              <select
                                value={statuses[item.complaint_id] || ""}
                                onChange={e =>
                                  setStatuses(prev => ({
                                    ...prev,
                                    [item.complaint_id]: e.target.value
                                  }))
                                }
                              >
                                <option value="">Select status</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>

                              <input
                                placeholder="Resolution remarks"
                                value={remarks[item.complaint_id] || ""}
                                onChange={e =>
                                  setRemarks(prev => ({
                                    ...prev,
                                    [item.complaint_id]: e.target.value
                                  }))
                                }
                              />

                              <button onClick={() => handleUpdate(item.complaint_id)}>
                                Update
                              </button>
                            </div>
                          ) : (
                            <span className="cc-completed">Completed ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>
            </>
)}

          <footer className="cc-footer">
            CampusCare · Making campus better, one issue at a time.
          </footer>

        </section>
      </main>
    </div>
  );j
}

export default CommitteeDashboard;