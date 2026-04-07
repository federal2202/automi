'use client';

export default function Button({ text, onClick, type, size }: { text: string; onClick?: () => void; type: 'primary' | 'secondary'; size: 'small' | 'large'; }) {
  const baseStyles = '';
  const typeStyles = type === 'primary' ? 'bg-green-nice text-white' : 'bg-[#ffffff]/2 border-[1px] border-[#ffffff]/10 text-white';
  const sizeStyles = size === 'small' ? 'w-[115px] rounded-[20px] h-[30px] text-[14px]' : 'w-[230px] h-[60px] text-[18px] leading-[28px] font-bold rounded-[30px]';

  return (
    <button onClick={onClick} className={`font-bold flex items-center justify-center ${baseStyles} ${typeStyles} ${sizeStyles}`}>
        <span>
            {text}
        </span>
    </button>
  );
}
