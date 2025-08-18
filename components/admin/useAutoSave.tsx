"use client";
import { useEffect, useRef, useCallback } from "react";
import { useToast } from "./Toast";
import { useCSRF } from "./useCSRF";

interface AutoSaveOptions {
  delay?: number; // Delay in milliseconds before auto-saving
  onSave?: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions = {}
) {
  const {
    delay = 2000, // 2 seconds default
    onSave,
    onError,
    enabled = true
  } = options;

  const { showToast } = useToast();
  const { fetchWithCSRF } = useCSRF();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const saveData = useCallback(async (currentData: T) => {
    if (!enabled || isSavingRef.current || !mountedRef.current) return;

    try {
      isSavingRef.current = true;
      
      if (onSave) {
        await onSave(currentData);
      }

      if (mountedRef.current) {
        lastSavedRef.current = JSON.stringify(currentData);
        showToast({
          type: "info",
          title: "Auto-saved",
          message: "Your changes have been automatically saved.",
          duration: 2000
        });
      }
    } catch (error) {
      if (mountedRef.current) {
        const errorObj = error instanceof Error ? error : new Error('Auto-save failed');
        
        if (onError) {
          onError(errorObj);
        } else {
          showToast({
            type: "warning",
            title: "Auto-save Failed",
            message: "Your changes were not saved automatically. Please save manually.",
            duration: 5000
          });
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, onSave, onError, showToast]);

  useEffect(() => {
    if (!enabled) return;

    const currentDataString = JSON.stringify(data);
    
    // Don't auto-save if data hasn't changed or is empty
    if (
      currentDataString === lastSavedRef.current ||
      currentDataString === '{}' ||
      currentDataString === 'null' ||
      currentDataString === 'undefined'
    ) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        saveData(data);
      }
    }, delay);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveData(data);
  }, [data, saveData]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const currentDataString = JSON.stringify(data);
    return currentDataString !== lastSavedRef.current && 
           currentDataString !== '{}' && 
           currentDataString !== 'null' && 
           currentDataString !== 'undefined';
  }, [data]);

  return {
    saveNow,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: hasUnsavedChanges()
  };
}

// Auto-save enabled AdminPanel wrapper
export function withAutoSave<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  return function AutoSaveWrapper(props: T) {
    const { showToast } = useToast();

    // Warn user about unsaved changes when leaving page
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // This will be enhanced when integrated with form state
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Show auto-save status indicator
    useEffect(() => {
      const indicator = document.createElement('div');
      indicator.id = 'auto-save-indicator';
      indicator.className = 'fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium z-50 opacity-0 transition-opacity duration-200';
      indicator.textContent = 'Auto-save enabled';
      document.body.appendChild(indicator);

      // Show indicator briefly
      setTimeout(() => {
        indicator.style.opacity = '1';
        setTimeout(() => {
          indicator.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(indicator);
          }, 200);
        }, 2000);
      }, 100);

      return () => {
        const existingIndicator = document.getElementById('auto-save-indicator');
        if (existingIndicator) {
          document.body.removeChild(existingIndicator);
        }
      };
    }, []);

    return <Component {...props} />;
  };
}

