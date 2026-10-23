// ===== Dashboard page =====
// All summary numbers come from GET /api/dashboard.
// The frontend does not calculate its own summary (contract section 6).

let attendanceChart = null;

async function loadDashboard() {
  const loader = $("#loader");
  const content = $("#dashboard-content");
  const errorBox = $("#error-box");

  loader.hidden = false;
  content.hidden = true;
  errorBox.replaceChildren();

  try {
    const dash = await getDashboard();
    renderSummary(dash.summary);
    renderBanner(dash.subjects, dash.summary);
    renderChart(dash.subjects, dash.summary.attendance_threshold);
    renderSubjectGrid(dash.subjects);
    content.hidden = false;
    loadInsightsSection(dash.summary.attendance_threshold);
  } catch (error) {
    showError(errorBox, error.message, loadDashboard);
  } finally {
    loader.hidden = true;
  }
}

function summaryCard(label, value, tone) {
  return el(
    "div",
    { class: "card " + (tone || "") },
    el("div", { class: "label", text: label }),
    el("div", { class: "value", text: value })
  );
}

function renderSummary(summary) {
  $("#summary-cards").replaceChildren(
    summaryCard("Total subjects", summary.total_subjects),
    summaryCard("Average attendance", formatPercent(summary.average_attendance_percentage)),
    summaryCard(
      "Low-attendance subjects",
      summary.low_attendance_count,
      summary.low_attendance_count > 0 ? "low" : "safe"
    ),
    summaryCard("Target threshold", formatPercent(summary.attendance_threshold))
  );
}

function renderBanner(subjects, summary) {
  const banner = $("#alert-banner");
  const low = subjects.filter((s) => s.attendance_status === "low");
  if (subjects.length === 0) {
    banner.replaceChildren();
    return;
  }
  if (low.length === 0) {
    banner.replaceChildren(
      el("div", { class: "banner ok", text: "Great job! All subjects meet the " + summary.attendance_threshold + "% target." })
    );
    return;
  }
  banner.replaceChildren(
    el(
      "div",
      { class: "banner", role: "alert" },
      el("strong", { text: "Low attendance: " }),
      low.map((s) => s.name).join(", ")
    )
  );
}

function renderChart(subjects, threshold) {
  const wrap = $(".chart-wrap");
  if (attendanceChart) {
    attendanceChart.destroy();
    attendanceChart = null;
  }
  if (typeof Chart === "undefined" || subjects.length === 0) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  attendanceChart = new Chart($("#chart"), {
    type: "bar",
    data: {
      labels: subjects.map((s) => s.name),
      datasets: [
        {
          label: "Attendance %",
          data: subjects.map((s) => s.attendance_percentage),
          backgroundColor: subjects.map((s) => (s.attendance_status === "low" ? "#dc2626" : "#16a34a")),
          borderRadius: 6,
        },
        {
          type: "line",
          label: "Target (" + threshold + "%)",
          data: subjects.map(() => threshold),
          borderColor: "#4f46e5",
          borderDash: [6, 4],
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 0, max: 100, title: { display: true, text: "Percent" } } },
    },
  });
}

function renderSubjectGrid(subjects) {
  const grid = $("#subject-grid");
  if (subjects.length === 0) {
    grid.replaceChildren(
      el(
        "div",
        { class: "empty" },
        "No subjects yet. ",
        el("a", { href: "subjects.html", text: "Add your first one." })
      )
    );
    return;
  }
  grid.replaceChildren(
    ...subjects.map((s) => {
      const pct = Math.max(0, Math.min(100, s.attendance_percentage));
      return el(
        "div",
        { class: "subject-card " + s.attendance_status },
        el("h3", { text: s.name }),
        el("div", { class: "pct", text: formatPercent(s.attendance_percentage) }),
        el("div", { class: "progress " + s.attendance_status }, el("span", { style: "width:" + pct + "%" })),
        el("div", { class: "muted", text: s.classes_attended + " of " + s.classes_held + " classes attended" }),
        el("div", {}, statusBadge(s.attendance_status))
      );
    })
  );
}

// ----- Insights (POST /api/ai/insights) -----

async function loadInsightsSection(threshold) {
  const box = $("#insights");
  const button = $("#refresh-insights");
  box.replaceChildren(el("div", { class: "loader", text: "Generating insights…" }));
  button.disabled = true;
  try {
    const insights = await getInsights(threshold);
    renderInsights(box, insights);
  } catch (error) {
    showError(box, error.message, () => loadInsightsSection(threshold));
  } finally {
    button.disabled = false;
  }
}

function renderInsights(box, insights) {
  if (insights.length === 0) {
    box.replaceChildren(el("div", { class: "empty", text: "No insights right now. Everything looks fine." }));
    return;
  }
  box.replaceChildren(
    el(
      "ul",
      { class: "insight-list" },
      insights.map((item) => {
        if (typeof item === "string") return el("li", { class: "insight", text: item });
        const title = item.subject_name || item.subject || "";
        const message = item.message || item.recommendation || item.text || JSON.stringify(item);
        return el(
          "li",
          { class: "insight" },
          el(
            "div",
            { class: "title" },
            title ? el("span", { text: title }) : null,
            item.type ? el("span", { class: "badge neutral", text: String(item.type).replace(/_/g, " ") }) : null
          ),
          el("div", { class: "muted", text: message })
        );
      })
    )
  );
}

document.addEventListener("DOMContentLoaded", () => {
  $("#refresh-insights").addEventListener("click", () => loadInsightsSection(DEFAULT_THRESHOLD));
  loadDashboard();
});
