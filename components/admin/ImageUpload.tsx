"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Eye, X, Upload, Crop } from "lucide-react";
import PhotoEditor from "./PhotoEditor";

interface ImageUploadProps {
  value?: string; // Current image URL (for existing events)
  file?: File | null; // Selected file for upload
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

export default function ImageUpload({
  value,
  file,
  onFileChange,
  disabled = false,
  uploading = false,
  uploadProgress = 0,
  error
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // Set preview when file changes
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (value) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [file, value]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Validate file size (8MB max)
    if (selectedFile.size > 8 * 1024 * 1024) {
      alert("File too large. Maximum size is 8MB");
      return;
    }

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    // Open photo editor instead of directly setting file
    setOriginalFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setImageToEdit(objectUrl);
    setShowPhotoEditor(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'] },
    multiple: false,
    disabled: disabled || uploading,
  });

  const clearSelection = () => {
    onFileChange(null);
    setPreview(null);
  };

  const handlePhotoEditorSave = useCallback((croppedBlob: Blob, previewUrl: string) => {
    // Create a File object from the cropped blob
    const fileName = originalFile?.name || 'cropped-image.jpg';
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
    
    // Set the cropped file and close editor
    onFileChange(croppedFile);
    setShowPhotoEditor(false);
    setImageToEdit(null);
    
    // Cleanup original file URL if it exists
    if (imageToEdit && imageToEdit.startsWith('blob:')) {
      URL.revokeObjectURL(imageToEdit);
    }
  }, [originalFile, imageToEdit, onFileChange]);

  const handlePhotoEditorClose = useCallback(() => {
    setShowPhotoEditor(false);
    setImageToEdit(null);
    
    // Cleanup image URL
    if (imageToEdit && imageToEdit.startsWith('blob:')) {
      URL.revokeObjectURL(imageToEdit);
    }
  }, [imageToEdit]);

  const openCropEditor = useCallback(() => {
    if (preview) {
      setImageToEdit(preview);
      setShowPhotoEditor(true);
    }
  }, [preview]);

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:bg-gray-100'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} disabled={disabled || uploading} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-indigo-600 font-medium">Uploading... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {isDragActive ? "Drop the image here" : "Drag & drop an image, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 8MB (will be optimized to 1200×900px)
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCropEditor();
                  }}
                  disabled={disabled || uploading}
                  className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  title="Crop image"
                >
                  <Crop className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(true);
                  }}
                  className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="View full image"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  disabled={disabled || uploading}
                  className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* File info */}
          <div className="mt-2 text-xs text-gray-500">
            {file ? (
              <div className="flex items-center justify-between">
                <span>{file.name}</span>
                <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            ) : value ? (
              <span>Current event image</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Full Image Modal */}
      {showImageModal && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={preview} 
              alt="Full size preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Photo Editor */}
      <PhotoEditor
        image={imageToEdit || ''}
        isOpen={showPhotoEditor}
        onClose={handlePhotoEditorClose}
        onSave={handlePhotoEditorSave}
        title="Crop Event Image"
      />
    </div>
  );
}