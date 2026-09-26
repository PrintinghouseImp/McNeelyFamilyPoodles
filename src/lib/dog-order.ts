/** Shared list order for dogs and litters. Photo galleries keep their own order. */

export const puppyOrderBy = [
  { birthDate: { sort: "desc" as const, nulls: "last" as const } },
  { name: "asc" as const },
];

export const litterOrderBy = [
  { birthDate: "desc" as const },
  { name: "asc" as const },
];

/**
 * Parents with a birth date come first, newest first.
 * Missing dates fall back to createdAt, then name.
 */
export const parentOrderBy = [
  { birthDate: { sort: "desc" as const, nulls: "last" as const } },
  { createdAt: "desc" as const },
  { name: "asc" as const },
];
