export const es = {
  meta: {
    title: "Centro de Convenciones de Puerto Rico",
    description: "Descubre próximos eventos y más.",
  },
  nav: {
    visitors: "Visitantes",
    planners: "Planificadores",
    tour: "Tour Virtual",
    calendar: "Calendario",
    contact: "Contacto",
  },
  cta: {
    title: "¿Tienes preguntas o necesitas ayuda?",
    contact: "Contáctanos",
  },
  events: {
    empty: "No hay eventos disponibles por el momento.",
    buyTickets: "Comprar Boletos",
  },
  admin: {
    missingEnv: "La contraseña de administrador no está configurada.",
  },
} as const;

export type EsDict = typeof es;


