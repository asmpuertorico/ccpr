"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { EventItem } from "@/lib/events";
import { useToast } from "./Toast";
import { FormField } from "./FormField";
import { useCSRF } from "./useCSRF";
import ImageUpload from "./ImageUpload";
import DateTimePicker from "./DateTimePicker";
import RichTextEditor from "./RichTextEditor";
import BulkActions from "./BulkActions";
import EventPreview from "./EventPreview";
import EventForm from "./EventForm";
import EditEventModal from "./EditEventModal";
import { useAutoSave } from "./useAutoSave";
import PhotoEditor from "./PhotoEditor";
import { ChevronDown, ChevronRight, Plus, Eye } from "lucide-react";

type Props = { initialEvents: EventItem[] };

export default function AdminPanel({ initialEvents }: Props) {
  const { showToast } = useToast();
  const { fetchWithCSRF, loading: csrfLoading } = useCSRF();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Partial<EventItem>>({});
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string>>({});
  const [selectedEvents, setSelectedEvents] = useState<EventItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageCropEditor, setShowImageCropEditor] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [remoteImageData, setRemoteImageData] = useState<{ filename: string; url: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [isCreateFormExpanded, setIsCreateFormExpanded] = useState(false);

  const filtered = useMemo(() => {
    let result = query 
      ? events.filter((e) => {
          const q = query.toLowerCase();
          return [e.name, e.planner, e.date, e.time].some((f) => f.toLowerCase().includes(q));
        })
      : events;

    // Sort events: upcoming first, then today, then past
    return result.sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      const isAToday = dateA.getTime() === today.getTime();
      const isBToday = dateB.getTime() === today.getTime();
      const isAPast = dateA < today;
      const isBPast = dateB < today;
      
      // Today events first
      if (isAToday && !isBToday) return -1;
      if (isBToday && !isAToday) return 1;
      
      // Then upcoming events (future)
      if (!isAPast && !isAToday && (isBPast || isBToday)) return -1;
      if (!isBPast && !isBToday && (isAPast || isAToday)) return 1;
      
      // Within same category, sort by date (ascending for upcoming, descending for past)
      if (isAPast && isBPast) {
        return dateB.getTime() - dateA.getTime(); // Most recent past first
      } else {
        return dateA.getTime() - dateB.getTime(); // Nearest future first
      }
    });
  }, [events, query]);

  const getEventBadge = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    
    if (eventDate.getTime() === today.getTime()) {
      return { label: "Today", className: "bg-green-100 text-green-800" };
    } else if (eventDate > today) {
      return { label: "Upcoming", className: "bg-blue-100 text-blue-800" };
    } else {
      return { label: "Past", className: "bg-gray-100 text-gray-600" };
    }
  };

  // Load latest events from API to avoid server/client memory divergence
  useEffect(() => {
    fetch('/api/events').then(r=>r.json()).then((data)=>{
      if(Array.isArray(data?.events)) setEvents(data.events);
    }).catch(()=>{});
  }, []);

  // Form validation function
  const validateForm = (formData: Partial<EventItem>) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    // Required field errors (empty fields only)
    if (!formData.name?.trim()) {
      errors.name = "Event name is required";
    } else if (formData.name.length > 100) {
      warnings.name = "Event name is quite long (over 100 characters)";
    }
    
    if (!formData.planner?.trim()) {
      errors.planner = "Planner name is required";
    }
    
    if (!formData.date) {
      errors.date = "Event date is required";
    } else {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        warnings.date = "This event date is in the past";
      }
    }
    
    if (!formData.time) {
      errors.time = "Event time is required";
    }
    
    // Optional field warnings (format/content issues)
    if (formData.ticketsUrl && formData.ticketsUrl.trim()) {
      try {
        new URL(formData.ticketsUrl);
      } catch {
        warnings.ticketsUrl = "This doesn't look like a valid URL";
      }
    }
    
    if (formData.description && formData.description.length > 1000) {
      warnings.description = "Description is quite long (over 1000 characters)";
    } else if (formData.description && formData.description.length < 50) {
      warnings.description = "Consider adding more details to the description";
    }
    
    if (formData.image && formData.image.trim() && !formData.image.startsWith('/images/') && !formData.image.startsWith('http')) {
      warnings.image = "Image path format may not be recognized";
    }
    
    return { errors, warnings };
  };

  // Real-time validation on form changes
  useEffect(() => {
    const { errors, warnings } = validateForm(form);
    setValidationErrors(errors);
    setValidationWarnings(warnings);
  }, [form]);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate form before submission (including image requirement)
    const { errors } = validateForm(form);
    if (!imageFile && !form.image) {
      errors.image = "Event image is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fix the errors in the form before submitting."
      });
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      let imageUrl = form.image || "";
      
      // Upload image if a new file is selected (this will override any existing form.image)
      if (imageFile) {
        setUploadProgress(10);
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('optimize', 'true');
        formData.append('targetWidth', '1200');
        formData.append('targetHeight', '900');
        formData.append('quality', '85');

        const uploadRes = await fetchWithCSRF('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(70);

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url || uploadData.path; // Use url first, fallback to path for backward compatibility
          setUploadProgress(90);
        } else {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }
      }

      // Create/update event with image URL
      const payload = {
        name: form.name || "",
        planner: form.planner || "",
        date: form.date || "",
        time: form.time || "",
        image: imageUrl || "",
        ticketsUrl: form.ticketsUrl || "",
        description: form.description || "",
      };

      // Create new event
      const res = await fetchWithCSRF("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const created = (await res.json()) as EventItem;
        // Add cache-busting for new images to prevent browser caching
        const createdWithCacheBust = {
          ...created,
          image: created.image && imageFile ? `${created.image}?t=${Date.now()}` : created.image
        };
        setEvents((prev) => [...prev, createdWithCacheBust]);
        setForm({});
        setImageFile(null);
        setValidationErrors({});
        setValidationWarnings({});
        setUploadProgress(100);
        showToast({
          type: "success",
          title: "Event Created",
          message: `"${created.name}" has been created successfully.`
        });
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Operation Failed",
        message: error instanceof Error ? error.message : "An error occurred"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    try {
      const target = events.find((e) => e.id === id);
      const res = await fetchWithCSRF(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((x) => x.id !== id));
        if (target?.image?.startsWith("/images/events/")) {
          const rel = target.image.replace("/images/events/", "");
          fetch(`/api/uploads/${rel}`, { method: "DELETE" });
        }
        showToast({
          type: "success",
          title: "Event Deleted",
          message: `"${target?.name || 'Event'}" has been deleted.`
        });
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: error instanceof Error ? error.message : "Failed to delete event"
      });
    } finally {
      setDeletingId(null);
    }
  }



  const fetchRemoteImage = async (imageUrl: string) => {
    try {
      const response = await fetchWithCSRF('/api/fetch-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch image');
      }
    } catch (error) {
      console.error('Remote image fetch failed:', error);
      
      // Show a more helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unable to fetch image from URL';
      showToast({
        type: "warning",
        title: "Remote Image Not Available", 
        message: `${errorMessage}. You can manually upload an image using the upload area below.`
      });
      return null;
    }
  };

  const handleImageCropSave = (croppedBlob: Blob, previewUrl: string) => {
    // Create a File object from the cropped blob
    const fileName = remoteImageData?.filename || 'cropped-image.jpg';
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
    
    // Set the cropped file for upload (don't set form.image to temporary URL)
    setImageFile(croppedFile);
    // Remove any existing form image URL - let the upload process handle it
    setForm(prev => ({ ...prev, image: undefined }));
    
    // Close editor and cleanup
    setShowImageCropEditor(false);
    setImageToCrop(null);
    setRemoteImageData(null);
    
    showToast({
      type: "success",
      title: "Image Cropped",
      message: "Image has been cropped and will be uploaded when you save the event."
    });
  };

  const handleImageCropClose = () => {
    setShowImageCropEditor(false);
    setImageToCrop(null);
    setRemoteImageData(null);
  };

  // Modal edit functions
  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setModalImageFile(null); // Reset modal image file
    setValidationErrors({});
    setValidationWarnings({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEvent(null);
    setModalImageFile(null);
    setValidationErrors({});
    setValidationWarnings({});
  };

  // Clear form function
  const clearForm = () => {
    setForm({});
    setImageFile(null);
    setValidationErrors({});
    setValidationWarnings({});
    showToast({
      type: "success",
      title: "Form Cleared",
      message: "The form has been cleared and is ready for a new event."
    });
  };

  const saveEventFromModal = async (updatedEvent: EventItem) => {
    setLoading(true);
    try {
      let imageUrl = updatedEvent.image;
      
      // Upload new image if provided
      if (modalImageFile) {
        const formData = new FormData();
        formData.append('file', modalImageFile);
        formData.append('optimize', 'true');
        formData.append('targetWidth', '1200');
        formData.append('targetHeight', '900');
        formData.append('quality', '85');

        const uploadRes = await fetchWithCSRF('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url || uploadData.path;
        } else {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }
      }

      // Update the event
      const payload = {
        name: updatedEvent.name,
        planner: updatedEvent.planner,
        date: updatedEvent.date,
        time: updatedEvent.time,
        image: imageUrl || "",
        ticketsUrl: updatedEvent.ticketsUrl || "",
        description: updatedEvent.description || "",
      };

      const res = await fetchWithCSRF(`/api/events/${updatedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = (await res.json()) as EventItem;
        // Add cache-busting timestamp to image URL to force browser refresh
        const updatedWithCacheBust = {
          ...updated,
          image: updated.image && updated.image !== updatedEvent.image 
            ? `${updated.image}?t=${Date.now()}` 
            : updated.image
        };
        setEvents((prev) => prev.map((x) => (x.id === updated.id ? updatedWithCacheBust : x)));
        closeEditModal();
        showToast({
          type: "success",
          title: "Event Updated",
          message: `"${updated.name}" has been updated successfully.`
        });
      } else {
        throw new Error("Failed to update event");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: error instanceof Error ? error.message : "Failed to update event"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* URL Import Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <input 
            id="import-url" 
            placeholder="Paste event URL (Eventbrite, Facebook, etc.)" 
            className="flex-1 border border-blue-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          <button 
            type="button" 
            disabled={importLoading}
            className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 hover:bg-blue-700" 
            onClick={async()=>{
              const el = document.getElementById('import-url') as HTMLInputElement | null;
              const url = el?.value?.trim();
              if(!url) return;
              setImportLoading(true);
              try {
                const res = await fetch('/api/import-event', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url }) });
                if(res.ok){
                  const data = await res.json();
                  const ev = data.event || {};
                  
                  // Decode HTML entities in imported data
                  const decodeHtmlEntities = (str: string) => {
                    if (!str) return str;
                    const textarea = document.createElement('textarea');
                    textarea.innerHTML = str;
                    return textarea.value;
                  };
                  
                  // Separate the description from other fields to avoid interference
                  // Don't set image URL in form initially - we'll handle it separately
                  const formDataWithoutDescription = {
                    name: ev.name ? decodeHtmlEntities(ev.name) : "",
                    date: ev.date || "",
                    time: ev.time || "",
                    image: "", // Don't set remote URL directly to avoid CORS
                    planner: ev.planner ? decodeHtmlEntities(ev.planner) : "Eventbrite",
                    ticketsUrl: ev.ticketsUrl || "",
                  };
                  
                  const description = ev.description ? decodeHtmlEntities(ev.description) : "";
                  
                  // Step 1: Set all fields EXCEPT description first
                  setTimeout(() => {
                    setForm(prev => ({
                      ...prev,
                      ...formDataWithoutDescription
                    }));
                  }, 50);
                  
                  // Step 2: Set description separately after other fields are stable
                  setTimeout(() => {
                    setForm(prev => ({
                      ...prev,
                      description: description
                    }));
                  }, 200);

                  // Step 3: Fetch remote image if available
                  if (ev.image && ev.image.startsWith('http')) {
                    setTimeout(async () => {
                      const imageData = await fetchRemoteImage(ev.image);
                      if (imageData) {
                        // Set up for cropping
                        setRemoteImageData({
                          filename: imageData.filename,
                          url: ev.image
                        });
                        setImageToCrop(imageData.dataUrl);
                        setShowImageCropEditor(true);
                        
                        showToast({
                          type: "info", 
                          title: "Image Ready to Crop",
                          message: "Remote image loaded. Please crop it to fit your event card."
                        });
                      }
                    }, 300);
                  }
                  
                  if (el) el.value = '';
                  
                  // Expand the create form to show populated data
                  setIsCreateFormExpanded(true);
                  
                  // Show success message
                  showToast({
                    type: "success",
                    title: "Import Successful",
                    message: `Event "${ev.name ? decodeHtmlEntities(ev.name) : 'Unknown'}" data has been imported and populated in the form.`
                  });
                } else {
                  throw new Error('Unable to import from URL');
                }
              } catch (error) {
                showToast({
                  type: "error",
                  title: "Import Failed",
                  message: error instanceof Error ? error.message : 'Unable to import from URL'
                });
              } finally {
                setImportLoading(false);
              }
            }}
          >
            {importLoading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {importLoading ? 'Importing...' : 'Import from Website'}
          </button>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Import event details from external websites to quickly populate the form
        </p>
      </div>

      {/* Create New Event Accordion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Accordion Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600">
          <button
            onClick={() => setIsCreateFormExpanded(!isCreateFormExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Create New Event</h2>
                <p className="text-green-100 text-sm">
                  Add a new event to the calendar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              {isCreateFormExpanded ? (
                <ChevronDown className="h-5 w-5 text-white transition-transform" />
              ) : (
                <ChevronRight className="h-5 w-5 text-white transition-transform" />
              )}
            </div>
          </button>
        </div>
        
        {/* Accordion Content */}
        {isCreateFormExpanded && (
          <div className="border-t border-green-200 animate-in slide-in-from-top duration-200">
            <div className="p-6">
              <EventForm
                form={form}
                setForm={setForm}
                validationErrors={validationErrors}
                validationWarnings={validationWarnings}
                loading={loading}
                csrfLoading={csrfLoading}
                editingId={null} // Always null for create form
                onSubmit={createEvent}
                onCancel={() => {
                  setForm({}); 
                  setImageFile(null);
                  setValidationErrors({});
                  setValidationWarnings({});
                }}
                onClear={clearForm}
                onPreview={() => setShowPreview(true)}
                imageFile={imageFile}
                onImageFileChange={setImageFile}
                uploadProgress={uploadProgress}
              />
            </div>
          </div>
        )}
      </div>



      <BulkActions
        selectedEvents={selectedEvents}
        onClearSelection={() => setSelectedEvents([])}
        onEventsUpdated={setEvents}
        allEvents={events}
      />

      <div className="flex items-center justify-between">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search events..." className="border border-ink/20 rounded-md px-3 py-2 w-64" />

      </div>

      <div className="border border-ink/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5">
            <tr>
              <th className="text-left p-2 w-12">
                <input
                  type="checkbox"
                  checked={selectedEvents.length === filtered.length && filtered.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEvents(filtered);
                    } else {
                      setSelectedEvents([]);
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Planner</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-ink/10">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedEvents.some(selected => selected.id === e.id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedEvents([...selectedEvents, e]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(selected => selected.id !== e.id));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{e.name}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventBadge(e.date).className}`}>
                      {getEventBadge(e.date).label}
                    </span>
                  </div>
                </td>
                <td className="p-2">{e.date}</td>
                <td className="p-2">{e.time}</td>
                <td className="p-2">{e.planner}</td>
                <td className="p-2 flex gap-2">
                  <button 
                    onClick={() => openEditModal(e)}
                    disabled={loading || deletingId === e.id || showEditModal}
                    className="rounded-md border border-indigo-300 bg-indigo-50 text-indigo-700 px-2 py-1 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={()=>remove(e.id)} 
                    disabled={deletingId === e.id}
                    className="rounded-md border px-2 py-1 text-sun disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    {deletingId === e.id && (
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {deletingId === e.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <EventPreview
          event={form}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Image Crop Editor for Remote Images */}
      <PhotoEditor
        image={imageToCrop || ''}
        isOpen={showImageCropEditor}
        onClose={handleImageCropClose}
        onSave={handleImageCropSave}
        title="Crop Imported Image"
      />

      {/* Edit Event Modal */}
      <EditEventModal
        event={editingEvent}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={saveEventFromModal}
        validationErrors={validationErrors}
        validationWarnings={validationWarnings}
        loading={loading}
        csrfLoading={csrfLoading}
        imageFile={modalImageFile}
        onImageFileChange={setModalImageFile}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}


