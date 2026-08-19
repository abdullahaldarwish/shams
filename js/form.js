/* ---------------- Form ---------------- */

function renderDateField(fieldId, displayId, ymd) {
  const hidden = document.getElementById(fieldId);
  const input = document.getElementById(displayId);
  const hint = document.getElementById(fieldId + "Hijri");
  hidden.value = ymd || "";
  if (!ymd) {
    input.value = "";
    if (hint) hint.textContent = "";
    return;
  }
  const greg = formatDate(ymd);
  const hijri = HIJRI_OK ? gregToHijriStr(ymd) : "";
  if (datePref === "hijri" && hijri) {
    input.value = hijri;
    if (hint) hint.textContent = greg;
  } else {
    input.value = greg;
    if (hint) hint.textContent = hijri;
  }
}

function toggleDatePref() {
  datePref = datePref === "hijri" ? "gregorian" : "hijri";
  save();
  updateDatePrefBtn();
  render();
  renderDateField(
    "fStart",
    "fStartDisplay",
    document.getElementById("fStart").value,
  );
  renderDateField(
    "fEnd",
    "fEndDisplay",
    document.getElementById("fEnd").value,
  );
}

function updateDatePrefBtn() {
  const b = document.getElementById("datePrefBtn");
  if (b)
    b.textContent =
      datePref === "hijri" ? "عرض بالميلادي" : "عرض بالهجري";
}

function openModal(id) {
  const c = id ? contracts.find((x) => x.id === id) : null;
  document.getElementById("modalTitle").textContent = c
    ? "تعديل العقد #" + c.id
    : "إضافة عقد جديد";
  document.getElementById("formError").textContent = "";
  document.getElementById("fId").value = c ? c.id : "";
  document.getElementById("fName").value = c ? c.name : "";
  document.getElementById("fPhone").value = c ? c.phone || "" : "";
  document.getElementById("fContractNo").value = c ? c.contractNo : "";
  document.getElementById("fRoom").value = c ? c.room : "";
  document.getElementById("fPrice").value = c ? c.price : "";
  renderDateField("fStart", "fStartDisplay", c ? c.start : "");
  renderDateField("fEnd", "fEndDisplay", c ? c.end : "");
  endMode = "manual";
  selectedDays = null;
  updateEndModeUI();
  document.getElementById("fNotes").value = c ? c.notes || "" : "";
  document.getElementById("modal").classList.add("show");
  const scrollEl = document.querySelector("#modal .modal");
  if (scrollEl) scrollEl.scrollTop = 0;
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("formError").textContent = "";
}

function saveContract(e) {
  e.preventDefault();
  const errorEl = document.getElementById("formError");
  errorEl.textContent = "";

  const id = document.getElementById("fId").value;
  const name = document.getElementById("fName").value.trim();
  const phone = document.getElementById("fPhone").value.trim();
  const contractNo = document
    .getElementById("fContractNo")
    .value.trim();
  const room = parseInt(
    arNum(document.getElementById("fRoom").value),
    10,
  );
  const price = parseFloat(
    arNum(document.getElementById("fPrice").value),
  );
  const start = document.getElementById("fStart").value;
  const end = document.getElementById("fEnd").value;
  const notes = document.getElementById("fNotes").value.trim();

  if (!name) {
    errorEl.textContent = "برجاء إدخال الاسم الكامل.";
    return false;
  }
  if (!contractNo) {
    errorEl.textContent = "برجاء إدخال رقم العقد.";
    return false;
  }
  if (isNaN(room) || room < 1 || room > 11) {
    errorEl.textContent = "رقم الغرفة يجب أن يكون بين 1 و 11.";
    return false;
  }
  if (isNaN(price) || price < 0) {
    errorEl.textContent = "برجاء إدخال سعر صحيح.";
    return false;
  }
  if (!start || !end) {
    errorEl.textContent = "برجاء تحديد تاريخ البداية والنهاية.";
    return false;
  }
  if (end < start) {
    errorEl.textContent =
      "تاريخ نهاية العقد يجب أن يكون بعد تاريخ البداية.";
    return false;
  }

  const conflict = findRoomConflict(room, start, end, id);
  if (conflict) {
    errorEl.textContent =
      "الغرفة رقم " +
      room +
      " مشغولة خلال هذه الفترة بعقد رقم " +
      conflict.id +
      ".";
    return false;
  }

  const existing = id
    ? contracts.find((x) => x.id === Number(id))
    : null;

  if (existing) {
    existing.name = name;
    existing.phone = phone;
    existing.contractNo = contractNo;
    existing.room = room;
    existing.price = price;
    existing.start = start;
    existing.end = end;
    existing.notes = notes;
    existing.status = computeStatus(existing);
  } else {
    const nc = {
      id: nextId(),
      name,
      phone,
      contractNo,
      room,
      price,
      start,
      end,
      notes,
      status: "current",
      createdAt: new Date().toISOString(),
    };
    nc.status = computeStatus(nc);
    contracts.push(nc);
  }

  save();
  closeModal();
  render();
  toast(id ? "تم تعديل العقد بنجاح" : "تم إضافة العقد بنجاح");
  if (!id) window.scrollTo({ top: 0, behavior: "smooth" });
  return false;
}
