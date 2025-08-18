"use client";
import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar as CalendarIcon, Clock, User, ExternalLink, Edit, Trash2 } from "lucide-react";
import { useToast } from "./Toast";
import type { EventItem } from "@/lib/events";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: EventItem[];
  onEventEdit: (event: EventItem) => void;
  onEventDelete: (eventId: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventItem;
}

export default function CalendarView({ events, onEventEdit, onEventDelete }: CalendarViewProps) {
  const { showToast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Convert EventItem[] to CalendarEvent[]
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => {
      const [hours, minutes] = event.time.split(':').map(Number);
      const startDate = new Date(event.date);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(hours + 2, minutes, 0, 0); // Default 2-hour duration

      return {
        id: event.id,
        title: event.name,
        start: startDate,
        end: endDate,
        resource: event
      };
    });
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    const dateStr = start.toISOString().split('T')[0];
    const timeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    
    showToast({
      type: "info",
      title: "Create New Event",
      message: `Click "Manage Events" tab to create an event for ${dateStr} at ${timeStr}`
    });
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const now = new Date();
    const isPast = event.start < now;
    const isToday = event.start.toDateString() === now.toDateString();
    
    let backgroundColor = '#6366f1'; // Default indigo
    
    if (isPast) {
      backgroundColor = '#9ca3af'; // Gray for past events
    } else if (isToday) {
      backgroundColor = '#10b981'; // Green for today's events
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: isPast ? 0.7 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <div className="text-xs">
      <div className="font-medium truncate">{event.title}</div>
      <div className="opacity-75 truncate">{event.resource.planner}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Event Calendar</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-3 h-3 bg-indigo-600 rounded"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Past</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="h-[600px] p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent
            }}
            messages={{
              next: "Next",
              previous: "Previous",
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              agenda: "Agenda",
              noEventsInRange: "No events in this range",
              showMore: (total) => `+${total} more`
            }}
            step={60}
            timeslots={1}
            min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
            max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              agendaTimeFormat: 'HH:mm',
              agendaTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
            }}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {selectedEvent.name}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{moment(selectedEvent.date).format('MMMM D, YYYY')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{moment(selectedEvent.time, 'HH:mm').format('h:mm A')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{selectedEvent.planner}</span>
                </div>

                {selectedEvent.description && (
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-1">Description:</div>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                    />
                  </div>
                )}

                {selectedEvent.image && (
                  <div>
                    <div className="font-medium text-sm text-gray-700 mb-2">Event Image:</div>
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    onEventEdit(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit Event
                </button>

                {selectedEvent.ticketsUrl && (
                  <button
                    onClick={() => window.open(selectedEvent.ticketsUrl, '_blank')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Tickets
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this event?')) {
                      onEventDelete(selectedEvent.id);
                      setSelectedEvent(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 inline-flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

