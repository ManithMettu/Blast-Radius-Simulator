"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        classNames: {
          toast: "bg-white border border-slate-200 text-slate-900 shadow-lg",
        },
      }}
    />
  );
}
