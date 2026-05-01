/**
 * MandalaBg — CSS-only rotating mandala pattern for cultural depth.
 * Super subtle (opacity 0.04), slow rotation (60s per revolution).
 * No JavaScript needed — pure CSS animation.
 */
export function MandalaBg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{
        animation: 'mandala-rotate 60s linear infinite',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes mandala-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <g fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6">
        {/* Outer ring of petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <ellipse key={`o-${deg}`} cx="200" cy="200" rx="20" ry="90"
            transform={`rotate(${deg} 200 200)`} />
        ))}
        {/* Middle ring */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={`m-${deg}`} cx="200" cy="200" rx="15" ry="60"
            transform={`rotate(${deg} 200 200)`} />
        ))}
        {/* Inner ring */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={`i-${deg}`} cx="200" cy="200" rx="10" ry="35"
            transform={`rotate(${deg} 200 200)`} />
        ))}
        {/* Concentric circles */}
        <circle cx="200" cy="200" r="95" />
        <circle cx="200" cy="200" r="65" />
        <circle cx="200" cy="200" r="38" />
        <circle cx="200" cy="200" r="18" />
        {/* Center dot */}
        <circle cx="200" cy="200" r="5" fill="currentColor" opacity="0.3" />
      </g>
    </svg>
  );
}
