/* ---------------- Contract actions, backup & toast ---------------- */

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    p(d.getMonth() + 1) +
    "-" +
    p(d.getDate()) +
    " " +
    p(d.getHours()) +
    ":" +
    p(d.getMinutes())
  );
}

function askEnd(id) {
  const c = contracts.find((x) => x.id === id);
  if (!c) return;
  pendingEndId = id;
  document.getElementById("endConfirmText").textContent =
    "هل أنت متأكد من إنهاء عقد رقم " +
    c.id +
    " — " +
    c.name +
    "؟ ستُضاف ملاحظة بتاريخ الإنهاء إلى العقد.";
  document.getElementById("endOverlay").classList.add("show");
}

function doEnd() {
  if (pendingEndId == null) return;
  const c = contracts.find((x) => x.id === pendingEndId);
  if (c) {
    c.status = "ended";
    c.notes =
      (c.notes ? c.notes + "\n" : "") +
      "تم إنهاء العقد يدويا في " +
      nowStamp();
  }
  pendingEndId = null;
  save();
  closeEndConfirm();
  render();
  toast("تم إنهاء العقد");
}

function closeEndConfirm() {
  pendingEndId = null;
  document.getElementById("endOverlay").classList.remove("show");
}

function askCancelEnd(id) {
  const c = contracts.find((x) => x.id === id);
  if (!c) return;
  pendingCancelEndId = id;
  document.getElementById("cancelEndConfirmText").textContent =
    "هل أنت متأكد من إلغاء إنهاء عقد رقم " +
    c.id +
    " — " +
    c.name +
    "؟ ستُضاف ملاحظة بإلغاء الإنهاء اليدوي إلى العقد.";
  document.getElementById("cancelEndOverlay").classList.add("show");
}

function doCancelEnd() {
  if (pendingCancelEndId == null) return;
  const c = contracts.find((x) => x.id === pendingCancelEndId);
  if (c) {
    c.status = naturalStatus(c);
    c.notes =
      (c.notes ? c.notes + "\n" : "") +
      "تم إلغاء الإنهاء اليدوي في " +
      nowStamp();
  }
  pendingCancelEndId = null;
  save();
  closeCancelEndConfirm();
  render();
  toast("تم إلغاء إنهاء العقد");
}

function closeCancelEndConfirm() {
  pendingCancelEndId = null;
  document.getElementById("cancelEndOverlay").classList.remove("show");
}

function askDelete(id) {
  const c = contracts.find((x) => x.id === id);
  if (!c) return;
  pendingDeleteId = id;
  document.getElementById("confirmText").textContent =
    "هل أنت متأكد من حذف عقد رقم " +
    c.id +
    " — " +
    c.name +
    "؟ لا يمكن التراجع عن هذا الإجراء.";
  document.getElementById("confirmOverlay").classList.add("show");
}

function doDelete() {
  if (pendingDeleteId == null) return;
  contracts = contracts.filter((x) => x.id !== pendingDeleteId);
  pendingDeleteId = null;
  save();
  closeConfirm();
  render();
  toast("تم حذف العقد");
}

function closeConfirm() {
  pendingDeleteId = null;
  document.getElementById("confirmOverlay").classList.remove("show");
}

function exportBackup() {
  const obj = buildStateObject();
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "shams_backup_" + todayYMD() + ".json";
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, 100);
  toast("تم إنشاء النسخة الاحتياطية");
}

function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const st = parseState(e.target.result);
    if (!st) {
      toast("ملف غير صالح — لم يتم الاستعادة");
      return;
    }
    contracts = st.contracts;
    idCounter = st.nextId;
    datePref = st.datePref;
    pickerMode = st.calMode;
    save();
    render();
    toast("تمت استعادة البيانات من الملف");
  };
  reader.readAsText(file);
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}
