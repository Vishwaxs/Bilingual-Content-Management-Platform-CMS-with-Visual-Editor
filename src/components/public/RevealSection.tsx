import type { CSSProperties, ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
};

const RevealSection = ({
  children,
  className,
  style,
  threshold,
}: RevealSectionProps) => {
  const { ref, revealed } = useReveal(threshold);

  return (
    <section
      ref={ref}
      className={cn(
        'transition-all duration-700 motion-reduce:transition-none',
        revealed
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0',
        className,
      )}
      style={style}
    >
      {children}
    </section>
  );
};

export default RevealSection;
