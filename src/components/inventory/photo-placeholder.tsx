type PhotoPlaceholderProps = {
  label: string;
  className?: string;
};

/** Neutral placeholder until real photos are uploaded in admin. */
export function PhotoPlaceholder({
  label,
  className = "",
}: PhotoPlaceholderProps) {
  const initial = label.trim().charAt(0).toUpperCase() || "·";

  return (
    <div
      className={`photo-frame min-h-[12rem] ${className}`}
      aria-hidden
    >
      <span className="py-16 text-5xl font-light text-gray-300">{initial}</span>
    </div>
  );
}
