/* ---------------- Date helpers ---------------- */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayYMD() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    pad2(d.getMonth() + 1) +
    "-" +
    pad2(d.getDate())
  );
}

function ymdFromUTC(y, m, d) {
  return y + "-" + pad2(m) + "-" + pad2(d);
}

function daysUntil(ymd) {
  const d = new Date(ymd + "T00:00:00Z");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayUTC = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return Math.round(
    (Date.parse(ymd + "T00:00:00Z") - todayUTC) / 86400000,
  );
}
