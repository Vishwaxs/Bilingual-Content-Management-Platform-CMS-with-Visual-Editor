import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicDocuments } from '@/hooks/useDocuments';
import { Link } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = ['all', 'circular', 'report', 'policy', 'press', 'other'] as const;

const DocumentsPage = () => {
  const { t, language } = useLanguage();
  const { data: docs, isLoading } = usePublicDocuments();
  const [cat, setCat] = useState('all');

  const filtered = docs?.filter(d => cat === 'all' || d.category === cat) ?? [];

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <span className="text-white/80">{t('Documents', 'दस्तावेज़')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">{t('Documents', 'दस्तावेज़')}</h1>
        </div>
      </section>

      <section className="py-12 bg-[#F8F6F2]">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 flex-wrap mb-8">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${cat === c ? 'bg-[#FF6B00] text-white' : 'bg-white border border-black/10 text-gray-600 hover:border-[#FF6B00]/30'}`}>
                {c === 'all' ? t('All', 'सभी') : c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />)}</div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg p-4 border border-black/[0.06] flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#0B1F3A] truncate">{language === 'en' ? doc.title_en : (doc.title_hi || doc.title_en)}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{doc.category}</span>
                      {doc.file_size && <><span>•</span><span>{formatSize(doc.file_size)}</span></>}
                    </div>
                  </div>
                  {doc.file_url ? (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="bg-[#FF6B00] text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-[#E55A00] transition flex items-center gap-1.5 flex-shrink-0">
                      <Download className="w-3.5 h-3.5" /> {t('Download', 'डाउनलोड')}
                    </a>
                  ) : (
                    <span className="px-4 py-2 rounded-md text-xs font-semibold bg-gray-100 text-gray-400 flex items-center gap-1.5 flex-shrink-0">
                      <Download className="w-3.5 h-3.5" /> {t('Unavailable', 'उपलब्ध नहीं')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-[rgba(255,107,0,0.3)] rounded-xl">
              <div className="text-4xl mb-3">📄</div>
              <div className="font-semibold text-[#0B1F3A] text-lg">{t('No documents available', 'कोई दस्तावेज़ उपलब्ध नहीं')}</div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DocumentsPage;
