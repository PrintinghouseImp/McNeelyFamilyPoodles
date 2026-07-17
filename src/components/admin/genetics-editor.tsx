"use client";

import { useMemo, useState } from "react";
import {
  GENETICS_PRESETS,
  alleleOptionsForMarker,
  emptyGeneticsData,
  parseGeneticsData,
  type GeneticsData,
  type GeneticsEntry,
  type GeneticsSource,
} from "@/lib/genetics";
import { inputClass, selectClass, textareaClass } from "@/components/admin/field";

type Props = {
  /** Existing JSON column value */
  geneticsData?: unknown;
  /** Legacy free-text genotype */
  geneticsText?: string | null;
};

function newCustomId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function GeneticsEditor({ geneticsData, geneticsText }: Props) {
  const initial = useMemo(
    () => parseGeneticsData(geneticsData, geneticsText),
    [geneticsData, geneticsText],
  );

  const [entries, setEntries] = useState<GeneticsEntry[]>(initial.entries);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [presetPick, setPresetPick] = useState("");

  const selectedPresetIds = useMemo(
    () => new Set(entries.filter((e) => e.source === "preset").map((e) => e.id)),
    [entries],
  );

  const payload: GeneticsData = {
    version: 1,
    entries: entries.filter((e) => e.label.trim() || e.value.trim()),
    notes: notes.trim() || undefined,
  };

  function addPreset(id: string) {
    if (!id || selectedPresetIds.has(id)) return;
    const preset = GENETICS_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setEntries((prev) => [
      ...prev,
      {
        id: preset.id,
        label: preset.label,
        value: "",
        source: "preset" as GeneticsSource,
      },
    ]);
    setPresetPick("");
  }

  function addCustom() {
    setEntries((prev) => [
      ...prev,
      {
        id: newCustomId(),
        label: "",
        value: "",
        source: "custom",
      },
    ]);
  }

  function updateEntry(id: string, patch: Partial<GeneticsEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const categories = useMemo(() => {
    const map = new Map<string, typeof GENETICS_PRESETS>();
    for (const p of GENETICS_PRESETS) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, []);

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="text-sm font-medium text-gray-700">Genetics</p>
        <p className="mt-1 text-xs text-gray-500">
          Select common markers, then pick a result/allele combo from the
          dropdown (or type a custom value). Stored as flexible JSON for a
          future visualizer.
        </p>
      </div>

      {/* Multi-select style: pick presets from categorized dropdown */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
            Add suggested marker
          </span>
          <select
            value={presetPick}
            onChange={(e) => {
              const v = e.target.value;
              setPresetPick(v);
              if (v) addPreset(v);
            }}
            className={selectClass}
          >
            <option value="">Choose a common gene / locus…</option>
            {[...categories.entries()].map(([cat, presets]) => (
              <optgroup key={cat} label={cat}>
                {presets.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={selectedPresetIds.has(p.id)}
                  >
                    {p.label}
                    {selectedPresetIds.has(p.id) ? " (added)" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={addCustom}
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
        >
          + Custom gene
        </button>
      </div>

      {/* Active chips for multi-select feel */}
      {entries.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {entries.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => removeEntry(e.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-red-200 hover:text-red-700"
              title="Remove"
            >
              {e.label || "Untitled"}
              <span aria-hidden className="text-gray-400">
                ×
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No markers selected yet.</p>
      )}

      {entries.length > 0 ? (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const preset = GENETICS_PRESETS.find((p) => p.id === entry.id);
            const alleleOptions = alleleOptionsForMarker(entry.id);
            const valueInList = alleleOptions.includes(entry.value);

            return (
              <li
                key={entry.id}
                className="grid gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-start"
              >
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs text-gray-400">Label</span>
                  <input
                    value={entry.label}
                    onChange={(e) =>
                      updateEntry(entry.id, { label: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Gene / locus name"
                    readOnly={entry.source === "preset"}
                  />
                </label>

                <div className="min-w-0 space-y-2">
                  <span className="block text-xs text-gray-400">
                    Result / alleles
                  </span>
                  {alleleOptions.length > 0 ? (
                    <select
                      value={valueInList ? entry.value : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) updateEntry(entry.id, { value: v });
                      }}
                      className={selectClass}
                      aria-label={`Common results for ${entry.label}`}
                    >
                      <option value="">
                        {entry.value && !valueInList
                          ? "Custom value (see below) — or pick a common result…"
                          : "Pick a common result / allele combo…"}
                      </option>
                      {alleleOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    value={entry.value}
                    onChange={(e) =>
                      updateEntry(entry.id, { value: e.target.value })
                    }
                    className={inputClass}
                    placeholder={
                      preset?.valueHint ??
                      (alleleOptions.length
                        ? "Or type a custom result…"
                        : "e.g. B/b, Clear")
                    }
                    aria-label={`Result value for ${entry.label || "gene"}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 transition hover:border-red-200 hover:text-red-700 sm:mt-5"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Notes (optional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={textareaClass}
          placeholder="Lab name, test date, free-form genotype line…"
          rows={2}
        />
      </label>

      {/* Single field submitted with the parent form */}
      <input
        type="hidden"
        name="geneticsDataJson"
        value={JSON.stringify(
          payload.entries.length || payload.notes
            ? payload
            : emptyGeneticsData(),
        )}
      />
    </div>
  );
}
