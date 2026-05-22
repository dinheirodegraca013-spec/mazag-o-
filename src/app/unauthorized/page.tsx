
"use client"

import { Logo } from "@/components/ui/logo"
import { NeonButton } from "@/components/ui/neon-button"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background decoration to match the cinematic feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        <Logo className="mb-20 scale-125" />
        
        <div className="mb-8 h-24 w-24 rounded-full border border-destructive/40 flex items-center justify-center bg-destructive/5">
          <ShieldAlert className="h-10 w-10 text-destructive/80" />
        </div>
        
        <h1 className="font-impact text-6xl md:text-7xl text-white uppercase tracking-tighter mb-4">
          ACESSO NEGADO
        </h1>
        
        <p className="text-white/40 uppercase text-[10px] md:text-xs font-black tracking-[0.3em] mb-16 max-w-sm leading-relaxed">
          Suas credenciais não possuem privilégios operacionais para esta zona de comando.
        </p>
        
        <div className="w-full max-w-md">
          <NeonButton 
            variant="blue" 
            onClick={() => router.push("/")} 
            className="w-full h-14 rounded-md text-xs font-black tracking-[0.2em]"
          >
            VOLTAR PARA A BASE
          </NeonButton>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] text-white/10 font-black tracking-widest uppercase">
        Mazagão Gás - Segurança de Protocolo v2.0
      </div>
    </div>
  )
}
