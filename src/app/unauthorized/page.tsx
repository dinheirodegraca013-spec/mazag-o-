
"use client"

import { Logo } from "@/components/ui/logo"
import { NeonButton } from "@/components/ui/neon-button"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Logo className="mb-12" />
      
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive animate-pulse">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
        </div>
        
        <h1 className="font-impact text-5xl text-white uppercase tracking-tighter">ACESSO NEGADO</h1>
        <p className="text-white/60 uppercase text-xs font-black tracking-widest">
          Suas credenciais não possuem privilégios operacionais para esta zona de comando.
        </p>
        
        <div className="pt-8">
          <NeonButton variant="blue" onClick={() => router.push("/")} className="w-full">
            VOLTAR PARA A BASE
          </NeonButton>
        </div>
      </div>
    </div>
  )
}
