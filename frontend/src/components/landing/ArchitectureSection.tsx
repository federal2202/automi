import CardWrapper from "../shared/CardWrapper";
import SecondaryText from "../shared/SecondaryText";
import { SystemMomentumIcon, AISchedulingIcon, ObsidianInterfaceIcon, SyncIcon } from "../shared/icons/icons";

export default function ArchitectureSection() {
    return (
        <div className="w-full flex flex-col items-center py-16 md:py-20 px-4">
            <div className="max-w-7xl w-full">
                
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
                        Architected for{' '}
                        <span className="text-green-nice">Peak Performance</span>.
                    </h2>
                    <SecondaryText 
                        text="Engineered with a focus on speed, clarity, and biological feedback loops." 
                        size="small"
                        className="max-w-2xl mx-auto"
                    />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    
                    {/* System Momentum - Top Left */}
                    <CardWrapper variant="neutral" animationDelay="0.1s">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-nice/20 rounded-lg flex items-center justify-center">
                                <SystemMomentumIcon />
                            </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            System Momentum
                        </h3>
                        <SecondaryText 
                            text="Visualize your consistency with our high-density activity heatmap. Every square represents a commitment kept." 
                            size="small"
                        />
                    </CardWrapper>

                    {/* AI Scheduling - Top Right */}
                    <CardWrapper variant="green" animationDelay="0.2s">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-nice/20 rounded-lg flex items-center justify-center">
                                <AISchedulingIcon />
                            </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            AI Scheduling
                        </h3>
                        <SecondaryText 
                            text="Adaptive algorithms that learn your energy peaks to suggest the optimal habit windows." 
                            size="small"
                            className="text-[#ffffff]/90"
                        />
                    </CardWrapper>

                    {/* Obsidian Interface - Bottom Left */}
                    <CardWrapper variant="neutral" animationDelay="0.3s">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-nice/20 rounded-lg flex items-center justify-center">
                                <ObsidianInterfaceIcon />
                            </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Obsidian Interface
                        </h3>
                        <SecondaryText 
                            text="Zero eye-strain during late-night reviews. Crafted for the aesthetic minimalist." 
                            size="small"
                        />
                    </CardWrapper>

                    {/* Global Sync - Bottom Right */}
                    <CardWrapper variant="neutral" animationDelay="0.4s">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-nice/20 rounded-lg flex items-center justify-center">
                                <SyncIcon />
                            </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Global Sync
                        </h3>
                        <SecondaryText 
                            text="Seamless transitions between desktop, mobile, and wearable ecosystems." 
                            size="small"
                        />
                    </CardWrapper>

                </div>
            </div>
        </div>
    );
}