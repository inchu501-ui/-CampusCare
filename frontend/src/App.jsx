import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import Notifications from "./pages/Notifications";
function App() {
  return (
    <Routes>
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/committee-dashboard" element={<CommitteeDashboard />} />
      <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/notifications" element={<Notifications />} />

      <Route path="/submit-complaint" element={<SubmitComplaint />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;