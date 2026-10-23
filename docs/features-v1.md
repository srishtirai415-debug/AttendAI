# Attendance Analyzer — Version 1 Feature Specification

## 1. Project Overview

Attendance Analyzer is a web-based application that helps an individual student track subject-wise attendance, calculate attendance percentages, identify low-attendance subjects, and understand how many additional classes are needed to reach a target attendance percentage.

The primary goal of Version 1 is to build a functional application while learning frontend-backend integration, database management, API communication, and team collaboration.

## 2. Version 1 Objectives

- Allow students to enter and manage their attendance records.
- Display attendance percentages for individual subjects.
- Provide an overall attendance summary.
- Alert students when their attendance is below the target percentage.
- Calculate how many classes are required to reach a target attendance percentage.
- Provide basic attendance insights using rule-based logic.
- Maintain a consistent API contract between frontend, backend, and AI module.

## 3. Features Included in Version 1

### Feature 1: Subject Management

Description: Users can manage the subjects for which they want to track attendance.

Functional requirements:

- Add a subject.
- View all subjects.
- Edit a subject's name.
- Delete a subject.
- Store classes held and classes attended for each subject.

Validation rules:

- Subject name cannot be empty.
- Classes held and classes attended must be non-negative numbers.
- Classes attended cannot exceed classes held.

**Completion criteria:** A user can add, view, edit, and delete subjects, and valid changes are saved in the database.

### Feature 2: Attendance Entry

Description: Users can manually enter or update their existing attendance totals.

Required fields:

- Subject name.
- Total classes held.
- Total classes attended.

Attendance calculation:

> Attendance percentage = (Classes attended / Classes held) × 100.

If no classes have been held, the application should display "N/A" instead of dividing by zero.

**Completion criteria:** Valid attendance data is saved and the correct percentage is displayed.

### Feature 3: Dashboard

**Description**: The dashboard provides a quick overview of the student's attendance.

Dashboard components:

- Total number of subjects.
- Subject-wise attendance percentage.
- Classes held and classes attended for each subject.
- Overall attendance summary.
- Low-attendance subject indicators.

**Important:** The backend should calculate attendance values and provide them to the frontend through APIs.

**Completion criteria:** The dashboard displays updated information after attendance records change.

### Feature 4: Low-Attendance Alerts

**Description:** The application highlights subjects whose attendance is below the configured target.

Initial default target: 75%.

Expected behavior:

- Attendance below 75% should trigger a warning.
- Attendance at or above 75% should not trigger a low-attendance warning.
- Subjects with zero classes held should display an appropriate message instead of a misleading percentage.

Completion criteria: Alerts correctly reflect the latest attendance data.

### Feature 5: Attendance Target Calculator

**Description:** The calculator determines how many consecutive classes a student must attend to reach a target attendance percentage.

Example:

If a student has attended 18 out of 30 classes, their attendance is 60%.

To reach 75%, the student must attend the next 18 classes without missing any.

Formula:

Let:

- "A" = classes attended.
- "H" = total classes held.
- "T" = target attendance percentage expressed as a decimal.
**
Required additional classes:**

> "N = max(0, ceil((T × H - A) / (1 - T)))"

This formula assumes the target is less than 100%.

**Completion criteria**: The calculator returns the correct number of additional classes for valid inputs and handles invalid targets appropriately.

### Feature 6: Basic Attendance Insights

**Description:** The AI module provides simple, understandable attendance recommendations using rule-based logic.

Examples:

- "Your attendance is below the 75% target."
- "You need to attend the next 5 classes to reach.