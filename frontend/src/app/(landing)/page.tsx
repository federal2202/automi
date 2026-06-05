import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import HeroSection from "@/components/landing/HeroSection"

const AboutSection = dynamic(() => import("@/components/landing/AboutSection"))
const ArchitectureSection = dynamic(() => import("@/components/landing/ArchitectureSection"))
const CTASection = dynamic(() => import("@/components/landing/CTASection"))

function SectionSkeleton() {
  return <div className="w-full h-80 animate-pulse rounded-2xl bg-white/5 mx-auto max-w-7xl" />
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ArchitectureSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <CTASection />
      </Suspense>
    </div>
  )
}
