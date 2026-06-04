"use client"


import BreakthroughSection from "../shared/BreakThorugh";
import Button from "../shared/Button";
import SecondaryText from "../shared/SecondaryText";

export default function HeroSection(){
    return (
        <div className="w-full flex flex-col items-center relative min-h-screen overflow-hidden pt-20">
            {/* <div className="fixed inset-0 w-full h-full pointer-events-none" style={{background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.08) 0%, transparent 90%)'}}></div> */}

            

            <div className="w-full flex flex-col items-center gap-6 md:gap-8 mt-8 md:mt-12 px-4 md:px-0">
                <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <BreakthroughSection text="Professional Automation v2.0" />
                </div>
                
                <div className="text-center w-full animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h1 className="text-[48px] md:text-[80px] lg:text-[96px] font-extrabold animate-slide-in-left leading-tight" style={{animationDelay: '0.6s'}}>Elevate your</h1>
                    <p className="text-[52px] md:text-[84px] lg:text-[100px] font-extrabold text-green-nice -mt-4 md:-mt-8 lg:-mt-10 animate-slide-in-right leading-tight" style={{animationDelay: '0.8s'}}>Daily success</p>
                </div>
                
                <div className="animate-fade-in-up" style={{animationDelay: '1s'}}>
                    <SecondaryText text="The obsidian-grade habit architecture for elite professionals. Automate routines, visualize productivity clusters, and dominate your schedule with precision." size="large" className="text-center max-w-[680px] px-4 md:px-0" />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up w-full px-4 md:px-0" style={{animationDelay: '1.2s'}}>
                    <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 w-full sm:w-auto">
                        <Button text="Start Automating" onClick={() => {}} type="primary" size="large" />
                    </div>
                    <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg w-full sm:w-auto">
                        <Button text="View Protocol" onClick={() => {}} type="secondary" size="large" />
                    </div>
                </div>
                
            </div>
        </div>
        
    )
}