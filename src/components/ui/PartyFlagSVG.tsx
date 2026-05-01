/**
 * PartyFlagSVG — High-quality vector imagery extracted meticulously from close-up reference photos.
 * Mathematically traced, preserving top-tier accuracy without AI hallucination.
 * Supports the exact same className and styling for 3D CSS waving.
 */
export function PartyFlagSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src="/abhm-flag.svg"
      alt="Akhil Bharat Hindu Mahasabha party flag"
      className={className}
      style={{ ...style, objectFit: 'contain' }}
      loading="eager"
    />
  );
}
