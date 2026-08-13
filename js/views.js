/* ---------------- Views ---------------- */

function setView(v) {
  view = v;
  document
    .getElementById("tabCurrent")
    .classList.toggle("active", v === "current");
  document
    .getElementById("tabUpcoming")
    .classList.toggle("active", v === "upcoming");
  document
    .getElementById("tabEnding")
    .classList.toggle("active", v === "ending");
  document
    .getElementById("tabEnded")
    .classList.toggle("active", v === "ended");
  document
    .getElementById("tabAll")
    .classList.toggle("active", v === "all");
  render();
}

function visibleContracts() {
  const q = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  return contracts.filter((c) => {
    const status = computeStatus(c);
    if (view === "current" && status !== "current") return false;
    if (view === "upcoming" && status !== "active") return false;
    if (view === "ending" && !isEndingSoon(c)) return false;
    if (view === "ended" && status !== "ended") return false;
    if (q) {
      const hay = (
        c.name +
        " " +
        c.phone +
        " " +
        c.contractNo +
        " " +
        (c.notes || "")
      ).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function dateCell(ymd, cls) {
  const greg = formatDate(ymd);
  const hijri = HIJRI_OK ? gregToHijriStr(ymd) : "";
  const useHijri = datePref === "hijri" && !!hijri;
  return (
    "<td" +
    (cls ? ' class="' + cls + '"' : "") +
    ">" +
    (useHijri ? hijri : greg) +
    '<div class="hijri-sub">' +
    (useHijri ? greg : hijri) +
    "</div>" +
    "</td>"
  );
}

function render() {
  syncStatuses();
  updateDatePrefBtn();
  const list = visibleContracts();
  const tbody = document.getElementById("tableBody");

  const currentCount = contracts.filter(
    (c) => computeStatus(c) === "current",
  ).length;
  const activeCount = contracts.filter(
    (c) => computeStatus(c) === "active",
  ).length;
  const endedCount = contracts.filter(
    (c) => computeStatus(c) === "ended",
  ).length;
  const endingCount = contracts.filter(isEndingSoon).length;

  document.getElementById("tabAll").innerHTML =
    'الكل <span class="cnt">(' + contracts.length + ")</span>";
  document.getElementById("tabCurrent").innerHTML =
    'الحالية <span class="cnt">(' + currentCount + ")</span>";
  document.getElementById("tabUpcoming").innerHTML =
    'قادمة <span class="cnt">(' + activeCount + ")</span>";
  document.getElementById("tabEnding").innerHTML =
    '⏳ قرب الانتهاء <span class="cnt">(' + endingCount + ")</span>";
  document.getElementById("tabEnded").innerHTML =
    'المنتهية <span class="cnt">(' + endedCount + ")</span>";

  if (!list.length) {
    const q = document.getElementById("searchInput").value.trim();
    const msg = q
      ? "لا توجد نتائج مطابقة للبحث"
      : {
          current: "لا توجد عقود حالية",
          upcoming: "لا توجد عقود قادمة",
          ending: "لا توجد عقود على وشك الانتهاء",
          ended: "لا توجد عقود منتهية",
          all: "لا توجد عقود",
        }[view] || "لا توجد عقود";
    tbody.innerHTML =
      '<tr><td colspan="11" class="empty-cell"><div class="empty">' +
      msg +
      "</div></td></tr>";
    return;
  }

  list.sort((a, b) => {
    const sa = computeStatus(a),
      sb = computeStatus(b);
    if (view === "all" && sa !== sb)
      return (
        { current: 0, active: 1, ended: 2 }[sa] -
        { current: 0, active: 1, ended: 2 }[sb]
      );
    if (view === "ending") return daysUntil(a.end) - daysUntil(b.end);
    return b.id - a.id;
  });

  tbody.innerHTML = list
    .map((c) => {
      const status = computeStatus(c);
      const soon = isEndingSoon(c);
      let badge = '<span class="badge badge-active">قادم</span>';
      if (status === "current") {
        badge = soon
          ? '<span class="badge badge-soon">ينتهي قريبًا</span>'
          : '<span class="badge badge-current">نشط</span>';
      } else if (status === "ended") {
        badge = '<span class="badge badge-ended">منتهي</span>';
      }
      const endCls = status === "current" && soon ? "soon" : "";
      const endBtn =
        status === "current"
          ? '<button class="btn btn-sm btn-danger" onclick="askEnd(' +
            c.id +
            ')">إنهاء</button>'
          : "";
      const cancelEndBtn =
        status === "ended" &&
        c.start < todayYMD() &&
        c.end > todayYMD()
          ? '<button class="btn btn-sm btn-outline" onclick="askCancelEnd(' +
            c.id +
            ')">إلغاء الإنهاء</button>'
          : "";
      return (
        "<tr>" +
        '<td class="col-id">' +
        c.id +
        "</td>" +
        '<td class="col-name"><b>' +
        esc(c.name) +
        "</b></td>" +
        '<td dir="ltr" style="text-align:right">' +
        (esc(c.phone) || "—") +
        "</td>" +
        "<td>" +
        esc(c.contractNo) +
        "</td>" +
        "<td>" +
        c.room +
        "</td>" +
        "<td>" +
        formatPrice(c.price) +
        "</td>" +
        dateCell(c.start, "") +
        dateCell(c.end, endCls) +
        "<td>" +
        badge +
        "</td>" +
        '<td class="notes-cell">' +
        (esc(c.notes) || "—") +
        "</td>" +
        '<td class="actions-td"><div class="actions">' +
        endBtn +
        cancelEndBtn +
        '<button class="btn btn-sm btn-success" onclick="openModal(' +
        c.id +
        ')">تعديل</button>' +
        '<button class="btn btn-sm btn-danger" onclick="askDelete(' +
        c.id +
        ')">حذف</button>' +
        "</div></td>" +
        "</tr>"
      );
    })
    .join("");
}
