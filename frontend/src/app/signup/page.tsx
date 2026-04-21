"use client";

import { Globe } from "lucide-react";

export default function Page(){
  function handleLogin(){
    // Direct redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:8000/auth/google';
  }
  
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-nice/5 via-transparent to-green-nice/10" />
      
      {/* Main modal container */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Modal with green glow effect */}
        <div className="relative bg-[#ffffff]/2 backdrop-blur-sm border border-[#ffffff]/10 rounded-3xl p-8 shadow-2xl">
          {/* Green glow effect */}
          <div className="absolute inset-0 rounded-3xl shadow-[0_0_50px_rgba(0,143,76,0.15)] border border-green-nice/20" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-2 animate-fade-in-down" style={{animationDelay: '0.2s'}}>
              <div className="w-3 h-3 bg-green-nice rounded-full animate-pulse" style={{animationDuration: '2s'}} />
              <span className="text-2xl font-bold text-white font-display">
                automi.
              </span>
            </div>
            
            {/* Welcome text */}
            <div className="text-center space-y-3 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h1 className="text-3xl font-bold text-white font-display">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Continue your journey with seamless productivity
              </p>
            </div>
            
            {/* Google login button */}
            <div className="w-full animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <button
                onClick={handleLogin}
                className="w-full h-14 bg-[#ffffff]/5 hover:bg-[#ffffff]/10 border border-[#ffffff]/10 hover:border-green-nice/30 text-white rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm group relative overflow-hidden"
              >
                {/* Button background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-nice/0 via-green-nice/5 to-green-nice/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center justify-center space-x-3">
                  <Globe className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300" />
                  <span className="font-semibold text-base">
                    Continue with Google
                  </span>
                </div>
              </button>
            </div>
            
            {/* Footer text */}
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <p className="text-sm text-muted-foreground">
                Secure authentication powered by Google
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}