'use client';

import Link from 'next/link';
import Button from './shared/Button';




export default function Navbar(){
  return (
    <nav className='w-full max-w-[600px] h-[50px] flex items-center justify-between lg:px-4 px-0 py-3 bg-[#ffffff]/2 border-[1px] mt-4 border-[#ffffff]/10 rounded-[30px]'>
      <div className='flex items-center gap-1'>
        <div className='w-2 h-2 bg-green-nice rounded-[50%]'/>
        <Link href="/">
          <span className='text-[20px] font-bold text-white'>
            automi.
          </span>
        </Link>
      </div>
      <div className='flex items-center justify-between max-w-[220px] w-full'>
        <Link href="/features">
          <span className='text-[16px] leading-[24px] text-secondary'>
            Features
          </span>
        </Link>
        <Link href="/product">
          <span className='text-[16px] leading-[24px] text-secondary'>
            Product
          </span>
        </Link>
        <Link href="/pricing">
          <span className='text-[16px] leading-[24px] text-secondary'>
            Pricing
          </span>
        </Link>
      </div>
      <div>
        <Button text="Get Started" onClick={() => {}} type="primary" size="small" />
      </div>
    </nav>
  )
}