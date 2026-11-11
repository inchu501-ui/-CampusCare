import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Clock,
  CheckCircle2, AlertCircle, LogOut, RefreshCw,
  Users
} from "lucide-react";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionHours: 0
  });

  const [complaints, setComplaints] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [selectedCommittees, setSelectedCommittees] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});
const [remarks, setRemarks] = useState({});

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [statsRes, complaintsRes, committeesRes] =
        await Promise.all([
          API.get("/api/admin/stats", config),
          API.get("/api/admin/complaints", config),
          API.get("/api/admin/committees", config)
        ]);

      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setCommittees(committeesRes.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (complaintId) => {
    const committeeId = selectedCommittees[complaintId];

    if (!committeeId) {
      setError("Please select a committee first.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/api/admin/assign/${complaintId}`,
        { committeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Complaint assigned successfully!");
      setError("");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
      setMessage("");
    }
  };
  const handleStatusUpdate = async (complaintId) => {
  const status = selectedStatuses[complaintId];
  const remark = remarks[complaintId];

  if (!status || !remark?.trim()) {
    setError("Select a status and enter remarks.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await API.put(
      `/api/admin/status/${complaintId}`,
      { status, remarks: remark },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("Complaint status updated successfully!");
    setError("");
    await fetchData();
  } catch (err) {
    setError(err.response?.data?.message || "Status update failed");
    setMessage("");
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-page">

      <aside className="admin-sidebar">
        <h2>✳ CampusCare</h2>
        <p className="admin-label">ADMIN PORTAL</p>

        <div className="admin-nav active">
          <LayoutDashboard size={18} /> Dashboard
        </div>

       

        <button className="admin-logout" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="admin-main">

        <header className="admin-header">
          <div>
            <span>OVERVIEW / ADMINISTRATION</span>
            <h1>Good day, Admin.</h1>
            <p>Monitor campus issues and their resolution.</p>
          </div>

          <button className="admin-refresh" onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {error && <p className="admin-error">{error}</p>}
        {message && <p className="admin-success">{message}</p>}

        <section className="admin-stats">

          <div className="admin-stat">
            <ClipboardList />
            <span>Total Complaints</span>
            <h2>{stats.total ?? 0}</h2>
          </div>

          <div className="admin-stat">
            <AlertCircle />
            <span>Pending</span>
            <h2>{stats.pending ?? 0}</h2>
          </div>

          <div className="admin-stat">
            <Clock />
            <span>In Progress</span>
            <h2>{stats.inProgress ?? 0}</h2>
          </div>

          <div className="admin-stat">
            <CheckCircle2 />
            <span>Resolved</span>
            <h2>{stats.resolved ?? 0}</h2>
          </div>

        </section>

        <section className="admin-resolution">
          <div>
            <span>AVERAGE RESOLUTION TIME</span>
            <h2>
              {stats.avgResolutionHours == null
                ? "N/A"
                : `${stats.avgResolutionHours} hours`}
            </h2>
            <p>Average time taken to resolve complaints.</p>
          </div>
          <Clock size={35} />
        </section>

        <section className="admin-table-section">
          <div className="admin-table-heading">
            <div>
              <h2>All Complaints</h2>
              <p>Recent reports submitted by students.</p>
            </div>
            <span>{complaints.length} Reports</span>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Student</th>
                  <th>Photo</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Committee</th>
                  <th>Action</th>
                  <th>Committee</th>
<th>Assignment</th>
<th>Status Update</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((item) => {
                  const matchingCommittees = committees.filter(
                    (c) => c.category_id === item.category_id
                  );

                  const currentCommittee = committees.find(
                    (c) => c.committee_name === item.committee_name
                  );

                  const selectedValue =
                    selectedCommittees[item.complaint_id] ??
                    currentCommittee?.committee_id?.toString() ?? "";

                  return (
                    <tr key={item.complaint_id}>
                      <td>{item.tracking_code}</td>
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
                      <td>{item.category_name}</td>
                      <td>{item.location}</td>
                      <td>{item.priority}</td>
                      <td>
                        <span className={`admin-status ${item.status.toLowerCase().replace(" ", "-")}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === "Resolved" ? (
                          item.committee_name || "Not assigned"
                        ) : (
                          <select
                            value={selectedValue}
                            onChange={(e) =>
                              setSelectedCommittees({
                                ...selectedCommittees,
                                [item.complaint_id]: e.target.value
                              })
                            }
                          >
                            <option value="">Select Committee</option>
                            {matchingCommittees.map((c) => (
                              <option
                                key={c.committee_id}
                                value={c.committee_id}
                              >
                                {c.committee_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        {item.status !== "Resolved" && (
                          <button
                            className="admin-assign-btn"
                            onClick={() => handleAssign(item.complaint_id)}
                          >
                            Assign
                          </button>
                        )}
                      </td>
                      <td>
  {item.status !== "Resolved" && item.status !== "Submitted" && (
    <div className="admin-update-controls">
      <select
        value={selectedStatuses[item.complaint_id] || ""}
        onChange={(e) =>
          setSelectedStatuses({
            ...selectedStatuses,
            [item.complaint_id]: e.target.value
          })
        }
      >
        <option value="">Update Status</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>

      <input
        type="text"
        placeholder="Enter remarks"
        value={remarks[item.complaint_id] || ""}
        onChange={(e) =>
          setRemarks({
            ...remarks,
            [item.complaint_id]: e.target.value
          })
        }
      />

      <button
        className="admin-assign-btn"
        onClick={() => handleStatusUpdate(item.complaint_id)}
      >
        Update
      </button>
    </div>
  )}
</td>
                    </tr>
                  );
                })}

                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="9">No complaints available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;