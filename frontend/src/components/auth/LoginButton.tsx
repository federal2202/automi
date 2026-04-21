// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/hooks/useAuth'
// import { cn } from '@/utils/cn'

// interface LoginButtonProps {
//   onSuccess?: () => void
//   onError?: (error: string) => void
//   className?: string
//   size?: 'small' | 'large'
//   variant?: 'primary' | 'secondary'
//   redirectTo?: string
// }

// export default function LoginButton({
//   onSuccess,
//   onError,
//   className,
//   size = 'large',
//   variant = 'primary',
//   redirectTo = '/dashboard'
// }: LoginButtonProps) {
//   const [isLoading, setIsLoading] = useState(false)
//   const { loginWithGoogle, error, clearError } = useAuth()
//   const router = useRouter()

//   const handleGoogleLogin = async () => {
//     try {
//       setIsLoading(true)
//       clearError()

//       // Generate Google OAuth URL
//       const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
//       if (!clientId) {
//         const errorMsg = 'Google OAuth not configured'
//         onError?.(errorMsg)
//         return
//       }

//       const redirectUri = `${window.location.origin}/auth/callback`
//       const scope = 'openid profile email'
//       const responseType = 'code'
//       const state = btoa(JSON.stringify({ redirectTo }))

//       const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
//       authUrl.searchParams.set('client_id', clientId)
//       authUrl.searchParams.set('redirect_uri', redirectUri)
//       authUrl.searchParams.set('scope', scope)
//       authUrl.searchParams.set('response_type', responseType)
//       authUrl.searchParams.set('state', state)
//       authUrl.searchParams.set('access_type', 'offline')
//       authUrl.searchParams.set('prompt', 'consent')

//       // Redirect to Google OAuth
//       window.location.href = authUrl.toString()
      
//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'Login failed'
//       onError?.(errorMsg)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const baseStyles = 'transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
  
//   const variantStyles = variant === 'primary' 
//     ? 'bg-green-nice text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25' 
//     : 'bg-[#ffffff]/2 border-[1px] border-[#ffffff]/10 text-white hover:bg-[#ffffff]/5 hover:border-[#ffffff]/20 backdrop-blur-sm'
  
//   const sizeStyles = size === 'small' 
//     ? 'w-[140px] sm:w-[160px] rounded-[20px] h-[35px] text-[12px] sm:text-[14px] px-4' 
//     : 'w-full sm:w-[220px] md:w-[250px] h-[50px] md:h-[60px] text-[16px] md:text-[18px] leading-[28px] rounded-[30px] px-6'

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <button
//         onClick={handleGoogleLogin}
//         disabled={isLoading}
//         className={cn(baseStyles, variantStyles, sizeStyles, className)}
//       >
//         {isLoading ? (
//           <>
//             <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
//             <span className="transition-all duration-300">Signing in...</span>
//           </>
//         ) : (
//           <>
//             {/* Google Icon SVG */}
//             <svg className="w-5 h-5" viewBox="0 0 24 24">
//               <path
//                 fill="currentColor"
//                 d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//               />
//               <path
//                 fill="currentColor"
//                 d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//               />
//               <path
//                 fill="currentColor"
//                 d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//               />
//               <path
//                 fill="currentColor"
//                 d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//               />
//             </svg>
//             <span className="transition-all duration-300">Continue with Google</span>
//           </>
//         )}
//       </button>
      
//       {error && (
//         <div className="text-destructive text-sm text-center mt-2 max-w-[300px]">
//           {error}
//         </div>
//       )}
//     </div>
//   )
// }