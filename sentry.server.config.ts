import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Configure the scope to include additional context
  beforeSend(event, hint) {
    // Add additional server context
    if (event.request) {
      // Log API endpoint information
      event.tags = {
        ...event.tags,
        endpoint: event.request.url,
        method: event.request.method,
      };
    }

    // Filter sensitive information
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't log authentication errors with sensitive data
        if (error.message.includes('password') || error.message.includes('token')) {
          event.extra = {
            ...event.extra,
            message: 'Authentication error (details redacted)'
          };
        }
      }
    }

    return event;
  },

  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  // Server-specific configuration
  debug: process.env.NODE_ENV === 'development',
});

