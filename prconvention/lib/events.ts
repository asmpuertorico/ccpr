export type EventItem = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  planner: string;
  image: string; // /images/...
  ticketsUrl?: string;
  description?: string;
};

export function isEventItem(value: unknown): value is EventItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.date === "string" &&
    typeof v.time === "string" &&
    typeof v.planner === "string" &&
    typeof v.image === "string"
  );
}

export function sortByDateAsc(a: EventItem, b: EventItem) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Utilities for date/time parsing, filtering, and formatting
export function getEventDateTime(event: EventItem): Date {
  // If time is 00:00, treat as end of day to avoid prematurely classifying as past
  const [year, month, day] = event.date.split("-").map((v) => parseInt(v, 10));
  const [hour, minute] = event.time?.split(":").map((v) => parseInt(v, 10)) ?? [0, 0];
  const useHour = hour === 0 && minute === 0 ? 23 : hour;
  const useMinute = hour === 0 && minute === 0 ? 59 : minute;
  return new Date(year, (month ?? 1) - 1, day ?? 1, useHour ?? 0, useMinute ?? 0, 0, 0);
}

export function isPastEvent(event: EventItem, now: Date = new Date()): boolean {
  return getEventDateTime(event).getTime() < now.getTime();
}

export function formatEventDate(event: EventItem): string {
  const d = new Date(event.date + "T00:00:00");
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.toLocaleString("en-US", { day: "2-digit" }).replace(/^0/, "");
  return `${month}, ${day}`;
}

export function formatEventTime(event: EventItem): string {
  const [hourStr, minuteStr] = (event.time || "00:00").split(":");
  const hour = parseInt(hourStr || "0", 10);
  const minute = parseInt(minuteStr || "0", 10);
  if (hour === 0 && minute === 0) return "";
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}


