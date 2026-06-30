import React, { useState } from 'react';

export default function TagInput({
  tags = [],
  onChange,
  maxTags = 10,
  placeholder = 'Add a tag...',
  className = '',
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    // Prevent form submission on pressing Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.endsWith(',')) {
      addTag(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
  };

  const addTag = (text = inputValue) => {
    const trimmed = text.trim().toUpperCase();
    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      setInputValue('');
      return;
    }

    if (tags.length >= maxTags) {
      setInputValue('');
      return;
    }

    const newTags = [...tags, trimmed];
    onChange(newTags);
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(newTags);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all ${className}`}>
      {/* Existing Tag Chips */}
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-55 bg-opacity-70 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors p-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 focus:outline-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {/* Input element */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag()}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={tags.length >= maxTags}
        className="flex-1 min-w-[120px] bg-transparent border-none p-1 text-sm focus:outline-none focus:ring-0 text-gray-900 dark:text-white disabled:cursor-not-allowed"
      />
    </div>
  );
}
