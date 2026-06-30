import React, { useState, useEffect, useRef } from 'react';

export default function ImageUpload({
  label,
  multiple = false,
  onChange,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp',
  value, // Can be File, File[], URL string, or URL string[]
  className = '',
}) {
  const fileInputRef = useRef(null);
  const [items, setItems] = useState([]); // Array of { id, url, file }

  // Sync state with incoming value
  useEffect(() => {
    let newItems = [];
    if (value) {
      if (multiple) {
        const arr = Array.isArray(value) ? value : [value];
        newItems = arr.map((item, index) => {
          if (item instanceof File) {
            return {
              id: `file-${index}-${item.name}`,
              url: URL.createObjectURL(item),
              file: item,
            };
          }
          // Existing Cloudinary URL
          return {
            id: `url-${index}`,
            url: item,
            file: null,
          };
        });
      } else {
        if (value instanceof File) {
          newItems = [{
            id: 'single-file',
            url: URL.createObjectURL(value),
            file: value,
          }];
        } else if (typeof value === 'string' && value.trim()) {
          newItems = [{
            id: 'single-url',
            url: value,
            file: null,
          }];
        }
      }
    }
    
    setItems(newItems);

    // Clean up created Object URLs to prevent memory leaks
    return () => {
      newItems.forEach((item) => {
        if (item.file && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [value, multiple]);

  const handleFileChange = (e) => {
    const chosenFiles = Array.from(e.target.files || []);
    if (chosenFiles.length === 0) return;

    if (multiple) {
      // Filter out files if it exceeds maxFiles limit
      const currentFiles = items.filter(item => item.file).map(item => item.file);
      const currentUrls = items.filter(item => !item.file).map(item => item.url);
      
      const newFiles = [...currentFiles, ...chosenFiles].slice(0, maxFiles - currentUrls.length);
      
      // Notify parent: we pass the combination of new File objects.
      // Wait, since we are doing form submissions, the parent needs the File list of NEW files.
      // We pass the new files array or the overall files array. Let's pass the array of Files.
      onChange(newFiles);
    } else {
      const file = chosenFiles[0];
      onChange(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input selection
    }
  };

  const handleRemove = (idToRemove) => {
    const itemToRemove = items.find(item => item.id === idToRemove);
    if (!itemToRemove) return;

    if (multiple) {
      const remainingItems = items.filter(item => item.id !== idToRemove);
      const remainingFiles = remainingItems.filter(item => item.file).map(item => item.file);
      
      // If we are editing and have removed an existing image, we can also pass a list of remaining URLs.
      // But standard File upload form only submits newly uploaded File objects.
      // So we pass the remaining File objects back to parent.
      onChange(remainingFiles);
    } else {
      onChange(null);
    }
  };

  const triggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        className="hidden"
      />

      {/* Single Upload Area Replacement logic */}
      {!multiple && items.length > 0 ? (
        // Render Single Preview
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video max-h-[220px] bg-gray-50 dark:bg-gray-900">
          <img src={items[0].url} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(items[0].id)}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-650 text-white rounded-full transition-colors focus:outline-none"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        // Render Upload Trigger Box
        <div className="space-y-4">
          {(multiple || items.length === 0) && (
            <div
              onClick={triggerPicker}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-600 rounded-xl p-6 text-center cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col items-center justify-center min-h-[140px]"
            >
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Click to upload
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                {multiple ? `Upload up to ${maxFiles} images` : 'JPG, PNG or WEBP (Max 5MB)'}
              </span>
            </div>
          )}

          {/* Multiple Image Grid Previews */}
          {multiple && items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-650 text-white rounded-full transition-colors focus:outline-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
