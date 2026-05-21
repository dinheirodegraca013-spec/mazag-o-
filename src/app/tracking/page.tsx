
"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, CheckCircle2, MapPin } from "lucide-react"
import { OrderService, Order } from "@/services/order-service"

export default function TrackingPage() {
  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulação ou busca real via ID na URL
    const unsubscribe = OrderService.subscribeToOrders((orders) => {
      if (orders.length > 0) setOrder(orders[0]) // Mostra o mais recente para teste
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-impact uppercase text-4xl">Localizando Entrega...</div>

  return (
    <div className="min-h-screen bg-background p-4 md:p-12 flex flex-col items-center">
      <Logo className="mb-12" />
      
      <Card className="w-full max-w-2xl glass-morphism border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="font-impact text-4xl text-white uppercase tracking-tighter">
            RASTREAMENTO OPERACIONAL
          </CardTitle>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Status em Tempo Real Mazagão Gás</p>
        </CardHeader>
        <CardContent className="space-y-12 py-8">
          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0" />
            <div className={`absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ${order?.status === 'Em Rota' ? 'w-1/2' : order?.status === 'Entregue' ? 'w-full' : 'w-0'}`} />
            
            {[
              { icon: <Package />, label: 'Pendente', active: true },
              { icon: <Truck />, label: 'Em Rota', active: order?.status === 'Em Rota' || order?.status === 'Entregue' },
              { icon: <CheckCircle2 />, label: 'Entregue', active: order?.status === 'Entregue' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-colors ${step.active ? 'bg-primary border-primary text-black' : 'bg-background border-white/10 text-white/20'}`}>
                  {step.icon}
                </div>
                <p className={`mt-2 text-[10px] font-black uppercase tracking-widest ${step.active ? 'text-primary' : 'text-white/20'}`}>{step.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[10px] font-black uppercase">CLIENTE</span>
              <span className="text-white font-bold uppercase">{order?.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[10px] font-black uppercase">DESTINO</span>
              <span className="text-white font-bold uppercase">{order?.neighborhood}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[10px] font-black uppercase">STATUS</span>
              <Badge variant={order?.status === 'Entregue' ? 'default' : 'secondary'} className="uppercase text-[9px] font-black tracking-widest">
                {order?.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-12 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
        Mazagão Gás &copy; Energia em Movimento 2026
      </p>
    </div>
  )
}
