"use client";

import { useEffect } from "react";

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-lg border border-zinc-200 animate-in fade-in zoom-in-95 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md hover:bg-zinc-100 p-1 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </>
  );
}

export function ModalWithFooter({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-lg border border-zinc-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md hover:bg-zinc-100 p-1 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {footer && (
            <div className="border-t border-zinc-200 px-6 py-4 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
