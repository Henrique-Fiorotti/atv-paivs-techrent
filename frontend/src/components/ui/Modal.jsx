"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeClasses[size]} bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur animate-in fade-in zoom-in-95 duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-slate-700/30 px-6 py-4">
              <h2 className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{title}</h2>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg hover:bg-slate-700/50 p-1 transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="px-6 py-5">{children}</div>
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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeClasses[size]} bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur animate-in fade-in zoom-in-95 duration-300 flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-slate-700/30 px-6 py-4">
              <h2 className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{title}</h2>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg hover:bg-slate-700/50 p-1 transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="px-6 py-5 flex-1">{children}</div>

          {footer && (
            <div className="border-t border-slate-700/30 px-6 py-4 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
