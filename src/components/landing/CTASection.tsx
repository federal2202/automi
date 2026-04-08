import SecondaryText from "../shared/SecondaryText";
import Button from "../shared/Button";

export default function CTASection() {
    return (
        <div className="w-full flex flex-col items-center py-20 md:py-32 px-4">
            <div className="max-w-4xl w-full text-center relative">

                {/* Glassmorphism Container */}
                <div 
                    className="border border-[#ffffff]/10 rounded-3xl md:rounded-[60px] p-8 md:p-16 lg:p-20 bg-[#ffffff]/2 backdrop-blur-sm relative overflow-hidden animate-fade-in-up flex flex-col items-center"
                    // style={{
                    //     boxShadow: '0 0 60px rgba(0, 143, 76, 0.3), 0 0 120px rgba(0, 143, 76, 0.1)'
                    // }}
                >
                    
                    {/* Full bottom gradient */}
                    <div 
                        className="absolute bottom-0 left-0 right-0 h-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center bottom, rgba(0, 143, 76, 0.3) 0%, rgba(0, 143, 76, 0.1) 30%, transparent 60%)',
                            filter: 'blur(12px)'
                        }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 mb-8">
                        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] leading-none font-bold text-white mb-6 text-center flex items-center flex-col">
                            <span>Your Future</span>
                            <span className="text-green-nice">starts today.</span>
                        </div>
                        
                        <div className="mb-8 max-w-sm sm:max-w-md md:max-w-xl">
                            <SecondaryText 
                                text="Join 50,000+ elite achievers who have mastered their daily architecture with automi." 
                                size="large"
                                className="mx-auto"
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <Button 
                            text="GET STARTED FREE"
                            type="primary"
                            size="large"
                        />
                        </div>
                        
                    </div>
                </div>
                
            </div>
        </div>
    );
}