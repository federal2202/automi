'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from './shared/Button';
import Logo from './shared/Logo';
import { useAppSelector } from '@/stores/hooks';

export default function Navbar(){
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const router = useRouter();

  return (
    <nav className='w-full max-w-[600px] h-[50px] flex items-center justify-between px-3 lg:px-4 py-3 bg-[#ffffff]/2 border-[1px] mt-4 mx-4 md:mx-0 border-[#ffffff]/10 rounded-[30px] animate-fade-in-down backdrop-blur-sm transition-all duration-300 hover:bg-[#ffffff]/5 hover:border-[#ffffff]/20'>
      <div className='flex items-center gap-1 animate-slide-in-left' style={{animationDelay: '0.1s'}}>
        <Logo />
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
        {isAuthenticated ? (
          <div className="transform hover:scale-105 transition-all duration-300">
            <Button type="secondary" size="small" text="Dashboard" onClick={() => router.push('/dashboard')} />
          </div>
        ) : (
          <div className='transform hover:scale-105 transition-all duration-300'>
            <Button type="primary" size="small" text="Login" />
          </div>
        )}
      </div>
    </nav>
  )
}