// ===== Subjects page (list, add, edit, delete) =====

let editingId = null;

async function loadSubjects() {
  const loader = $("#loader");
  const errorBox = $("#error-box");
  const tableWrap = $("#table-wrap");

  loader.hidden = false;
  tableWrap.hidden = true;
  errorBox.replaceChildren();

  try {
    const subjects = await getSubjects();
    renderTable(subjects);
    tableWrap.hidden = false;
  } catch (error) {
    showError(errorBox, error.message, loadSubjects);
  } finally {
    loader.hidden = true;
  }
}

function renderTable(subjects) {
  const body = $("#subjects-body");
  const empty = $("#empty-state");
  empty.hidden = subjects.length > 0;
  $("#subjects-table").hidden = subjects.length === 0;

  body.replaceChildren(
    ...subjects.map((s) =>
      el(
        "tr",
        {},
        el("td", { class: "name-cell", text: s.name }),
        el("td", { text: s.classes_held }),
        el("td", { text: s.classes_attended }),
        el("td", { text: formatPercent(s.attendance_percentage) }),
        el("td", {}, statusBadge(s.attendance_status)),
        el(
          "td",
          { class: "actions" },
          el("button", { class: "btn small", type: "button", text: "Edit", onclick: () => startEdit(s) }),
          el("button", { class: "btn small danger", type: "button", text: "Delete", onclick: (e) => removeSubject(s, e.currentTarget) })
        )
      )
    )
  );
}

function readForm() {
  return {
    name: $("#name").value,
    classes_held: $("#classes_held").value,
    classes_attended: $("#classes_attended").value,
  };
}

function startEdit(subject) {
  editingId = subject.id;
  $("#name").value = subject.name;
  $("#classes_held").value = subject.classes_held;
  $("#classes_attended").value = subject.classes_attended;
  $("#form-title").textContent = "Edit subject";
  $("#submit-btn").textContent = "Save changes";
  $("#cancel-btn").hidden = false;
  $("#form-error").textContent = "";
  $("#subject-form").scrollIntoView({ behavior: "smooth", block: "center" });
  $("#name").focus();
}

function resetForm() {
  editingId = null;
  $("#subject-form").reset();
  $("#form-title").textContent = "Add subject";
  $("#submit-btn").textContent = "Add subject";
  $("#cancel-btn").hidden = true;
  $("#form-error").textContent = "";
}

async function handleSubmit(event) {
  event.preventDefault();
  const formError = $("#form-error");
  const values = readForm();

  const problem = validateSubject(values);
  if (problem) {
    formError.textContent = problem;
    return;
  }
  formError.textContent = "";

  // The contract says never send id or created_at when creating.
  const payload = {
    name: values.name.trim(),
    classes_held: Number(values.classes_held),
    classes_attended: Number(values.classes_attended),
  };

  const button = $("#submit-btn");
  const isEdit = editingId !== null;
  try {
    await withBusyButton(button, "Saving…", () =>
      isEdit ? updateSubject(editingId, payload) : addSubject(payload)
    );
    showToast(isEdit ? "Subject updated." : "Subject added.", "success");
    resetForm();
    await loadSubjects(); // refresh the list after a successful change
  } catch (error) {
    formError.textContent = error.message;
  }
}

async function removeSubject(subject, button) {
  if (!confirm('Delete "' + subject.name + '"? This cannot be undone.')) return;
  try {
    await withBusyButton(button, "Deleting…", () => deleteSubject(subject.id));
    showToast("Subject deleted.", "success");
    if (editingId === subject.id) resetForm();
    await loadSubjects();
  } catch (error) {
    showToast(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#subject-form").addEventListener("submit", handleSubmit);
  $("#cancel-btn").addEventListener("click", resetForm);
  loadSubjects();
});
