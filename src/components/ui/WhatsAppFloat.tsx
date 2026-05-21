"use client"

import * as React from "react"
import { MessageCircle } from "lucide-react"

export function WhatsAppFloat() {
  return (
    <a 
      href="https://wa.me/5513996253286" 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[100] h-16 w-16 bg-primary text-black rounded-full flex items-center justify-center shadow-neon-green animate-float hover:scale-110 transition-transform active:scale-90 group"
    >
      <div className="absolute -top-12 right-0 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Fala com a Mazagão! 👋
      </div>
      <MessageCircle className="h-8 w-8" />
      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
    </a>
  )
}
