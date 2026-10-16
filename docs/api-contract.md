# Attendance Analyzer — Frontend–Backend API Contract

**Version:** 1.0  
**Status:** Agreed API specification for V1  
**Backend:** Node.js + Express  
**Database:** MySQL  
**Frontend:** HTML, CSS, JavaScript

---

## 1. Purpose

This document defines how the frontend and backend communicate.

Both teams must follow the agreed endpoint URLs, request formats, response formats, validation rules, and error formats.

- Frontend developers must use the request and response formats defined here.
- Backend developers must implement the endpoints defined here.
- Neither team should change the API contract without informing the other team.
- The frontend must never connect directly to MySQL.
- All database operations must be performed by the backend.

## 2. Base URL and conventions

During local development:

`http://localhost:3000`

All API endpoints start with `/api`.

Example:

`GET http://localhost:3000/api/subjects`

### General rules

- Request and response data use JSON unless otherwise specified.
- JSON request bodies must use `Content-Type: application/json`.
- IDs are integers.
- Attendance counts are non-negative integers.
- Attendance percentage is returned as a number, rounded to two decimal places.
- The default low-attendance threshold is 75%.
- The API does not require authentication in V1.

## 3. API endpoint summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/subjects/:id` | Get one subject |
| POST | `/api/subjects` | Create a subject |
| PUT | `/api/subjects/:id` | Update a subject |
| DELETE | `/api/subjects/:id` | Delete a subject |
| GET | `/api/dashboard` | Get dashboard summary and subject attendance |
| POST | `/api/calculator` | Calculate classes needed to reach a target |
| POST | `/api/insights` | Generate rule-based attendance insights |

---

## 4. Subject data model

The `subjects` table uses the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | Integer | Auto-generated primary key |
| `name` | String | Subject name |
| `classes_held` | Integer | Total classes conducted |
| `classes_attended` | Integer | Classes attended by the student |
| `created_at` | Timestamp | Record creation time |

The API returns `id` and `created_at` as well as the subject fields.

### Attendance calculation

`attendance_percentage = (classes_attended / classes_held) * 100`

Rules:

- If `classes_held` is 0, attendance percentage is 0.
- If percentage is below 75%, the subject is considered low attendance.
- If percentage is exactly 75% or higher, the subject meets the default threshold.

---

## 5. Endpoint specifications

### 5.1 GET `/api/subjects`

**Purpose:** Retrieve all subjects for the subjects page or dashboard.

Request body: None.

Success status: `200 OK`

Example response:

```json
[
  {
    "id": 1,
    "name": "DBMS",
    "classes_held": 40,
    "classes_attended": 32,
    "created_at": "2026-10-15T10:00:00.000Z",
    "attendance_percentage": 80,
    "attendance_status": "safe"
  },
  {
    "id": 2,
    "name": "Java",
    "classes_held": 30,
    "classes_attended": 21,
    "created_at": "2026-10-15T10:05:00.000Z",
    "attendance_percentage": 70,
    "attendance_status": "low"
  }
]
```

## Actual response
```json
    {
  "msg": "Successfully done",
  "data": [
    {
      "id": 1,
      "name": "DBMS",
      "classes_held": 40,
      "classes_attended": 32,
      "created_at": "2026-10-15T10:55:58.000Z"
    },
    {
      "id": 2,
      "name": "Java",
      "classes_held": 30,
      "classes_attended": 21,
      "created_at": "2026-10-15T10:55:58.000Z"
    },
    {
      "id": 3,
      "name": "Data Structures",
      "classes_held": 25,
      "classes_attended": 20,
      "created_at": "2026-10-15T10:55:58.000Z"
    }
```

Notes:
- The example timestamps are illustrative.
- `attendance_percentage` and `attendance_status` are computed by the backend; they do not need to be stored in MySQL.
- An empty table returns `200 OK` with `[]`.

### 5.2 GET `/api/subjects/:id`

**Purpose:** Retrieve one subject by its ID.

Example request:

`GET /api/subjects/2`

Success status: `200 OK`

Example response:

```json
{
  "id": 2,
  "name": "Java",
  "classes_held": 30,
  "classes_attended": 21,
  "created_at": "2026-10-15T10:05:00.000Z",
  "attendance_percentage": 70,
  "attendance_status": "low"
}
```

