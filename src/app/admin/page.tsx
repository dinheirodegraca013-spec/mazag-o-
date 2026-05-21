
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
import { OrderService } from "@/services/order-service"
import { Database } from "@/types/database"

type OrderStatus = Database['public']['Enums']['order_status']

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
    neighborhood: "",
    value: "115.00"
  })

  React.useEffect(() => {
    async function checkAccess() {
      try {
        if (!supabase || !supabase.auth) {
          throw new Error("Supabase não configurado corretamente.")
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push("/admin/login")
          return
        }
        
        setIsAuthorizing(false)
      } catch (err: any) {
        console.error("Erro de acesso:", err)
        setConfigError(err.message || "Erro crítico de conexão.")
        if (!err.message?.includes("configurado")) {
          setTimeout(() => router.push("/admin/login"), 3000)
        }
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
      revenue: orders.reduce((acc, curr) => acc + (curr.total_value || 0), 0)
    }
  }, [orders])

  const handleLogout = async () => {
    if (supabase?.auth) {
      await supabase.auth.signOut()
    }
    router.push("/admin/login")
    router.refresh()
  }

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(id, newStatus)
      toast({ 
        title: "COMANDO EXECUTADO", 
        description: `Status do pedido atualizado para ${newStatus.toUpperCase()}.`,
      })
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "ERRO OPERACIONAL", 
        description: "Não foi possível sincronizar o status." 
      })
    }
  }

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingOrder(true)
    try {
      await OrderService.createOrder({
        customerName: newOrder.name,
        customerPhone: newOrder.phone,
        customerEmail: newOrder.email,
        neighborhood: newOrder.neighborhood || "Geral",
        total_value: parseFloat(newOrder.value)
      })
      
      toast({
        title: "ORDEM CRIADA",
        description: "Novo pedido registrado com sucesso na central.",
      })
      
      setIsDialogOpen(false)
      setNewOrder({ name: "", phone: "", email: "", neighborhood: "", value: "115.00" })
      refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "FALHA NA CRIAÇÃO",
        description: error.message || "Erro ao registrar ordem manual no banco de dados.",
      })
    } finally {
      setIsCreatingOrder(false)
    }
  }

  if (configError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-6">
        <Alert variant="destructive" className="max-w-md bg-destructive/10 border-destructive/20 text-white">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="font-impact uppercase">ERRO DE CONFIGURAÇÃO</AlertTitle>
          <AlertDescription className="text-xs uppercase font-bold mt-2">
            {configError}. Verifique as variáveis de ambiente.
          </AlertDescription>
          <NeonButton variant="blue" onClick={() => window.location.reload()} className="w-full mt-4 h-10 text-[10px]">
            TENTAR NOVAMENTE
          </NeonButton>
        </Alert>
      </div>
    )
  }

  if (isAuthorizing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Activity className="h-16 w-16 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body text-foreground w-full">
      <Sidebar className="border-r border-white/10 glass-morphism">
        <SidebarHeader className="p-8">
          <Logo variant="full" className="scale-75 origin-left" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-6 space-y-2">
            {[
              { label: 'Visão Geral', id: 'overview', icon: <LayoutDashboard className="h-4 w-4" /> },
              { label: 'Logística', id: 'orders', icon: <ShoppingBag className="h-4 w-4" /> },
              { label: 'Clientes / CRM', id: 'customers', icon: <Users className="h-4 w-4" /> },
              { label: 'Radar IA', id: 'predictive', icon: <BrainCircuit className="h-4 w-4" /> },
            ].map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => setActiveTab(item.id)}
                  isActive={activeTab === item.id}
                  className={`w-full text-white/50 hover:text-primary hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest h-12 transition-all rounded-none border-l-2 border-transparent ${activeTab === item.id ? 'bg-primary/5 text-primary border-primary' : ''}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <div className="pt-8 mt-4 border-t border-white/5">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout} 
                  className="w-full text-destructive/60 hover:text-destructive hover:bg-destructive/5 font-bold uppercase text-[10px] tracking-widest h-12 rounded-none"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-3">LOGOUT</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-y-auto bg-background p-10">
        <header className="flex items-center justify-between mb-16">
          <div className="space-y-1">
            <h1 className="font-impact text-6xl text-white tracking-tighter uppercase leading-none">CENTRAL DE COMANDO</h1>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-[9px] font-black tracking-widest uppercase">
              Sincronizado via Supabase Realtime
            </Badge>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <NeonButton variant="green" size="default" className="h-10 text-[10px]">
                <Plus className="mr-2 h-4 w-4" />
                NOVA ORDEM
              </NeonButton>
            </DialogTrigger>
            <DialogContent className="glass-morphism border-white/10 text-white rounded-none sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-impact text-2xl uppercase tracking-wider">REGISTRAR ORDEM MANUAL</DialogTitle>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Entrada direta no sistema logístico</p>
              </DialogHeader>
              <form onSubmit={handleCreateManualOrder} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-white/60">CLIENTE</Label>
                  <Input 
                    value={newOrder.name} 
                    onChange={(e) => setNewOrder({...newOrder, name: e.target.value})}
                    placeholder="Nome Completo" 
                    className="bg-white/5 border-white/10 rounded-none text-white h-10"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/60">WHATSAPP</Label>
                    <Input 
                      value={newOrder.phone} 
                      onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                      placeholder="1399..." 
                      className="bg-white/5 border-white/10 rounded-none text-white h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/60">VALOR (R$)</Label>
                    <Input 
                      value={newOrder.value} 
                      onChange={(e) => setNewOrder({...newOrder, value: e.target.value})}
                      placeholder="115.00" 
                      className="bg-white/5 border-white/10 rounded-none text-white h-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-white/60">BAIRRO / ZONA</Label>
                  <Input 
                    value={newOrder.neighborhood} 
                    onChange={(e) => setNewOrder({...newOrder, neighborhood: e.target.value})}
                    placeholder="Ex: Astúrias" 
                    className="bg-white/5 border-white/10 rounded-none text-white h-10"
                    required
                  />
                </div>
                <DialogFooter className="pt-4">
                  <NeonButton 
                    type="submit" 
                    variant="green" 
                    className="w-full h-12 rounded-none text-[12px]"
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : "DISPARAR ORDEM"}
                  </NeonButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <Tabs value={activeTab} className="space-y-10">
          <TabsContent value="overview" className="space-y-10">
             <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Volume Total', val: stats.total, color: 'text-primary', icon: <Activity />, desc: 'Pedidos totais' },
                { label: 'Alerta Pendente', val: stats.pending, color: 'text-white', icon: <AlertTriangle />, desc: 'Aguardando ação' },
                { label: 'Em Trânsito', val: stats.delivering, color: 'text-secondary', icon: <Truck />, desc: 'Entregadores ativos' },
                { label: 'Receita Bruta', val: `R$ ${stats.revenue.toFixed(2)}`, color: 'text-primary', icon: <TrendingUp />, desc: 'Faturamento real' },
              ].map((stat, i) => (
                <Card key={i} className="glass-morphism border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all rounded-none">
                  <CardHeader className="pb-2">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{stat.label}</p>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {isLoading ? (
                      <Skeleton className="h-12 w-32 bg-white/5" />
                    ) : (
                      <p className={`text-5xl font-impact tracking-tighter ${stat.color}`}>{stat.val}</p>
                    )}
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{stat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass-morphism border-white/5 rounded-none overflow-hidden">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="font-impact text-3xl text-white uppercase tracking-tight">Últimas Atividades</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="px-8 text-[10px] font-black uppercase text-white/40">OPERADOR / CLIENTE</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-white/40">ESTADO ATUAL</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-white/40">ZONA OPERACIONAL</TableHead>
                      <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/40">VALOR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="px-8"><Skeleton className="h-12 w-full bg-white/5" /></TableCell></TableRow>) : 
                      orders.slice(0, 10).map(order => (
                        <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03]">
                          <TableCell className="px-8 py-5">
                            <p className="font-bold text-white uppercase text-sm">{order.users?.full_name || 'CLIENTE MANUAL'}</p>
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
                          <TableCell>
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{order.neighborhood || 'GERAL'}</span>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <p className="font-impact text-primary text-2xl tracking-tighter">R$ {order.total_value?.toFixed(2)}</p>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
