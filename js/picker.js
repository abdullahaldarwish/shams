/* ---------------- Custom date picker ---------------- */

let pickerField = null;
let pickerDisplay = null;
let pickerMode = "gregorian";
let cur = todayYMD();

function openPicker(fieldId, displayId) {
  pickerField = fieldId;
  pickerDisplay = displayId;
  const val = document.getElementById(fieldId).value;
  cur = val || todayYMD();
  document.getElementById("calToggle").style.display = HIJRI_OK
    ? ""
    : "none";
  renderCal();
  document.getElementById("pickerModal").classList.add("show");
}

function closePicker() {
  document.getElementById("pickerModal").classList.remove("show");
}

function calToggle() {
  if (!HIJRI_OK) return;
  pickerMode = pickerMode === "gregorian" ? "hijri" : "gregorian";
  save();
  renderCal();
}

function calToday() {
  cur = todayYMD();
  renderCal();
}

function calNav(dir) {
  if (pickerMode === "gregorian") {
    cur = addMonthsYMD(cur, dir);
  } else {
    const h = toHijri(cur);
    const t = normMonth(h.year, h.month + dir);
    cur = fromHijri(t.year, t.month, 1);
  }
  renderCal();
}

function pickDate(ymd) {
  if (dayDisabled(ymd)) return;
  document.getElementById(pickerField).value = ymd;
  renderDateField(pickerField, pickerDisplay, ymd);
  if (pickerField === "fStart" && endMode === "days")
    applyDurationToEnd();
  closePicker();
}

function dayDisabled(ymd) {
  if (endMode === "days") return false;
  if (pickerField === "fStart") {
    const max = document.getElementById("fEnd").value;
    return max ? ymd > max : false;
  }
  if (pickerField === "fEnd") {
    const min = document.getElementById("fStart").value;
    return min ? ymd < min : false;
  }
  return false;
}

function renderCal() {
  const grid = document.getElementById("calGrid");
  const title = document.getElementById("calTitle");
  const toggle = document.getElementById("calToggle");
  const mode = pickerMode;
  toggle.textContent =
    mode === "gregorian" ? "تحويل إلى هجري" : "تحويل إلى ميلادي";

  const selYMD = document.getElementById(pickerField).value;
  const tYMD = todayYMD();
  let startIdx,
    daysIn,
    cells = "";

  if (mode === "gregorian") {
    const [y, m] = cur.split("-").map(Number);
    const ym1 = y + "-" + pad2(m) + "-01";
    startIdx = new Date(ym1 + "T00:00:00Z").getUTCDay();
    daysIn = daysInGregMonth(ym1);
    title.textContent = gregMonths[m - 1] + " " + y;
    for (let i = 1; i <= daysIn; i++) {
      const ymd = ymdFromUTC(y, m, i);
      cells += dayCell(i, ymd, ymd === selYMD, ymd === tYMD);
    }
  } else {
    const h = toHijri(cur);
    daysIn = daysInHijriMonth(h.year, h.month);
    const d1 = fromHijri(h.year, h.month, 1);
    startIdx = new Date(d1 + "T00:00:00Z").getUTCDay();
    title.textContent = hijriMonths[h.month - 1] + " " + h.year + " هـ";
    const tH = toHijri(tYMD);
    for (let i = 1; i <= daysIn; i++) {
      const ymd = fromHijri(h.year, h.month, i);
      const isToday =
        h.year === tH.year && h.month === tH.month && i === tH.day;
      cells += dayCell(i, ymd, ymd === selYMD, isToday);
    }
  }

  let html = weekLabels
    .map((l) => '<div class="dow">' + l + "</div>")
    .join("");
  for (let i = 0; i < startIdx; i++) html += "<div></div>";
  html += cells;
  grid.innerHTML = html;

  let hint = HIJRI_OK
    ? mode === "gregorian"
      ? "اختر تاريخًا بالتقويم الميلادي"
      : "اختر تاريخًا بالهجري وسيُحوَّل تلقائيًا"
    : "اختر تاريخًا بالتقويم الميلادي";
  if (pickerField === "fStart")
    hint += " — لا يمكن أن يتجاوز تاريخ نهاية العقد";
  if (pickerField === "fEnd")
    hint += " — لا يمكن أن يسبق تاريخ بداية العقد";
  document.getElementById("calHint").textContent = hint;
}

function dayCell(label, ymd, selected, isToday) {
  let cls = "day";
  if (isToday && !selected) cls += " today";
  if (selected) cls += " selected";
  const dis = dayDisabled(ymd);
  if (dis) cls += " disabled";
  return (
    '<button type="button" class="' +
    cls +
    '"' +
    (dis ? "" : " onclick=\"pickDate('" + ymd + "')\"") +
    ">" +
    label +
    "</button>"
  );
}
