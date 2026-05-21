
"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Hero } from "@/components/sections/Hero"
import { OrderFunnel } from "@/components/sections/OrderFunnel"
import { ProductGallery } from "@/components/sections/ProductGallery"
import { CoverageMap } from "@/components/sections/CoverageMap"
import { FinalCTA } from "@/components/sections/FinalCTA"
import { CinematicIntro } from "@/components/sections/CinematicIntro"
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [showIntro, setShowIntro] = React.useState(true)

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}
      
      {!showIntro && (
        <div className="animate-in fade-in duration-1000">
          <Navbar />
          <Hero />
          <OrderFunnel />
          <ProductGallery />
          <CoverageMap />
          <FinalCTA />
          
          <footer className="py-16 border-t border-white/5 bg-black/50">
            <div className="container px-4 text-center">
              <div className="space-y-4 mb-8">
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                  Mazagão Gás Ltda &copy; 2026
                </p>
                <div className="text-[10px] text-white/20 font-medium uppercase tracking-[0.2em] space-y-1">
                  <p>Mazagao Gas Ltda</p>
                  <p>CNPJ: 33.374.911/0001-38</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-6 opacity-20 hover:opacity-100 transition-opacity duration-500">
                <span className="text-[9px] uppercase tracking-tighter">Google Analytics 4</span>
                <span className="text-[9px] uppercase tracking-tighter">Meta Pixel</span>
                <span className="text-[9px] uppercase tracking-tighter">Clarity Active</span>
              </div>
            </div>
          </footer>

          <WhatsAppFloat />
          <Toaster />
        </div>
      )}
    </main>
  )
}
