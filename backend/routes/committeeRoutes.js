const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// VIEW COMPLAINTS ASSIGNED TO THIS COMMITTEE
router.get("/complaints", verifyToken, allowRoles("Committee"), async (req, res) => {
    try {
        const [users] = await db.promise().query(
            "SELECT committee_id FROM users WHERE user_id = ? AND role = 'Committee'",
            [req.user.userId]
        );

        if (!users.length || !users[0].committee_id) {
            return res.status(403).json({
                message: "No committee is linked to this account."
            });
        }

        const [complaints] = await db.promise().query(
            `SELECT
                c.complaint_id,
                c.tracking_code,
                c.location,
                c.description,
                c.priority,
                c.status,
c.created_at,
c.photo_path,
cat.category_name,
                u.name AS student_name
             FROM complaints c
             JOIN categories cat ON c.category_id = cat.category_id
             JOIN users u ON c.student_id = u.user_id
             WHERE c.committee_id = ?
             ORDER BY c.created_at DESC`,
            [users[0].committee_id]
        );

        res.json(complaints);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch assigned complaints"
        });
    }
});


// UPDATE ASSIGNED COMPLAINT STATUS
router.put("/status/:id", verifyToken, allowRoles("Committee"), async (req, res) => {
    const { status, remarks } = req.body;
    const complaintId = req.params.id;

    try {
        const [users] = await db.promise().query(
            "SELECT committee_id FROM users WHERE user_id = ? AND role = 'Committee'",
            [req.user.userId]
        );

        if (!users.length || !users[0].committee_id) {
            return res.status(403).json({
                message: "No committee is linked to this account."
            });
        }

        const committeeId = users[0].committee_id;

        if (!["In Progress", "Resolved"].includes(status)) {
            return res.status(400).json({
                message: "Invalid complaint status"
            });
        }

        if (!remarks || !remarks.trim()) {
            return res.status(400).json({
                message: "Please enter remarks"
            });
        }

        const connection = db.promise();

        await connection.beginTransaction();

        const [complaints] = await connection.query(
            `SELECT student_id, status
             FROM complaints
             WHERE complaint_id = ? AND committee_id = ?`,
            [complaintId, committeeId]
        );

        if (!complaints.length) {
            await connection.rollback();
            return res.status(404).json({
                message: "Assigned complaint not found"
            });
        }

        const oldStatus = complaints[0].status;
        if (oldStatus === status) {
    await connection.rollback();
    return res.status(400).json({
        message: "Complaint is already in this status"
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
             WHERE complaint_id = ? AND committee_id = ?`,
            [status, complaintId, committeeId]
        );

        await connection.query(
            `INSERT INTO complaint_history
             (complaint_id, old_status, new_status, changed_by, remarks)
             VALUES (?, ?, ?, ?, ?)`,
            [complaintId, oldStatus, status, req.user.userId, remarks.trim()]
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

        res.json({
            message: "Complaint status updated successfully"
        });

    } catch (error) {
        await db.promise().rollback();
        console.error(error);
        res.status(500).json({
            message: "Failed to update complaint status"
        });
    }
});
// Get complaint history for the logged-in committee
router.get("/history", verifyToken, allowRoles("Committee"), async (req, res) => {    try {
        const [users] = await db.promise().query(
            "SELECT committee_id FROM users WHERE user_id = ? AND role = 'Committee'",
            [req.user.userId]
        );

        if (!users.length || !users[0].committee_id) {
            return res.status(403).json({
                message: "No committee is linked to this account."
            });
        }

        const committeeId = users[0].committee_id;

        const [history] = await db.promise().query(
            `SELECT
                h.history_id,
                h.complaint_id,
                c.tracking_code,
                cat.category_name,
                h.old_status,
                h.new_status,
                h.remarks,
                h.changed_at,
                u.name AS changed_by_name
             FROM complaint_history h
             JOIN complaints c
                ON h.complaint_id = c.complaint_id
             JOIN categories cat
                ON c.category_id = cat.category_id
             LEFT JOIN users u
                ON h.changed_by = u.user_id
             WHERE c.committee_id = ?
             ORDER BY h.changed_at DESC`,
            [committeeId]
        );

        res.json(history);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch complaint history"
        });
    }
});
module.exports = router;