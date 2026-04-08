import SecondaryText from "../shared/SecondaryText";
import CardWrapper from "../shared/CardWrapper";
import { ChatDownIcon, CHeckIcon } from "../shared/icons/icons";

export default function AboutSection() {
    return (
        <div className="w-full flex flex-col items-center py-0 md:py-0 px-4">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                
                {/* Reality Block - Red */}
                <CardWrapper variant="red" animationDelay="0.2s">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[#FFB4AB] text-sm md:text-base font-semibold tracking-wider uppercase">THE REALITY</span>
                        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                            <ChatDownIcon />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Unstructured Effort<br />
                        Leads to Burnout.
                    </h2>
                    
                    <div className="mb-8">
                        <SecondaryText 
                            text="Relying on sheer willpower is a failing strategy. Without automation, your habits are just wishes lost in a void of inconsistency." 
                            size="small" 
                            className="mb-8" 
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <SecondaryText text="Inconsistent streak management" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <SecondaryText text="Invisible progress blocks" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <SecondaryText text="Cognitive overload & fatigue" />
                        </div>
                    </div>
                </CardWrapper>

                {/* Solution Block - Green */}
                <CardWrapper variant="green" animationDelay="0.4s">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-green-nice text-sm md:text-base font-semibold tracking-wider uppercase">THE SOLUTION</span>
                        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                            <CHeckIcon />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Quantified Systems<br />
                        Drive Rapid Growth.
                    </h2>
                    
                    <div className="mb-8">
                        <SecondaryText 
                            text="automi turns biological intent into digital architecture. We map your neuro-pathways to a visual interface designed for momentum." 
                            size="small" 
                            className="mb-8 text-[#ffffff]/90" 
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <SecondaryText text="Visual momentum engines" className="text-[#ffffff]/90" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <SecondaryText text="AI-driven routine optimization" className="text-[#ffffff]/90" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <SecondaryText text="Zero-friction synchronization" className="text-[#ffffff]/90" />
                        </div>
                    </div>
                </CardWrapper>
                
            </div>
        </div>
    );
}