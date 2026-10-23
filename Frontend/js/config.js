// ===== Configuration =====
// Backend base URL (see API contract, section 2).
// If you open the frontend with Live Server (http://127.0.0.1:5500),
// the backend must enable CORS for that origin.
const API_BASE_URL = "http://localhost:8080";

// Default low-attendance threshold (percent). The backend decides the real
// status; this is only used as a fallback and as the default for insights.
const DEFAULT_THRESHOLD = 75;
