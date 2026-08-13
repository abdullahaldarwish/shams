/* ---------------- Contract status & id helpers ---------------- */

function nextId() {
  const max = contracts.reduce((m, c) => Math.max(m, c.id || 0), 0);
  let id = Math.max(idCounter, max + 1);
  idCounter = id + 1;
  return id;
}

function computeStatus(c) {
  if (c.status === "ended") return "ended";
  return naturalStatus(c);
}

function naturalStatus(c) {
  if (c.end && c.end < todayYMD()) return "ended";
  if (c.start && c.start > todayYMD()) return "active";
  return "current";
}

function isEndingSoon(c) {
  if (computeStatus(c) !== "current") return false;
  const d = daysUntil(c.end);
  return d >= 0 && d <= ENDING_SOON_DAYS;
}

function syncStatuses() {
  let changed = false;
  contracts.forEach((c) => {
    const s = computeStatus(c);
    if (s !== c.status) {
      c.status = s;
      changed = true;
    }
  });
  if (changed) save();
}
