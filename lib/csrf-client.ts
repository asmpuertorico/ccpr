// Client-side CSRF utilities

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Gets CSRF token from document cookies (CLIENT-SIDE ONLY)
 */
export function getCSRFTokenFromDocumentCookies(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Creates headers with CSRF token for fetch requests
 */
export function createCSRFHeaders(additionalHeaders?: HeadersInit): Headers {
  const headers = new Headers(additionalHeaders);
  const csrfToken = getCSRFTokenFromDocumentCookies();
  
  if (csrfToken) {
    headers.set(CSRF_HEADER_NAME, csrfToken);
  }
  
  return headers;
}

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export async function fetchWithCSRF(url: string, options?: RequestInit): Promise<Response> {
  const csrfToken = getCSRFTokenFromDocumentCookies();
  
  if (!csrfToken) {
    throw new Error('CSRF token not available. Please refresh the page.');
  }
  
  const headers = new Headers(options?.headers);
  headers.set(CSRF_HEADER_NAME, csrfToken);
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };

