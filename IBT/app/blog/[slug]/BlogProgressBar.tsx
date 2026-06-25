'use client'

import { useEffect, useState } from 'react'

export function BlogProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-100 z-[9999]">
      <div 
        className="h-full bg-[#e63946] transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
