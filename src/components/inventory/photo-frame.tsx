type PhotoFrameProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Full-photo frame: contain (no crop), height auto, max-height 80vh.
 */
export function PhotoFrame({
  src,
  alt,
  className = "",
  imgClassName = "",
}: PhotoFrameProps) {
  return (
    <div className={`photo-frame ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={`photo-img ${imgClassName}`} />
    </div>
  );
}
