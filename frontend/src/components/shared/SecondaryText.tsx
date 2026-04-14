import { cn } from '@/utils/cn';

export default function SecondaryText({ text, size, className }: { text: string; size?: 'small' | 'large'; className?: string }) {
    return (
        <p className={cn(
            'leading-relaxed md:leading-[24px] text-secondary',
            size === 'large' ? 'text-base md:text-lg lg:text-xl' : 'text-sm md:text-base',
            className
        )}>
            {text}
        </p>
    );
}