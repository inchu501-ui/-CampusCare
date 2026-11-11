import { Link } from "react-router-dom";
import { ArrowLeft, User, Mail, LockKeyhole } from "lucide-react";
import API from "../services/api";
import { useState } from "react";
function Register() {
    const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await API.post("/api/auth/register", {
      name,
      email,
      password
    });

    setMessage(response.data.message);
    setName("");
    setEmail("");
    setPassword("");
  } catch (error) {
    setMessage(error.response?.data?.message || "Registration failed");
  }
};
  return (
    <div className="auth-page">
      <Link to="/" className="back-home">
        <ArrowLeft size={17} /> Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-icon">
          <User size={30} />
        </div>

        <h1>Create Account</h1>
        <p>Join your campus community.</p>
<form onSubmit={handleRegister}>
          <label>Full Name</label>
          <div className="auth-input">
            <User size={18} />
<input
  type="text"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>          </div>

          <label>Email Address</label>
          <div className="auth-input">
            <Mail size={18} />
<input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={18} />
<input
  type="password"
  placeholder="Create a password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>          </div>

          <button type="submit" className="auth-submit">
            Create Account →
          </button>
        </form>
        {message && <p>{message}</p>}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>

      <p className="auth-note">
        Join us in building a better campus.
      </p>
    </div>
  );
}

export default Register;