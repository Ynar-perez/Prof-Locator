import React, { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';

const AvatarUpload = ({ 
  currentAvatar = null, 
  onImageSelect, 
  size = 'md',
  className = '' 
}) => {
  const [preview, setPreview] = useState(currentAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Size configurations
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process the selected file
  const processFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      // Pass both file and preview to parent
      if (onImageSelect) {
        onImageSelect(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Remove avatar
  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null, null);
    }
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      
      <div className="relative inline-block pt-2 pr-2">
  
        {/* Avatar Preview / Upload Area (This is the circular div) */}
        <div
          className={`
            ${sizeClasses[size]}
            relative rounded-full overflow-hidden 
            border-2 border-dashed cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : preview 
                ? 'border-gray-300 hover:border-gray-400' 
                : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100'
            }
          `}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
  
          {preview ? (
            <div className="relative w-full h-full"> 
              <img
                src={preview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={iconSizes[size]} className="text-white" />
              </div>
            </div>
          ) : (
            // Upload Placeholder
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
              <Upload size={iconSizes[size]} className="text-gray-400" />
              <span className="text-xs text-gray-500 text-center hidden sm:block">
                {isDragging ? 'Drop here' : 'Upload'}
              </span>
            </div>
          )}
        </div> 
  
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg z-10"
            aria-label="Remove avatar"
          >
            <X size={16} />
          </button>
        )}
  
      </div>
  
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Click or drag to upload ( max 5MB )
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;