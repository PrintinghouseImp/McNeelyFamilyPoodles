/**
 * Flexible dog genetics model (JSON in DB).
 * Designed so a future visualizer can consume entries by id/label/value.
 */

export type GeneticsSource = "preset" | "custom" | "legacy";

export type GeneticsEntry = {
  /** Stable key, e.g. "a-locus" or "custom-uuid" */
  id: string;
  /** Human label, e.g. "A locus (Agouti)" */
  label: string;
  /** Allele / result value, e.g. "at/at" or "Clear" */
  value: string;
  source: GeneticsSource;
};

export type GeneticsData = {
  version: 1;
  entries: GeneticsEntry[];
  /** Freeform notes */
  notes?: string;
};

/** Common miniature poodle / color genetics suggestions for admin multi-select. */
export const GENETICS_PRESETS: {
  id: string;
  label: string;
  category: string;
  /** Placeholder hint for the value field */
  valueHint?: string;
}[] = [
  { id: "a-locus", label: "A locus (Agouti)", category: "Locus", valueHint: "e.g. Ay/at, at/at, a/a" },
  { id: "b-locus", label: "B locus (Black/Brown)", category: "Locus", valueHint: "e.g. B/B, B/b, b/b" },
  { id: "d-locus", label: "D locus (Dilute)", category: "Locus", valueHint: "e.g. D/D, D/d, d/d" },
  { id: "e-locus", label: "E locus (Extension)", category: "Locus", valueHint: "e.g. E/E, E/e, e/e" },
  { id: "k-locus", label: "K locus (Dominant black)", category: "Locus", valueHint: "e.g. KB/ky, ky/ky" },
  { id: "s-locus", label: "S locus (Spotting / white)", category: "Locus", valueHint: "e.g. S/S, S/sp, sp/sp" },
  { id: "m-locus", label: "M locus (Merle)", category: "Pattern", valueHint: "e.g. m/m, M/m, Mh/m" },
  { id: "parti", label: "Parti", category: "Pattern", valueHint: "e.g. carrier, expressed" },
  { id: "phantom", label: "Phantom", category: "Pattern", valueHint: "e.g. at/at related phantom" },
  { id: "abstract", label: "Abstract / mismark", category: "Pattern", valueHint: "e.g. abstract white" },
  { id: "sable", label: "Sable", category: "Pattern", valueHint: "e.g. Ay/-" },
  { id: "furnishings", label: "Furnishings (IC / RSPO2)", category: "Coat", valueHint: "e.g. F/F, F/f, f/f" },
  { id: "curl", label: "Curl (KRT71)", category: "Coat", valueHint: "e.g. Cu/Cu, Cu/cu" },
  { id: "improper-coat", label: "Improper coat", category: "Coat", valueHint: "e.g. IC/N clear" },
  { id: "prcd-pra", label: "prcd-PRA", category: "Health", valueHint: "Clear / Carrier / Affected" },
  { id: "vwd1", label: "vWD Type I", category: "Health", valueHint: "Clear / Carrier / Affected" },
  { id: "dm", label: "Degenerative Myelopathy (DM)", category: "Health", valueHint: "Clear / Carrier / Affected" },
  { id: "neonatal-enceph", label: "Neonatal Encephalopathy (NEWS)", category: "Health", valueHint: "Clear / Carrier / Affected" },
  { id: "osteochondrodysplasia", label: "Osteochondrodysplasia", category: "Health", valueHint: "Clear / Carrier / Affected" },
];

export function emptyGeneticsData(): GeneticsData {
  return { version: 1, entries: [] };
}

export function parseGeneticsData(
  raw: unknown,
  legacyText?: string | null,
): GeneticsData {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj.version === 1 && Array.isArray(obj.entries)) {
      const entries: GeneticsEntry[] = obj.entries
        .filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === "object")
        .map((e) => ({
          id: String(e.id ?? ""),
          label: String(e.label ?? ""),
          value: String(e.value ?? ""),
          source: (["preset", "custom", "legacy"].includes(String(e.source))
            ? String(e.source)
            : "custom") as GeneticsSource,
        }))
        .filter((e) => e.id && e.label);
      const notes =
        typeof obj.notes === "string" && obj.notes.trim()
          ? obj.notes.trim()
          : undefined;
      if (entries.length > 0 || notes) {
        return { version: 1, entries, notes };
      }
    }
  }

  // Fallback: promote free-text genotype into a single legacy entry
  const text = legacyText?.trim();
  if (text) {
    return {
      version: 1,
      entries: [
        {
          id: "legacy-summary",
          label: "Genotype summary",
          value: text,
          source: "legacy",
        },
      ],
    };
  }

  return emptyGeneticsData();
}

/** Compact one-line summary for cards / legacy `genetics` column. */
export function geneticsSummary(data: GeneticsData): string | null {
  const parts = data.entries
    .map((e) => {
      const v = e.value.trim();
      return v ? `${e.label}: ${v}` : e.label;
    })
    .filter(Boolean);
  if (data.notes?.trim()) parts.push(data.notes.trim());
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function hasGeneticsContent(data: GeneticsData): boolean {
  return (
    data.entries.some((e) => e.label.trim() || e.value.trim()) ||
    Boolean(data.notes?.trim())
  );
}

/** Parse FormData fields produced by GeneticsEditor. */
export function geneticsFromFormData(formData: FormData): {
  geneticsData: GeneticsData | null;
  genetics: string | null;
} {
  const raw = strForm(formData, "geneticsDataJson");
  let data: GeneticsData = emptyGeneticsData();

  if (raw) {
    try {
      data = parseGeneticsData(JSON.parse(raw));
    } catch {
      data = emptyGeneticsData();
    }
  }

  // Also accept multi-value fallback if JSON missing
  if (!hasGeneticsContent(data)) {
    const labels = formData.getAll("geneticsLabel").map(String);
    const values = formData.getAll("geneticsValue").map(String);
    const ids = formData.getAll("geneticsId").map(String);
    const sources = formData.getAll("geneticsSource").map(String);
    const entries: GeneticsEntry[] = [];
    for (let i = 0; i < Math.max(labels.length, values.length); i++) {
      const label = (labels[i] ?? "").trim();
      const value = (values[i] ?? "").trim();
      if (!label && !value) continue;
      entries.push({
        id: (ids[i] ?? `entry-${i}`).trim() || `entry-${i}`,
        label: label || "Gene",
        value,
        source: (sources[i] === "preset" || sources[i] === "legacy"
          ? sources[i]
          : "custom") as GeneticsSource,
      });
    }
    const notes = strForm(formData, "geneticsNotes");
    data = {
      version: 1,
      entries,
      notes: notes || undefined,
    };
  }

  if (!hasGeneticsContent(data)) {
    return { geneticsData: null, genetics: null };
  }

  return {
    geneticsData: data,
    genetics: geneticsSummary(data),
  };
}

function strForm(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function presetById(id: string) {
  return GENETICS_PRESETS.find((p) => p.id === id);
}
