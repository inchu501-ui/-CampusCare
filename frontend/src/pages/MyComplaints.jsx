
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ClipboardList, MapPin,
  CalendarDays, AlertCircle, Search, CheckCircle2
} from "lucide-react";
import API from "../services/api";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
const [trackingId, setTrackingId] = useState("");
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await API.get("/api/complaints/my", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setComplaints(response.data.complaints);
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchComplaints();
  }, []);

 const filteredComplaints = complaints.filter((item) => {
  const matchesSearch =
    `${item.tracking_code} ${item.category_name} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    (statusFilter === "Pending" &&
      ["Submitted", "Assigned"].includes(item.status)) ||
    item.status === statusFilter;

const matchesTracking =
    !trackingId.trim() ||
    item.tracking_code.toLowerCase() === trackingId.trim().toLowerCase();

return matchesSearch && matchesStatus && matchesTracking;});

  return (
    <div className="my-complaints-page">
      <Link to="/student-dashboard" className="mc-back">
        <ArrowLeft size={17} /> Back to Dashboard
      </Link>

      <header className="mc-header">
        <div>
          <span className="mc-eyebrow">STUDENT PORTAL / REPORTS</span>
          <h1>My Complaints</h1>
          <p>Every report matters. Track your campus improvements here.</p>
        </div>
        <div className="mc-header-icon">
          <ClipboardList size={38} />
        </div>
      </header>

      <div className="mc-summary">
        <div>
          <span>Total Reports</span>
          <h2>{complaints.length}</h2>
        </div>
        <div>
          <span>Pending</span>
          <h2>{complaints.filter(c =>
            ["Submitted", "Assigned"].includes(c.status)
          ).length}</h2>
        </div>
        <div>
          <span>In Progress</span>
          <h2>{complaints.filter(c =>
            c.status === "In Progress"
          ).length}</h2>
        </div>
        <div>
          <span>Resolved</span>
          <h2>{complaints.filter(c =>
            c.status === "Resolved"
          ).length}</h2>
        </div>
      </div>
<div className="mc-impact">
  <div className="mc-impact-icon">
    <CheckCircle2 size={25} />
  </div>
  <div>
    <span>CAMPUS IMPACT</span>
    <h2>
      {complaints.filter(c => c.status === "Resolved").length}
      <small> issues resolved</small>
    </h2>
    <p>Every resolved report makes our campus better.</p>
  </div>
  <div className="mc-impact-decoration">✳</div>
</div>
<div className="mc-track-box">
  <div>
    <span className="mc-eyebrow">QUICK TRACKING</span>
    <h2>Track a Complaint</h2>
    <p>Enter your complaint ID to find its latest status.</p>
  </div>

  <div className="mc-track-input">
    <Search size={19} />
    <input
      type="text"
      placeholder="Enter Tracking ID (e.g. CC-2026-XXXXXX)"
      value={trackingId}
      onChange={(e) => setTrackingId(e.target.value)}
    />
  </div>
</div>
      <div className="mc-list-header">
        <div>
          <h2>All Reports</h2>
          <p>View and track your submitted complaints.</p>
        </div>
<div className="mc-filters">
  {["All", "Pending", "In Progress", "Resolved"].map((status) => (
    <button
      key={status}
      className={statusFilter === status ? "mc-filter active" : "mc-filter"}
      onClick={() => setStatusFilter(status)}
    >
      {status}
    </button>
  ))}
</div>
        <div className="mc-search">
          <Search size={18} />
          <input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="mc-empty">
          <ClipboardList size={38} />
          <h3>No complaints found</h3>
          <p>Try another search or submit a new complaint.</p>
        </div>
      ) : (
        <div className="mc-cards">
{filteredComplaints.map((item) => {
  const steps = ["Submitted", "Assigned", "In Progress", "Resolved"];
  const currentStep = steps.indexOf(item.status);

  return (            <div className="mc-card" key={item.complaint_id}>
              <div className="mc-card-top">
                <span className="mc-category">
                  {item.category_name}
                </span>
                <span className={`mc-status ${item.status.toLowerCase().replace(" ", "-")}`}>
                  {item.status === "Submitted" || item.status === "Assigned"
                    ? "Pending"
                    : item.status}
                </span>
              </div>
              <div className="mc-progress">
                {steps.map((step, index) => (
                  <div className="mc-progress-step" key={step}>
                    <div className={`mc-progress-dot ${
                      index <= currentStep ? "active" : ""
                    }`}>
                      {index + 1}
                    </div>
                    <span className={
                      index <= currentStep ? "active-label" : ""
                    }>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <h3>{item.tracking_code}</h3>
              <p className="mc-description">{item.description}</p>

              <div className="mc-details">
                <span><MapPin size={15} /> {item.location}</span>
                <span><CalendarDays size={15} />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span><AlertCircle size={15} />
                  {item.priority} Priority
                </span>
              </div>
                        </div>
          );
        })}
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
