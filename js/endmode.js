/* ---------------- Contract end mode (manual / by duration) ---------------- */

function applyDurationToEnd() {
  const start = document.getElementById("fStart").value;
  if (!start || !selectedDays) return;
  renderDateField(
    "fEnd",
    "fEndDisplay",
    addDaysYMD(start, selectedDays),
  );
}

function setEndMode(mode) {
  endMode = mode;
  updateEndModeUI();
  if (mode === "days") applyDurationToEnd();
}

function setDays(btn) {
  selectedDays = parseInt(btn.dataset.days, 10);
  updateEndModeUI();
  applyDurationToEnd();
}

function updateEndModeUI() {
  document
    .getElementById("modeManual")
    .classList.toggle("active", endMode === "manual");
  document
    .getElementById("modeDays")
    .classList.toggle("active", endMode === "days");
  document.getElementById("fEndField").style.display =
    endMode === "manual" ? "" : "none";
  document.getElementById("durPresets").style.display =
    endMode === "days" ? "" : "none";
  document
    .querySelectorAll("#durPresets .dur-preset")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.days == selectedDays),
    );
}
