import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/i18n';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface NewsCardProps {
  article: {
    id: string;
    title_en: string;
    title_hi: string;
    body_en: string;
    body_hi: string;
    slug: string;
    featured_image?: string;
    published_at?: string;
  };
}

const NewsCard = ({ article }: NewsCardProps) => {
  const { field, t } = useLanguage();

  const body = field(article, 'body');
  const excerpt = body.length > 120 ? body.substring(0, 120) + '...' : body;

  return (
    <Link to={`/news/${article.slug}`} className="group block">
      <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        {article.featured_image && (
          <div className="h-44 overflow-hidden">
            <img
              src={article.featured_image}
              alt={field(article, 'title')}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5 border-t-2 border-primary">
          {article.published_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              {format(new Date(article.published_at), 'MMM d, yyyy')}
            </div>
          )}
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {field(article, 'title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 font-body leading-relaxed">{excerpt}</p>
          <span className="inline-block mt-3 text-sm text-primary font-medium">
            {t(translations.sections.readMore.en, translations.sections.readMore.hi)} →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
