# AttendAI rule-based attendance assistant

This folder contains a small Python module that turns the attendance totals already stored by the Node backend into explainable recommendations. It is intentionally rule-based: the project stores totals, not enough history to train or validate a machine-learning model.

## Features

- **Subject insights:** reports the percentage and whether each subject is below the target, on track, or has not started.
- **Prioritized attention:** puts subjects below half of the target in high priority, other below-target subjects in medium priority, and subjects needing no action last.
- **Recovery calculator:** calculates the number of consecutive classes to attend to meet a target below 100%.
- **100% target handling:** reports `classes_needed: null` when a student has missed classes, because no finite run of attended classes can make the lifetime percentage exactly 100%.
- **What-if projection:** shows the percentage after a chosen number of attended and missed classes without changing the saved data.
- **Input validation:** checks subject names, attendance counts, subject IDs, and target percentages before calculating.
- **Zero-class handling:** reports attendance as `null` and suggests starting with the first class instead of presenting a misleading 0%.

All calculations use Python's standard library; no package installation or AI API key is required.

## Requirements and tests

- Python 3.10 or newer
- Node.js 18 or newer for the Express backend
- A running MySQL server with the AttendAI database configured

Run the Python tests from this directory:

```powershell
python -m unittest -v
```

To run one calculation directly, send a JSON object to the Python program:

```powershell
'{"action":"calculator","classes_held":30,"classes_attended":21,"target_percentage":75}' | python .\attendance_insights.py
```

It prints one JSON response to standard output. Invalid input produces a JSON error and a non-zero exit code.

## Backend integration

The Express backend launches the Python program for each AI request. Start MySQL, configure the backend `.env`, install the backend dependencies, and run the backend as usual:

```powershell
cd ..\Backend
npm install
npm run dev
```

The backend uses `python` on Windows and `python3` on macOS/Linux by default. If Python is not on that command name, set `PYTHON_EXECUTABLE` in the backend environment to the executable path, for example:

```text
PYTHON_EXECUTABLE=C:\Python312\python.exe
```

The current endpoints are mounted below `/api/ai`:

### `POST /api/ai/insights`

Reads current subjects from MySQL and returns ordered recommendations. The request body may be `{}` or specify an `attendance_threshold` between 0 and 100 (exclusive of 0, inclusive of 100).

```json
{
  "attendance_threshold": 75
}
```

Example response shape:

```json
{
  "attendance_threshold": 75,
  "insights": [
    {
      "subject_id": 2,
      "subject_name": "Java",
      "attendance_percentage": 70.0,
      "attendance_status": "low",
      "priority": "medium",
      "classes_needed": 6,
      "message": "Attendance is 70.0%, below the 75% target. Attend the next 6 consecutive classes to reach the target."
    }
  ]
}
```

### `POST /api/ai/calculator`

Calculates recovery guidance without reading or changing the database.

```json
{
  "classes_held": 30,
  "classes_attended": 21,
  "target_percentage": 75
}
```

### `POST /api/ai/what-if`

Projects attendance after future attended and/or missed classes. The future counts default to zero.

```json
{
  "classes_held": 30,
  "classes_attended": 21,
  "classes_to_attend": 4,
  "classes_to_miss": 1
}
```

The calculator and what-if endpoints are pure calculations; neither writes to MySQL. Invalid data returns HTTP `400` with a JSON validation error. Database or Python process failures return an explicit server error rather than a fabricated result.

## Calculation notes

For a target fraction `T`, classes held `H`, and attended `A`, the minimum number `N` of consecutive future classes to attend is:

```text
N = max(0, ceil((T * H - A) / (1 - T)))
```

This formula is used only for targets below 100%. If no classes have been held, the current percentage is unknown (`null`) and attending the first class starts the record. Percentages returned for existing records are rounded to two decimal places.

These recommendations are deterministic rules, not machine-learning predictions. They do not know future timetables, class importance, or student circumstances.
