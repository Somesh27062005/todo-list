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
