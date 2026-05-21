
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
}

export function Logo({ className, variant = 'full' }: LogoProps) {
  return (
    <div className={cn("relative flex items-center select-none bg-transparent", className)}>
      <img 
        src="/images/logo.png" 
        alt="Mazagão Gás" 
        className={cn(
          "h-auto object-contain bg-transparent",
          variant === 'icon' ? "w-10" : "w-auto max-w-[220px]"
        )}
      />
    </div>
  )
}
