
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
  Users, 
  LogOut, 
  Plus, 
  Activity,
  Search,
  Loader2,
  Trash2,
  AlertTriangle,
  Download,
  UserCheck,
  Phone,
  MapPin,
  Pencil,
  History,
  FileText,
  BarChart3,
  Flame,
  TrendingUp,
  Clock,
  Upload
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { NeonButton } from "@/components/ui/neon-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useOrdersRealtime } from "@/hooks/realtime/use-orders-realtime"
import { useCustomersRealtime } from "@/hooks/realtime/use-customers-realtime"
import { createClient } from "@/lib/supabase/client"
import { updateOrderStatus } from "@/services/orders/update-order-status"
import { deleteOrder } from "@/services/orders/delete-order"
import { deleteCustomer } from "@/services/customers/delete-customer"
import { getCustomerByPhone } from "@/services/customers/get-customer-by-phone"
import { createOrder } from "@/services/order-service"
import { updateOrder } from "@/services/orders/update-order"
import { updateCustomer } from "@/services/customers/update-customer"
import { analyzeNeighborhoodDemand } from "@/ai/flows/neighborhood-analysis-flow"
import { Database } from "@/types/database"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts"

type OrderStatus = Database['public']['Tables']['orders']['Row']['status']

const chartConfig = {
  count: {
    label: "Pedidos",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { orders, loading: isLoadingOrders, refresh: refreshOrders } = useOrdersRealtime()
  const { customers, loading: isLoadingCustomers, refresh: refreshCustomers } = useCustomersRealtime()
  
  const [activeTab, setActiveTab] = React.useState("overview")
  const [isAuthorizing, setIsAuthorizing] = React.useState(true)
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false)
  const [isUpdatingOrder, setIsUpdatingOrder] = React.useState(false)
  const [isUpdatingCustomer, setIsUpdatingCustomer] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isSearchingCustomer, setIsSearchingCustomer] = React.useState(false)
  
  // Estados para Gráficos
  const [isAnalyzingDemand, setIsAnalyzingDemand] = React.useState(false)
  const [neighborhoodData, setNeighborhoodData] = React.useState<any[]>([])
  const [aiInsights, setAiInsights] = React.useState("")
  
  const supabase = createClient()

  const [newOrder, setNewOrder] = React.useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    total: "115.00"
  })

  const [editingOrder, setEditingOrder] = React.useState<any>(null)
  const [editingCustomer, setEditingCustomer] = React.useState<any>(null)

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
        console.error(err)
      }
    }
    checkAccess()
  }, [router, supabase])

  const runDemandAnalysis = React.useCallback(async () => {
    if (orders.length === 0) return
    setIsAnalyzingDemand(true)
    try {
      const addresses = orders.map(o => o.notes || "").filter(a => a.length > 5)
      const analysis = await analyzeNeighborhoodDemand({ addresses })
      setNeighborhoodData(analysis.neighborhoods)
      setAiInsights(analysis.insights)
      toast({ title: "ANÁLISE CONCLUÍDA", description: "Mapa de calor de demanda atualizado." })
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "FALHA NA IA", description: "Não foi possível processar o mapa de calor." })
    } finally {
      setIsAnalyzingDemand(false)
    }
  }, [orders, toast])

  React.useEffect(() => {
    if (activeTab === 'charts' && neighborhoodData.length === 0) {
      runDemandAnalysis()
    }
  }, [activeTab, neighborhoodData.length, runDemandAnalysis])

  const stats = React.useMemo(() => {
    return {
      totalOrders: orders.length,
      totalCustomers: customers.length,
      pending: orders.filter(o => o.status === 'pending').length,
      revenue: orders.reduce((acc, curr) => acc + (curr.total || 0), 0)
    }
  }, [orders, customers])

  const hourlyData = React.useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, count: 0 }))
    orders.forEach(o => {
      const h = new Date(o.created_at).getHours()
      hours[h].count++
    })
    return hours.filter(h => h.count > 0 || (parseInt(h.hour) >= 8 && parseInt(h.hour) <= 22))
  }, [orders])

  const filteredOrders = React.useMemo(() => {
    if (!searchTerm) return orders
    const lower = searchTerm.toLowerCase()
    return orders.filter(o => 
      o.id.toLowerCase().includes(lower) || 
      o.customer?.name?.toLowerCase().includes(lower) ||
      o.notes?.toLowerCase().includes(lower)
    )
  }, [orders, searchTerm])

  const filteredCustomers = React.useMemo(() => {
    if (!searchTerm) return customers
    const lower = searchTerm.toLowerCase()
    return customers.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.email?.toLowerCase().includes(lower) ||
      c.phone?.includes(searchTerm)
    )
  }, [customers, searchTerm])

  const handlePhoneChange = async (val: string) => {
    setNewOrder(prev => ({ ...prev, phone: val }))
    if (val.length >= 10) {
      setIsSearchingCustomer(true)
      const existingCustomer = await getCustomerByPhone(val)
      if (existingCustomer) {
        setNewOrder(prev => ({
          ...prev,
          name: existingCustomer.name || prev.name,
          email: existingCustomer.email || prev.email,
          notes: existingCustomer.address || prev.notes
        }))
        toast({ title: "CLIENTE RECORRENTE", description: "Dados preenchidos automaticamente." })
      }
      setIsSearchingCustomer(false)
    }
  }

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

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id)
      toast({ title: "ORDEM EXCLUÍDA", description: "O registro foi removido do sistema." })
      refreshOrders()
    } catch (error) {
      toast({ variant: "destructive", title: "ERRO AO EXCLUIR", description: "Falha na exclusão." })
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id)
      toast({ title: "CLIENTE EXCLUÍDO", description: "O registro foi removido." })
      refreshCustomers()
    } catch (error) {
      toast({ variant: "destructive", title: "ERRO AO EXCLUIR", description: "O cliente pode ter pedidos vinculados." })
    }
  }

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.notes) {
      toast({ variant: "destructive", title: "ENDEREÇO OBRIGATÓRIO", description: "Preencha o local de entrega." })
      return
    }
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
      refreshOrders()
      refreshCustomers()
      setNewOrder({ name: "", phone: "", email: "", notes: "", total: "115.00" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "FALHA", description: error.message })
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleUpdateOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return
    setIsUpdatingOrder(true)
    try {
      await updateOrder({
        orderId: editingOrder.id,
        customerName: editingOrder.customerName,
        customerPhone: editingOrder.customerPhone,
        customerEmail: editingOrder.customerEmail,
        notes: editingOrder.notes,
        total: parseFloat(editingOrder.total)
      })
      toast({ title: "ORDEM ATUALIZADA", description: "Dados sincronizados com sucesso." })
      setIsEditDialogOpen(false)
      setEditingOrder(null)
      refreshOrders()
      refreshCustomers()
    } catch (error: any) {
      toast({ variant: "destructive", title: "FALHA NA ATUALIZAÇÃO", description: error.message })
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  const handleUpdateCustomerDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return
    setIsUpdatingCustomer(true)
    try {
      await updateCustomer({
        id: editingCustomer.id,
        name: editingCustomer.name,
        phone: editingCustomer.phone,
        email: editingCustomer.email,
        address: editingCustomer.address,
        notes: editingCustomer.notes
      })
      toast({ title: "CLIENTE ATUALIZADO", description: "Dados de CRM sincronizados." })
      setIsEditCustomerOpen(false)
      setEditingCustomer(null)
      refreshCustomers()
    } catch (error: any) {
      toast({ variant: "destructive", title: "FALHA NA ATUALIZAÇÃO", description: error.message })
    } finally {
      setIsUpdatingCustomer(false)
    }
  }

  const openEditOrderDialog = (order: any) => {
    setEditingOrder({
      id: order.id,
      customerName: order.customer?.name || "",
      customerPhone: order.customer?.phone || "",
      customerEmail: order.customer?.email || "",
      notes: order.notes || "",
      total: order.total?.toString() || "0.00"
    })
    setIsEditDialogOpen(true)
  }

  const openEditCustomerDialog = (customer: any) => {
    setEditingCustomer({
      id: customer.id,
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || ""
    })
    setIsEditCustomerOpen(true)
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    ).join("\n")
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "EXPORTAÇÃO CONCLUÍDA", description: "Arquivo baixado com sucesso." })
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
              { label: 'Painel', id: 'overview', icon: <LayoutDashboard className="h-4 w-4" /> },
              { label: 'Gráficos', id: 'charts', icon: <BarChart3 className="h-4 w-4" /> },
              { label: 'Pedidos', id: 'orders', icon: <ShoppingBag className="h-4 w-4" /> },
              { label: 'Clientes', id: 'customers', icon: <Users className="h-4 w-4" /> },
            ].map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => {
                    setActiveTab(item.id)
                    setSearchTerm("")
                  }}
                  isActive={activeTab === item.id}
                  className={`w-full text-white/50 h-12 rounded-none border-l-2 border-transparent font-bold text-[10px] tracking-widest transition-all ${activeTab === item.id ? 'bg-primary/5 text-primary border-primary' : 'hover:bg-white/5'}`}
                >
                  {item.icon}
                  <span className="ml-3 uppercase">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <div className="pt-8 mt-4 border-t border-white/5">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="w-full text-destructive/60 font-bold text-[10px] tracking-widest h-12 hover:bg-destructive/5">
                  <LogOut className="h-4 w-4" />
                  <span className="ml-3">LOGOUT</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="font-impact text-4xl md:text-6xl text-white uppercase tracking-tighter">
              {activeTab === 'overview' ? 'PAINEL DE CONTROLE' : activeTab === 'orders' ? 'GERENCIAR PEDIDOS' : activeTab === 'charts' ? 'INTELIGÊNCIA IA' : 'BASE DE CLIENTES'}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/20 text-[9px] font-black tracking-widest uppercase">OPERACIONAL ATIVO</Badge>
              <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">v2.5 CRM & SMART SYNC</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {activeTab === 'charts' && (
              <Button 
                variant="outline" 
                className="bg-primary/10 border-primary/20 text-primary rounded-none h-10 text-[10px] uppercase font-black tracking-widest hover:bg-primary/20"
                onClick={runDemandAnalysis}
                disabled={isAnalyzingDemand}
              >
                {isAnalyzingDemand ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />} 
                ATUALIZAR ANÁLISE IA
              </Button>
            )}

            {(activeTab === 'orders' || activeTab === 'customers') && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10 text-white rounded-none h-10 text-[10px] uppercase font-black tracking-widest"
                  onClick={() => exportToCSV(activeTab === 'orders' ? orders : customers, activeTab)}
                >
                  <Download className="mr-2 h-4 w-4" /> EXPORTAR
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10 text-white rounded-none h-10 text-[10px] uppercase font-black tracking-widest"
                  onClick={() => toast({ title: "IMPORTAÇÃO", description: "Arraste o arquivo CSV para processar." })}
                >
                  <Upload className="mr-2 h-4 w-4" /> IMPORTAR
                </Button>
              </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <NeonButton variant="green" className="h-10 text-[10px] px-6"><Plus className="mr-2 h-4 w-4" /> NOVA ORDEM</NeonButton>
              </DialogTrigger>
              <DialogContent className="glass-morphism border-white/10 text-white rounded-none sm:max-w-[425px]">
                <DialogHeader><DialogTitle className="font-impact text-2xl uppercase">REGISTRO MANUAL</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateManualOrder} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">TELEFONE (BUSCA AUTOMÁTICA)</label>
                    <div className="relative">
                      <Input value={newOrder.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="(13) 99999-9999" className="bg-white/5 border-white/10 rounded-none h-12 text-white" required />
                      {isSearchingCustomer && <Loader2 className="absolute right-3 top-3 h-6 w-6 animate-spin text-primary" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">DADOS DO CLIENTE</label>
                    <Input value={newOrder.name} onChange={(e) => setNewOrder({...newOrder, name: e.target.value})} placeholder="Nome Completo" className="bg-white/5 border-white/10 rounded-none h-12 text-white" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input value={newOrder.email} onChange={(e) => setNewOrder({...newOrder, email: e.target.value})} placeholder="E-mail" className="bg-white/5 border-white/10 rounded-none h-12 text-white" />
                    <Input value={newOrder.total} onChange={(e) => setNewOrder({...newOrder, total: e.target.value})} placeholder="Valor (R$)" className="bg-white/5 border-white/10 rounded-none h-12 text-white" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-primary tracking-widest">ENDEREÇO DE ENTREGA (OBRIGATÓRIO)</label>
                    <Input value={newOrder.notes} onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})} placeholder="Ex: Rua Tal, 123 - Bairro" className="bg-white/5 border-primary/20 rounded-none h-12 text-white" required />
                  </div>
                  <DialogFooter className="pt-4">
                    <NeonButton type="submit" variant="green" className="w-full h-14 rounded-none text-[12px] font-impact" disabled={isCreatingOrder}>
                      {isCreatingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : "EXECUTAR ORDEM"}
                    </NeonButton>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Volume Pedidos', val: stats.totalOrders, color: 'text-primary' },
                { label: 'Base Clientes', val: stats.totalCustomers, color: 'text-white' },
                { label: 'Aguardando', val: stats.pending, color: 'text-secondary' },
                { label: 'Receita Total', val: `R$ ${stats.revenue.toFixed(2)}`, color: 'text-primary' },
              ].map((stat, i) => (
                <Card key={i} className="glass-morphism border-white/5 rounded-none p-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-3xl md:text-4xl font-impact tracking-tighter ${stat.color} mt-2`}>{stat.val}</p>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-impact text-2xl text-white uppercase tracking-tight">PEDIDOS RECENTES</h2>
                <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Ver Todos</button>
              </div>
              <Card className="glass-morphism border-white/5 rounded-none overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="px-8 text-[10px] font-black uppercase text-white/40">CLIENTE</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-white/40">STATUS</TableHead>
                      <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/40">TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map(order => (
                      <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                        <TableCell className="px-8 py-4">
                          <p className="font-bold text-white uppercase text-sm">{order.customer?.name || 'Venda Direta'}</p>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">REF: {order.id.slice(0, 8)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] font-black">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8 font-impact text-xl text-white">
                          R$ {order.total?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Mapa de Calor de Bairros */}
              <Card className="glass-morphism border-white/5 rounded-none p-6">
                <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-impact text-2xl text-white uppercase flex items-center gap-2">
                      <Flame className="text-primary h-6 w-6" /> MAPA DE CALOR: DEMANDA
                    </CardTitle>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Concentração de pedidos por região em Guarujá</p>
                  </div>
                </CardHeader>
                <CardContent className="px-0 h-[350px]">
                  {isAnalyzingDemand ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-[10px] font-black text-primary uppercase animate-pulse">IA Analisando Endereços...</p>
                    </div>
                  ) : neighborhoodData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={neighborhoodData} layout="vertical" margin={{ left: 20, right: 40 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: 'white', fontSize: 10, fontWeight: 'bold' }}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                            content={<ChartTooltipContent hideLabel />} 
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {neighborhoodData.map((entry, index) => (
                              <Cell key={index} fill={entry.intensity > 70 ? '#b8ff00' : entry.intensity > 30 ? '#1d22d8' : '#333'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/20 uppercase font-black text-xs">Sem dados para análise</div>
                  )}
                </CardContent>
                {aiInsights && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-none">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Insight Estratégico IA:</p>
                    <p className="text-xs text-white/80 italic">"{aiInsights}"</p>
                  </div>
                )}
              </Card>

              {/* Gráfico de Horários de Pico */}
              <Card className="glass-morphism border-white/5 rounded-none p-6">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="font-impact text-2xl text-white uppercase flex items-center gap-2">
                    <Clock className="text-secondary h-6 w-6" /> PICOS DE OPERAÇÃO
                  </CardTitle>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Distribuição de pedidos por hora do dia</p>
                </CardHeader>
                <CardContent className="px-0 h-[350px]">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData} margin={{ top: 20, bottom: 20 }}>
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="#1d22d8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  placeholder="BUSCAR PEDIDO POR NOME OU ID..." 
                  className="bg-white/5 border-white/10 rounded-none h-12 pl-12 text-white uppercase font-bold text-xs tracking-widest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="glass-morphism border-white/5 rounded-none overflow-hidden">
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="px-8 text-[10px] font-black uppercase text-white/40">DATA / CLIENTE</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-white/40">FLUXO LOGÍSTICO</TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/40">INVESTIMENTO / AÇÃO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOrders ? (
                    <TableRow><TableCell colSpan={3} className="px-8 py-20 text-center text-primary font-black animate-pulse tracking-[0.5em] uppercase">SINCRONIZANDO PEDIDOS...</TableCell></TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="px-8 py-20 text-center text-white/20 font-black uppercase">NENHUMA ORDEM ENCONTRADA</TableCell></TableRow>
                  ) : (
                    filteredOrders.map(order => (
                      <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03]">
                        <TableCell className="px-8 py-6">
                          <p className="text-[9px] text-primary font-black uppercase tracking-widest mb-1">
                            {new Date(order.created_at).toLocaleString('pt-BR')}
                          </p>
                          <p className="font-bold text-white uppercase text-base">{order.customer?.name || 'CLIENTE FINAL'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-white/20" />
                            <p className="text-[10px] text-white/40 font-bold uppercase">{order.notes || 'Endereço não informado'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}>
                            <SelectTrigger className="w-[180px] h-10 text-[10px] bg-white/5 border-white/10 uppercase font-black tracking-widest rounded-none text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0c1a] border-white/10 rounded-none text-white">
                              <SelectItem value="pending" className="focus:bg-primary/20">PENDENTE</SelectItem>
                              <SelectItem value="confirmed" className="focus:bg-primary/20">CONFIRMADO</SelectItem>
                              <SelectItem value="preparing" className="focus:bg-primary/20">PREPARANDO</SelectItem>
                              <SelectItem value="delivering" className="focus:bg-primary/20">EM ROTA</SelectItem>
                              <SelectItem value="completed" className="focus:bg-primary/20">ENTREGUE</SelectItem>
                              <SelectItem value="cancelled" className="focus:bg-destructive/20">CANCELADO</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-right mr-4">
                              <p className="font-impact text-primary text-3xl tracking-tighter">R$ {order.total?.toFixed(2)}</p>
                              <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{order.payment_method || 'A DEFINIR'}</p>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white/40 hover:text-primary hover:bg-primary/5"
                              onClick={() => openEditOrderDialog(order)}
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/5">
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-morphism border-white/10 text-white rounded-none">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-impact text-2xl uppercase flex items-center gap-2">
                                    <AlertTriangle className="text-destructive" /> EXCLUIR REGISTRO?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-white/60 uppercase text-[10px] font-black tracking-widest">
                                    Esta ação é irreversível. O pedido será removido permanentemente da base Mazagão.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white uppercase text-[10px] font-black rounded-none">CANCELAR</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive text-white uppercase text-[10px] font-black rounded-none hover:bg-destructive/80">CONFIRMAR EXCLUSÃO</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  placeholder="BUSCAR CLIENTE POR NOME, EMAIL OU TELEFONE..." 
                  className="bg-white/5 border-white/10 rounded-none h-12 pl-12 text-white uppercase font-bold text-xs tracking-widest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="glass-morphism border-white/5 rounded-none overflow-hidden">
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="px-8 text-[10px] font-black uppercase text-white/40">CADASTRO / CLIENTE</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-white/40">INFORMAÇÕES DE CONTATO / ENDEREÇO</TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/40">HISTÓRICO / AÇÃO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow><TableCell colSpan={3} className="px-8 py-20 text-center text-primary font-black animate-pulse tracking-[0.5em] uppercase">SINCRONIZANDO BASE CRM...</TableCell></TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="px-8 py-20 text-center text-white/20 font-black uppercase">NENHUM CLIENTE REGISTRADO</TableCell></TableRow>
                  ) : (
                    filteredCustomers.map(customer => {
                      const customerOrders = orders.filter(o => o.customer_id === customer.id)
                      const uniqueAddresses = Array.from(new Set(customerOrders.map(o => o.notes).filter(Boolean)))
                      
                      return (
                        <TableRow key={customer.id} className="border-white/5 hover:bg-white/[0.03]">
                          <TableCell className="px-8 py-6">
                            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">
                              DESDE {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-bold text-white uppercase text-base">{customer.name}</p>
                                <Badge className="bg-white/5 text-white/40 text-[8px] font-black border-white/10 uppercase">ID: {customer.id.slice(0, 8)}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-white/60">
                                <Phone className="h-3 w-3 text-primary" />
                                <span className="text-xs font-bold">{customer.phone || 'NÃO INFORMADO'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/40">
                                <MapPin className="h-3 w-3" />
                                <span className="text-[10px] font-medium uppercase truncate max-w-[200px]">{customer.address || 'SEM ENDEREÇO PRINCIPAL'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex items-center justify-end gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white text-[10px] font-black uppercase h-8">
                                    <History className="mr-2 h-3 w-3" /> {customerOrders.length} PEDIDOS
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="glass-morphism border-white/10 text-white rounded-none max-w-2xl">
                                  <DialogHeader><DialogTitle className="font-impact text-2xl uppercase">DETALHES: {customer.name}</DialogTitle></DialogHeader>
                                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2">
                                    
                                    <div className="space-y-4">
                                      <h3 className="font-impact text-primary uppercase text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> HISTÓRICO DE ENDEREÇOS</h3>
                                      <div className="grid gap-2">
                                        {uniqueAddresses.length > 0 ? uniqueAddresses.map((addr, idx) => (
                                          <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-none flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{idx + 1}</div>
                                            <p className="text-xs uppercase font-bold text-white/70">{addr}</p>
                                          </div>
                                        )) : <p className="text-xs text-white/30 uppercase italic">Nenhum endereço de entrega registrado.</p>}
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="font-impact text-white uppercase text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> ÚLTIMAS TRANSAÇÕES</h3>
                                      <Table>
                                        <TableHeader className="bg-white/5">
                                          <TableRow>
                                            <TableHead className="text-[9px] uppercase font-black">DATA</TableHead>
                                            <TableHead className="text-[9px] uppercase font-black">ENDEREÇO</TableHead>
                                            <TableHead className="text-[9px] uppercase font-black">STATUS</TableHead>
                                            <TableHead className="text-right text-[9px] uppercase font-black">TOTAL</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {customerOrders.map(o => (
                                            <TableRow key={o.id} className="border-white/5">
                                              <TableCell className="text-[10px] font-bold">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                                              <TableCell className="text-[10px] max-w-[150px] truncate uppercase">{o.notes}</TableCell>
                                              <TableCell><Badge className="text-[8px] font-black uppercase">{o.status}</Badge></TableCell>
                                              <TableCell className="text-right font-impact text-primary">R$ {o.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white/40 hover:text-primary hover:bg-primary/5"
                                onClick={() => openEditCustomerDialog(customer)}
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/5">
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-morphism border-white/10 text-white rounded-none">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-impact text-2xl uppercase flex items-center gap-2">
                                      <AlertTriangle className="text-destructive" /> REMOVER CLIENTE?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-white/60 uppercase text-[10px] font-black tracking-widest">
                                      Esta ação removerá o cliente da base CRM. Se houver pedidos vinculados, a exclusão poderá falhar.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white uppercase text-[10px] font-black rounded-none">VOLTAR</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)} className="bg-destructive text-white uppercase text-[10px] font-black rounded-none hover:bg-destructive/80">CONFIRMAR REMOÇÃO</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* DIÁLOGO: EDITAR PEDIDO */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-morphism border-white/10 text-white rounded-none sm:max-w-[425px]">
            <DialogHeader><DialogTitle className="font-impact text-2xl uppercase">EDITAR PEDIDO</DialogTitle></DialogHeader>
            {editingOrder && (
              <form onSubmit={handleUpdateOrderDetails} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">NOME DO CLIENTE</label>
                  <Input value={editingOrder.customerName} onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">TELEFONE</label>
                    <Input value={editingOrder.customerPhone} onChange={(e) => setEditingOrder({...editingOrder, customerPhone: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">VALOR (R$)</label>
                    <Input value={editingOrder.total} onChange={(e) => setEditingOrder({...editingOrder, total: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">E-MAIL</label>
                  <Input value={editingOrder.customerEmail} onChange={(e) => setEditingOrder({...editingOrder, customerEmail: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest">ENDEREÇO DE ENTREGA</label>
                  <Input value={editingOrder.notes} onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})} className="bg-white/5 border-primary/20 rounded-none h-12 text-white" required />
                </div>
                <DialogFooter className="pt-4">
                  <NeonButton type="submit" variant="green" className="w-full h-14 rounded-none text-[12px] font-impact" disabled={isUpdatingOrder}>
                    {isUpdatingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : "SALVAR ALTERAÇÕES"}
                  </NeonButton>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* DIÁLOGO: EDITAR CLIENTE (CRM) */}
        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
          <DialogContent className="glass-morphism border-white/10 text-white rounded-none sm:max-w-[425px]">
            <DialogHeader><DialogTitle className="font-impact text-2xl uppercase">EDITAR CADASTRO CRM</DialogTitle></DialogHeader>
            {editingCustomer && (
              <form onSubmit={handleUpdateCustomerDetails} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">NOME COMPLETO</label>
                  <Input value={editingCustomer.name} onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white uppercase font-bold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">TELEFONE</label>
                    <Input value={editingCustomer.phone} onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">E-MAIL</label>
                    <Input value={editingCustomer.email} onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12 text-white lowercase" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest">ENDEREÇO PRINCIPAL</label>
                  <Input value={editingCustomer.address} onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})} className="bg-white/5 border-primary/20 rounded-none h-12 text-white uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">NOTAS OPERACIONAIS</label>
                  <Textarea value={editingCustomer.notes} onChange={(e) => setEditingCustomer({...editingCustomer, notes: e.target.value})} className="bg-white/5 border-white/10 rounded-none min-h-[80px] text-white text-xs uppercase" placeholder="Observações sobre o cliente..." />
                </div>
                <DialogFooter className="pt-4">
                  <NeonButton type="submit" variant="green" className="w-full h-14 rounded-none text-[12px] font-impact" disabled={isUpdatingCustomer}>
                    {isUpdatingCustomer ? <Loader2 className="animate-spin h-5 w-5" /> : "ATUALIZAR CRM"}
                  </NeonButton>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
