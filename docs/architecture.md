# Attendance Analyzer — Project Architecture

## 1. Project Overview

The Attendance Analyzer is a beginner-friendly web application that helps an individual student analyze attendance across different subjects.

The student manually enters existing attendance data, including the total number of classes held and the number of classes attended. The application calculates attendance percentages, displays a dashboard, identifies low-attendance subjects, and provides useful attendance insights.

The main goal of this project is to learn full-stack development, teamwork, module integration, Git/GitHub collaboration, and software project coordination.

## 2. Project Goals

- Build a functional attendance analysis application.
- Learn how frontend, backend, database, and AI modules communicate.
- Practice independent development and collaborative integration.
- Maintain consistent documentation and code structure.
- Make the project easy for every team member to understand and run.

## 3. High-Level Architecture

The application consists of four main components.

### A. Frontend

Responsibility: User interface and user interactions.

The frontend will:

- Display the attendance dashboard.
- Allow the student to add, edit, view, and delete subjects.
- Provide forms for entering existing attendance data.
- Display attendance percentages and alerts.
- Request data from the backend using HTTP APIs.
- Display loading indicators and error messages.

### B. Backend

Responsibility: Business logic, validation, API handling, and database communication.

The backend will:

- Provide REST API endpoints.
- Validate incoming subject and attendance data.
- Perform attendance calculations.
- Read and write subject data in MySQL.
- Provide dashboard summary information.
- Coordinate requests to the AI module.
- Handle errors and return consistent API responses.

### C. Database

Technology: MySQL.

The database will store subject information and attendance totals.

The initial "subjects" table will contain:

- "id"
- "name"
- "classes_held"
- "classes_attended"
- "created_at"

The database structure will be defined in "database/init.sql", allowing each team member to create the same local schema.

### D. AI Module

Proposed technology: Python. FastAPI may be used if we decide to expose the AI module through an HTTP API.

The AI module will:

- Analyze attendance information.
- Identify subjects with low attendance.
- Generate attendance improvement insights.
- Return structured results to the backend.

For Version 1, we may begin with rule-based analysis. A machine learning model or external AI service is optional and will only be added if it supports our learning objectives.

## 4. Data Flow

The expected data flow is:

1. The student enters subject and attendance information in the frontend.
2. The frontend sends an HTTP request to the backend.
3. The backend validates the data.
4. The backend saves or updates the data in MySQL.
5. The backend calculates attendance percentages and prepares dashboard data.
6. When insights are requested, the backend passes the relevant data to the AI module.
7. The AI module returns structured insights.
8. The backend sends the result to the frontend.
9. The frontend displays the updated attendance information.

## 5. Initial Technology Stack

- Frontend: HTML, CSS, JavaScript.
- Backend: Node.js and Express.js.
- Database: MySQL.
- AI module: Python.
- Version control: Git and GitHub.
- API testing: Postman or equivalent tools.

The exact libraries and versions will be documented when finalized by the team.

## 6. Initial Folder Structure
```
attendance-analyzer/
├── docs/
│   ├── architecture.md
│   ├── setup-instructions.md
│   ├── features-v1.md
│   └── project-status.md
├── frontend/
├── backend/
├── ai-module/
├── database/
│   └── init.sql
├── .gitignore
└── README.md
```

This is the planned structure. Each module's internal files will be added as development begins.
## 7. Team Responsibilities

Frontend Developer

- Build the UI and dashboard.
- Implement subjec