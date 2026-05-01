import { useLanguage } from '@/contexts/LanguageContext';
import { User } from 'lucide-react';

interface LeadershipCardProps {
  leader: {
    id: string;
    name_en: string;
    name_hi: string;
    designation_en: string;
    designation_hi: string;
    photo_url?: string;
  };
}

const LeadershipCard = ({ leader }: LeadershipCardProps) => {
  const { field } = useLanguage();

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
        {leader.photo_url ? (
          <img
            src={leader.photo_url}
            alt={field(leader, 'name')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <User className="h-16 w-16 text-muted-foreground/30" />
        )}
      </div>
      <div className="p-4 border-t-2 border-primary">
        <h3 className="font-display text-lg font-semibold text-foreground">{field(leader, 'name')}</h3>
        <p className="text-sm text-muted-foreground font-body">{field(leader, 'designation')}</p>
      </div>
    </div>
  );
};

export default LeadershipCard;
