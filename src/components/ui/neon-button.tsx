import * as React from "react"
import { cn } from "@/lib/utils"

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'blue'
  size?: 'default' | 'lg' | 'xl'
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = 'green', size = 'default', ...props }, ref) => {
    const variants = {
      green: "bg-primary text-black shadow-neon-green hover:bg-[#D4FF4D] ring-offset-background transition-all hover:scale-105 active:scale-95",
      blue: "bg-secondary text-white shadow-neon-blue hover:brightness-110 ring-offset-background transition-all hover:scale-105 active:scale-95"
    }
    
    const sizes = {
      default: "h-12 px-6 py-3 text-base font-bold uppercase",
      lg: "h-16 px-10 py-4 text-xl font-impact tracking-wider",
      xl: "h-20 px-12 py-5 text-2xl font-impact tracking-widest"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
NeonButton.displayName = "NeonButton"

export { NeonButton }
