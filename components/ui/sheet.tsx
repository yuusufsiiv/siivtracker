"use client"

import { X } from "lucide-react"
import type { ReactNode } from "react"

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  dismissable = true,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  dismissable?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Xidh"
        onClick={dismissable ? onClose : undefined}
        className="absolute inset-0 bg-foreground/40 animate-fade-in"
      />
      <div className="animate-slide-up relative z-10 w-full max-w-md rounded-t-3xl bg-background p-5 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? (
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
          ) : (
            <span />
          )}
          {dismissable && (
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
              aria-label="Xidh"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="max-h-[70dvh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Haa",
  cancelLabel = "Maya",
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Xidh"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40 animate-fade-in"
      />
      <div className="animate-pop-in relative z-10 w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {message && (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground active:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              "flex-1 rounded-xl py-3 text-sm font-semibold text-primary-foreground active:scale-95 " +
              (destructive ? "bg-danger" : "bg-primary")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
