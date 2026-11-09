export function getLocalDateStr(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function extractDateOnlyStr(dateValue) {
  if (!dateValue) return "";
  const str = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return getLocalDateStr(parsed);
}

export function isoToDisplayDate(isoValue) {
  const dateOnly = extractDateOnlyStr(isoValue);
  if (!dateOnly) return "";
  const [year, month, day] = dateOnly.split("-");
  return `${day}/${month}/${year}`;
}

export function parseDisplayDateToIso(inputValue) {
  if (typeof inputValue !== "string") return "";
  const trimmed = inputValue.trim();
  if (!trimmed) return "";

  let day;
  let month;
  let year;

  // Support DD/MM/YYYY, D/M/YYYY, DD-MM-YYYY, D-M-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    day = Number(dmyMatch[1]);
    month = Number(dmyMatch[2]);
    year = Number(dmyMatch[3]);
  } else {
    // Also accept YYYY-MM-DD if pasted
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!isoMatch) return "";
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  }

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return "";
  }

  const probe = new Date(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return "";
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isTaskOverdue(todo) {
  if (!todo || todo.status === "completed" || !todo.dueDate) return false;
  const dueStr = extractDateOnlyStr(todo.dueDate);
  if (!dueStr) return false;
  return dueStr < getLocalDateStr();
}

export function getDueDateMeta(dueDateValue, status) {
  const dueStr = extractDateOnlyStr(dueDateValue);
  if (!dueStr) return null;

  const now = new Date();
  const todayStr = getLocalDateStr(now);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrow);

  const [y, m, d] = dueStr.split("-").map(Number);
  const displayDate = new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: y !== now.getFullYear() ? "numeric" : undefined,
  });

  if (status !== "completed" && dueStr < todayStr) {
    return { label: `Overdue (${displayDate})`, className: "badge-due-overdue" };
  }
  if (dueStr === todayStr) {
    return {
      label: "Due Today",
      className: status === "completed" ? "badge-due-upcoming" : "badge-due-today",
    };
  }
  if (dueStr === tomorrowStr) {
    return { label: "Due Tomorrow", className: "badge-due-upcoming" };
  }
  return { label: `Due ${displayDate}`, className: "badge-due-upcoming" };
}

export function formatTimestamp(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
