"use client";

import React from "react";

export default function ChatModal() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("open-chat-modal", openHandler as EventListener);
    window.addEventListener("keydown", closeHandler as EventListener);
    return () => {
      window.removeEventListener("open-chat-modal", openHandler as EventListener);
      window.removeEventListener("keydown", closeHandler as EventListener);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
          <h2 className="text-sm font-semibold text-ink">Contact us</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-ink/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-0">
          <iframe
            src="https://dashboard.getlinkai.com/embed/cme7jn41o0001d4q5q4gt76dn/window"
            style={{ border: "none", width: "100%", height: "600px" }}
            allow="microphone"
          />
        </div>
      </div>
    </div>
  );
}


