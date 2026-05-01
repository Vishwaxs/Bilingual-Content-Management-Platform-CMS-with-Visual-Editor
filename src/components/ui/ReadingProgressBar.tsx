import { useEffect, useState } from 'react';

/**
 * ReadingProgressBar — thin saffron bar at the top of the viewport
 * that fills as the user scrolls through article content.
 * Use on NewsDetail pages.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress(Math.min(100, (scrollTop / docHeight) * 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        zIndex: 9999,
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #FF6B00, #FF9933)',
          borderRadius: '0 2px 2px 0',
          transition: 'width 0.1s linear',
          boxShadow: progress > 5 ? '0 0 8px rgba(255,107,0,0.4)' : 'none',
        }}
      />
    </div>
  );
}
