import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNewsBySlug, usePublishedNews } from '@/hooks/useNews';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { TableOfContents } from '@/components/ui/TableOfContents';
import { NewsletterSignup } from '@/components/public/NewsletterSignup';

const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { data: article, isLoading, error } = useNewsBySlug(slug || '');
  const { data: relatedRaw } = usePublishedNews(4);
  const related = relatedRaw?.filter(a => a.slug !== slug && a.category === article?.category).slice(0, 3);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article ? (language === 'en' ? article.title_en : article.title_hi) : '';

  if (isLoading) return (
    <div className="min-h-screen"><SiteHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );

  if (error || !article) return (
    <div className="min-h-screen"><SiteHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">📰</div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">{t('Article Not Found', 'लेख नहीं मिला')}</h1>
        <Link to="/news" className="text-[#FF6B00] text-sm mt-4 inline-block">{t('← Back to News', '← समाचार पर वापस')}</Link>
      </div>
      <Footer />
    </div>
  );

  const content = sanitizeHtml(language === 'hi' && article.body_hi ? article.body_hi : article.body_en);

  return (
    <div className="min-h-screen">
      <ReadingProgressBar />
      <SiteHeader />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0B1F3A] to-[#122B52] py-16">
        {article.featured_image && (
          <div className="absolute inset-0 opacity-20">
            <img src={article.featured_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <Link to="/news" className="hover:text-white/80">{t('News', 'समाचार')}</Link><span>›</span>
            <span className="text-white/80 truncate max-w-[200px]">{language === 'en' ? article.title_en : article.title_hi}</span>
          </div>
          <div className="bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mb-4">{article.category}</div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight max-w-3xl">
            {language === 'en' ? article.title_en : (article.title_hi || article.title_en)}
          </h1>
          {article.title_hi && language === 'en' && <p className="font-devanagari text-white/50 mt-2">{article.title_hi}</p>}
          <div className="text-white/50 text-sm mt-4">{article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : ''}</div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            <article className="max-w-prose">
              {article.featured_image && (
                <img src={article.featured_image} alt={article.title_en} className="w-full rounded-xl mb-8" />
              )}
              <div className="prose prose-lg prose-gray max-w-none text-gray-700 leading-relaxed"
                data-article-content
                dangerouslySetInnerHTML={{ __html: content }} />

              {/* Share buttons */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-500 mb-3">{t('Share this article', 'इस लेख को साझा करें')}</p>
                <div className="flex gap-3">
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer"
                    className="bg-[#25D366] text-white px-4 py-2 rounded-md text-xs font-semibold hover:opacity-80 transition">WhatsApp</a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                    className="bg-[#1DA1F2] text-white px-4 py-2 rounded-md text-xs font-semibold hover:opacity-80 transition">Twitter</a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                    className="bg-[#1877F2] text-white px-4 py-2 rounded-md text-xs font-semibold hover:opacity-80 transition">Facebook</a>
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-xs font-semibold hover:bg-gray-300 transition">{t('Copy Link', 'लिंक कॉपी')}</button>
                </div>
              </div>

              {/* Post-article newsletter */}
              <div className="mt-8">
                <NewsletterSignup variant="card" />
              </div>
            </article>

            {/* Sidebar */}
            <aside>
              <TableOfContents contentHtml={content} />
              <h3 className="font-bold text-[#0B1F3A] text-sm mb-4 mt-8">{t('Related Articles', 'संबंधित लेख')}</h3>
              <div className="space-y-4">
                {related && related.length > 0 ? related.map(r => (
                  <Link to={`/news/${r.slug}`} key={r.id} className="block group">
                    <div className="text-[11px] text-gray-400">{r.published_at ? format(new Date(r.published_at), 'MMM d') : ''}</div>
                    <div className="text-sm font-semibold text-[#0B1F3A] group-hover:text-[#FF6B00] transition-colors leading-snug mt-0.5">
                      {language === 'en' ? r.title_en : (r.title_hi || r.title_en)}
                    </div>
                  </Link>
                )) : <p className="text-xs text-gray-400">{t('No related articles', 'कोई संबंधित लेख नहीं')}</p>}
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NewsDetailPage;
