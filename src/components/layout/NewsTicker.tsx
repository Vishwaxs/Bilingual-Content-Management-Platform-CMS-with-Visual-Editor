import { glass } from '@/lib/glass';

interface NewsTickerProps {
  items: string[];
}

const NewsTicker = ({ items }: NewsTickerProps) => {
  if (!items.length) return null;

  const tickerContent = items.join(' ◆ ');

  return (
    <div className="w-full bg-saffron h-8 sm:h-9 md:h-[34px] flex items-center overflow-hidden relative z-[51]">
      <div className="flex-shrink-0 px-2 sm:px-3 py-1 rounded-r-full ml-0 z-10" style={glass.navy}>
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-body font-semibold text-saffron-foreground">
          <span className="font-devanagari">ताज़ा समाचार</span>
          <span className="mx-1 opacity-60">|</span>
          <span>LATEST NEWS</span>
        </span>
      </div>
      <div className="flex-1 overflow-hidden ml-3">
        <div className="ticker-track whitespace-nowrap">
          <span className="text-[10px] sm:text-[11px] md:text-[12px] font-body font-medium text-saffron-foreground">
            {tickerContent} ◆ {tickerContent}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
