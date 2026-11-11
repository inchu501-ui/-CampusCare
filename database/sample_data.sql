
USE campus_issues;

-- 1. Insert Categories
INSERT INTO categories (category_name, description) VALUES
('Electrical', 'Fans, lights and electrical problems'),
('Plumbing', 'Water leakage and plumbing problems'),
('Cleaning', 'Washroom and campus cleanliness'),
('Furniture', 'Broken benches and desks'),
('Laboratory', 'Damaged laboratory equipment'),
('Wi-Fi', 'Internet and network issues');

-- 2. Insert Committees
INSERT INTO committees (committee_name, category_id) VALUES
('Electrical Committee', 1),
('Plumbing Committee', 2),
('Cleaning Committee', 3),
('Furniture Committee', 4),
('Laboratory Committee', 5),
('Network Committee', 6);

-- 3. Insert Admin
INSERT INTO users (name, email, password, role) VALUES
('Campus Admin', 'admin@campuscare.com',
 'admin123', 'Admin');

-- 4. Insert Committee Members
INSERT INTO users (name, email, password, role, committee_id) VALUES
('Electrical Member', 'electrical@campuscare.com', 'member123', 'Committee', 1),
('Plumbing Member', 'plumbing@campuscare.com', 'member123', 'Committee', 2),
('Cleaning Member', 'cleaning@campuscare.com', 'member123', 'Committee', 3),
('Furniture Member', 'furniture@campuscare.com', 'member123', 'Committee', 4),
('Lab Member', 'lab@campuscare.com', 'member123', 'Committee', 5),
('Network Member', 'network@campuscare.com', 'member123', 'Committee', 6);

-- 5. Insert Students
INSERT INTO users (name, email, password, role) VALUES
('Aarav', 'aarav@student.com', 'student123', 'Student'),
('Ananya', 'ananya@student.com', 'student123', 'Student'),
('Rahul', 'rahul@student.com', 'student123', 'Student'),
('Priya', 'priya@student.com', 'student123', 'Student'),
('Rohan', 'rohan@student.com', 'student123', 'Student');

-- 6. Insert Sample Complaints
INSERT INTO complaints
(tracking_code, student_id, category_id, committee_id,
 assigned_by, location, description, priority, status, resolved_at)
VALUES
('CC-2026-001', 8, 1, NULL, NULL,
 'Block A, Room 101', 'Ceiling fan is not working',
 'High', 'Submitted', NULL),

('CC-2026-002', 9, 2, 2, 1,
 'Block B, Washroom', 'Water leakage near the sink',
 'High', 'Assigned', NULL),

('CC-2026-003', 10, 3, 3, 1,
 'Main Building, Floor 1', 'Washroom requires cleaning',
 'Medium', 'In Progress', NULL),

('CC-2026-004', 11, 4, 4, 1,
 'Library, Second Floor', 'Broken study table',
 'Medium', 'Resolved', NOW()),

('CC-2026-005', 12, 6, NULL, NULL,
 'Block C, Classroom 202', 'Wi-Fi connection is unavailable',
 'Low', 'Submitted', NULL);

-- 7. Insert Complaint History
INSERT INTO complaint_history
(complaint_id, old_status, new_status, changed_by, remarks)
VALUES
(1, NULL, 'Submitted', 8, 'Complaint submitted'),
(2, NULL, 'Assigned', 1, 'Assigned to Plumbing Committee'),
(3, NULL, 'In Progress', 3, 'Repair work started'),
(4, NULL, 'Resolved', 4, 'Study table repaired'),
(5, NULL, 'Submitted', 12, 'Complaint submitted');

-- 8. Insert Notifications
INSERT INTO notifications
(user_id, complaint_id, message)
VALUES
(9, 2, 'Your complaint has been assigned'),
(10, 3, 'Your complaint is now in progress'),
(11, 4, 'Your complaint has been resolved');
