"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD format
  timeValue?: string; // HH:MM format
  onChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  error?: string;
  warning?: string;
  timeError?: string;
  timeWarning?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
}

export default function DateTimePicker({
  label,
  value,
  timeValue,
  onChange,
  onTimeChange,
  error,
  warning,
  timeError,
  timeWarning,
  disabled = false,
  required = false,
  minDate = new Date()
}: DateTimePickerProps) {
  // Convert string to Date object
  const dateValue = value ? new Date(value + 'T00:00:00') : null;
  
  // Convert time string to Date object for time picker
  const timeAsDate = timeValue ? (() => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  })() : null;

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  const handleTimeChange = (time: Date | null) => {
    if (time) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      onTimeChange(`${hours}:${minutes}`);
    } else {
      onTimeChange('');
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">Date</label>
          <DatePicker
            selected={dateValue}
            onChange={handleDateChange}
            minDate={minDate}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select date..."
            disabled={disabled}
            className={`
              w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                warning ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            `}
            calendarClassName="shadow-lg border border-gray-200"
            dayClassName={(date) => {
              const today = new Date();
              const isToday = date.toDateString() === today.toDateString();
              const isPast = date < today;
              
              return `
                hover:bg-indigo-100 rounded-md transition-colors
                ${isToday ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                ${isPast ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
              `;
            }}
            showPopperArrow={false}
            popperClassName="z-50"
          />
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {warning && !error && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {warning}
            </p>
          )}
        </div>

        {/* Time Picker */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">Time</label>
          <DatePicker
            selected={timeAsDate}
            onChange={handleTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            placeholderText="Select time..."
            disabled={disabled}
            className={`
              w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${timeError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                timeWarning ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            `}
            popperClassName="z-50"
            showPopperArrow={false}
          />
          {timeError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeError}
            </p>
          )}
          {timeWarning && !timeError && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {timeWarning}
            </p>
          )}
        </div>
      </div>

      {/* Quick time buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Quick times:</span>
        {[
          { label: '9:00 AM', value: '09:00' },
          { label: '12:00 PM', value: '12:00' },
          { label: '2:00 PM', value: '14:00' },
          { label: '6:00 PM', value: '18:00' },
          { label: '7:00 PM', value: '19:00' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTimeChange(value)}
            disabled={disabled}
            className={`
              px-2 py-1 text-xs rounded border transition-colors
              ${timeValue === value 
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
