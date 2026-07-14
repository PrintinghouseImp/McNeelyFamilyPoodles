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
      className={`flex aspect-[4/3] w-full items-center justify-center bg-gray-100 ${className}`}
      aria-hidden
    >
      <span className="text-5xl font-light text-gray-300">{initial}</span>
    </div>
  );
}
