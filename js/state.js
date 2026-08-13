/* ---------------- Application state ---------------- */

let contracts = [];
let idCounter = 1;
let view = "all";
let pendingDeleteId = null;
let pendingEndId = null;
let pendingCancelEndId = null;
let endMode = "manual";
let selectedDays = null;
let datePref = "gregorian";
let expandedCards = new Set();
let storageMode = "";
let storagePersisted = null;