## Actual response
```json
  {
  "msg": "Successfully",
  "data": {
    "id": 2,
    "name": "Java",
    "classes_held": 30,
    "classes_attended": 21,
    "created_at": "2026-10-15T10:55:58.000Z",
    "attendance_percentage": 70,
    "attendance_status": "low"
  }
}
```

If the subject does not exist, return `404 Not Found`.

### 5.3 POST `/api/subjects`

**Purpose:** Create a new subject.

Request headers:

`Content-Type: application/json`

Example request body:

```json
{
  "name": "Computer Networks",
  "classes_held": 20,
  "classes_attended": 17
}
```

Required fields:
- `name`
- `classes_held`
- `classes_attended`

Success status: `201 Created`

Example response:

```json
{
  "message": "Subject created successfully",
  "subject": {
    "id": 5,
    "name": "Computer Networks",
    "classes_held": 20,
    "classes_attended": 17,
    "attendance_percentage": 85,
    "attendance_status": "safe"
  }
}
```

The backend generates the ID and creation timestamp. The frontend must not send either field when creating a subject.

### 5.4 PUT `/api/subjects/:id`

**Purpose:** Update an existing subject.

Example request:

`PUT /api/subjects/5`

Request body:

```json
{
  "name": "Computer Networks",
  "classes_held": 25,
  "classes_attended": 19
}
```

All three fields are required for this V1 endpoint.

Success status: `200 OK`

Example response:

```json
{
  "message": "Subject updated successfully",
  "subject": {
    "id": 5,
    "name": "Computer Networks",
    "classes_held": 25,
    "classes_attended": 19,
    "attendance_percentage": 76,
    "attendance_status": "safe"
  }
}
```

If the subject does not exist, return `404 Not Found`.

### 5.5 DELETE `/api/subjects/:id`

**Purpose:** Delete a subject.

Example request:

`DELETE /api/subjects/5`

Request body: None.

Success status: `200 OK`

Example response:

```json
{
  "message": "Subject deleted successfully"
}
```

If the subject does not exist, return `404 Not Found`.

The frontend should ask the user to confirm before deleting a subject.

---

## 6. Dashboard API

### GET `/api/dashboard`

**Purpose:** Provide the data needed to render the dashboard.

Request body: None.

Success status: `200 OK`

Example response:

```json
{
  "summary": {
    "total_subjects": 8,
    "low_attendance_count": 4,
    "average_attendance_percentage": 74.91,
    "attendance_threshold": 75
  },
  "subjects": [
    {
      "id": 1,
      "name": "DBMS",
      "classes_held": 40,
      "classes_attended": 32,
      "attendance_percentage": 80,
      "attendance_status": "safe"
    },
    {
      "id": 2,
      "name": "Java",
      "classes_held": 30,
      "classes_attended": 21,
      "attendance_percentage": 70,
      "attendance_status": "low"
    }
  ]
}
```

Rules:

- `total_subjects` is the number of subject records.
- `low_attendance_count` counts subjects below 75%.
- `average_attendance_percentage` is the arithmetic average of the individual subject percentages, rounded to two decimals. Subjects with zero classes held count as 0%.
- `attendance_threshold` is 75.
- The response's `subjects` array contains all subjects, not just low-attendance subjects.
- If no subjects exist, counts and average are 0, and `subjects` is `[]`.

The frontend must not independently calculate a different dashboard summary.

---

## 7. Attendance calculator API

### POST `/api/calculator`

**Purpose:** Calculate how many consecutive classes the student must attend to reach a target percentage.

Request body:

```json
{
  "classes_held": 30,
  "classes_attended": 21,
  "target_percentage": 75
}
```

Success status: `200 OK`

Example response:

```json
{
  "current_percentage": 70,
  "target_percentage": 75,
  "classes_needed": 6,
  "message": "Attend the next 6 classes to reach the target."
}
```

Rules:

- `classes_held` and `classes_attended` must be non-negative integers.
- `classes_attended` cannot exceed `classes_held`.
- `target_percentage` must be greater than 0 and at most 100.
- If the current attendance already meets the target, `classes_needed` is 0.
- If the target is 100% and attendance is currently below 100%, return `classes_needed: null` and explain that a finite number of classes cannot reach exactly 100% unless all classes so far were attended.
- The calculation assumes every future class is attended.
- This endpoint calculates a result without modifying the database.

