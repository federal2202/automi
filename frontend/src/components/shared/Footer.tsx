import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full border-t border-[#ffffff]/10 bg-background py-8 md:py-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Left side - Logo and copyright */}
                <div className="flex flex-col gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-nice rounded-full"></div>
                        <span className="text-[#ffffff]/40  text-xl font-bold">automi.</span>
                    </div>
                    
                    {/* Copyright */}
                    <p className="text-[#ffffff]/40 text-sm">
                        © 2026 AUTOMI. ARCHITECTED FOR PEAK PERFORMANCE.
                    </p>
                </div>

                {/* Right side - Links */}
                <div className="flex gap-8 md:gap-12">
                    <Link 
                        href="/privacy-policy" 
                        className="text-[#ffffff]/60 hover:text-white text-sm font-medium transition-colors duration-300"
                    >
                        PRIVACY POLICY
                    </Link>
                    <Link 
                        href="/terms" 
                        className="text-[#ffffff]/60 hover:text-white text-sm font-medium transition-colors duration-300"
                    >
                        TERMS
                    </Link>
                    <Link 
                        href="/contact" 
                        className="text-[#ffffff]/60 hover:text-white text-sm font-medium transition-colors duration-300"
                    >
                        CONTACT
                    </Link>
                </div>
                
            </div>
        </footer>
    );
}