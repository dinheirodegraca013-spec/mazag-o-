"use client"

import * as React from "react"
import { NeonButton } from "@/components/ui/neon-button"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function FinalCTA() {
  const resolveImageData = PlaceHolderImages.find(img => img.id === 'resolve-img')

  return (
    <section id="support" className="py-32 relative overflow-hidden bg-background">
      {/* Dynamic background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="font-impact text-7xl md:text-8xl text-white tracking-tighter leading-[0.85] uppercase">
                PRECISOU DE GÁS?
              </h2>
              <h3 className="font-impact text-5xl md:text-7xl text-primary neon-text-green tracking-tight uppercase">
                MAZAGÃO RESOLVE.
              </h3>
            </div>
            
            <p className="text-xl md:text-2xl text-white/70 font-light max-w-2xl mx-auto lg:mx-0">
              A distribuidora mais moderna do litoral paulista está a um clique de distância. 
              Não deixe sua cozinha parar.
            </p>

            <NeonButton 
              variant="green" 
              size="xl"
              className="w-full md:w-auto"
              onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              PEDIR AGORA MESMO
            </NeonButton>
          </div>

          <div className="relative group hidden lg:block">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-morphism p-3 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img 
                src={resolveImageData?.imageUrl} 
                alt="Mazagão Resolve" 
                className="w-full aspect-[3/4] object-cover rounded-2xl transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
