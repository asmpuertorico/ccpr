"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import EventForm from "./EventForm";
import type { EventItem } from "@/lib/events";

interface EditEventModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: EventItem) => void;
  validationErrors: Record<string, string>;
  validationWarnings: Record<string, string>;
  loading: boolean;
  csrfLoading: boolean;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  uploadProgress: number;
}

export default function EditEventModal({
  event,
  isOpen,
  onClose,
  onSave,
  validationErrors,
  validationWarnings,
  loading,
  csrfLoading,
  imageFile,
  onImageFileChange,
  uploadProgress
}: EditEventModalProps) {
  const [form, setForm] = useState<Partial<EventItem>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setForm(event);
    } else {
      setForm({});
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (event && form.name && form.date && form.time && form.planner) {
      const updatedEvent: EventItem = {
        id: event.id,
        name: form.name,
        date: form.date,
        time: form.time,
        planner: form.planner,
        image: form.image || event.image,
        description: form.description || "",
        ticketsUrl: form.ticketsUrl || ""
      };
      onSave(updatedEvent);
    }
  };

  const handleClose = () => {
    setForm({});
    onClose();
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Event</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Editing: {event.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-indigo-200 hover:bg-white/20 transition-colors p-2 rounded-md"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Container - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <EventForm
            form={form}
            setForm={setForm}
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
            loading={loading}
            csrfLoading={csrfLoading}
            editingId={event.id}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            onPreview={() => setShowPreview(true)}
            imageFile={imageFile}
            onImageFileChange={onImageFileChange}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>

      {/* Preview Modal (nested modal) */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-6 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Event Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors p-2 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg">{form.name}</h4>
                <p className="text-sm text-gray-600">{form.date} • {form.time}</p>
                <p className="text-sm text-gray-600">By {form.planner}</p>
              </div>
              
              {form.image && (
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={form.image} 
                    alt={form.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {form.description && (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: form.description }} />
                </div>
              )}
              
              {form.ticketsUrl && (
                <a 
                  href={form.ticketsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  View Tickets
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
