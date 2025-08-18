"use client";
import React from "react";
import { Trash2, Archive, Copy, Download, CheckSquare } from "lucide-react";
import { useToast } from "./Toast";
import { useCSRF } from "./useCSRF";
import type { EventItem } from "@/lib/events";

interface BulkActionsProps {
  selectedEvents: EventItem[];
  onClearSelection: () => void;
  onEventsUpdated: (updatedEvents: EventItem[]) => void;
  allEvents: EventItem[];
}

export default function BulkActions({ 
  selectedEvents, 
  onClearSelection, 
  onEventsUpdated,
  allEvents 
}: BulkActionsProps) {
  const { showToast } = useToast();
  const { fetchWithCSRF } = useCSRF();
  const [loading, setLoading] = React.useState(false);

  if (selectedEvents.length === 0) return null;

  const handleBulkDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete ${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const deletePromises = selectedEvents.map(event =>
        fetchWithCSRF(`/api/events/${event.id}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        const remainingEvents = allEvents.filter(
          event => !selectedEvents.some(selected => selected.id === event.id)
        );
        onEventsUpdated(remainingEvents);
        onClearSelection();

        showToast({
          type: "success",
          title: "Bulk Delete Complete",
          message: `Successfully deleted ${successful} event${successful > 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}.`
        });
      }

      if (failed > 0 && successful === 0) {
        showToast({
          type: "error",
          title: "Bulk Delete Failed",
          message: `Failed to delete ${failed} event${failed > 1 ? 's' : ''}.`
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Bulk Delete Error",
        message: "An unexpected error occurred during bulk delete."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDuplicate = async () => {
    setLoading(true);
    try {
      const duplicatePromises = selectedEvents.map(async (event) => {
        const duplicatedEvent = {
          ...event,
          name: `${event.name} (Copy)`,
          id: undefined // Remove ID so a new one is generated
        };

        return fetchWithCSRF('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(duplicatedEvent)
        });
      });

      const results = await Promise.allSettled(duplicatePromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        // Refresh events list
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          onEventsUpdated(data.events || []);
        }
        
        onClearSelection();

        showToast({
          type: "success",
          title: "Bulk Duplicate Complete",
          message: `Successfully duplicated ${successful} event${successful > 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}.`
        });
      }

      if (failed > 0 && successful === 0) {
        showToast({
          type: "error",
          title: "Bulk Duplicate Failed",
          message: `Failed to duplicate ${failed} event${failed > 1 ? 's' : ''}.`
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Bulk Duplicate Error",
        message: "An unexpected error occurred during bulk duplication."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelected = () => {
    try {
      const exportData = selectedEvents.map(event => ({
        name: event.name,
        planner: event.planner,
        date: event.date,
        time: event.time,
        image: event.image,
        ticketsUrl: event.ticketsUrl,
        description: event.description
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selected-events-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: "success",
        title: "Export Complete",
        message: `Exported ${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''} to JSON file.`
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export selected events."
      });
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-indigo-600" />
          <span className="font-medium text-indigo-900">
            {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          <button
            onClick={handleBulkDuplicate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Duplicate selected events"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>

          <button
            onClick={handleExportSelected}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export selected events"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete selected events"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>

          <button
            onClick={onClearSelection}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
}

