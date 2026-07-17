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

export type GeneticsPreset = {
  id: string;
  label: string;
  category: string;
  /** Placeholder hint for free-text entry */
  valueHint?: string;
  /** Common result/allele combos for the Result dropdown */
  alleleOptions?: string[];
};

const HEALTH_CLEAR_CARRIER_AFFECTED = [
  "Clear",
  "Carrier",
  "Affected",
  "N/N",
  "N/Mut",
  "Mut/Mut",
] as const;

/** Common miniature poodle / color genetics suggestions for admin multi-select. */
export const GENETICS_PRESETS: GeneticsPreset[] = [
  {
    id: "a-locus",
    label: "A locus (Agouti / ASIP)",
    category: "Locus",
    valueHint: "e.g. Ay/at, at/at, a/a",
    alleleOptions: [
      "Ay/Ay",
      "Ay/aw",
      "Ay/at",
      "Ay/a",
      "aw/aw",
      "aw/at",
      "aw/a",
      "at/at",
      "at/a",
      "a/a",
    ],
  },
  {
    id: "b-locus",
    label: "B locus (Black/Brown / TYRP1)",
    category: "Locus",
    valueHint: "e.g. B/B, B/b, b/b",
    alleleOptions: ["B/B", "B/b", "b/b"],
  },
  {
    id: "d-locus",
    label: "D locus (Dilute / MLPH)",
    category: "Locus",
    valueHint: "e.g. D/D, D/d, d/d",
    alleleOptions: ["D/D", "D/d", "d/d"],
  },
  {
    id: "e-locus",
    label: "E locus (Extension / MC1R)",
    category: "Locus",
    valueHint: "e.g. E/E, E/e, e/e",
    alleleOptions: [
      "E/E",
      "E/e",
      "e/e",
      "Em/Em",
      "Em/E",
      "Em/e",
      "Eg/E",
      "Eg/e",
      "Eh/E",
      "Eh/e",
    ],
  },
  {
    id: "k-locus",
    label: "K locus (Dominant black / CBD103)",
    category: "Locus",
    valueHint: "e.g. KB/ky, ky/ky",
    alleleOptions: [
      "KB/KB",
      "KB/kbr",
      "KB/ky",
      "kbr/kbr",
      "kbr/ky",
      "ky/ky",
    ],
  },
  {
    id: "s-locus",
    label: "S locus (Spotting / white)",
    category: "Locus",
    valueHint: "e.g. S/S, S/sp, sp/sp",
    alleleOptions: ["S/S", "S/si", "S/sp", "si/si", "si/sp", "sp/sp"],
  },
  {
    id: "m-locus",
    label: "M locus (Merle)",
    category: "Pattern",
    valueHint: "e.g. m/m, M/m, Mh/m",
    alleleOptions: [
      "m/m (non-merle)",
      "M/m (heterozygous merle)",
      "M/M (double merle)",
      "Mh/m",
      "Mh/Mh",
      "Mc/m",
      "Ma/m",
      "M/Mc",
      "M/Ma",
      "M/Mh",
    ],
  },
  {
    id: "merle-pmel",
    label: "Merle (PMEL / SILV)",
    category: "Pattern",
    valueHint: "PMEL length / genotype, e.g. m/m, M/m, Mh268",
    alleleOptions: [
      "m/m (non-merle)",
      "M/m (classic merle)",
      "M/M (double merle)",
      "Mh/m (harlequin merle)",
      "Mh/Mh",
      "Mc/m (cryptic merle)",
      "Ma/m (atypical merle)",
      "Mh268",
      "Mh265",
      "M268",
      "SINE insertion present",
      "SINE insertion absent",
    ],
  },
  {
    id: "parti",
    label: "Parti",
    category: "Pattern",
    valueHint: "e.g. carrier, expressed",
    alleleOptions: [
      "Not parti",
      "Parti carrier",
      "Parti expressed",
      "Abstract / mismark",
    ],
  },
  {
    id: "phantom",
    label: "Phantom",
    category: "Pattern",
    valueHint: "e.g. at/at related phantom",
    alleleOptions: [
      "Not phantom",
      "Phantom carrier",
      "Phantom expressed",
      "at/at (phantom genotype)",
    ],
  },
  {
    id: "abstract",
    label: "Abstract / mismark",
    category: "Pattern",
    valueHint: "e.g. abstract white",
    alleleOptions: [
      "None",
      "Minor abstract",
      "Abstract white",
      "Mismark",
    ],
  },
  {
    id: "sable",
    label: "Sable",
    category: "Pattern",
    valueHint: "e.g. Ay/-",
    alleleOptions: ["Not sable", "Sable (Ay/-)", "Ay/Ay", "Ay/at", "Ay/a"],
  },
  {
    id: "furnishings",
    label: "Furnishings (RSPO2)",
    category: "Coat",
    valueHint: "e.g. F/F, F/f, f/f",
    alleleOptions: [
      "F/F (furnishings)",
      "F/f (furnishings)",
      "f/f (no furnishings)",
    ],
  },
  {
    id: "curl",
    label: "Curl (KRT71)",
    category: "Coat",
    valueHint: "e.g. Cu/Cu, Cu/cu",
    alleleOptions: ["Cu/Cu", "Cu/cu", "cu/cu"],
  },
  {
    id: "improper-coat",
    label: "Improper coat (IC)",
    category: "Coat",
    valueHint: "e.g. IC/N clear",
    alleleOptions: [
      "Clear (N/N)",
      "Carrier (IC/N)",
      "Affected (IC/IC)",
      "Furnishings present",
    ],
  },
  {
    id: "prcd-pra",
    label: "prcd-PRA",
    category: "Health",
    valueHint: "Clear / Carrier / Affected",
    alleleOptions: [...HEALTH_CLEAR_CARRIER_AFFECTED],
  },
  {
    id: "vwd1",
    label: "vWD Type I",
    category: "Health",
    valueHint: "Clear / Carrier / Affected",
    alleleOptions: [...HEALTH_CLEAR_CARRIER_AFFECTED],
  },
  {
    id: "dm",
    label: "Degenerative Myelopathy (DM)",
    category: "Health",
    valueHint: "Clear / Carrier / Affected",
    alleleOptions: [...HEALTH_CLEAR_CARRIER_AFFECTED],
  },
  {
    id: "neonatal-enceph",
    label: "Neonatal Encephalopathy (NEWS)",
    category: "Health",
    valueHint: "Clear / Carrier / Affected",
    alleleOptions: [...HEALTH_CLEAR_CARRIER_AFFECTED],
  },
  {
    id: "osteochondrodysplasia",
    label: "Osteochondrodysplasia",
    category: "Health",
    valueHint: "Clear / Carrier / Affected",
    alleleOptions: [...HEALTH_CLEAR_CARRIER_AFFECTED],
  },
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

/** Allele suggestions for a marker id (empty for custom genes). */
export function alleleOptionsForMarker(id: string): string[] {
  return presetById(id)?.alleleOptions ?? [];
}
