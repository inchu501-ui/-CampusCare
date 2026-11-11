require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const committeeRoutes = require("./routes/committeeRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
    res.send("CampusCare Backend is Running!");
});

app.get("/test-db", (req, res) => {
    db.query("SELECT * FROM categories", (err, results) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.json(results);
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);
//complaint routes
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/committee", committeeRoutes);
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on http://localhost:5000");
});