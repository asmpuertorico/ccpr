"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { FormField } from "./FormField";
import ImageUpload from "./ImageUpload";
import type { SalesRep } from "@/lib/db/schema";

export interface SalesRepFormData {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  region: string;
  linkedin: string;
  bio: string;
  status: "active" | "inactive";
  image: string;
}

interface SalesRepFormProps {
  rep?: SalesRep | null;
  onSave: (data: SalesRepFormData, imageFile: File | null) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

const REGIONS = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Southwest",
  "West Coast",
  "International",
  "Puerto Rico",
  "Caribbean",
];

const defaultForm: SalesRepFormData = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  phone: "",
  mobile: "",
  region: "",
  linkedin: "",
  bio: "",
  status: "active",
  image: "",
};

export default function SalesRepForm({ rep, onSave, onClose, saving = false }: SalesRepFormProps) {
  const [form, setForm] = useState<SalesRepFormData>(
    rep
      ? {
          firstName: rep.firstName,
          lastName: rep.lastName,
          title: rep.title,
          email: rep.email,
          phone: rep.phone || "",
          mobile: rep.mobile || "",
          region: rep.region || "",
          linkedin: rep.linkedin || "",
          bio: rep.bio || "",
          status: rep.status as "active" | "inactive",
          image: rep.image || "",
        }
      : defaultForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof SalesRepFormData, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function set(field: keyof SalesRepFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof SalesRepFormData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form, imageFile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {rep ? "Edit Sales Rep" : "New Sales Rep"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form id="sales-rep-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Profile Photo */}
          <div>
            <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Profile Photo
            </p>
            <ImageUpload
              value={form.image || undefined}
              file={imageFile}
              onFileChange={(file) => {
                setImageFile(file);
                if (!file) set("image", "");
              }}
              uploading={uploading}
            />
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              required
              value={form.firstName}
              onChange={(e) => set("firstName", (e.target as HTMLInputElement).value)}
              error={errors.firstName}
              placeholder="John"
            />
            <FormField
              label="Last Name"
              required
              value={form.lastName}
              onChange={(e) => set("lastName", (e.target as HTMLInputElement).value)}
              error={errors.lastName}
              placeholder="Doe"
            />
          </div>

          {/* Title */}
          <FormField
            label="Job Title"
            required
            value={form.title}
            onChange={(e) => set("title", (e.target as HTMLInputElement).value)}
            error={errors.title}
            placeholder="Senior Sales Executive"
          />

          {/* Email */}
          <FormField
            label="Email"
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", (e.target as HTMLInputElement).value)}
            error={errors.email}
            placeholder="john.doe@prconvention.com"
          />

          {/* Phone row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Office Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", (e.target as HTMLInputElement).value)}
              placeholder="(787) 000-0000"
            />
            <FormField
              label="Mobile"
              type="tel"
              value={form.mobile}
              onChange={(e) => set("mobile", (e.target as HTMLInputElement).value)}
              placeholder="(787) 000-0000"
            />
          </div>

          {/* Region */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Region / Territory
            </label>
            <select
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
              className="border border-neutral-300 dark:border-neutral-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">Select region...</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* LinkedIn */}
          <FormField
            label="LinkedIn URL"
            type="url"
            value={form.linkedin}
            onChange={(e) => set("linkedin", (e.target as HTMLInputElement).value)}
            placeholder="https://linkedin.com/in/johndoe"
          />

          {/* Bio */}
          <FormField
            label="Short Bio"
            isTextarea
            rows={3}
            value={form.bio}
            onChange={(e) => set("bio", (e.target as HTMLInputElement).value)}
            placeholder="Brief introduction about the sales rep..."
          />

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Status
            </label>
            <div className="flex gap-4">
              {(["active", "inactive"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => set("status", s)}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm capitalize text-neutral-700 dark:text-neutral-300">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="sales-rep-form"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              rep ? "Save Changes" : "Create Rep"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
