"use client"

import * as React from "react"
import { MapPin, Zap, Clock, ShieldCheck } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function CoverageMap() {
  const mapImageData = PlaceHolderImages.find(img => img.id === 'map-guaruja')

  return (
    <section id="coverage" className="py-24 relative overflow-hidden">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 glass-morphism p-2 shadow-2xl">
              <img 
                src={mapImageData?.imageUrl} 
                alt="Operação Mazagão Gás" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="font-impact text-6xl text-white uppercase tracking-tight leading-none">
                DOMÍNIO <span className="text-primary neon-text-green">OPERACIONAL</span>
              </h2>
              <p className="text-white/60 font-body text-lg">
                Nossa logística é otimizada para cobrir cada quilômetro de Guarujá com velocidade cinematográfica. 
                Não somos apenas entrega, somos energia em movimento.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: <Clock className="h-8 w-8" />, title: 'TEMPO MÉDIO', val: '25 MINUTOS', desc: 'A entrega mais rápida do litoral' },
                { icon: <MapPin className="h-8 w-8" />, title: 'COBERTURA', val: '100% GUARUJÁ', desc: 'Atendemos todos os bairros' },
                { icon: <Zap className="h-8 w-8" />, title: 'VELOCIDADE', val: 'ALTA PERFORMANCE', desc: 'Frota ativa 24 horas por dia' },
                { icon: <ShieldCheck className="h-8 w-8" />, title: 'GARANTIA', val: 'PROCEDÊNCIA', desc: 'Gás certificado e seguro' },
              ].map((item, i) => (
                <div key={i} className="space-y-3 p-6 glass-morphism border-white/5 rounded-xl hover:border-primary/20 transition-colors">
                  <div className="text-primary">{item.icon}</div>
                  <div>
                    <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-2xl font-impact text-white tracking-tight leading-none mt-1">{item.val}</p>
                    <p className="text-sm text-white/50 mt-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
