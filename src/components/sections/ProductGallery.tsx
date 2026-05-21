"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { NeonButton } from "@/components/ui/neon-button"
import { ShoppingCart } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const PRODUCTS = [
  { 
    id: 'p5', 
    name: 'GÁS P5', 
    desc: 'Botijão de Prata - P5', 
    icon: '🔥', 
    price: 'Econômico', 
    imgId: 'product-p5' 
  },
  { 
    id: 'p13', 
    name: 'GÁS P13', 
    desc: 'Botijão de Prata - P13', 
    icon: '🔥🔥', 
    price: 'Mais Pedido', 
    imgId: 'product-p13' 
  },
  { 
    id: 'p20', 
    name: 'GÁS P20', 
    desc: 'Botijão de Prata - P20', 
    icon: '📦', 
    price: 'Empilhadeiras', 
    imgId: 'product-p20' 
  },
  { 
    id: 'p45', 
    name: 'GÁS P45', 
    desc: 'Botijão de Prata - P45', 
    icon: '🏢', 
    price: 'Industrial', 
    imgId: 'product-p45' 
  },
]

export function ProductGallery() {
  return (
    <section id="products" className="py-24 bg-black/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="font-impact text-6xl text-white uppercase tracking-tighter leading-none">
              LINHA <span className="text-primary neon-text-green">PREMIUM PRATA</span>
            </h2>
            <p className="text-white/60 font-body text-lg max-w-xl">
              Equipamento certificado, lacrado e com o brilho característico da prata Mazagão. 
              Segurança e rendimento máximo para sua casa ou empresa.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product) => {
            const imageData = PlaceHolderImages.find(img => img.id === product.imgId)
            return (
              <Card key={product.id} className="glass-morphism border-white/5 overflow-hidden group hover:border-primary/40 transition-all hover:-translate-y-2">
                <div className="relative h-72 overflow-hidden bg-gradient-to-b from-black/60 to-black/20">
                  <img 
                    src={imageData?.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110 brightness-110 contrast-125" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 bg-primary text-black font-impact px-3 py-1 rounded text-sm shadow-neon-green">
                    {product.price}
                  </div>
                </div>
                <CardContent className="p-6 space-y-4 border-t border-white/5">
                  <div>
                    <h3 className="font-impact text-3xl text-white mb-1 tracking-tight">{product.name}</h3>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{product.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 text-white/20">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{product.icon}</span>
                  </div>
                  <NeonButton 
                    className="w-full" 
                    variant="green" 
                    size="default"
                    onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    PEDIR AGORA
                  </NeonButton>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
