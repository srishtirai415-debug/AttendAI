CREATE DATABASE IF NOT EXISTS attendance_analyzer;

USE attendance_analyzer;

CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    classes_held INT NOT NULL DEFAULT 0,
    classes_attended INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_classes_held
        CHECK (classes_held >= 0),

    CONSTRAINT chk_classes_attended
        CHECK (classes_attended >= 0),

    CONSTRAINT chk_attendance_count
        CHECK (classes_attended <= classes_held)
);