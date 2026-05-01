import { useEffect, useState, useMemo } from 'react';
import { List } from 'lucide-react';

interface TocEntry {
  id: string;
  text: string;
  level: number; // 2 or 3
}

/**
 * TableOfContents — auto-generates a TOC from H2/H3 headings in article HTML.
 * Sticky sidebar on desktop, highlights current section via Intersection Observer.
 */
export function TableOfContents({ contentHtml }: { contentHtml: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Parse headings from HTML string
  const headings = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const elements = doc.querySelectorAll('h2, h3');
    const entries: TocEntry[] = [];

    elements.forEach((el, i) => {
      const text = el.textContent?.trim() || '';
      if (!text) return;
      const id = `heading-${i}`;
      entries.push({
        id,
        text,
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });

    return entries;
  }, [contentHtml]);

  // Inject IDs into the actual rendered headings
  useEffect(() => {
    const articleEl = document.querySelector('[data-article-content]');
    if (!articleEl) return;
    const elements = articleEl.querySelectorAll('h2, h3');
    elements.forEach((el, i) => {
      el.id = `heading-${i}`;
    });
  }, [contentHtml]);

  // Intersection Observer to track active section
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that's intersecting or above viewport
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="hidden lg:block"
      style={{
        position: 'sticky',
        top: 100,
        maxHeight: 'calc(100vh - 140px)',
        overflow: 'auto',
        paddingRight: 8,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
        fontSize: 11, fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <List style={{ width: 14, height: 14 }} />
        On this page
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {headings.map((h) => (
          <button
            key={h.id}
            onClick={() => handleClick(h.id)}
            style={{
              display: 'block',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              paddingLeft: h.level === 3 ? 16 : 0,
              fontSize: h.level === 2 ? 12 : 11,
              fontWeight: activeId === h.id ? 700 : 500,
              color: activeId === h.id ? '#FF6B00' : '#6b7280',
              borderLeft: activeId === h.id ? '2px solid #FF6B00' : '2px solid transparent',
              paddingInlineStart: h.level === 3 ? 20 : 8,
              transition: 'color 0.15s, border-color 0.15s',
              lineHeight: 1.5,
            }}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
