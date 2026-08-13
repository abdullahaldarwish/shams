/* ---------------- Formatting helpers ---------------- */

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(ymd) {
  if (!ymd) return "—";
  const p = ymd.split("-");
  if (p.length !== 3) return ymd;
  return p[2] + "/" + p[1] + "/" + p[0];
}

function formatPrice(n) {
  return n == null || n === ""
    ? "—"
    : Number(n).toLocaleString("ar-SA") + " ر.س";
}
