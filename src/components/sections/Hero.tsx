
"use client"

import * as React from "react"
import { NeonButton } from "@/components/ui/neon-button"
import { MessageCircle } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function Hero() {
  const scrollToForm = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg')

  return (
    <section className="relative h-svh w-full flex items-center justify-center overflow-hidden border-b border-white/5">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage?.imageUrl} 
          alt="Mazagão Gás Operation" 
          data-ai-hint={heroImage?.imageHint}
          className="w-full h-full object-cover brightness-[0.4] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
        <div className="absolute inset-0 bg-secondary/10 mix-blend-overlay" />
      </div>

      <div className="container relative z-10 text-center px-4">
        <div className="inline-block px-4 py-1 mb-6 border border-primary/30 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest animate-pulse">
          Operação 24h em todo Guarujá
        </div>
        
        <h1 className="font-impact text-7xl md:text-[10rem] text-white leading-[0.85] tracking-tighter mb-4 animate-fade-in-up drop-shadow-2xl">
          ACABOU O GÁS?
        </h1>
        
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up [animation-delay:200ms]">
          <p className="font-body text-xl md:text-2xl text-white/80 font-light tracking-wide">
            Entrega ultra rápida em todo <span className="text-white font-bold">Guarujá</span>. 
            Não perca tempo com espera.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <h2 className="font-impact text-4xl md:text-6xl text-primary neon-text-green tracking-tight">
              LIGA PRA MAZAGÃO GÁS!
            </h2>
            
            <NeonButton 
              size="xl" 
              variant="green"
              className="group"
              onClick={scrollToForm}
            >
              <MessageCircle className="mr-3 h-8 w-8 group-hover:animate-bounce" />
              PEDIR NO WHATSAPP
            </NeonButton>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-10 left-10 hidden lg:block animate-float">
        <div className="glass-morphism p-4 rounded-xl border-l-4 border-l-primary">
          <p className="text-xs text-primary font-bold uppercase mb-1">Status do Pátio</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-lg font-impact text-white">OPERAÇÃO ATIVA</p>
          </div>
        </div>
      </div>
    </section>
  )
}
