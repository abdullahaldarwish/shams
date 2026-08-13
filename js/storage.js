/* ---------------- JSON-file storage (Origin Private File System) ---------------- */

function supportsOPFS() {
  try {
    return !!(navigator.storage && navigator.storage.getDirectory);
  } catch (e) {
    return false;
  }
}

async function requestPersistentStorage() {
  if (!(navigator.storage && navigator.storage.persist)) {
    storagePersisted = null;
    updateStorageStatus();
    return false;
  }
  try {
    if (await navigator.storage.persisted()) {
      storagePersisted = true;
      updateStorageStatus();
      return true;
    }
    storagePersisted = await navigator.storage.persist();
    updateStorageStatus();
    return storagePersisted;
  } catch (e) {
    storagePersisted = null;
    updateStorageStatus();
    return false;
  }
}

async function persistRaw(obj) {
  const json = JSON.stringify(obj);
  let opfsOk = false;
  let localOk = false;
  if (supportsOPFS()) {
    try {
      const root = await navigator.storage.getDirectory();
      const fh = await root.getFileHandle(STATE_FILE, { create: true });
      const w = await fh.createWritable();
      await w.write(json);
      await w.close();
      opfsOk = true;
    } catch (e) {}
  }
  try {
    localStorage.setItem(STORAGE_KEY, json);
    localOk = true;
  } catch (e) {}
  if (opfsOk) return "opfs";
  if (localOk) return "local";
  return null;
}

async function loadRaw() {
  let opfsText = null;
  let localText = null;
  if (supportsOPFS()) {
    try {
      const root = await navigator.storage.getDirectory();
      const fh = await root.getFileHandle(STATE_FILE);
      const file = await fh.getFile();
      const txt = await file.text();
      if (txt) opfsText = txt;
    } catch (e) {}
  }
  try {
    localText = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}
  return { opfs: opfsText, local: localText };
}

function parseState(raw) {
  try {
    const obj = JSON.parse(raw);
    if (Array.isArray(obj)) {
      return {
        legacy: true,
        savedAt: 0,
        contracts: obj,
        nextId: obj.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1,
        datePref: "gregorian",
        calMode: "gregorian",
      };
    }
    const list = Array.isArray(obj.contracts) ? obj.contracts : [];
    const maxId = list.reduce((m, c) => Math.max(m, c.id || 0), 0);
    return {
      contracts: list,
      savedAt: Number(obj.savedAt) || 0,
      nextId: obj.nextId > 0 ? obj.nextId : maxId + 1,
      datePref: obj.datePref || "gregorian",
      calMode: obj.calMode || "gregorian",
    };
  } catch (e) {
    return null;
  }
}

function buildStateObject() {
  return {
    version: 1,
    savedAt: Date.now(),
    nextId: idCounter,
    datePref: datePref,
    calMode: pickerMode,
    contracts: contracts,
  };
}

let _saveChain = Promise.resolve();

function save() {
  const obj = buildStateObject();
  _saveChain = _saveChain
    .then(() => persistRaw(obj))
    .then((m) => {
      storageMode = m || "خطأ";
      updateStorageStatus();
    })
    .catch(() => {
      storageMode = "خطأ";
      updateStorageStatus();
    });
  return _saveChain;
}

function updateStorageStatus() {
  const el = document.getElementById("storageStatus");
  if (!el) return;
  const method =
    storageMode === "opfs"
      ? "طريقة الحفظ: نظام الملفات الخاص بالمتصفح (OPFS)"
      : storageMode === "local"
        ? "طريقة الحفظ: مخزن المتصفح"
        : "";
  const persist =
    storagePersisted === true
      ? "البيانات دائمة "
      : storagePersisted === false
        ? "البيانات محفوظة"
        : "";
  el.textContent = [method, persist].filter(Boolean).join(" · ");
}
