"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function RichTextEditor({
  label,
  value = "",
  onChange,
  error,
  disabled = false,
  placeholder = "Enter description...",
  maxLength = 1000
}: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  const handleChange = (content: string) => {
    // Remove HTML tags for length calculation
    const textLength = content.replace(/<[^>]*>/g, '').length;
    
    if (textLength <= maxLength) {
      onChange(content);
    }
  };

  // Calculate current text length (without HTML tags)
  const currentLength = value.replace(/<[^>]*>/g, '').length;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      
      <div className={`relative ${disabled ? 'opacity-50' : ''}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className={`
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            height: '150px',
            marginBottom: '42px' // Space for toolbar
          }}
        />
        
        {/* Character counter */}
        <div className="absolute bottom-2 right-3 text-xs text-gray-500">
          {currentLength}/{maxLength}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Formatting tips */}
      <div className="text-xs text-gray-500">
        <details className="cursor-pointer">
          <summary className="hover:text-gray-700">Formatting tips</summary>
          <div className="mt-2 space-y-1 pl-4">
            <p>• Use headers to structure your content</p>
            <p>• Bold important information</p>
            <p>• Create lists for easy reading</p>
            <p>• Add links to external resources</p>
          </div>
        </details>
      </div>
    </div>
  );
}

