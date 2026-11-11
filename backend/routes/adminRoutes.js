
const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ADMIN DASHBOARD STATISTICS
router.get("/stats", verifyToken, allowRoles("Admin"), async (req, res) => {
    try {
        const [stats] = await db.promise().query(`
            SELECT
                COUNT(*) AS total,
                SUM(status IN ('Submitted', 'Assigned')) AS pending,
                SUM(status = 'In Progress') AS inProgress,
                SUM(status = 'Resolved') AS resolved,
                ROUND(AVG(
                    CASE
                        WHEN resolved_at IS NOT NULL
                        THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at)
                    END
                ), 1) AS avgResolutionHours
            FROM complaints
        `);

        res.json(stats[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch statistics" });
    }
});

// VIEW ALL COMPLAINTS
router.get("/complaints", verifyToken, allowRoles("Admin"), async (req, res) => {
    try {
        const [complaints] = await db.promise().query(`
            SELECT
                c.complaint_id,
                c.category_id,
                c.tracking_code,
                c.location,
                c.description,
                c.priority,
                c.status,
c.created_at,
c.photo_path,
                u.name AS student_name,
                cat.category_name,
                cm.committee_name
            FROM complaints c
            JOIN users u ON c.student_id = u.user_id
            JOIN categories cat ON c.category_id = cat.category_id
            LEFT JOIN committees cm ON c.committee_id = cm.committee_id
            ORDER BY c.created_at DESC
        `);

        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch complaints" });
    }
});

// GET ALL COMMITTEES
router.get("/committees", verifyToken, allowRoles("Admin"), async (req, res) => {
    try {
        const [committees] = await db.promise().query(`
            SELECT committee_id, committee_name, category_id
            FROM committees
            ORDER BY committee_name
        `);

        res.json(committees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch committees" });
    }
});

// ASSIGN COMPLAINT TO COMMITTEE
router.put("/assign/:id", verifyToken, allowRoles("Admin"), async (req, res) => {
    const { committeeId } = req.body;
    const complaintId = req.params.id;
    const adminId = req.user.userId;
    const connection = db.promise();

    if (!committeeId) {
        return res.status(400).json({ message: "Please select a committee" });
    }

    try {
        await connection.beginTransaction();

        const [complaints] = await connection.query(
            "SELECT category_id, status FROM complaints WHERE complaint_id = ?",
            [complaintId]
        );

        if (complaints.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaints[0].status === "Resolved") {
            await connection.rollback();
            return res.status(400).json({
                message: "Resolved complaints cannot be assigned"
            });
        }

        const [committees] = await connection.query(
            `SELECT committee_name FROM committees
             WHERE committee_id = ? AND category_id = ?`,
            [committeeId, complaints[0].category_id]
        );

        if (committees.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "Invalid committee for this complaint category"
            });
        }

        await connection.query(
            `UPDATE complaints
             SET committee_id = ?, assigned_by = ?, status = 'Assigned',
                 updated_at = NOW()
             WHERE complaint_id = ?`,
            [committeeId, adminId, complaintId]
        );

        await connection.query(
            `INSERT INTO complaint_history
             (complaint_id, old_status, new_status, changed_by, remarks)
             VALUES (?, ?, 'Assigned', ?, 'Complaint assigned to committee')`,
            [complaintId, complaints[0].status, adminId]
        );

        await connection.query(
            `INSERT INTO notifications (user_id, complaint_id, message)
             SELECT user_id, ?, ?
             FROM users
             WHERE role = 'Committee' AND committee_id = ?`,
            [
                complaintId,
                `New complaint assigned to ${committees[0].committee_name}`,
                committeeId
            ]
        );

        await connection.commit();

        res.json({ message: "Complaint assigned successfully" });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Failed to assign complaint" });
    }
});
// UPDATE COMPLAINT STATUS WITH REMARKS
router.put("/status/:id", verifyToken, allowRoles("Admin"), async (req, res) => {
    const { status, remarks } = req.body;
    const complaintId = req.params.id;
    const adminId = req.user.userId;
    const connection = db.promise();

    if (!["In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({
            message: "Invalid complaint status"
        });
    }

    if (!remarks || !remarks.trim()) {
        return res.status(400).json({
            message: "Please enter resolution remarks"
        });
    }

    try {
        await connection.beginTransaction();

        const [complaints] = await connection.query(
            "SELECT student_id, status FROM complaints WHERE complaint_id = ?",
            [complaintId]
        );

        if (complaints.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        const oldStatus = complaints[0].status;

        if (oldStatus === "Submitted") {
            await connection.rollback();
            return res.status(400).json({
                message: "Please assign the complaint before updating its status"
            });
        }

        if (oldStatus === "Resolved") {
            await connection.rollback();
            return res.status(400).json({
                message: "This complaint is already resolved"
            });
        }

        await connection.query(
            `UPDATE complaints
             SET status = ?,
                 updated_at = NOW(),
                 resolved_at = ${status === "Resolved" ? "NOW()" : "NULL"}
             WHERE complaint_id = ?`,
            [status, complaintId]
        );

        await connection.query(
            `INSERT INTO complaint_history
             (complaint_id, old_status, new_status, changed_by, remarks)
             VALUES (?, ?, ?, ?, ?)`,
            [complaintId, oldStatus, status, adminId, remarks.trim()]
        );

        await connection.query(
            `INSERT INTO notifications (user_id, complaint_id, message)
             VALUES (?, ?, ?)`,
            [
                complaints[0].student_id,
                complaintId,
                `Your complaint status has been updated to ${status}.`
            ]
        );

        await connection.commit();

        res.json({ message: "Complaint status updated successfully" });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({
            message: "Failed to update complaint status"
        });
    }
});

module.exports = router;
