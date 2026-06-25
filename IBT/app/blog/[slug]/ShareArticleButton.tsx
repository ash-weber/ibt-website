'use client'

import { FiShare2 } from 'react-icons/fi'

type ShareArticleButtonProps = {
  title: string;
  description: string;
}

export function ShareArticleButton({ title, description }: ShareArticleButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-bold text-slate-400 mr-1">Share:</span>
      <button 
        onClick={handleShare}
        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-[#e63946] hover:bg-[#e63946] hover:text-white hover:border-[#e63946] transition-colors shadow-sm"
        aria-label="Share this article"
      >
        <FiShare2 size={16} />
      </button>
    </div>
  )
}
