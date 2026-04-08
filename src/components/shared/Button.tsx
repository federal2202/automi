'use client';

export default function Button({ text, onClick, type, size }: { text: string; onClick?: () => void; type: 'primary' | 'secondary'; size: 'small' | 'large'; }) {
  const baseStyles = 'transition-all duration-300 transform hover:scale-105 active:scale-95';
  const typeStyles = type === 'primary' 
    ? 'bg-green-nice text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25' 
    : 'bg-[#ffffff]/2 border-[1px] border-[#ffffff]/10 text-white hover:bg-[#ffffff]/5 hover:border-[#ffffff]/20 backdrop-blur-sm';
  const sizeStyles = size === 'small' 
    ? 'w-[100px] sm:w-[115px] rounded-[20px] h-[30px] text-[12px] sm:text-[14px]' 
    : 'w-full sm:w-[200px] md:w-[230px] h-[50px] md:h-[60px] text-[16px] md:text-[18px] leading-[28px] font-bold rounded-[30px]';

  return (
    <button onClick={onClick} className={`font-bold flex items-center justify-center ${baseStyles} ${typeStyles} ${sizeStyles}`}>
        <span className="transition-all duration-300">
            {text}
        </span>
    </button>
  );
}
