"use client"

import * as React from "react"
import { NeonButton } from "@/components/ui/neon-button"
import { MessageCircle } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass-morphism border-b border-white/10' : 'py-8 bg-transparent'}`}>
      <div className="container px-4 flex items-center justify-between">
        <Logo className="scale-75 md:scale-100 origin-left" />

        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/70">
          <a href="#products" onClick={(e) => handleNavClick(e, 'products')} className="hover:text-primary transition-colors cursor-pointer">Produtos</a>
          <a href="#coverage" onClick={(e) => handleNavClick(e, 'coverage')} className="hover:text-primary transition-colors cursor-pointer">Cobertura</a>
          <a href="#support" onClick={(e) => handleNavClick(e, 'support')} className="hover:text-primary transition-colors cursor-pointer">Suporte</a>
        </div>

        <NeonButton 
          variant="green" 
          size="default" 
          className="h-10 text-xs px-4"
          onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          PEDIR AGORA
        </NeonButton>
      </div>
    </nav>
  )
}
