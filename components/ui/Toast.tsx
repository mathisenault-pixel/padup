/**
 * Toast Component
 * Notifications temporaires en haut à droite de l'écran
 */

"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
};

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: {
      bg: "#d4edda",
      border: "#28a745",
      text: "#155724",
      icon: "✓",
    },
    error: {
      bg: "#f8d7da",
      border: "#dc3545",
      text: "#721c24",
      icon: "✕",
    },
    warning: {
      bg: "#fff3cd",
      border: "#ffc107",
      text: "#856404",
      icon: "⚠",
    },
    info: {
      bg: "#d1ecf1",
      border: "#17a2b8",
      text: "#0c5460",
      icon: "ℹ",
    },
  };

  const style = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        borderRadius: "8px",
        padding: "16px 20px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 2000,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        {style.icon}
      </div>

      {/* Message */}
      <div style={{ flex: 1, fontSize: "14px", lineHeight: "1.5" }}>{message}</div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          padding: "0 4px",
          color: style.text,
          opacity: 0.7,
        }}
        aria-label="Fermer"
      >
        ×
      </button>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook pour gérer les toasts
 */
export type ToastState = {
  id: number;
  message: string;
  type: ToastType;
} | null;

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent: toast ? (
      <Toast
        key={toast.id}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    ) : null,
  };
}

// Import React for the hook
import React from "react";
