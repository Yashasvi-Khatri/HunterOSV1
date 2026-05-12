"use client";

import { useState, useCallback, useRef } from "react";
import {
  FileAttachment,
  SupportedMime,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../lib/attachment";

export interface UseFileUploadReturn {
  attachments: FileAttachment[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  openFilePicker: () => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  errors: string[];
  clearErrors: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedMime(mime: string): mime is SupportedMime {
  return ACCEPTED_MIME_TYPES.includes(mime as SupportedMime);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix — API wants raw base64
      const base64 = result.split(",")[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error(`Invalid data URL format for file: ${file.name}`));
      }
    };
    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function useFileUpload(): UseFileUploadReturn {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const dragCounterRef = useRef(0); // track nested drag enter/leave events
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const newAttachments: FileAttachment[] = [];

    for (const file of fileArray) {
      // Validate mime
      if (!isAcceptedMime(file.type)) {
        newErrors.push(
          `"${file.name}" — unsupported type. Use JPEG, PNG, GIF, WebP, or PDF.`,
        );
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        newErrors.push(`"${file.name}" is too large (max 20 MB).`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const isPdf = file.type === "application/pdf";

        const attachment: FileAttachment = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: isPdf ? "pdf" : "image",
          mime: file.type as SupportedMime,
          base64,
          sizeLabel: formatBytes(file.size),
          previewUrl: isPdf ? undefined : URL.createObjectURL(file),
        };

        newAttachments.push(attachment);
      } catch {
        newErrors.push(`Failed to process "${file.name}".`);
      }
    }

    if (newErrors.length) setErrors((e) => [...e, ...newErrors]);
    if (newAttachments.length) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
      return [];
    });
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // required to enable drop
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  return {
    attachments,
    isDragging,
    fileInputRef,
    addFiles,
    removeAttachment,
    clearAttachments,
    openFilePicker,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    errors,
    clearErrors,
  };
}
