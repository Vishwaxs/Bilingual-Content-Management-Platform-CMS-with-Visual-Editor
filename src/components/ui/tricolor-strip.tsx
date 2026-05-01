import { cn } from '@/lib/utils';

interface TricolorStripProps {
  className?: string;
  height?: number;
}

const TricolorStrip = ({ className, height = 3 }: TricolorStripProps) => {
  return (
    <div
      className={cn('w-full', className)}
      style={{
        height: `${height}px`,
        background: 'linear-gradient(90deg, #FF9933 33.33%, #FFFFFF 33.33% 66.66%, #138808 66.66%)',
      }}
    />
  );
};

export default TricolorStrip;
