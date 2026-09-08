"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

type ContactFormDict = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  subjectRequired: string;
  messageRequired: string;
};

type ContactFormProps = {
  dict: ContactFormDict;
  className?: string;
  /**
   * Background the form sits on. The contact and planners pages use a light
   * card; the homepage section is a dark one, where the default label and
   * button colors are nearly invisible.
   */
  tone?: "light" | "dark";
};

export default function ContactForm({ dict, className = "", tone = "light" }: ContactFormProps) {
  const isDark = tone === "dark";

  const labelClass = `block text-sm font-medium mb-2 ${
    isDark ? "text-neutral-200" : "text-neutral-700"
  }`;
  const requiredClass = isDark ? "text-red-400" : "text-red-600";
  // Inputs stay white in both tones; only the focus-ring offset has to match the
  // card, otherwise a white halo is drawn around each field on the dark section.
  const inputClass = `w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:border-ocean focus:ring-2 focus:ring-ocean focus:ring-offset-2 transition-colors ${
    isDark ? "focus:ring-offset-neutral-800" : "focus:ring-offset-white"
  }`;
  const buttonClass = `w-full px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
    isDark
      ? "bg-white text-ink hover:bg-neutral-200"
      : "bg-ink text-white hover:bg-neutral-800"
  }`;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage(dict.nameRequired);
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage(dict.emailRequired);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage(dict.emailInvalid);
      return false;
    }
    if (!formData.subject.trim()) {
      setErrorMessage(dict.subjectRequired);
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage(dict.messageRequired);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || dict.error);
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : dict.error);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelClass}>
              {dict.name} <span className={requiredClass}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder={dict.name}
              required
              disabled={status === "submitting"}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              {dict.email} <span className={requiredClass}>*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              placeholder={dict.email}
              required
              disabled={status === "submitting"}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            {dict.phone}
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={inputClass}
            placeholder={dict.phone}
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>
              {dict.subject} <span className={requiredClass}>*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={inputClass}
            placeholder={dict.subject}
            required
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>
              {dict.message} <span className={requiredClass}>*</span>
            </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={6}
            className={`${inputClass} resize-none`}
            placeholder={dict.message}
            required
            disabled={status === "submitting"}
          />
        </div>

        {status === "error" && errorMessage && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-800">{dict.success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className={buttonClass}
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {dict.submitting}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {dict.submit}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

