// ===== API layer =====
// Every backend call lives in this file. If the backend changes,
// this is the only file you should need to edit.

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkError) {
    throw new Error(
      "Could not reach the server. Make sure the backend is running at " + API_BASE_URL + "."
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    data = null; // empty or non-JSON body
  }

  if (!response.ok) {
    // Contract error format: { error: { code, message } }
    const message =
      (data && data.error && data.error.message) ||
      (data && (data.message || data.msg)) ||
      "Request failed (status " + response.status + ").";
    throw new Error(message);
  }
  return data;
}

// The real backend currently wraps some responses as { msg, data: ... }
// while the contract shows plain objects. This accepts both.
function unwrap(payload) {
  if (payload && !Array.isArray(payload) && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
}

// The "actual" GET /api/subjects response has no attendance_percentage or
// attendance_status. If they are missing, derive them for DISPLAY only.
function normalizeSubject(subject, threshold = DEFAULT_THRESHOLD) {
  const s = { ...subject };
  if (s.attendance_percentage === undefined) {
    s.attendance_percentage =
      s.classes_held > 0
        ? Math.round((s.classes_attended / s.classes_held) * 10000) / 100
        : 0;
  }
  if (!s.attendance_status) {
    s.attendance_status = s.attendance_percentage < threshold ? "low" : "safe";
  }
  return s;
}

// ----- Subjects -----

async function getSubjects() {
  const list = unwrap(await request("/api/subjects"));
  return (Array.isArray(list) ? list : []).map((s) => normalizeSubject(s));
}

async function addSubject(subject) {
  const res = await request("/api/subjects", {
    method: "POST",
    body: JSON.stringify(subject),
  });
  return res;
}

async function updateSubject(id, subject) {
  return request("/api/subjects/" + encodeURIComponent(id), {
    method: "PUT",
    body: JSON.stringify(subject),
  });
}

async function deleteSubject(id) {
  return request("/api/subjects/" + encodeURIComponent(id), { method: "DELETE" });
}

// ----- Dashboard -----

async function getDashboard() {
  const dash = unwrap(await request("/api/dashboard")) || {};
  const summary = dash.summary || {};
  const threshold = summary.attendance_threshold || DEFAULT_THRESHOLD;
  return {
    summary: {
      total_subjects: summary.total_subjects || 0,
      low_attendance_count: summary.low_attendance_count || 0,
      average_attendance_percentage: summary.average_attendance_percentage || 0,
      attendance_threshold: threshold,
    },
    subjects: (dash.subjects || []).map((s) => normalizeSubject(s, threshold)),
  };
}

// ----- AI module (implemented paths, contract section 13) -----

async function getInsights(threshold = DEFAULT_THRESHOLD) {
  const raw = unwrap(
    await request("/api/ai/insights", {
      method: "POST",
      body: JSON.stringify({ attendance_threshold: threshold }),
    })
  );
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.insights)) return raw.insights;
  if (raw && Array.isArray(raw.recommendations)) return raw.recommendations;
  return [];
}

async function calculateTarget({ classes_held, classes_attended, target_percentage }) {
  return unwrap(
    await request("/api/ai/calculator", {
      method: "POST",
      body: JSON.stringify({ classes_held, classes_attended, target_percentage }),
    })
  );
}

// NOTE: the request body for what-if is NOT defined in the contract yet.
// Check ../AI/README.md and adjust the field names below if they differ.
async function whatIf({ classes_held, classes_attended, classes_to_attend, classes_to_miss }) {
  return unwrap(
    await request("/api/ai/what-if", {
      method: "POST",
      body: JSON.stringify({ classes_held, classes_attended, classes_to_attend, classes_to_miss }),
    })
  );
}
