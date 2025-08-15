export const en = {
  meta: {
    title: "Puerto Rico Convention Center",
    description: "Discover upcoming events and more.",
  },
  nav: {
    visitors: "Visitors",
    planners: "Planners",
    tour: "Virtual Tour",
    calendar: "Calendar",
    contact: "Contact",
  },
  cta: {
    title: "Have questions or need assistance?",
    contact: "Contact Us",
  },
  events: {
    empty: "No events available at the moment.",
    buyTickets: "Buy Tickets",
  },
  admin: {
    missingEnv: "Admin password is not configured.",
  },
} as const;

export type EnDict = typeof en;


