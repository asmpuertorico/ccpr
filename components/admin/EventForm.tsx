"use client";
import React from "react";
import { Calendar, Clock, User, Link, Image, FileText, Sparkles, Eye } from "lucide-react";
import { FormField } from "./FormField";
import ImageUpload from "./ImageUpload";
import DateTimePicker from "./DateTimePicker";
import RichTextEditor from "./RichTextEditor";
import type { EventItem } from "@/lib/events";

interface EventFormProps {
  form: Partial<EventItem>;
  setForm: (form: Partial<EventItem>) => void;
  validationErrors: Record<string, string>;
  validationWarnings: Record<string, string>;
  loading: boolean;
  csrfLoading: boolean;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onClear?: () => void;
  onPreview: () => void;
  imageFile?: File | null;
  onImageFileChange: (file: File | null) => void;
  uploadProgress?: number;
}

export default function EventForm({
  form,
  setForm,
  validationErrors,
  validationWarnings,
  loading,
  csrfLoading,
  editingId,
  onSubmit,
  onCancel,
  onClear,
  onPreview,
  imageFile,
  onImageFileChange,
  uploadProgress = 0
}: EventFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="space-y-6">
              <FormField
                label="Event Name"
                type="text"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={validationErrors.name}
                warning={validationWarnings.name}
                placeholder="Enter event name..."
                required
                disabled={loading || csrfLoading}
                className="text-lg font-medium"
              />
              <FormField
                label="Event Planner"
                type="text"
                value={form.planner || ""}
                onChange={(e) => setForm({ ...form, planner: e.target.value })}
                error={validationErrors.planner}
                warning={validationWarnings.planner}
                placeholder="Organization or planner name..."
                required
                disabled={loading || csrfLoading}
              />
            </div>
          </div>

          {/* Date & Time Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
            </div>
            <DateTimePicker
              label="Event Date & Time"
              value={form.date || ""}
              timeValue={form.time || ""}
              onChange={(date) => setForm({ ...form, date })}
              onTimeChange={(time) => setForm({ ...form, time })}
              error={validationErrors.date}
              warning={validationWarnings.date}
              timeError={validationErrors.time}
              timeWarning={validationWarnings.time}
              disabled={loading || csrfLoading}
              required
            />
          </div>

          {/* Visual Content Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Event Image <span className="text-red-500">*</span>
              </h3>
            </div>
            <ImageUpload
              value={form.image || ""}
              file={imageFile}
              onFileChange={onImageFileChange}
              disabled={loading || csrfLoading}
              uploading={loading}
              uploadProgress={uploadProgress}
              error={validationErrors.image}
            />
          </div>

          {/* Description Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Event Description</h3>
            </div>
            <RichTextEditor
              label="Description"
              value={form.description || ""}
              onChange={(description) => setForm({ ...form, description })}
              placeholder="Describe your event, include agenda, speakers, or special features..."
              disabled={loading || csrfLoading}
              maxLength={1000}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {validationErrors.description}
              </p>
            )}
            {validationWarnings.description && !validationErrors.description && (
              <p className="text-sm text-amber-600 flex items-center gap-1 mt-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {validationWarnings.description}
              </p>
            )}
          </div>

          {/* Tickets & Links Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tickets & Registration</h3>
            </div>
            <FormField
              label="Tickets URL"
              type="url"
              value={form.ticketsUrl || ""}
              onChange={(e) => setForm({ ...form, ticketsUrl: e.target.value })}
              error={validationErrors.ticketsUrl}
              warning={validationWarnings.ticketsUrl}
              placeholder="https://eventbrite.com/tickets/..."
              disabled={loading || csrfLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Optional: Add a link where visitors can purchase tickets or register for the event
            </p>
          </div>
        {/* Form Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading || csrfLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            {!editingId && onClear && (
              <button
                type="button"
                onClick={onClear}
                disabled={loading || csrfLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Form
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {Object.keys(validationErrors).length > 0 && (
                <span className="text-red-600">
                  {Object.keys(validationErrors).length} validation error(s)
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0 || csrfLoading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Event" : "Create Event")}
            </button>
          </div>
        </div>
      </form>
  );
}
