import { memo } from 'react'
import { MessageCircle } from 'lucide-react'

/**
 * FloatingChatButton Component
 * Extracted from the original calendar component
 * Floating chat button with responsive visibility
 */
export const FloatingChatButton = memo(() => {
  return (
    <button className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-[#064e3b] border border-[rgba(4,120,87,0.3)] 
                      rounded-full items-center justify-center shadow-[0px_0px_20px_0px_rgba(6,78,59,0.4)]
                      hover:scale-105 transition-all duration-200">
      <MessageCircle className="w-5 h-5 text-white" />
    </button>
  )
})

FloatingChatButton.displayName = 'FloatingChatButton'