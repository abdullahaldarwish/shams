/* ---------------- Hijri / Gregorian conversion (Umm al-Qura) ---------------- */

function arNum(str) {
  return String(str == null ? "" : str)
    .replace(/[٠-٩]/g, function (d) {
      return "٠١٢٣٤٥٦٧٨٩".indexOf(d);
    })
    .replace(/[۰-۹]/g, function (d) {
      return "۰۱۲۳۴۵۶۷۸۹".indexOf(d);
    });
}

function normalizeDigits(el) {
  const norm = arNum(el.value);
  if (norm !== el.value) el.value = norm;
}

function buildFormatter(locale) {
  const keys = ["islamic-umalqura", "islamic-civil", "islamic"];
  for (const k of keys) {
    try {
      const f = new Intl.DateTimeFormat(locale + "-u-ca-" + k, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        timeZone: "UTC",
      });
      const p = f.formatToParts(new Date("2024-03-11T00:00:00Z"));
      const y = parseInt(
        arNum((p.find((x) => x.type === "year") || {}).value),
        10,
      );
      if (y >= 1300 && y <= 1600) return f;
    } catch (e) {}
  }
  return null;
}

const islamicEn = buildFormatter("en-US");
const islamicAr = buildFormatter("ar-SA");
const HIJRI_OK = !!islamicEn && !!islamicAr;

function toHijri(ymd) {
  const parts = islamicEn.formatToParts(new Date(ymd + "T00:00:00Z"));
  let year = 0,
    month = 0,
    day = 0;
  parts.forEach((p) => {
    if (p.type === "year") year = parseInt(arNum(p.value), 10);
    if (p.type === "month") month = parseInt(arNum(p.value), 10);
    if (p.type === "day") day = parseInt(arNum(p.value), 10);
  });
  return { year, month, day };
}

function hijriRank(hy, hm, hd) {
  return hy * 372 + (hm - 1) * 31 + (hd - 1);
}

function normMonth(y, m) {
  while (m > 12) {
    m -= 12;
    y++;
  }
  while (m < 1) {
    m += 12;
    y--;
  }
  return { year: y, month: m };
}

function fromHijri(hy, hm, hd) {
  const target = hijriRank(hy, hm, hd);
  let lo =
    Date.UTC(622, 6, 19) +
    (hy - 1) * 354.367 * 86400000 -
    366 * 86400000;
  let hi = lo + 800 * 86400000;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const d = new Date(mid);
    const ymd = ymdFromUTC(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
    );
    const h = toHijri(ymd);
    if (hijriRank(h.year, h.month, h.day) < target) lo = mid + 86400000;
    else hi = mid;
  }
  const d = new Date(lo);
  return ymdFromUTC(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
  );
}

function daysInHijriMonth(hy, hm) {
  const a = normMonth(hy, hm);
  const b = normMonth(hy, hm + 1);
  const d1 = Date.parse(fromHijri(a.year, a.month, 1) + "T00:00:00Z");
  const d2 = Date.parse(fromHijri(b.year, b.month, 1) + "T00:00:00Z");
  return Math.round((d2 - d1) / 86400000);
}

function addMonthsYMD(ymd, delta) {
  const [y, m] = ymd.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return ymdFromUTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

function addDaysYMD(ymd, days) {
  const d = new Date(Date.parse(ymd + "T00:00:00Z"));
  d.setUTCDate(d.getUTCDate() + days);
  return ymdFromUTC(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
  );
}

function daysInGregMonth(ymd) {
  const d1 = Date.parse(ymd + "T00:00:00Z");
  const d2 = Date.parse(addMonthsYMD(ymd, 1) + "T00:00:00Z");
  return Math.round((d2 - d1) / 86400000);
}

function gregToHijriStr(ymd) {
  if (!ymd || !HIJRI_OK) return "";
  try {
    return islamicAr.format(new Date(ymd + "T00:00:00Z"));
  } catch (e) {
    return "";
  }
}
