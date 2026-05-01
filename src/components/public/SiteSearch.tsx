import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, X, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'news' | 'event';
  title: string;
  slug: string;
  excerpt: string;
  date: string | null;
}

/**
 * SiteSearch — full-text search across news articles and events.
 * Opens as a modal dialog, searches client-side from cached data.
 * Triggered by / key shortcut or search button.
 */
export function SiteSearch() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all searchable content
  const { data: searchIndex } = useQuery({
    queryKey: ['search-index'],
    queryFn: async () => {
      const [newsRes, eventsRes] = await Promise.all([
        supabase.from('news_articles').select('id, title_en, title_hi, slug, meta_description_en, published_at, status').eq('status', 'published'),
        supabase.from('events').select('id, title_en, title_hi, slug, description_en, event_date, status').eq('status', 'published'),
      ]);

      const items: SearchResult[] = [];

      (newsRes.data ?? []).forEach((n: any) => {
        items.push({
          id: n.id, type: 'news',
          title: language === 'hi' ? (n.title_hi || n.title_en) : n.title_en,
          slug: n.slug,
          excerpt: n.meta_description_en || '',
          date: n.published_at,
        });
      });

      (eventsRes.data ?? []).forEach((e: any) => {
        items.push({
          id: e.id, type: 'event',
          title: language === 'hi' ? (e.title_hi || e.title_en) : e.title_en,
          slug: e.slug,
          excerpt: (e.description_en || '').slice(0, 120),
          date: e.event_date,
        });
      });

      return items;
    },
    staleTime: 5 * 60_000,
  });

  // Filter results
  const results = (searchIndex ?? []).filter((item) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q);
  }).slice(0, 8);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        data-search
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#FF6B00] transition-colors px-3 py-1.5 rounded-md border border-gray-200 hover:border-[#FF6B00]/30"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('Search', 'खोजें')}</span>
        <kbd className="hidden sm:inline text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-400">/</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[10000] bg-black/50 flex items-start justify-center pt-[15vh] px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search articles, events...', 'लेख, कार्यक्रम खोजें...')}
                className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-300"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results */}
            {query.trim() && (
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {results.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">
                    {t('No results found', 'कोई परिणाम नहीं मिला')}
                  </div>
                ) : (
                  results.map((item) => (
                    <Link
                      key={item.id}
                      to={item.type === 'news' ? `/news/${item.slug}` : `/events/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {item.type === 'news' ? (
                          <FileText className="w-4 h-4 text-[#FF6B00]" />
                        ) : (
                          <Calendar className="w-4 h-4 text-[#0B1F3A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#0B1F3A] truncate">{item.title}</div>
                        {item.excerpt && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">{item.excerpt}</div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase text-gray-300 flex-shrink-0">
                        {item.type}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Footer hint */}
            <div className="px-5 py-2.5 border-t bg-gray-50 text-[10px] text-gray-400 flex items-center gap-4">
              <span><kbd className="font-mono bg-gray-200 px-1 rounded">ESC</kbd> to close</span>
              <span><kbd className="font-mono bg-gray-200 px-1 rounded">/</kbd> to search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
