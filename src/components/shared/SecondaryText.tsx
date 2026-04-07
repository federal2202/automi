import { cn } from '@/utils/cn';

export default function SecondaryText({ text, size, className }: { text: string; size?: 'small' | 'large'; className?: string }) {
    return (
        <p className={cn(
            'leading-[24px] text-secondary',
            size === 'large' ? 'text-xl' : 'text-base',
            className
        )}>
            {text}
        </p>
    );
}