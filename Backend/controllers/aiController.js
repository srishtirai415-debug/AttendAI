const { spawn } = require("child_process");
const path = require("path");
const db = require("../config/dbConnection");

const pythonExecutable = process.env.PYTHON_EXECUTABLE || (process.platform === "win32" ? "python" : "python3");
const aiScript = path.join(__dirname, "../../AI/attendance_insights.py");

const runAi = (payload) => new Promise((resolve, reject) => {
    const child = spawn(pythonExecutable, [aiScript], { windowsHide: true });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        callback(value);
    };

    const timeout = setTimeout(() => {
        child.kill();
        finish(reject, new Error("AI process timed out."));
    }, 10000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => finish(reject, error));
    child.on("close", (code) => {
        let result;
        try {
            result = JSON.parse(stdout);
        } catch (error) {
            finish(reject, new Error(`AI process returned invalid JSON${stderr ? `: ${stderr.trim()}` : ""}`));
            return;
        }

        if (code === 2 && result.error) {
            finish(resolve, { validationError: result.error });
        } else if (code !== 0) {
            finish(reject, new Error(`AI process failed${stderr ? `: ${stderr.trim()}` : ""}`));
        } else {
            finish(resolve, { result });
        }
    });
    child.stdin.on("error", (error) => finish(reject, error));
    child.stdin.end(JSON.stringify(payload));
});

const sendAiResult = async (res, payload) => {
    try {
        const output = await runAi(payload);
        if (output.validationError) {
            return res.status(400).json({ error: output.validationError });
        }
        return res.status(200).json(output.result);
    } catch (error) {
        console.error("AI request failed:", error.message);
        return res.status(500).json({
            error: {
                code: "AI_SERVICE_ERROR",
                message: "The attendance analysis service is unavailable.",
            },
        });
    }
};

const getInsights = (req, res) => {
    const sql = "SELECT id, name, classes_held, classes_attended FROM subjects";
    db.query(sql, async (err, subjects) => {
        if (err) {
            console.error("Could not load subjects for AI insights:", err.message);
            return res.status(500).json({
                error: { code: "DATABASE_ERROR", message: "Could not load subjects for attendance analysis." },
            });
        }

        const body = req.body || {};
        const threshold = body.attendance_threshold === undefined
            ? 75
            : body.attendance_threshold;
        return sendAiResult(res, { action: "insights", subjects, attendance_threshold: threshold });
    });
};

const calculateAttendance = (req, res) => sendAiResult(res, {
    action: "calculator",
    ...(req.body || {}),
});

const projectAttendance = (req, res) => sendAiResult(res, {
    action: "what_if",
    ...(req.body || {}),
});

module.exports = { getInsights, calculateAttendance, projectAttendance };
