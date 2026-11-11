import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Bell, ClipboardList,
    LogOut, Clock, ArrowLeft
} from "lucide-react";
import API from "../services/api";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await API.get("/api/complaints/notifications");
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "#f6f6ef",
            color: "#153d2e"
        }}>

            {/* SIDEBAR */}
            <aside className="sidebar">
                <h2>✳ CampusCare</h2>
                <p className="side-label">MENU</p>

                <Link to="/student-dashboard" className="side-link">
                    <LayoutDashboard size={19} /> Dashboard
                </Link>

                <Link to="/notifications" className="side-link active">
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
            <main style={{
                flex: 1,
                padding: "40px",
                minWidth: 0
            }}>

                <p style={{
                    color: "#718477",
                    fontSize: "17px",
                    marginBottom: "35px"
                }}>
                    Stay updated with your campus complaints.
                </p>

                {/* HEADER */}
                <div style={{
                    background: "#dcebc9",
                    borderRadius: "28px",
                    padding: "40px 50px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                    marginBottom: "45px"
                }}>
                    <div>
                        <p style={{
                            color: "#56805b",
                            letterSpacing: "3px",
                            fontWeight: "bold",
                            fontSize: "13px"
                        }}>
                            CAMPUSCARE UPDATES
                        </p>

                        <h1 style={{
                            fontSize: "36px",
                            margin: "15px 0",
                            color: "#123d2e"
                        }}>
                            Your Notifications
                        </h1>

                        <p style={{
                            fontSize: "17px",
                            color: "#62796b"
                        }}>
                            Every update brings your campus one step closer to better.
                        </p>
                    </div>

                    <div style={{
                        background: "#c5ed82",
                        padding: "25px",
                        borderRadius: "30px"
                    }}>
                        <Bell size={55} color="#174532" />
                    </div>
                </div>

                {/* NOTIFICATION HEADING */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "22px"
                }}>
                    <h2 style={{ fontSize: "25px" }}>
                        Recent Activity
                    </h2>

                    <span style={{
                        color: "#66816a",
                        fontSize: "13px",
                        letterSpacing: "1px"
                    }}>
                        {notifications.length} NOTIFICATIONS
                    </span>
                </div>

                {/* NOTIFICATIONS */}
                {loading ? (
                    <p>Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <div style={{
                        background: "white",
                        padding: "55px 20px",
                        borderRadius: "20px",
                        textAlign: "center",
                        border: "1px solid #e5e7dd"
                    }}>
                        <Bell size={45} color="#71945e" />
                        <h3>No notifications yet</h3>
                        <p style={{ color: "#829084" }}>
                            Updates about your complaints will appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gap: "16px"
                    }}>
                        {notifications.map((item) => (
                            <div key={item.notification_id} style={{
                                background: "white",
                                padding: "23px",
                                borderRadius: "18px",
                                border: "1px solid #e7e9df",
                                display: "flex",
                                gap: "18px",
                                alignItems: "center"
                            }}>
                                <div style={{
                                    background: "#e7f3d8",
                                    padding: "14px",
                                    borderRadius: "14px"
                                }}>
                                    <Bell size={23} color="#507b48" />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: "16px",
                                        marginBottom: "8px"
                                    }}>
                                        Complaint Update
                                    </h3>

                                    <p style={{
                                        color: "#65766a",
                                        lineHeight: "1.6"
                                    }}>
                                        {item.message}
                                    </p>

                                    <small style={{
                                        color: "#89958b",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        marginTop: "10px"
                                    }}>
                                        <Clock size={14} />
                                        {new Date(item.created_at).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => navigate("/student-dashboard")}
                    style={{
                        marginTop: "30px",
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "10px",
                        background: "#c5ed82",
                        color: "#153d2e",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <ArrowLeft size={17} /> Back to Dashboard
                </button>

            </main>
        </div>
    );
}

export default Notifications;