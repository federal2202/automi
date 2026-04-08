import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardVariant = 'red' | 'green' | 'neutral';

interface CardWrapperProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  animationDelay?: string;
  showIconSpace?: boolean;
}

export default function CardWrapper({ 
  children, 
  variant = 'neutral', 
  className, 
  animationDelay = '0s',
  showIconSpace = false 
}: CardWrapperProps) {
  
  const getVariantStyles = (variant: CardVariant) => {
    switch (variant) {
      case 'red':
        return {
          background: 'bg-[#ffffff]/2',
          border: 'border-[#93000A]/20'
        };
      case 'green':
        return {
          background: 'bg-[#0a0a0a]/40',
          border: 'border-[#008f4c]/20'
        };
      case 'neutral':
      default:
        return {
          background: 'bg-[#ffffff]/2',
          border: 'border-[#ffffff]/10'
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <div 
      className={cn(
        'border rounded-3xl p-8 md:p-12 relative animate-fade-in-up transition-all duration-300 backdrop-blur-sm',
        styles.background,
        styles.border,
        className
      )}
      style={{
        animationDelay
      }}
    >
      {showIconSpace && (
        <div className="flex justify-end mb-4">
          <div className="w-12 h-12 md:w-16 md:h-16">
            {/* Icon space for future use */}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}