// src/components/admin/forms/FormFields.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Hook to autosave drafts and recover on page reload
export function useDraftAutosave<T>(key: string, values: T, resetTrigger: boolean, onRecover: (recovered: T) => void) {
  // Recover on mount
  useEffect(() => {
    const raw = sessionStorage.getItem(`w2w_draft_${key}`);
    if (raw) {
      try {
        const recovered = JSON.parse(raw);
        onRecover(recovered);
      } catch (e) {
        console.warn("Autosave recover failed", e);
      }
    }
  }, [key]);

  // Save changes
  useEffect(() => {
    if (values && Object.keys(values).length > 0) {
      sessionStorage.setItem(`w2w_draft_${key}`, JSON.stringify(values));
    }
  }, [key, values]);

  // Clear draft on successful submit / reset trigger
  useEffect(() => {
    if (resetTrigger) {
      sessionStorage.removeItem(`w2w_draft_${key}`);
    }
  }, [key, resetTrigger]);
}

interface FieldWrapperProps {
  label?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, success, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="admin-label flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[var(--admin-accent)]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <span className="text-xs text-[var(--admin-error)] flex items-center gap-1 animate-pulse">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
      {!error && success && (
        <span className="text-xs text-[var(--admin-success)] flex items-center gap-1">
          <CheckCircle2 size={12} />
          {success}
        </span>
      )}
    </div>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, success, required, className = "", ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error} success={success} required={required}>
        <input
          ref={ref}
          className={`admin-input ${error ? "border-[var(--admin-error)] focus:border-[var(--admin-error)] focus:ring-[var(--admin-error)]/15" : ""} ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
InputField.displayName = "InputField";

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, success, required, className = "", ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error} success={success} required={required}>
        <textarea
          ref={ref}
          rows={props.rows || 3}
          className={`admin-input resize-y min-h-[80px] ${error ? "border-[var(--admin-error)] focus:border-[var(--admin-error)] focus:ring-[var(--admin-error)]/15" : ""} ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
TextareaField.displayName = "TextareaField";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  options: { value: string | number; label: string }[];
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, success, options, required, className = "", ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error} success={success} required={required}>
        <select
          ref={ref}
          className={`admin-input ${error ? "border-[var(--admin-error)] focus:border-[var(--admin-error)]" : ""} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
);
SelectField.displayName = "SelectField";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  error?: string;
}

export function TagInputField({ label, tags = [], onChange, suggestions = [], placeholder = "Add tag...", error }: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggests, setShowSuggests] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggests(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInput("");
    setShowSuggests(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  return (
    <FieldWrapper label={label} error={error}>
      <div ref={containerRef} className="relative w-full">
        <div className="flex flex-wrap items-center gap-2 p-2 border border-[var(--admin-border-strong)] rounded-md bg-[var(--admin-input-bg)] min-h-[44px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/20"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 font-bold shrink-0 cursor-pointer"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggests(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggests(true)}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-[var(--admin-text)] py-0.5"
          />
        </div>

        {/* Suggestion list */}
        {showSuggests && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 max-h-32 overflow-y-auto bg-[var(--admin-card-bg)] border border-[var(--admin-border)] shadow-lg rounded-md z-30 divide-y divide-[var(--admin-border)] admin-scrollbar select-none text-xs">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddTag(s)}
                className="w-full text-left px-3 py-2 text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/10 transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
