import Link from "next/link";

export default function Logo(){
    return (
              <div className='flex items-center gap-1 animate-slide-in-left' style={{animationDelay: '0.1s'}}>
                <div className='w-2 h-2 bg-green-nice rounded-[50%] animate-pulse' style={{animationDuration: '2s'}}/>

                <Link href="/">
                <span className='text-[18px] md:text-[20px] font-bold text-white transition-all duration-300 hover:text-green-nice'>
                    automi.
                </span>
                </Link>
              </div>
        
    )
}