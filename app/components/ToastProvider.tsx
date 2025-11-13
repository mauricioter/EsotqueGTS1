"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastProps } from "./Toast";

interface ToastContextProps {
  showToast: (message: string, type: ToastProps["type"]) => void;
}

const ToastContext = createContext<ToastContextProps>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{
    id: number;
    message: string;
    type: ToastProps["type"];
  }[]>([]);

  const showToast = (message: string, type: ToastProps["type"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
