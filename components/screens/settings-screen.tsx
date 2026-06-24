"use client"

import { useState, type ReactNode } from "react"
import {
  ChevronRight,
  User,
  Palette,
  SlidersHorizontal,
  ListChecks,
  MoonStar,
  Cigarette,
  ScrollText,
  CalendarRange,
  Lock,
  Database,
  LogOut,
  Trash2,
  Download,
  Plus,
  X,
  Cloud,
  CloudOff,
} from "lucide-react"
import { useStore, hashPin, pinToPassword, type CustomTask } from "@/lib/store"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { BottomSheet, ConfirmDialog } from "@/components/ui/sheet"
import { PinPad } from "@/components/pin-pad"
import { supabase } from "@/lib/supabase"
import type { TaskDef, SectionDef } from "@/lib/defaults"

type Panel =
  | null
  | "profile"
  | "appearance"
  | "custom"
  | "tasks"
  | "prayers"
  | "siiga"
  | "rules"
  | "weekly"
  | "security"
  | "data"

export function SettingsScreen({ onLock }: { onLock: () => void }) {
  const { state, setState, reset, supabaseUser, syncProfile } = useStore()
  const [panel, setPanel] = useState<Panel>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function closePanel() {
    setPanel(null)
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">Dejinta</h1>
        <p className="text-sm text-muted-foreground">
          {state.user?.name} · {state.user?.email}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {supabaseUser ? (
            <>
              <Cloud className="h-3.5 w-3.5 text-success" />
              <span className="text-success">Xog la keydiyo</span>
            </>
          ) : (
            <>
              <CloudOff className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Offline mode</span>
            </>
          )}
        </div>
      </header>

      <div className="space-y-5">
        <Group title="Akoonka">
          <Row
            icon={<User className="h-5 w-5" />}
            label="Macluumaadka Profile"
            onClick={() => setPanel("profile")}
          />
          <Row
            icon={<Palette className="h-5 w-5" />}
            label="Muuqaalka (Theme)"
            onClick={() => setPanel("appearance")}
          />
        </Group>

        <Group title="App-ka">
          <Row
            icon={<SlidersHorizontal className="h-5 w-5" />}
            label="Hagaajinta Guud"
            onClick={() => setPanel("custom")}
          />
          <Row
            icon={<ListChecks className="h-5 w-5" />}
            label="Hawlaha (CRUD)"
            onClick={() => setPanel("tasks")}
          />
          <Row
            icon={<MoonStar className="h-5 w-5" />}
            label="Salaadaha"
            onClick={() => setPanel("prayers")}
          />
          <Row
            icon={<Cigarette className="h-5 w-5" />}
            label={state.config.siiga.label}
            onClick={() => setPanel("siiga")}
          />
          <Row
            icon={<ScrollText className="h-5 w-5" />}
            label="Xeerarka"
            onClick={() => setPanel("rules")}
          />
          <Row
            icon={<CalendarRange className="h-5 w-5" />}
            label="Su'aalaha Toddobaadle"
            onClick={() => setPanel("weekly")}
          />
        </Group>

        <Group title="Amniga & Xogta">
          <Row
            icon={<Lock className="h-5 w-5" />}
            label="Beddel PIN-ka"
            onClick={() => setPanel("security")}
          />
          <Row
            icon={<Database className="h-5 w-5" />}
            label="Xogta (Export / Reset)"
            onClick={() => setPanel("data")}
          />
        </Group>

        <div className="space-y-3 pt-2">
          <button
            onClick={onLock}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground active:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Xidh App-ka
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-danger active:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Tirtir Dhammaan Xogta
          </button>
        </div>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Siiv Track · v2.0
        </p>
      </div>

      <ProfilePanel open={panel === "profile"} onClose={closePanel} onSync={syncProfile} />
      <AppearancePanel open={panel === "appearance"} onClose={closePanel} onSync={syncProfile} />
      <CustomPanel open={panel === "custom"} onClose={closePanel} onSync={syncProfile} />
      <TasksPanel open={panel === "tasks"} onClose={closePanel} onSync={syncProfile} />
      <PrayersPanel open={panel === "prayers"} onClose={closePanel} onSync={syncProfile} />
      <SiigaPanel open={panel === "siiga"} onClose={closePanel} onSync={syncProfile} />
      <RulesPanel open={panel === "rules"} onClose={closePanel} onSync={syncProfile} />
      <WeeklyPanel open={panel === "weekly"} onClose={closePanel} onSync={syncProfile} />
      <SecurityPanel open={panel === "security"} onClose={closePanel} />
      <DataPanel open={panel === "data"} onClose={closePanel} />

      <ConfirmDialog
        open={confirmReset}
        title="Tirtir dhammaan xogta?"
        message="Tani waxay tirtiri doontaa akoonkaaga, horumarkaaga, iyo dhammaan dejinta. Ma soo celin karto."
        confirmLabel="Tirtir"
        destructive
        onConfirm={() => {
          reset()
          setConfirmReset(false)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}

/* ----------------------------- Layout bits ----------------------------- */

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </div>
    </section>
  )
}

function Row({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-0 active:bg-muted"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1 truncate text-sm font-medium text-foreground">
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring"
      />
    </label>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
  accent,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  accent?: "primary" | "gold" | "success"
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} accent={accent} />
    </div>
  )
}

