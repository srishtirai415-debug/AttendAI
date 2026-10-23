// ===== Shared UI helpers =====

const $ = (selector, root = document) => root.querySelector(selector);

// Build a DOM element safely. Text is always inserted as text (never HTML),
// which protects against XSS from user-entered subject names.
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2), value);
    } else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "–";
  return (Math.round(n * 100) / 100) + "%";
}

function statusBadge(status) {
  const known = status === "safe" || status === "low";
  return el("span", { class: "badge " + (known ? status : "neutral"), text: status || "unknown" });
}

function showToast(message, type = "info") {
  let box = $("#toasts");
  if (!box) {
    box = el("div", { id: "toasts" });
    document.body.append(box);
  }
  const toast = el("div", { class: "toast " + type, text: message });
  box.append(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Show an error message with an optional "Try again" button.
function showError(container, message, retryFn) {
  container.replaceChildren(
    el(
      "div",
      { class: "error-box", role: "alert" },
      el("span", { text: message }),
      retryFn ? el("button", { class: "btn small", type: "button", onclick: retryFn, text: "Try again" }) : null
    )
  );
}

// Disable a button and change its label while a request is running,
// which also prevents double submits.
async function withBusyButton(button, busyLabel, task) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = busyLabel;
  try {
    return await task();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

// Validate subject form values (convenience only; the backend validates again).
function validateSubject({ name, classes_held, classes_attended }) {
  if (!name.trim()) return "Subject name is required.";
  if (classes_held === "" || classes_attended === "") return "Please fill in both class counts.";
  const held = Number(classes_held);
  const attended = Number(classes_attended);
  if (!Number.isInteger(held) || !Number.isInteger(attended)) return "Class counts must be whole numbers.";
  if (held < 0 || attended < 0) return "Class counts cannot be negative.";
  if (attended > held) return "Classes attended cannot exceed classes held.";
  return null;
}

// Render a generic result object (used for AI responses whose exact shape may vary).
function renderResult(container, data) {
  container.replaceChildren();
  if (data === null || data === undefined) return;

  const box = el("div", { class: "result-box" });
  if (typeof data !== "object") {
    box.append(el("div", { class: "headline", text: String(data) }));
    container.append(box);
    return;
  }

  if (data.message) box.append(el("div", { class: "headline", text: String(data.message) }));

  const dl = el("dl", { class: "kv" });
  for (const [key, value] of Object.entries(data)) {
    if (key === "message") continue;
    let shown;
    if (value === null) shown = "Not possible";
    else if (typeof value === "object") shown = JSON.stringify(value);
    else shown = String(value);
    dl.append(el("dt", { text: key.replace(/_/g, " ") }), el("dd", { text: shown }));
  }
  if (dl.children.length) box.append(dl);
  container.append(box);
}
