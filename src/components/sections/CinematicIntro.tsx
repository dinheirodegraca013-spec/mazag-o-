
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [scene, setScene] = React.useState(1)
  const introImage = PlaceHolderImages.find(img => img.id === 'intro-bg')

  React.useEffect(() => {
    const timers = [
      setTimeout(() => setScene(2), 1000), // Scene 2: Glow
      setTimeout(() => setScene(3), 2000), // Scene 3: Acabou o Gás?
      setTimeout(() => setScene(4), 3500), // Scene 4: Liga pra Mazagão!
      setTimeout(() => onComplete(), 5000)  // Complete
    ]
    return () => timers.forEach(t => clearTimeout(t))
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Glow Effects */}
        <div className={cn(
          "absolute inset-0 bg-secondary/20 transition-opacity duration-1000",
          scene >= 2 ? "opacity-100" : "opacity-0"
        )} />
        
        {/* Cinematic Backdrop */}
        <div className={cn(
          "absolute inset-0 bg-cover bg-center grayscale opacity-20 transition-opacity duration-1000 scale-110",
          scene >= 2 ? "opacity-30 scale-100" : "opacity-0"
        )} style={{ backgroundImage: `url(${introImage?.imageUrl})` }} />

        {/* Text Scenes */}
        <div className="relative text-center z-10 px-4">
          {scene === 3 && (
            <h1 className="font-impact text-6xl md:text-9xl text-white animate-fade-in-up tracking-tighter">
              ACABOU O GÁS?
            </h1>
          )}
          {scene === 4 && (
            <div className="space-y-4">
              <h2 className="font-impact text-7xl md:text-9xl text-primary animate-pulse-glow neon-text-green tracking-tighter">
                LIGA PRA MAZAGÃO GÁS!
              </h2>
            </div>
          )}
        </div>

        {/* Scanning Line */}
        <div className="absolute left-0 w-full h-1 bg-primary/30 blur-sm animate-scan pointer-events-none" />
      </div>
    </div>
  )
}
