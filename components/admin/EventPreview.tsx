"use client";
import React from "react";
import { Eye, Calendar, Clock, User, ExternalLink, X } from "lucide-react";
import moment from "moment";
import type { EventItem } from "@/lib/events";

interface EventPreviewProps {
  event: Partial<EventItem>;
  onClose: () => void;
}

export default function EventPreview({ event, onClose }: EventPreviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    return moment(dateString).format('MMMM D, YYYY');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'No time set';
    return moment(timeString, 'HH:mm').format('h:mm A');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Event Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          {/* Event Card Preview */}
          <div className="border rounded-lg overflow-hidden shadow-sm mb-6">
            {/* Event Image */}
            {event.image ? (
              <div className="aspect-[4/3] relative">
                <img
                  src={event.image}
                  alt={event.name || 'Event preview'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date ? moment(event.date).format('MMM D') : 'TBD'}
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm">No image selected</p>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {event.name || 'Untitled Event'}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                  {event.time && (
                    <>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{formatTime(event.time)}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{event.planner || 'No planner specified'}</span>
                </div>
              </div>

              {event.description && (
                <div className="mb-4">
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                {event.ticketsUrl ? (
                  <a
                    href={event.ticketsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buy Tickets
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                    <ExternalLink className="h-4 w-4" />
                    No Tickets URL
                  </div>
                )}

                <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Preview Mode</h4>
                <p className="text-sm text-blue-700">
                  This is how your event will appear to visitors on the website. The event card shows 
                  the key information in an attractive, easy-to-read format.
                </p>
              </div>
            </div>
          </div>

          {/* Validation Warnings */}
          <div className="mt-4">
            {(!event.name || !event.date || !event.time || !event.planner) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Missing Required Information</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {!event.name && <li>• Event name is required</li>}
                      {!event.date && <li>• Event date is required</li>}
                      {!event.time && <li>• Event time is required</li>}
                      {!event.planner && <li>• Planner name is required</li>}
                    </ul>
                    <p className="text-sm text-yellow-700 mt-2">
                      Complete these fields before publishing the event.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!event.image && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Recommendation</h4>
                    <p className="text-sm text-gray-700">
                      Adding an attractive event image will make your event more appealing to visitors 
                      and increase engagement.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

