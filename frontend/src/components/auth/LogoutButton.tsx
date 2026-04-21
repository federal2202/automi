// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/hooks/useAuth'
// import { cn } from '@/utils/cn'
// import { LogOut } from 'lucide-react'

// interface LogoutButtonProps {
//   onSuccess?: () => void
//   onError?: (error: string) => void
//   className?: string
//   size?: 'small' | 'large'
//   variant?: 'primary' | 'secondary' | 'ghost'
//   showConfirmation?: boolean
//   redirectTo?: string
//   children?: React.ReactNode
// }

// export default function LogoutButton({
//   onSuccess,
//   onError,
//   className,
//   size = 'small',
//   variant = 'ghost',
//   showConfirmation = false,
//   redirectTo = '/',
//   children
// }: LogoutButtonProps) {
//   const [isLoading, setIsLoading] = useState(false)
//   const [showConfirm, setShowConfirm] = useState(false)
//   const { logout, error } = useAuth()
//   const router = useRouter()

//   const handleLogout = async () => {
//     if (showConfirmation && !showConfirm) {
//       setShowConfirm(true)
//       return
//     }

//     try {
//       setIsLoading(true)
      
//       await logout()
      
//       onSuccess?.()
      
//       // Redirect after successful logout
//       router.push(redirectTo)
//       router.refresh()
      
//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'Logout failed'
//       onError?.(errorMsg)
//     } finally {
//       setIsLoading(false)
//       setShowConfirm(false)
//     }
//   }

//   const handleCancel = () => {
//     setShowConfirm(false)
//   }

//   const getButtonStyles = () => {
//     const baseStyles = 'transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
//     let variantStyles = ''
//     switch (variant) {
//       case 'primary':
//         variantStyles = 'bg-green-nice text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 active:scale-95'
//         break
//       case 'secondary':
//         variantStyles = 'bg-[#ffffff]/2 border-[1px] border-[#ffffff]/10 text-white hover:bg-[#ffffff]/5 hover:border-[#ffffff]/20 backdrop-blur-sm transform hover:scale-105 active:scale-95'
//         break
//       case 'ghost':
//       default:
//         variantStyles = 'text-muted-foreground hover:text-foreground hover:bg-[#ffffff]/5 rounded-md'
//         break
//     }
    
//     const sizeStyles = size === 'small' 
//       ? 'h-8 px-3 text-sm rounded-md' 
//       : 'h-10 px-4 text-base rounded-lg'

//     return cn(baseStyles, variantStyles, sizeStyles, className)
//   }

//   // Show confirmation dialog
//   if (showConfirm) {
//     return (
//       <div className="flex flex-col items-center gap-3 p-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg">
//         <p className="text-sm text-center text-foreground">
//           Are you sure you want to sign out?
//         </p>
//         <div className="flex gap-2">
//           <button
//             onClick={handleLogout}
//             disabled={isLoading}
//             className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
//           >
//             {isLoading ? (
//               <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//             ) : (
//               'Sign Out'
//             )}
//           </button>
//           <button
//             onClick={handleCancel}
//             className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-md hover:bg-muted/80 transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//         {error && (
//           <div className="text-destructive text-xs text-center">
//             {error}
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <button
//       onClick={handleLogout}
//       disabled={isLoading}
//       className={getButtonStyles()}
//     >
//       {isLoading ? (
//         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//       ) : (
//         <>
//           <LogOut className="w-4 h-4" />
//           {children || 'Sign Out'}
//         </>
//       )}
//     </button>
//   )
// }