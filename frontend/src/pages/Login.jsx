import { Link, useNavigate } from "react-router-dom";import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import API from "../services/api";
import { useState } from "react";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [role, setRole] = useState("Student");
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await API.post("/api/auth/login", {
      email,
      password
    });
if (response.data.user.role !== role) {
    setMessage(`This account is not registered as ${role}.`);
    return;
}
  localStorage.setItem("token", response.data.token);
localStorage.setItem("user", JSON.stringify(response.data.user));

console.log("Saved token:", localStorage.getItem("token"));
console.log("Saved user:", localStorage.getItem("user"));

if (response.data.user.role === "Admin") {
    navigate("/admin-dashboard");
} else if (response.data.user.role === "Committee") {
    navigate("/committee-dashboard");
} else {
    navigate("/student-dashboard");
}  } catch (error) {
    setMessage(error.response?.data?.message || "Login failed");
  }
};
  return (
    <div className="auth-page">
      <Link to="/" className="back-home">
        <ArrowLeft size={17} /> Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-icon">
          <ShieldCheck size={30} />
        </div>

        <h1>Welcome back!</h1>
        <p>Sign in to continue to CampusCare.</p>

       <form onSubmit={handleLogin}>
        <div className="login-role-tabs">
  {["Student", "Admin", "Committee"].map((item) => (
    <button
      type="button"
      key={item}
      className={role === item ? "role-tab active" : "role-tab"}
      onClick={() => {
        setRole(item);
        setMessage("");
      }}
    >
      {item}
    </button>
  ))}
</div>
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
  placeholder="Enter your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>          </div>

          <button type="submit" className="auth-submit">
            Sign In →
          </button>
        </form>
{message && <p>{message}</p>}
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>

      <p className="auth-note">
        <ShieldCheck size={15} /> Secure access for your campus community
      </p>
    </div>
  );
}

export default Login;