/* ------------------------------- Panels ------------------------------- */

function ProfilePanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  const u = state.user
  if (!open || !u) return null
  function update(patch: Partial<typeof u>) {
    setState((prev) => ({ ...prev, user: { ...prev.user!, ...patch } }))
  }
  return (
    <BottomSheet
      open={open}
      onClose={() => {
        onClose()
        onSync()
      }}
      title="Macluumaadka Profile"
    >
      <div className="space-y-4">
        <Field label="Magaca" value={u.name} onChange={(v) => update({ name: v })} />
        <Field
          label="Email"
          type="email"
          value={u.email}
          onChange={(v) => update({ email: v })}
        />
        <Field
          label="Magaalada"
          value={u.city}
          onChange={(v) => update({ city: v })}
          placeholder="Tusaale: Hargeisa"
        />
        <p className="text-xs text-muted-foreground">
          Magaalada waxaa loo isticmaalaa xisaabinta waqtiyada salaadda.
        </p>
      </div>
    </BottomSheet>
  )
}

function AppearancePanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  if (!open) return null
  const theme = state.config.theme
  function setTheme(t: "navy" | "dark") {
    setState((prev) => ({ ...prev, config: { ...prev.config, theme: t } }))
    setTimeout(onSync, 100)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Muuqaalka">
      <div className="grid grid-cols-2 gap-3">
        {(["navy", "dark"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={
              "rounded-xl border-2 p-4 text-left transition-colors " +
              (theme === t ? "border-primary" : "border-border")
            }
          >
            <div
              className={
                "mb-3 h-16 w-full rounded-lg " +
                (t === "navy" ? "bg-[#0a2463]" : "bg-[#060d1c]")
              }
            />
            <p className="text-sm font-semibold capitalize text-foreground">
              {t === "navy" ? "Iftiin (Navy)" : "Madow (Dark)"}
            </p>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

function CustomPanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  if (!open) return null
  const cfg = state.config
  function set<K extends keyof typeof cfg>(key: K, value: (typeof cfg)[K]) {
    setState((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }))
    setTimeout(onSync, 300)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Hagaajinta Guud">
      <div className="space-y-4">
        <Field
          label="Cinwaanka App-ka"
          value={cfg.appTitle}
          onChange={(v) => set("appTitle", v)}
        />
        <Field
          label="Calaamadda Score-ka"
          value={cfg.scoreLabel}
          onChange={(v) => set("scoreLabel", v)}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">
            Qoraalka Dhiirigelinta
          </span>
          <textarea
            value={cfg.quote}
            onChange={(e) => set("quote", e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring"
          />
        </label>
        <div className="divide-y divide-border">
          <ToggleRow
            label="Tus qoraalka dhiirigelinta"
            checked={cfg.showQuote}
            onChange={(v) => set("showQuote", v)}
          />
          <ToggleRow
            label="Tus Score-ka"
            checked={cfg.showScore}
            onChange={(v) => set("showScore", v)}
          />
          <ToggleRow
            label="Tus xeerarka"
            checked={cfg.showRules}
            onChange={(v) => set("showRules", v)}
          />
          <ToggleRow
            label="Tus saafka salaadda"
            checked={cfg.showPrayerRow}
            onChange={(v) => set("showPrayerRow", v)}
          />
          <ToggleRow
            label="Tus waqtiga ku xiga (countdown)"
            checked={cfg.showCountdown}
            onChange={(v) => set("showCountdown", v)}
          />
        </div>
      </div>
    </BottomSheet>
  )
}

/* ── Full CRUD Tasks Panel ─────────────────────────────────────────────── */

function TasksPanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskSection, setNewTaskSection] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  if (!open) return null
  const cfg = state.config

  const enabledSections = cfg.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)

  function updateTask(id: string, patch: Partial<TaskDef>) {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        tasks: prev.config.tasks.map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        ),
      },
    }))
    setTimeout(onSync, 300)
  }

  function addTask() {
    if (!newTaskName.trim()) return
    const section = newTaskSection || (enabledSections[0]?.id ?? "subax")
    const id = `task_${Date.now()}`
    const newT: TaskDef = {
      id,
      name: newTaskName.trim(),
      section,
      countInScore: true,
      enabled: true,
      order: cfg.tasks.length,
    }
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, tasks: [...prev.config.tasks, newT] },
    }))
    setNewTaskName("")
    setNewTaskSection("")
    setAddingTask(false)
    setTimeout(onSync, 300)
  }

  function deleteTask(id: string) {
    // Soft-delete: just disable the task so old history stays intact
    updateTask(id, { enabled: false })
  }

  function startEdit(task: TaskDef) {
    setEditingTaskId(task.id)
    setEditName(task.name)
  }

  function saveEdit(id: string) {
    updateTask(id, { name: editName.trim() })
    setEditingTaskId(null)
    setEditName("")
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Hawlaha Maalinlaha">
      <div className="space-y-3">
        {enabledSections.map((section) => {
          const sectionTasks = cfg.tasks.filter(
            (t) => t.section === section.id && t.enabled,
          )
          return (
            <div key={section.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.name}
              </p>
              {sectionTasks.map((t) => (
                <div
                  key={t.id}
                  className="mb-2 rounded-xl border border-border bg-card p-3"
                >
                  {editingTaskId === t.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-ring"
                      />
                      <button
                        onClick={() => saveEdit(t.id)}
                        disabled={!editName.trim()}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                      >
                        Keydi
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="rounded-lg p-1.5 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {t.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(t)}
                          className="rounded-lg p-1.5 text-muted-foreground active:text-foreground"
                          aria-label="Wax ka beddel"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="rounded-lg p-1.5 text-danger active:bg-danger/10"
                          aria-label="Tirtir"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {!editingTaskId && t.enabled && (
                    <label className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Ku xisaabi Score-ka
                      </span>
                      <ToggleSwitch
                        accent="success"
                        checked={t.countInScore}
                        onChange={(v) => updateTask(t.id, { countInScore: v })}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          )
        })}

        {/* Add new task form */}
        {addingTask ? (
          <div className="rounded-xl border border-dashed border-primary/50 bg-card p-3 space-y-3">
            <p className="text-sm font-semibold text-foreground">Hawl Cusub</p>
            <input
              autoFocus
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Magaca hawsha..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring"
            />
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Qaybta</p>
              <div className="flex flex-wrap gap-2">
                {enabledSections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setNewTaskSection(s.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      newTaskSection === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addTask}
                disabled={!newTaskName.trim()}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                Ku dar
              </button>
              <button
                onClick={() => {
                  setAddingTask(false)
                  setNewTaskName("")
                  setNewTaskSection("")
                }}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                Jooji
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingTask(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-primary active:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Ku dar hawl cusub
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

function PrayersPanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  if (!open) return null
  const cfg = state.config
  function update(id: string, patch: Partial<(typeof cfg.prayers)[number]>) {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        prayers: prev.config.prayers.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        ),
      },
    }))
    setTimeout(onSync, 300)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Salaadaha">
      <div className="space-y-3">
        {cfg.prayers.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">
                {p.label}
              </span>
              <ToggleSwitch
                checked={p.show}
                onChange={(v) => update(p.id, { show: v })}
              />
            </div>
            {p.show && (
              <label className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
                <span className="text-xs text-muted-foreground">
                  Digniin waqtiga salaadda
                </span>
                <ToggleSwitch
                  accent="gold"
                  checked={p.notify}
                  onChange={(v) => update(p.id, { notify: v })}
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

function SiigaPanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  if (!open) return null
  const s = state.config.siiga
  function set<K extends keyof typeof s>(key: K, value: (typeof s)[K]) {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, siiga: { ...prev.config.siiga, [key]: value } },
    }))
    setTimeout(onSync, 300)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Habka Siigada">
      <div className="space-y-4">
        <Field label="Calaamadda" value={s.label} onChange={(v) => set("label", v)} />
        <Field
          label="Su'aasha 'Maxaa kuu keenay'"
          value={s.whyLabel}
          onChange={(v) => set("whyLabel", v)}
        />
        <Field
          label="Su'aasha ka hortagga"
          value={s.preventionLabel}
          onChange={(v) => set("preventionLabel", v)}
        />
        <div className="divide-y divide-border">
          <ToggleRow
            label="Tus qaybta siigada"
            checked={s.show}
            onChange={(v) => set("show", v)}
          />
          <ToggleRow
            label="Ku xisaabi Score-ka"
            checked={s.countInScore}
            accent="success"
            onChange={(v) => set("countInScore", v)}
          />
          <ToggleRow
            label="Tus modal marka la dhaco"
            checked={s.showSlipModal}
            onChange={(v) => set("showSlipModal", v)}
          />
        </div>
      </div>
    </BottomSheet>
  )
}

function RulesPanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  if (!open) return null
  const rules = state.config.rules
  function setRules(next: typeof rules) {
    setState((prev) => ({ ...prev, config: { ...prev.config, rules: next } }))
    setTimeout(onSync, 300)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Xeerarka">
      <div className="space-y-3">
        {rules.map((r, i) => (
          <div key={r.id} className="flex items-start gap-2">
            <textarea
              value={r.text}
              onChange={(e) =>
                setRules(
                  rules.map((x) =>
                    x.id === r.id ? { ...x, text: e.target.value } : x,
                  ),
                )
              }
              rows={2}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            />
            <button
              onClick={() => setRules(rules.filter((x) => x.id !== r.id))}
              className="mt-1 rounded-lg p-2 text-danger active:bg-danger/10"
              aria-label="Tirtir"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            setRules([
              ...rules,
              { id: `rule-${Date.now()}`, text: "" },
            ])
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-primary active:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Ku dar xeer
        </button>
      </div>
    </BottomSheet>
  )
}

function WeeklyPanel({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  const { state, setState } = useStore()
  if (!open) return null
  const fields = state.config.weeklyFields
  function setFields(next: typeof fields) {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, weeklyFields: next },
    }))
    setTimeout(onSync, 300)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Su'aalaha Toddobaadle">
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.id} className="flex items-center gap-2">
            <input
              value={f.label}
              onChange={(e) =>
                setFields(
                  fields.map((x) =>
                    x.id === f.id ? { ...x, label: e.target.value } : x,
                  ),
                )
              }
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring"
            />
            <ToggleSwitch
              checked={f.show}
              onChange={(v) =>
                setFields(
                  fields.map((x) => (x.id === f.id ? { ...x, show: v } : x)),
                )
              }
            />
            <button
              onClick={() => setFields(fields.filter((x) => x.id !== f.id))}
              className="rounded-lg p-2 text-danger active:bg-danger/10"
              aria-label="Tirtir"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            setFields([
              ...fields,
              { id: `wf-${Date.now()}`, label: "", show: true },
            ])
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-primary active:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Ku dar su'aal
        </button>
      </div>
    </BottomSheet>
  )
}

function SecurityPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state, setState } = useStore()
  const [step, setStep] = useState<"current" | "new" | "confirm">("current")
  const [pin, setPin] = useState("")
  const [firstNew, setFirstNew] = useState("")
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)
  const [done, setDone] = useState(false)

  if (!open) return null

  function fail(msg: string) {
    setError(msg)
    setShake(true)
    setPin("")
    setTimeout(() => setShake(false), 450)
  }

  async function handleChange(next: string) {
    setError("")
    setPin(next)
    if (next.length !== 4) return

    if (step === "current") {
      if (hashPin(next) === state.user?.pin) {
        setStep("new")
        setPin("")
      } else fail("PIN-ka khaldan")
    } else if (step === "new") {
      setFirstNew(next)
      setStep("confirm")
      setPin("")
    } else {
      if (next === firstNew) {
        // Update Supabase Auth password
        const newPassword = pinToPassword(next)
        await supabase.auth.updateUser({ password: newPassword })

        setState((prev) => ({
          ...prev,
          user: { ...prev.user!, pin: hashPin(next) },
          pinHistory: [
            ...prev.pinHistory,
            {
              changedAt: new Date().toISOString(),
              method: "settings",
              deviceInfo:
                typeof navigator !== "undefined" ? navigator.userAgent : "",
            },
          ],
        }))
        setDone(true)
      } else {
        fail("PIN-ku iskuma mid aha")
        setStep("new")
        setFirstNew("")
      }
    }
  }

  const title =
    step === "current"
      ? "Geli PIN-ka hadda"
      : step === "new"
        ? "Geli PIN cusub"
        : "Xaqiiji PIN-ka cusub"

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        onClose()
        setStep("current")
        setPin("")
        setError("")
        setDone(false)
      }}
      title="Beddel PIN-ka"
    >
      {done ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-success/15 text-success">
            <Lock className="h-7 w-7" />
          </div>
          <p className="font-semibold text-foreground">PIN-ka waa la beddelay!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <PinPad value={pin} onChange={handleChange} shake={shake} />
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
        </div>
      )}
    </BottomSheet>
  )
}

function DataPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore()
  if (!open) return null

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `siiv-track-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const dayCount = Object.keys(state.days).length
  const customCount = Object.values(state.customTasks).filter(
    (t) => t.active,
  ).length

  return (
    <BottomSheet open={open} onClose={onClose} title="Xogta">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-foreground">
          <p>Maalmo la diiwaangeliyey: {dayCount}</p>
          <p>Hawlo gaar ah: {customCount}</p>
          <p>Dib u eegis: {Object.keys(state.weeklyReviews).length}</p>
        </div>
        <button
          onClick={exportData}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-95"
        >
          <Download className="h-4 w-4" />
          Soo dejiso xogta (JSON)
        </button>
        <p className="text-xs text-muted-foreground">
          Xogtaadu waxay ku kaydsan tahay cloud-ka (Supabase) iyo aaladdaada labadaba.
        </p>
      </div>
    </BottomSheet>
  )
}
