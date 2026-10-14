"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(14,14,16,0.92)",
            color: "#e4e4e7",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(14px)",
            borderRadius: "14px",
            fontSize: "14px",
            boxShadow: "0 12px 40px -12px rgba(168,85,247,0.35)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#050505" },
          },
          error: {
            iconTheme: { primary: "#f43f5e", secondary: "#050505" },
          },
        }}
      />
    </SessionProvider>
  );
}
