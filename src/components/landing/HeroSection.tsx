"use client"


import Navbar from "../Navigation";
import BreakthroughSection from "../shared/BreakThorugh";
import Button from "../shared/Button";
import SecondaryText from "../shared/SecondaryText";

export default function HeroSection(){
    return (
        <div className="w-full flex flex-col items-center relative h-screen">
            <div className="fixed inset-0 w-full h-full pointer-events-none" style={{background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.08) 0%, transparent 90%)'}}></div>

            <div className="w-full flex flex-col items-center gap-8 mt-20">


                <BreakthroughSection text="Professional Automation v2.0" />
                <div className="text-center w-full">
                            <h1 className="text-[96px] font-extrabold">Elevate your</h1>
                            <p className="text-[100px] font-extrabold text-green-nice -mt-10">Daily success</p>
                </div>
                <SecondaryText text="The obsidian-grade habit architecture for elite professionals. Automate routines, visualize productivity clusters, and dominate your schedule with precision." size="large" className="text-center max-w-[680px]" />
                <div className="flex items-center justify-center gap-4">
                    <Button text="Start Automating" onClick={() => {}} type="primary" size="large" />
                    <Button text="View Protocol" onClick={() => {}} type="secondary" size="large" />
                </div>
            </div>
        </div>
        
    )
}