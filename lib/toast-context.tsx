"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: ToastType, title: string, message?: string) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, type, title, message }])
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return CheckCircle2
      case "error":
        return AlertCircle
      case "warning":
        return AlertTriangle
      case "info":
      default:
        return Info
    }
  }

  const styles: Record<ToastType, string> = {
    success: "border-success/30 bg-success/10",
    error: "border-destructive/30 bg-destructive/10",
    warning: "border-warning/30 bg-warning/10",
    info: "border-primary/30 bg-primary/10",
  }

  const iconStyles: Record<ToastType, string> = {
    success: "text-success",
    error: "text-destructive",
    warning: "text-warning",
    info: "text-primary",
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 md:bottom-4 md:left-auto md:right-4 md:w-96">
      {toasts.map((toast) => {
        const Icon = getIcon(toast.type)
        const style = styles[toast.type] || styles.info
        const iconStyle = iconStyles[toast.type] || iconStyles.info
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300",
              style,
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconStyle)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.message && <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-1 hover:bg-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