---

## 8. Rule-based insights API

### POST `/api/insights`

**Purpose:** Generate simple, explainable attendance recommendations.

Request body:

```json
{
  "attendance_threshold": 75
}
```

Success status: `200 OK`

Example response:

```json
{
  "insights": [
    {
      "subject_id": 2,
      "subject_name": "Java",
      "type": "low_attendance",
      "message": "Your attendance is 70%. It is below the 75% target."
    },
    {
      "subject_id": 4,
      "subject_name": "Operating Systems",
      "type": "improvement",
      "message": "Attend upcoming classes regularly to improve your attendance."
    }
  ]
}
```

Rules:

- The backend reads current subject records from MySQL.
- The initial implementation uses deterministic, rule-based logic.
- No machine-learning model is required for V1.
- If no subjects need attention, return an empty `insights` array.
- If `attendance_threshold` is omitted, use 75.
- If supplied, the threshold must be greater than 0 and at most 100.

---

## 9. Common error response format

All API errors must use the following JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Classes attended cannot exceed classes held."
  }
}
```

Common HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Record created |
| `400` | Invalid input |
| `404` | Subject or route not found |
| `500` | Unexpected server/database error |

Suggested error codes:

- `VALIDATION_ERROR`
- `SUBJECT_NOT_FOUND`
- `DATABASE_ERROR`
- `INTERNAL_SERVER_ERROR`

Do not return database passwords, SQL credentials, stack traces, or other sensitive implementation details to the frontend.

For invalid input, return `400 Bad Request`.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Classes attended cannot exceed classes held."
  }
}
```

---

## 10. Validation rules

The backend must validate all incoming data, even if the frontend already validates it.

1. `name` must be a non-empty string after trimming whitespace.
2. `classes_held` must be a non-negative integer.
3. `classes_attended` must be a non-negative integer.
4. `classes_attended` must not exceed `classes_held`.
5. Subject IDs must be valid positive integers.
6. Unknown or malformed request data must not cause a server crash.
7. SQL queries with user-supplied values must use parameterized queries.
8. Invalid requests must not modify database records.

---

## 11. Frontend responsibilities

The frontend team must:

- Call the endpoints listed in this document.
- Use `fetch()` to communicate with the backend.
- Send JSON request bodies for POST and PUT.
- Display loading states while requests are in progress.
- Display a useful error message if a request fails.
- Refresh relevant UI data after successful create, update, or delete operations.
- Render data returned by the backend instead of hardcoding sample attendance.
- Never access MySQL directly or expose database credentials.

Example:

```javascript
async function loadSubjects() {
    try {
        const response = await fetch("/api/subjects");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Failed to load subjects"
            );
        }

        console.log(data);
        // Render the returned subjects in the UI.
    } catch (error) {
        console.error(error.message);
        // Show an error message to the user.
    }
}

loadSubjects();
```

---

## 12. Backend responsibilities

The backend team must:

- Implement every agreed endpoint.
- Connect to MySQL using environment variables.
- Validate request bodies and route parameters.
- Execute parameterized SQL queries.
- Calculate attendance percentages and status consistently.
- Return the agreed JSON response structures.
- Use appropriate HTTP status codes.
- Handle empty tables, missing subjects, and database errors.
- Never expose `.env` secrets in API responses.
- Keep the frontend API contract unchanged unless the team agrees to a revision.

---

## 13. Team integration and testing

Before integration, both teams should test the contract with the following cases:

- Fetch subjects when the table is empty.
- Fetch subjects when records exist.
- Create a valid subject.
- Reject invalid attendance counts.
- Update an existing subject.
- Return 404 for a nonexistent subject.
- Delete an existing subject.
- Calculate attendance when the target is already met.
- Calculate attendance when the target is not met.
- Generate low-attendance insights.
- Handle a database connection/query failure.

The backend team can test endpoints using Postman or curl. The frontend team can use mock JSON data temporarily, provided the mock matches this contract.

### Agreement

Both teams agree to follow this API contract for V1. Any change to an endpoint, request field, response field, or calculation rule must be communicated to both teams and reflected in this document.

**Frontend representative:** ____________________

**Backend representative:** ____________________

**Date:** ____________________