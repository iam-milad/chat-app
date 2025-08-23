export function formatMessageTime(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();

  // Format time in 24h format
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London", // UK time
  });

  // Helper: check if same day
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Today
  if (isSameDay(date, now)) {
    return `Today at ${time}`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Yesterday at ${time}`;
  }

  // Otherwise: format date
  const showYear = date.getFullYear() !== now.getFullYear();
  const datePart = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    ...(showYear && { year: "numeric" }),
    timeZone: "Europe/London",
  });

  return `${datePart} at ${time}`;
}
