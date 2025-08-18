import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Configure the scope to include additional context
  beforeSend(event, hint) {
    // Filter out non-critical errors in development
    if (process.env.NODE_ENV === 'development') {
      // Skip certain development-only errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Skip Next.js development warnings
          if (error.message.includes('Warning:') || error.message.includes('hydration')) {
            return null;
          }
        }
      }
    }

    // Add user context if available
    const session = typeof window !== 'undefined' ? 
      localStorage.getItem('admin_session') : null;
    
    if (session) {
      event.user = {
        id: 'admin',
        role: 'admin'
      };
    }

    return event;
  },

  // Configure which URLs to capture
  integrations: [
    new Sentry.Replay({
      // Capture only text and media, not forms for privacy
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
});

