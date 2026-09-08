import { unstable_cache } from "next/cache";
import { getStorage, getAllEventsWithFullData, type EnhancedEvent } from "./storage";
import { isPastEvent, sortByDateAsc, type EventItem } from "./events";

/**
 * Cache tag shared by every events read. Admin writes call
 * revalidateTag(EVENTS_TAG), which drops these entries and the cached pages
 * that rendered from them, so edits still show up immediately.
 */
export const EVENTS_TAG = "events";

/**
 * Safety-net expiry for a cached read. Deliberately long: revalidateTag covers
 * the normal edit path, and every expiry wakes the Neon compute back up, which
 * is the thing we're paying for.
 */
export const EVENTS_REVALIDATE_SECONDS = 21600; // 6 hours

/** Full events list. One database round trip per revalidation, not per visitor. */
export const getCachedEvents = unstable_cache(
  async (): Promise<EventItem[]> => getStorage().listFresh(),
  ["events:list"],
  { tags: [EVENTS_TAG], revalidate: EVENTS_REVALIDATE_SECONDS }
);

/**
 * Single event, resolved out of the cached list rather than its own query, so a
 * detail page view costs no database round trip at all. listFresh() returns
 * every row, so a miss here means the event genuinely does not exist.
 */
export async function getCachedEvent(id: string): Promise<EventItem | undefined> {
  const events = await getCachedEvents();
  return events.find((e) => e.id === id);
}

/** Full-fidelity rows for the public LLM endpoint. */
export const getCachedEventsWithFullData = unstable_cache(
  async (): Promise<EnhancedEvent[]> => getAllEventsWithFullData(),
  ["events:full"],
  { tags: [EVENTS_TAG], revalidate: EVENTS_REVALIDATE_SECONDS }
);

/**
 * Upcoming events for server rendering.
 *
 * "Past" is decided with the process's local clock, and on Vercel that is UTC
 * while the audience is on Atlantic time. Filtering against a point 12 hours in
 * the past keeps this a superset of what the visitor should see, so nothing
 * disappears from the server-rendered HTML that the client would still show;
 * the client trims the remainder against its own clock after mount.
 */
export async function getUpcomingEvents(): Promise<EventItem[]> {
  const graceWindow = new Date(Date.now() - 12 * 60 * 60 * 1000);
  return (await getCachedEvents())
    .filter((e) => !isPastEvent(e, graceWindow))
    .sort(sortByDateAsc);
}
