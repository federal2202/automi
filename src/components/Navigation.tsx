'use client';

import Link from 'next/link';
import Button from './shared/Button';




export default function Navbar(){
  return (
    <nav className='w-full max-w-[600px] h-[50px] flex items-center justify-between px-3 lg:px-4 py-3 bg-[#ffffff]/2 border-[1px] mt-4 mx-4 md:mx-0 border-[#ffffff]/10 rounded-[30px] animate-fade-in-down backdrop-blur-sm transition-all duration-300 hover:bg-[#ffffff]/5 hover:border-[#ffffff]/20'>
      <div className='flex items-center gap-1 animate-slide-in-left' style={{animationDelay: '0.1s'}}>
        <div className='w-2 h-2 bg-green-nice rounded-[50%] animate-pulse' style={{animationDuration: '2s'}}/>
        <Link href="/">
          <span className='text-[18px] md:text-[20px] font-bold text-white transition-all duration-300 hover:text-green-nice'>
            automi.
          </span>
        </Link>
      </div>
      <div className='hidden sm:flex items-center justify-between max-w-[220px] w-full animate-fade-in-up' style={{animationDelay: '0.3s'}}>
        <Link href="/features">
          <span className='text-[14px] md:text-[16px] leading-[24px] text-secondary transition-all duration-300 hover:text-white hover:scale-105'>
            Features
          </span>
        </Link>
        <Link href="/product">
          <span className='text-[14px] md:text-[16px] leading-[24px] text-secondary transition-all duration-300 hover:text-white hover:scale-105'>
            Product
          </span>
        </Link>
        <Link href="/pricing">
          <span className='text-[14px] md:text-[16px] leading-[24px] text-secondary transition-all duration-300 hover:text-white hover:scale-105'>
            Pricing
          </span>
        </Link>
      </div>
      <div className='animate-slide-in-right' style={{animationDelay: '0.5s'}}>
        <div className='transform hover:scale-105 transition-all duration-300'>
          <Button text="Get Started" onClick={() => {}} type="primary" size="small" />
        </div>
      </div>
    </nav>
  )
}