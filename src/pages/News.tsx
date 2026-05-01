import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedNewsPage } from '@/hooks/useNews';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

const CATEGORIES = ['all', 'event', 'announcement', 'seva', 'cultural', 'political', 'general'] as const;
const PER_PAGE = 9;

const parsePageNumber = (value: string | null) => {
  const parsed = Number(value ?? '1');
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
};

const isNewsCategory = (value: string): value is (typeof CATEGORIES)[number] => {
  return (CATEGORIES as readonly string[]).includes(value);
};

const NewsPage = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get('category') ?? 'all';
  const category = isNewsCategory(rawCategory) ? rawCategory : 'all';
  const search = searchParams.get('q') ?? '';
  const page = parsePageNumber(searchParams.get('page'));

  const { data: newsPage, isLoading } = usePublishedNewsPage({
    page,
    pageSize: PER_PAGE,
    category,
    search,
  });

  const paged = newsPage?.items ?? [];
  const totalPages = newsPage?.totalPages ?? 0;

  const updateParams = (updates: { category?: string; q?: string; page?: string }) => {
    const next = new URLSearchParams(searchParams);

    if (updates.category !== undefined) {
      if (!updates.category || updates.category === 'all') next.delete('category');
      else next.set('category', updates.category);
    }

    if (updates.q !== undefined) {
      if (!updates.q.trim()) next.delete('q');
      else next.set('q', updates.q);
    }

    if (updates.page !== undefined) {
      if (updates.page === '1') next.delete('page');
      else next.set('page', updates.page);
    }

    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      const next = new URLSearchParams(searchParams);
      if (totalPages === 1) next.delete('page');
      else next.set('page', String(totalPages));
      setSearchParams(next, { replace: true });
    }
  }, [page, totalPages, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <span className="text-white/80">{t('News', 'समाचार')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">{t('News & Updates', 'समाचार और अपडेट')}</h1>
        </div>
      </section>

      <section className="py-10 bg-[#F8F6F2]">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => updateParams({ category: cat, page: '1' })}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${category === cat ? 'bg-[#FF6B00] text-white' : 'bg-white border border-black/10 text-gray-600 hover:border-[#FF6B00]/30'}`}>
                  {cat === 'all' ? t('All', 'सभी') : cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => updateParams({ q: e.target.value, page: '1' })}
                placeholder={t('Search articles...', 'लेख खोजें...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none bg-white" />
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-xl" />
                  <div className="p-5 space-y-3"><div className="h-4 bg-gray-200 rounded w-full" /><div className="h-3 bg-gray-200 rounded w-2/3" /></div>
                </div>
              ))}
            </div>
          ) : paged.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paged.map(article => (
                  <Link to={`/news/${article.slug}`} key={article.id}
                    className="bg-white rounded-xl overflow-hidden border border-black/[0.06] hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                    <div className="aspect-video relative bg-gradient-to-br from-[#0B1F3A] to-[#1A3A6B]">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title_en} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-[0.07] font-devanagari text-white">ॐ</div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{article.category}</div>
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] text-gray-400 mb-2">{article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : ''}</div>
                      <div className="font-bold text-[15px] text-[#0B1F3A] leading-snug mb-2 group-hover:text-[#FF6B00] transition-colors">
                        {language === 'en' ? article.title_en : (article.title_hi || article.title_en)}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-3">{language === 'en' ? article.excerpt_en : (article.excerpt_hi || article.excerpt_en)}</div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })} disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded text-sm disabled:opacity-40">{t('Previous', 'पिछला')}</button>
                  <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
                  <button onClick={() => updateParams({ page: String(Math.min(totalPages, page + 1)) })} disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded text-sm disabled:opacity-40">{t('Next', 'अगला')}</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-[rgba(255,107,0,0.3)] rounded-xl">
              <div className="text-4xl mb-3">📰</div>
              <div className="font-semibold text-[#0B1F3A] text-lg">{t('No articles found', 'कोई लेख नहीं मिला')}</div>
              <p className="text-sm text-gray-500 mt-1">{t('Try adjusting your filters', 'अपने फ़िल्टर बदलें')}</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NewsPage;
