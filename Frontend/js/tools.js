// ===== Tools page: target calculator and what-if projection =====

let toolSubjects = [];

async function loadSubjectOptions() {
  try {
    toolSubjects = await getSubjects();
  } catch (error) {
    // Subject prefill is optional; manual entry still works.
    return;
  }
  for (const select of document.querySelectorAll(".subject-select")) {
    for (const s of toolSubjects) {
      select.append(el("option", { value: s.id, text: s.name }));
    }
  }
}

// When a subject is chosen, prefill the held/attended fields in that form.
function wirePrefill(form) {
  const select = $(".subject-select", form);
  select.addEventListener("change", () => {
    const subject = toolSubjects.find((s) => String(s.id) === select.value);
    if (!subject) return;
    $('[name="classes_held"]', form).value = subject.classes_held;
    $('[name="classes_attended"]', form).value = subject.classes_attended;
  });
}

function readCounts(form) {
  return {
    held: form.elements.classes_held.value,
    attended: form.elements.classes_attended.value,
  };
}

function checkCounts(held, attended) {
  if (held === "" || attended === "") return "Please fill in classes held and attended.";
  const h = Number(held);
  const a = Number(attended);
  if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0) return "Counts must be non-negative whole numbers.";
  if (a > h) return "Classes attended cannot exceed classes held.";
  return null;
}

function wireCalculator() {
  const form = $("#calc-form");
  wirePrefill(form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const err = $("#calc-error");
    const out = $("#calc-result");
    out.replaceChildren();

    const { held, attended } = readCounts(form);
    const target = form.elements.target_percentage.value;
    let problem = checkCounts(held, attended);
    if (!problem && (target === "" || Number(target) <= 0 || Number(target) > 100)) {
      problem = "Target must be greater than 0 and at most 100.";
    }
    err.textContent = problem || "";
    if (problem) return;

    try {
      const result = await withBusyButton($("#calc-btn"), "Calculating…", () =>
        calculateTarget({
          classes_held: Number(held),
          classes_attended: Number(attended),
          target_percentage: Number(target),
        })
      );
      renderResult(out, result);
    } catch (error) {
      err.textContent = error.message;
    }
  });
}

function wireWhatIf() {
  const form = $("#whatif-form");
  wirePrefill(form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const err = $("#whatif-error");
    const out = $("#whatif-result");
    out.replaceChildren();

    const { held, attended } = readCounts(form);
    const classes_to_attend = form.elements.future_attended.value || "0";
    const classes_to_miss = form.elements.future_missed.value || "0";
    console.log("future attended : "+classes_to_attend +"future missed" +classes_to_miss);
    let problem = checkCounts(held, attended);
    console.log("Problem "+problem);
    if (!problem) {
      const fa = Number(classes_to_attend);
      const fm = Number(classes_to_miss);
      if (!Number.isInteger(fa) || !Number.isInteger(fm) || fa < 0 || fm < 0) {
        problem = "Future classes must be non-negative whole numbers.";
      }
    }
    err.textContent = problem || "";
    if (problem) return;

    try {
      const result = await withBusyButton($("#whatif-btn"), "Projecting…", () =>
        whatIf({
          classes_held: Number(held),
          classes_attended: Number(attended),
          classes_to_attend: Number(classes_to_attend),
          classes_to_miss: Number(classes_to_miss),
        })
      );
      console.log(result);
      renderResult(out, result);
    } catch (error) {
      err.textContent = error.message;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireCalculator();
  wireWhatIf();
  loadSubjectOptions();
});
