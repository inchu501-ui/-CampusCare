const express = require("express");
const crypto = require("crypto");
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();
// IMAGE UPLOAD CONFIGURATION
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + crypto.randomBytes(6).toString("hex") +
            path.extname(file.originalname).toLowerCase();

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

router.post("/", verifyToken, upload.single("photo"), async (req, res) => {
    const { category, location, description, priority } = req.body;
    const studentId = req.user.userId;
    const photoPath = req.file ? "/uploads/" + req.file.filename : null;

    if (!category || !location || !description || !priority) {
        return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!["Low", "Medium", "High"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
    }

    const connection = db.promise();

    try {
        await connection.beginTransaction();

        // Find category
        const [categories] = await connection.query(
            "SELECT category_id FROM categories WHERE category_name = ?",
            [category]
        );

        if (categories.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Invalid category" });
        }

        const categoryId = categories[0].category_id;

        // Check for unresolved duplicate complaints
        const [duplicates] = await connection.query(
            `SELECT complaint_id FROM complaints
             WHERE student_id = ?
             AND category_id = ?
             AND LOWER(location) = LOWER(?)
             AND status != 'Resolved'`,
            [studentId, categoryId, location.trim()]
        );

        if (duplicates.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: "You already have an unresolved complaint for this category and location."
            });
        }

        // Generate tracking ID
        const trackingCode =
            "CC-" + new Date().getFullYear() + "-" +
            crypto.randomBytes(3).toString("hex").toUpperCase();

        // Save complaint with photo path
        const [result] = await connection.query(
            `INSERT INTO complaints
             (tracking_code, student_id, category_id, location,
              description, priority, status, photo_path)
             VALUES (?, ?, ?, ?, ?, ?, 'Submitted', ?)`,
            [
                trackingCode,
                studentId,
                categoryId,
                location.trim(),
                description.trim(),
                priority,
                photoPath
            ]
        );

        // Add initial complaint history
        await connection.query(
            `INSERT INTO complaint_history
             (complaint_id, old_status, new_status, changed_by, remarks)
             VALUES (?, NULL, 'Submitted', ?, 'Complaint submitted')`,
            [result.insertId, studentId]
        );

        // Notify administrators
        await connection.query(
            `INSERT INTO notifications (user_id, complaint_id, message)
             SELECT user_id, ?, ? FROM users WHERE role = 'Admin'`,
            [result.insertId, `New complaint received: ${trackingCode}`]
        );

        await connection.commit();

        res.status(201).json({
            message: "Complaint submitted successfully",
            trackingCode
        });

    } catch (error) {
        await connection.rollback();
        console.error("Complaint submission error:", error);
        res.status(500).json({ message: "Failed to submit complaint" });
    }
});
// GET STUDENT COMPLAINTS AND DASHBOARD STATISTICS
router.get("/my", verifyToken, async (req, res) => {
    const studentId = req.user.userId;
    const connection = db.promise();

    try {
        // Fetch student's complaints
        const [complaints] = await connection.query(
            `SELECT c.complaint_id, c.tracking_code,
                    c.location, c.description, c.priority,
                    c.status, c.created_at,
                    cat.category_name
             FROM complaints c
             JOIN categories cat
             ON c.category_id = cat.category_id
             WHERE c.student_id = ?
             ORDER BY c.created_at DESC`,
            [studentId]
        );

        // Calculate dashboard statistics
       const [stats] = await connection.query(
    `SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status IN ('Submitted', 'Assigned')), 0) AS pending,
        COALESCE(SUM(status = 'In Progress'), 0) AS inProgress,
        COALESCE(SUM(status = 'Resolved'), 0) AS resolved
     FROM complaints
     WHERE student_id = ?`,
    [studentId]
);
        res.json({
            complaints,
            stats: stats[0]
        });

    } catch (error) {
        console.error("Fetch complaints error:", error);
        res.status(500).json({
            message: "Failed to fetch complaints"
        });
    }
});
// GET STUDENT NOTIFICATIONS
router.get("/notifications", verifyToken, async (req, res) => {
    try {
        const [notifications] = await db.promise().query(
            `SELECT notification_id, complaint_id, message, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json(notifications);
    } catch (error) {
        console.error("Fetch notifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});
module.exports = router;