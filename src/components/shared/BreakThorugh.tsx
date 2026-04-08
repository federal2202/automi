

export default function BreakthroughSection({text} : {text: string}) {
    return (
        <div className="w-fit flex items-center justify-center px-3 md:px-4 py-2 rounded-[16px] bg-[#ffffff]/2 border-[1px] border-[#ffffff]/10 backdrop-blur-sm transition-all duration-300 hover:bg-[#ffffff]/5 hover:border-[#ffffff]/20 hover:scale-105">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-nice rounded-[50%] animate-pulse" style={{animationDuration: '2s'}} />
                <span className="font-semibold text-[11px] md:text-[13px] font-bold leading-tight md:leading-[15px] text-[#ffffff]/60 tracking-wide md:tracking-widest transition-all duration-300">{text}</span>
            </div>
        </div>
        
    );
}