import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Send } from "lucide-react";
import API from "../services/api";
function SubmitComplaint() {
  const [category, setCategory] = useState("Electrical");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("Submitting complaint...");

  try {
    const formData = new FormData();

    formData.append("category", category);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("priority", priority);

    if (photo) {
      formData.append("photo", photo);
    }

    const response = await API.post(
      "/api/complaints",
      formData
    );

    setSubmittedComplaint({
      trackingCode: response.data.trackingCode,
      category,
      location,
      description,
      priority
    });

    setMessage("");

    setLocation("");
    setDescription("");
    setPriority("Medium");
    setCategory("Electrical");
    setPhoto(null);

  } catch (error) {
    setMessage(
      error.response?.data?.message || "Something went wrong."
    );
  }
};
  return (
    <div className="complaint-page">
      <div className="complaint-container">

        <Link to="/student-dashboard" className="back-link">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="complaint-heading">
          <span>STUDENT PORTAL / NEW REPORT</span>
          <h1>Report an Issue</h1>
          <p>Tell us what's wrong. We'll help get it fixed.</p>
        </div>

        <form className="complaint-form" onSubmit={handleSubmit}>

          <label>Issue Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Electrical</option>
            <option>Plumbing</option>
            <option>Cleaning</option>
            <option>Furniture</option>
            <option>Laboratory</option>
            <option>Wi-Fi</option>
          </select>

          <label>Location</label>
          <input
            type="text"
            placeholder="Example: Block A, Room 204"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <label>Describe the Issue</label>
          <textarea
            placeholder="Explain the problem in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            required
          />

          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Attach Photo (Optional)</label>
          <div className="upload-box">
            <Upload size={24} />
            <p>{photo ? photo.name : "Choose an image of the issue"}</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </div>

          <button type="submit" className="submit-complaint-btn">
            Submit Complaint <Send size={17} />
          </button>

          {message && <p className="form-message">{message}</p>}

        </form>
        {submittedComplaint && (
  <div className="cc-success-card">
    <h2>✓ Complaint Submitted Successfully!</h2>
    <p>Your complaint has been registered.</p>

    <h3>{submittedComplaint.category} Issue</h3>
    <p>{submittedComplaint.description}</p>

    <p><strong>Location:</strong> {submittedComplaint.location}</p>
    <p><strong>Priority:</strong> {submittedComplaint.priority}</p>

    <div>
      <strong>Tracking ID:</strong>
      <h2>{submittedComplaint.trackingCode}</h2>
    </div>

    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(submittedComplaint.trackingCode)
      }
    >
      Copy Tracking ID
    </button>

    <Link to="/my-complaints">
      View My Complaints
    </Link>
  </div>
)}
      </div>
    </div>
  );
}

export default SubmitComplaint;