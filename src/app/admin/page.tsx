
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BrainCircuit, 
  Users, 
  LogOut, 
  AlertTriangle, 
  Truck, 
  TrendingUp,
  Activity,
  Plus,
  ShieldAlert,
  Loader2
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { NeonButton } from "@/components/ui/neon-button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useOrdersRealtime } from "@/hooks/realtime/use-orders-realtime"
import { createClient } from "@/lib/supabase/client"
import { updateOrderStatus } from "@/services/orders/update-order-status"
import { createOrder } from "@/services/order-service"
import { Database } from "@/types/database"

type OrderStatus = Database['public']['Tables']['orders']['Row']['status']

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { orders, loading: isLoading, refresh } = useOrdersRealtime()
  const [activeTab, setActiveTab] = React.useState("overview")
  const [isAuthorizing, setIsAuthorizing] = React.useState(true)
  const [configError, setConfigError] = React.useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  
  const supabase = createClient()

  const [newOrder, setNewOrder] = React.useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    total: "115.00"
  })

  React.useEffect(() => {
    async function checkAccess() {
      try {
        if (!supabase) throw new Error("Supabase indisponível.")
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          router.push("/admin/login")
          return
        }
        setIsAuthorizing(false)
      } catch (err: any) {
        setConfigError(err.message)
      }
    }
    checkAccess()
  }, [router, supabase])

  const stats = React.useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      delivering: orders.filter(o => o.status === 'delivering').length,
      completed: orders.filter(o => o.status === 'completed').length,
      revenue: orders.reduce((acc, curr) => acc + (curr.total || 0), 0)
    }
  }, [orders])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(id, newStatus)
      toast({ title: "OPERACIONAL", description: `Status atualizado para ${newStatus.toUpperCase()}.` })
    } catch (error) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha na sincronização." })
    }
  }

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingOrder(true)
    try {
      await createOrder({
        customerName: newOrder.name,
        customerPhone: newOrder.phone,
        customerEmail: newOrder.email,
        notes: newOrder.notes,
        total: parseFloat(newOrder.total),
        isAdminAction: true
      })
      toast({ title: "ORDEM CRIADA", description: "Sucesso no registro." })
      setIsDialogOpen(false)
      refresh()
    } catch (error: any) {
      toast({ variant: "destructive", title: "FALHA", description: error.message })
    } finally {
      setIsCreatingOrder(false)
    }
  }

  if (isAuthorizing) return <div className="flex h-screen w-full items-center justify-center bg-background"><Activity className="h-12 w-12 text-primary animate-pulse" /></div>

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full">
      <Sidebar className="border-r border-white/10 glass-morphism">
        <SidebarHeader className="p-8">
          <Logo variant="full" className="scale-75 origin-left" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-6 space-y-2">
            {[
              { label: 'Painel', id: 'overview', icon: <LayoutDashboard /> },
              { label: 'Pedidos', id: 'orders', icon: <ShoppingBag /> },
              { label: 'Clientes', id: 'customers', icon: <Users /> },
            ].map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => setActiveTab(item.id)}
                  isActive={activeTab === item.id}
                  className={`w-full text-white/50 h-12 rounded-none border-l-2 border-transparent font-bold text-[10px] tracking-widest ${activeTab === item.id ? 'bg-primary/5 text-primary border-primary' : ''}`}
                >
                  {item.icon}
                  <span className="ml-3 uppercase">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <div className="pt-8 mt-4 border-t border-white/5">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="w-full text-destructive/60 font-bold text-[10px] tracking-widest h-12">
                  <LogOut className="h-4 w-4" />
                  <span className="ml-3">LOGOUT</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h1 className="font-impact text-6xl text-white uppercase tracking-tighter">CENTRAL OPERACIONAL</h1>
            <Badge variant="outline" className="text-primary border-primary/20 text-[9px] font-black tracking-widest uppercase">REAL-TIME ATIVO</Badge>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <NeonButton variant="green" className="h-10 text-[10px]"><Plus className="mr-2 h-4 w-4" /> NOVA ORDEM</NeonButton>
            </DialogTrigger>
            <DialogContent className="glass-morphism border-white/10 text-white rounded-none sm:max-w-[425px]">
              <DialogHeader><DialogTitle className="font-impact text-2xl uppercase">REGISTRO MANUAL</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateManualOrder} className="space-y-4 py-4">
                <Input value={newOrder.name} onChange={(e) => setNewOrder({...newOrder, name: e.target.value})} placeholder="Nome do Cliente" className="bg-white/5 border-white/10 rounded-none h-10" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input value={newOrder.phone} onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})} placeholder="WhatsApp" className="bg-white/5 border-white/10 rounded-none h-10" required />
                  <Input value={newOrder.total} onChange={(e) => setNewOrder({...newOrder, total: e.target.value})} placeholder="Valor" className="bg-white/5 border-white/10 rounded-none h-10" required />
                </div>
                <Input value={newOrder.notes} onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})} placeholder="Observações (Bairro/Referência)" className="bg-white/5 border-white/10 rounded-none h-10" />
                <DialogFooter className="pt-4"><NeonButton type="submit" variant="green" className="w-full h-12 rounded-none text-[12px]" disabled={isCreatingOrder}>{isCreatingOrder ? <Loader2 className="animate-spin" /> : "EXECUTAR ORDEM"}</NeonButton></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Volume', val: stats.total, color: 'text-primary' },
            { label: 'Pendentes', val: stats.pending, color: 'text-white' },
            { label: 'Em Rota', val: stats.delivering, color: 'text-secondary' },
            { label: 'Faturamento', val: `R$ ${stats.revenue.toFixed(2)}`, color: 'text-primary' },
          ].map((stat, i) => (
            <Card key={i} className="glass-morphism border-white/5 rounded-none p-6">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{stat.label}</p>
              <p className={`text-4xl font-impact tracking-tighter ${stat.color} mt-2`}>{stat.val}</p>
            </Card>
          ))}
        </div>

        <Card className="glass-morphism border-white/5 rounded-none overflow-hidden">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase text-white/40">OPERADOR / CLIENTE</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40">STATUS</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/40">VALOR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="px-8 py-12 text-center text-primary font-black animate-pulse">CARREGANDO LOGÍSTICA...</TableCell></TableRow> : 
                orders.map(order => (
                  <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="px-8 py-5">
                      <p className="font-bold text-white uppercase text-sm">{order.customer?.name || 'DESCONHECIDO'}</p>
                      <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">ID: {order.id.slice(0, 8)}</p>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}>
                        <SelectTrigger className="w-[160px] h-9 text-[10px] bg-white/5 border-white/10 uppercase font-black tracking-widest rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-white/10 rounded-none">
                          <SelectItem value="pending">PENDENTE</SelectItem>
                          <SelectItem value="confirmed">CONFIRMADO</SelectItem>
                          <SelectItem value="preparing">PREPARANDO</SelectItem>
                          <SelectItem value="delivering">EM ROTA</SelectItem>
                          <SelectItem value="completed">ENTREGUE</SelectItem>
                          <SelectItem value="cancelled">CANCELADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <p className="font-impact text-primary text-2xl tracking-tighter">R$ {order.total?.toFixed(2)}</p>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  )
}
