/* ---------------- Bootstrap & event wiring ---------------- */

async function init() {
  requestPersistentStorage();
  const sources = await loadRaw();
  let st = null;
  for (const raw of [sources.opfs, sources.local]) {
    const parsed = raw ? parseState(raw) : null;
    if (!parsed) continue;
    if (!st || parsed.savedAt > st.savedAt) st = parsed;
  }
  if (st) {
    contracts = st.contracts;
    idCounter = st.nextId;
    datePref = st.datePref;
    pickerMode = st.calMode;
    if (st.legacy) {
      try {
        datePref =
          localStorage.getItem(STORAGE_KEY + "_datepref") || datePref;
        pickerMode = localStorage.getItem(CAL_MODE_KEY) || pickerMode;
        const n = parseInt(
          localStorage.getItem(STORAGE_KEY + "_nextid"),
          10,
        );
        if (!isNaN(n) && n > idCounter) idCounter = n;
      } catch (e) {}
    }
  } else {
    try {
      datePref =
        localStorage.getItem(STORAGE_KEY + "_datepref") || "gregorian";
      pickerMode = localStorage.getItem(CAL_MODE_KEY) || "gregorian";
    } catch (e) {}
  }
  render();
  save();
}

document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", doDelete);
document
  .getElementById("confirmEndBtn")
  .addEventListener("click", doEnd);
document
  .getElementById("confirmCancelEndBtn")
  .addEventListener("click", doCancelEnd);
document
  .getElementById("modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });
document
  .getElementById("pickerModal")
  .addEventListener("click", function (e) {
    if (e.target === this) closePicker();
  });
document
  .getElementById("confirmOverlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeConfirm();
  });
document
  .getElementById("endOverlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeEndConfirm();
  });
document
  .getElementById("cancelEndOverlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeCancelEndConfirm();
  });
document
  .getElementById("importFile")
  .addEventListener("change", function (e) {
    importBackupFile(e.target.files[0]);
    e.target.value = "";
  });
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    closePicker();
    closeConfirm();
    closeEndConfirm();
    closeCancelEndConfirm();
  }
});

init();
