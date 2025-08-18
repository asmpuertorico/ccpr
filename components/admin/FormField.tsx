import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  isTextarea?: boolean;
  rows?: number;
}

export function FormField({ label, error, warning, isTextarea, rows, className, ...props }: FormFieldProps) {
  const baseClasses = "border rounded-md px-3 py-2 focus:outline-none focus:ring-2 w-full";
  let borderClasses = "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
  
  if (error) {
    borderClasses = "border-red-300 focus:ring-red-500 focus:border-red-500";
  } else if (warning) {
    borderClasses = "border-amber-300 focus:ring-amber-500 focus:border-amber-500";
  }
  
  const finalClasses = `${baseClasses} ${borderClasses} ${className || ""}`;

  const InputComponent = isTextarea ? "textarea" : "input";

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <InputComponent
        {...(props as any)}
        className={finalClasses}
        rows={isTextarea ? rows : undefined}
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
  );
}
