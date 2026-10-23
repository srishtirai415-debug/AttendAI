# Attendance Analyzer — Frontend

Plain HTML, CSS and JavaScript (no build step). It talks to the backend over `fetch()` as described in the API contract.

## Run it

1. Start MySQL and the backend (`http://localhost:3000`).
2. Open the `frontend/` folder in VS Code, right-click `index.html`, choose **Open with Live Server**.
3. If the console shows a CORS error, ask the backend developer to allow your origin (for example `http://127.0.0.1:5500`).

The backend URL is set in `js/config.js`.

## Pages

| Page | File | Backend calls |
|---|---|---|
| Dashboard | `index.html` | `GET /api/dashboard`, `POST /api/ai/insights` |
| Subjects (add, edit, delete) | `subjects.html` | `GET/POST/PUT/DELETE /api/subjects` |
| Tools (calculator, what-if) | `tools.html` | `GET /api/subjects`, `POST /api/ai/calculator`, `POST /api/ai/what-if` |

## Folder structure

```
frontend/
├── index.html
├── subjects.html
├── tools.html
├── css/style.css
└── js/
    ├── config.js     # API base URL
    ├── api.js        # every backend call + response normalizing
    ├── ui.js         # DOM helpers, toast, validation, result renderer
    ├── dashboard.js
    ├── subjects.js
    └── tools.js
```

## Known contract mismatches (handled in `js/api.js`)

- `GET /api/subjects` currently returns `{ msg, data: [...] }` without `attendance_percentage` / `attendance_status`. `api.js` unwraps `data` and derives the missing fields for display only.
- `POST` / `PUT` return `{ message, subject }`; the frontend only needs the success status and then reloads the list.
- AI endpoints live under `/api/ai/*` (contract section 13), not `/api/insights` and `/api/calculator`.
- The request body for `/api/ai/what-if` is not in the contract. The frontend sends `classes_held`, `classes_attended`, `future_attended`, `future_missed`. Adjust `whatIf()` in `api.js` if the AI README says otherwise.

## Test checklist

- Empty table: dashboard and subjects page show the empty state.
- Add a valid subject; it appears in the list and on the dashboard.
- Attended greater than held: blocked by the form and by the backend.
- Edit and delete (with confirmation).
- Stop the backend: a friendly error with "Try again" appears.
- Resize to phone width.
