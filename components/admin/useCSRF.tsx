"use client";
import { useEffect, useState, useCallback } from "react";
import { CSRF_HEADER_NAME, getCSRFTokenFromDocumentCookies } from "@/lib/csrf-client";

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCSRFToken = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/csrf-token', {
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCSRFToken(data.csrfToken);
      } else {
        console.error('Failed to get CSRF token');
        setCSRFToken(null);
      }
    } catch (error) {
      console.error('CSRF token fetch error:', error);
      setCSRFToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCSRFToken();
    
    // Refresh CSRF token every 30 minutes
    const interval = setInterval(refreshCSRFToken, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshCSRFToken]);

  const getCSRFHeaders = useCallback((): Record<string, string> => {
    const token = csrfToken || getCSRFTokenFromDocumentCookies();
    if (!token) return {};
    
    return {
      [CSRF_HEADER_NAME]: token
    };
  }, [csrfToken]);

  const fetchWithCSRF = useCallback(async (url: string, options: RequestInit = {}) => {
    const csrfHeaders = getCSRFHeaders();
    const headers: HeadersInit = {
      ...(options.headers as Record<string, string> || {}),
      ...csrfHeaders
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  }, [getCSRFHeaders]);

  return {
    csrfToken,
    loading,
    refreshCSRFToken,
    getCSRFHeaders,
    fetchWithCSRF
  };
}
