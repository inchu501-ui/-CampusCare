
USE campus_issues;

-- 1. Categories
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. Committees
CREATE TABLE committees (
    committee_id INT AUTO_INCREMENT PRIMARY KEY,
    committee_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL UNIQUE,
    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
);

-- 3. Users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Admin', 'Committee') NOT NULL,
    committee_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (committee_id)
        REFERENCES committees(committee_id)
);

-- 4. Complaints
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_code VARCHAR(30) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    committee_id INT NULL,
    assigned_by INT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM(
        'Submitted',
        'Assigned',
        'In Progress',
        'Resolved'
    ) DEFAULT 'Submitted',
    photo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,

    FOREIGN KEY (student_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (committee_id) REFERENCES committees(committee_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id),

    INDEX idx_category_location_status
        (category_id, location, status),
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_student (student_id)
);

-- 5. Complaint History
CREATE TABLE complaint_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    old_status ENUM(
        'Submitted',
        'Assigned',
        'In Progress',
        'Resolved'
    ) NULL,
    new_status ENUM(
        'Submitted',
        'Assigned',
        'In Progress',
        'Resolved'
    ) NOT NULL,
    changed_by INT NOT NULL,
    remarks TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
);

-- 6. Notifications
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
);
