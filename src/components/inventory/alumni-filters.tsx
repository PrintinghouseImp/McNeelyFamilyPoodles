import Link from "next/link";

export type AlumniView = "all" | "parents" | "puppies";

const OPTIONS: { value: AlumniView; label: string }[] = [
  { value: "all", label: "All alumni" },
  { value: "parents", label: "Retired parents" },
  { value: "puppies", label: "Adopted puppies" },
];

type Props = {
  view: AlumniView;
  retiredCount: number;
  adoptedCount: number;
};

/** Server-rendered filter chips using ?view= query (no client JS required). */
export function AlumniFilters({ view, retiredCount, adoptedCount }: Props) {
  return (
    <nav
      aria-label="Filter alumni"
      className="flex flex-wrap items-center gap-2"
    >
      {OPTIONS.map((opt) => {
        const active = view === opt.value;
        const count =
          opt.value === "parents"
            ? retiredCount
            : opt.value === "puppies"
              ? adoptedCount
              : retiredCount + adoptedCount;
        const href =
          opt.value === "all" ? "/alumni" : `/alumni?view=${opt.value}`;
        return (
          <Link
            key={opt.value}
            href={href}
            className={
              active
                ? "rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
                : "rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-black"
            }
            aria-current={active ? "page" : undefined}
          >
            {opt.label}
            <span
              className={
                active ? "ml-1.5 text-gray-300" : "ml-1.5 text-gray-400"
              }
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
