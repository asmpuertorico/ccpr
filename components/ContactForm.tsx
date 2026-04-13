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
};

export default function ContactForm({ dict, className = "" }: ContactFormProps) {
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
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
              {dict.name} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:border-ocean focus:ring-2 focus:ring-ocean focus:ring-offset-2 focus:ring-offset-white transition-colors"
              placeholder={dict.name}
              required
              disabled={status === "submitting"}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              {dict.email} <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:border-ocean focus:ring-2 focus:ring-ocean focus:ring-offset-2 focus:ring-offset-white transition-colors"
              placeholder={dict.email}
              required
              disabled={status === "submitting"}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
            {dict.phone}
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:border-ocean focus:ring-2 focus:ring-ocean focus:ring-offset-2 focus:ring-offset-white transition-colors"
            placeholder={dict.phone}
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
              {dict.subject} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:border-ocean focus:ring-2 focus:ring-ocean focus:ring-offset-2 focus:ring-offset-white transition-colors"
            placeholder={dict.subject}
            required
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
              {dict.message} <span className="text-red-600">*</span>
            </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 focus:border-ocean focus:ring-2 focus:ring-ocean focus:ring-offset-2 focus:ring-offset-white transition-colors resize-none"
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
          className="w-full bg-ink text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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

