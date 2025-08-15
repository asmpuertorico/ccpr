"use client";
import React, { useState } from "react";

export default function PasswordGate({ missingEnvMessage }: { missingEnvMessage?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Invalid password");
    }
  }

  return (
    <div className="max-w-sm mx-auto border border-ink/10 rounded-lg p-4 bg-white">
      <form onSubmit={onSubmit} className="space-y-3" aria-label="Admin sign in">
        <label className="block text-sm font-medium" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="w-full rounded-md border border-ink/20 px-3 py-2 focus-visible:ring-2 focus-visible:ring-ocean"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {missingEnvMessage && (
          <p className="text-xs text-sun">{missingEnvMessage}</p>
        )}
        {error && <p className="text-xs text-sun" role="status" aria-live="polite">{error}</p>}
        <button type="submit" className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
          Sign In
        </button>
      </form>
    </div>
  );
}



