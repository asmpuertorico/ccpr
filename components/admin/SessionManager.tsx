"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";

export default function SessionManager() {
  const { showToast } = useToast();
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session-check");
        if (!response.ok) {
          setSessionValid(false);
          showToast({
            type: "error",
            title: "Session Expired",
            message: "Please log in again."
          });
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setSessionValid(false);
        showToast({
          type: "error",
          title: "Connection Error",
          message: "Please check your internet connection."
        });
      }
    };

    // Check session immediately
    checkSession();

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [showToast]);

  // Show warning when session is about to expire (optional - simplified version)
  useEffect(() => {
    if (!sessionValid) return;

    // Check for session expiration warning every minute
    const warningInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/session-check");
        if (response.status === 401) {
          showToast({
            type: "warning",
            title: "Session Expiring",
            message: "Session will expire soon. Please save your work."
          });
        }
      } catch (error) {
        // Ignore errors for warning checks
      }
    }, 60 * 1000);

    return () => clearInterval(warningInterval);
  }, [sessionValid, showToast]);

  return null; // This component doesn't render anything visible
}
