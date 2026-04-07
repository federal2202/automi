

export default function BreakthroughSection({text} : {text: string}) {
    return (
        <div className="w-fit flex items-center justify-center px-4 py-2 rounded-[16px] bg-[#ffffff]/2 border-[1px]  border-[#ffffff]/10">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-nice rounded-[50%]" />
                <span className="font-semibold text-[13px] font-bold leading-[15px]  text-[#ffffff]/60 tracking-widest">{text}</span>

            </div>
        </div>
        
    );
}