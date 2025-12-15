export type EventItem = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (optional)
  endDate?: string; // YYYY-MM-DD (optional, for multi-day events)
  endTime?: string; // HH:mm (optional, for multi-day events)
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
    (v.time === undefined || v.time === null || typeof v.time === "string") &&
    (v.endDate === undefined || v.endDate === null || typeof v.endDate === "string") &&
    (v.endTime === undefined || v.endTime === null || typeof v.endTime === "string") &&
    typeof v.planner === "string" &&
    typeof v.image === "string"
  );
}

export function sortByDateAsc(a: EventItem, b: EventItem) {
  // For multi-day events, use end date for sorting; otherwise use start date
  const dateA = a.endDate || a.date;
  const dateB = b.endDate || b.date;
  const dateCompare = dateA.localeCompare(dateB);
  if (dateCompare !== 0) return dateCompare;
  
  // If dates are equal, compare times (use end time for multi-day events if available)
  const timeA = (a.endDate && a.endTime) ? a.endTime : (a.time || '');
  const timeB = (b.endDate && b.endTime) ? b.endTime : (b.time || '');
  return timeA.localeCompare(timeB);
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Utilities for date/time parsing, filtering, and formatting
export function getEventDateTime(event: EventItem): Date {
  const [year, month, day] = event.date.split("-").map((v: string) => parseInt(v, 10));
  
  // If no time specified or time is "00:00", treat as all-day event (end of day)
  if (!event.time || (typeof event.time === 'string' && (event.time.trim() === '' || event.time === '00:00'))) {
    return new Date(year, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999);
  }
  
  // At this point, TypeScript knows event.time is a non-empty string
  const [hour, minute] = event.time.split(":").map((v: string) => parseInt(v, 10));
  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0, 0);
}

export function getEventEndDateTime(event: EventItem): Date | null {
  // For multi-day events, return the end date/time
  if (!event.endDate) return null;
  
  const [year, month, day] = event.endDate.split("-").map((v: string) => parseInt(v, 10));
  
  // If no end time specified, treat as end of day
  if (!event.endTime || event.endTime.trim() === '') {
    return new Date(year, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999);
  }
  
  const [hour, minute] = event.endTime.split(":").map((v: string) => parseInt(v, 10));
  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 23, minute ?? 59, 0, 0);
}

export function isPastEvent(event: EventItem, now: Date = new Date()): boolean {
  console.log('🔍 isPastEvent check:', {
    name: event.name,
    date: event.date,
    time: event.time,
    timeType: typeof event.time,
    timeValue: JSON.stringify(event.time),
    endDate: event.endDate,
    endTime: event.endTime,
    now: now.toISOString()
  });
  
  // For multi-day events, check if end date/time has passed
  const endDateTime = getEventEndDateTime(event);
  if (endDateTime) {
    const isPast = endDateTime.getTime() < now.getTime();
    console.log('  📅 Multi-day event - endDateTime:', endDateTime.toISOString(), 'isPast:', isPast);
    return isPast;
  }
  
  // For single-day events, check start date/time
  // If no time specified or time is "00:00", treat as all-day event (valid until end of day)
  const hasNoTime = !event.time || (typeof event.time === 'string' && (event.time.trim() === '' || event.time === '00:00'));
  console.log('  ⏰ hasNoTime check:', {
    '!event.time': !event.time,
    'typeof event.time': typeof event.time,
    'event.time === string': typeof event.time === 'string',
    'event.time.trim() === ""': typeof event.time === 'string' ? event.time.trim() === '' : 'N/A',
    'event.time === "00:00"': event.time === '00:00',
    'hasNoTime result': hasNoTime
  });
  
  if (hasNoTime) {
    // Parse date explicitly - compare dates only, not times
    // For all-day events, compare the date itself (not end of day)
    // This avoids timezone issues when converting to UTC
    const [year, month, day] = event.date.split("-").map((v: string) => parseInt(v, 10));
    const eventDate = new Date(year, (month ?? 1) - 1, day ?? 1);
    // Set both to midnight local time for fair comparison
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    const isPast = eventDate.getTime() < today.getTime();
    console.log('  📆 All-day event - eventDate:', eventDate.toISOString(), 'today:', today.toISOString(), 'isPast:', isPast, {
      eventDateMs: eventDate.getTime(),
      todayMs: today.getTime(),
      diff: today.getTime() - eventDate.getTime(),
      eventDateLocal: eventDate.toString(),
      todayLocal: today.toString(),
      eventDateOnly: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      todayOnly: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    });
    return isPast;
  }
  
  const eventDateTime = getEventDateTime(event);
  const isPast = eventDateTime.getTime() < now.getTime();
  console.log('  🕐 Timed event - eventDateTime:', eventDateTime.toISOString(), 'isPast:', isPast);
  return isPast;
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

export function formatEventEndTime(event: EventItem): string {
  if (!event.endTime) return "";
  const [hourStr, minuteStr] = event.endTime.split(":");
  const hour = parseInt(hourStr || "0", 10);
  const minute = parseInt(minuteStr || "0", 10);
  if (hour === 0 && minute === 0) return "";
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatEventDateRange(event: EventItem): string {
  const startDate = formatEventDate(event);
  const startTime = formatEventTime(event);
  
  if (event.endDate) {
    const endDate = formatEventDate({
      ...event,
      date: event.endDate,
      time: event.endTime || "00:00"
    });
    const endTime = formatEventEndTime(event);
    
    if (event.endDate === event.date) {
      // Same day, show time range
      if (startTime && endTime) {
        return `${startDate} at ${startTime} - ${endTime}`;
      } else if (startTime) {
        return `${startDate} at ${startTime}`;
      } else {
        return startDate;
      }
    } else {
      // Different days, show date range
      if (startTime && endTime) {
        return `${startDate} at ${startTime} - ${endDate} at ${endTime}`;
      } else if (startTime) {
        return `${startDate} at ${startTime} - ${endDate}`;
      } else if (endTime) {
        return `${startDate} - ${endDate} at ${endTime}`;
      } else {
        return `${startDate} - ${endDate}`;
      }
    }
  }
  
  // Single day event
  if (startTime) {
    return `${startDate} at ${startTime}`;
  }
  return startDate;
}


