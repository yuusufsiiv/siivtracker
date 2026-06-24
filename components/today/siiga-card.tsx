"use client"

import { useState } from "react"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { BottomSheet } from "@/components/ui/sheet"
import type { SiigaConfig } from "@/lib/defaults"

export function SiigaCard({
  config,
  siiga,
  why,
  prevention,
  readOnly,
  onChange,
}: {
  config: SiigaConfig
  siiga: boolean
  why: string
  prevention: string
  readOnly?: boolean
  onChange: (next: {
    siiga: boolean
    why: string
    prevention: string
  }) => void
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draftWhy, setDraftWhy] = useState(why)
  const [draftPrev, setDraftPrev] = useState(prevention)

  function handleToggle(next: boolean) {
    if (readOnly) return
    if (!next && config.showSlipModal) {
      setDraftWhy(why)
      setDraftPrev(prevention)
      setSheetOpen(true)
    }
    onChange({ siiga: next, why, prevention })
  }

  return (
    <section className="rounded-2xl border border-gold/40 bg-gold-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-foreground">{config.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {siiga ? "Wanaagsan — sii wad" : "Maanta waa la dhacay"}
          </p>
        </div>
        <ToggleSwitch
          checked={siiga}
          onChange={handleToggle}
          accent="gold"
          disabled={readOnly}
          label={config.label}
        />
      </div>

      {!siiga && (why || prevention) && (
        <div className="mt-3 space-y-2 border-t border-gold/30 pt-3 text-xs text-muted-foreground">
          {why && (
            <p>
              <span className="font-semibold text-foreground">
                {config.whyLabel}{" "}
              </span>
              {why}
            </p>
          )}
          {prevention && (
            <p>
              <span className="font-semibold text-foreground">
                {config.preventionLabel}{" "}
              </span>
              {prevention}
            </p>
          )}
        </div>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={config.whyLabel}
      >
        <div className="space-y-4">
          <textarea
            value={draftWhy}
            onChange={(e) => setDraftWhy(e.target.value)}
            rows={3}
            placeholder="Qor sababta..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
          <label className="block text-sm font-semibold text-foreground">
            {config.preventionLabel}
          </label>
          <textarea
            value={draftPrev}
            onChange={(e) => setDraftPrev(e.target.value)}
            rows={3}
            placeholder="Qorshahaaga..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => {
              onChange({ siiga: false, why: draftWhy, prevention: draftPrev })
              setSheetOpen(false)
            }}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-95"
          >
            Keydi &amp; Xidh
          </button>
        </div>
      </BottomSheet>
    </section>
  )
}
