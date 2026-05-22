"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NeonButton } from "@/components/ui/neon-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { generatePersonalizedWhatsAppOrderMessage } from "@/ai/flows/personalized-whatsapp-order-message-flow"
import { createOrder } from "@/services/order-service"
import { getCustomerByPhone } from "@/services/customers/get-customer-by-phone"
import { CheckCircle2, Loader2, Send, MessageCircle, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido")
})

export function OrderFunnel() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [whatsappUrl, setWhatsappUrl] = React.useState("")
  const [lastAddress, setLastAddress] = React.useState<string | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: ""
    }
  })

  // Efeito para detectar cliente recorrente pelo telefone
  const phoneValue = form.watch("phone")
  React.useEffect(() => {
    const checkCustomer = async () => {
      const cleanPhone = phoneValue.replace(/\D/g, "")
      if (cleanPhone.length >= 10) {
        setIsSearching(true)
        try {
          const customer = await getCustomerByPhone(cleanPhone)
          if (customer) {
            if (!form.getValues("name")) {
              form.setValue("name", customer.name)
            }
            if (!form.getValues("email") && customer.email) {
              form.setValue("email", customer.email)
            }
            if (customer.address) {
              setLastAddress(customer.address)
              toast({
                title: "CLIENTE RECORRENTE",
                description: "Seu último endereço foi localizado para agilizar o pedido.",
              })
            }
          }
        } catch (e) {
          console.error("Erro ao buscar cliente:", e)
        } finally {
          setIsSearching(false)
        }
      }
    }
    checkCustomer()
  }, [phoneValue, form, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // 1. Registrar Ordem no Banco
      await createOrder({
        customerName: values.name,
        customerPhone: values.phone,
        customerEmail: values.email,
        notes: lastAddress ? `Endereço Reutilizado: ${lastAddress}` : "Captado via Site Mazagão Gás",
        total: 115.00
      })

      // 2. Gerar Mensagem com IA (incluindo o endereço se existir)
      let finalMessage = `Olá, vim pelo site da Mazagão Gás. Meu nome é ${values.name}, meu e-mail é ${values.email} e meu telefone é ${values.phone}. Gostaria de pedir agora mesmo.${lastAddress ? ` Meu último endereço cadastrado foi: ${lastAddress}.` : ""}`
      
      try {
        const response = await generatePersonalizedWhatsAppOrderMessage({
          customerName: values.name,
          customerPhone: values.phone,
          customerEmail: values.email,
          deliveryAddress: lastAddress || undefined
        })
        if (response?.whatsappMessage) finalMessage = response.whatsappMessage
      } catch (e) {
        console.warn("IA indisponível. Usando mensagem padrão.")
      }

      const encodedMsg = encodeURIComponent(finalMessage)
      const url = `https://wa.me/5513996253286?text=${encodedMsg}`
      
      setWhatsappUrl(url)
      setIsSuccess(true)
      
      setTimeout(() => {
        window.location.assign(url)
      }, 1500)

    } catch (error: any) {
      console.error("Erro ao processar pedido:", error)
      toast({
        variant: "destructive",
        title: "SISTEMA INDISPONÍVEL",
        description: "Falha na conexão com a central. Tente novamente em instantes."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="order-form" className="py-24 container px-4 relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-impact text-7xl md:text-8xl text-white uppercase leading-[0.85] tracking-tighter">
            MÁQUINA DE <br/><span className="text-primary neon-text-green">PEDIDOS ATIVA</span>
          </h2>
          <p className="text-xl text-white/40 max-w-md font-bold uppercase tracking-widest leading-snug">
            Seu pedido será registrado automaticamente em nossa central operacional de alta performance.
          </p>
          
          {lastAddress && !isSuccess && (
            <div className="bg-primary/5 border border-primary/20 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-left-4">
              <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Endereço Detectado</p>
                <p className="text-sm text-white/70 font-bold uppercase">{lastAddress}</p>
                <p className="text-[9px] text-white/30 uppercase mt-1">Confirmaremos os detalhes no WhatsApp</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-primary/20 blur-2xl rounded-none opacity-50" />
          
          <Card className="bg-[#05060f] border border-white/10 relative overflow-hidden shadow-2xl rounded-none z-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-scan z-20 shadow-[0_0_10px_rgba(184,255,0,0.8)]" />
            
            <CardHeader className="pb-8 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="font-impact text-5xl text-white uppercase tracking-tight">PEDIR AGORA</CardTitle>
              <CardDescription className="text-white/40 uppercase text-[10px] tracking-[0.4em] font-black mt-1">SISTEMA INTEGRADO MAZAGÃO</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-10 px-8 pb-10">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-impact text-white uppercase tracking-tighter">ORDEM PROCESSADA</h3>
                  <p className="text-white/40 text-xs font-black uppercase tracking-widest">Iniciando protocolo WhatsApp...</p>
                  <NeonButton className="w-full h-16 rounded-none text-xl font-impact" variant="green" onClick={() => window.location.assign(whatsappUrl)}>
                    <MessageCircle className="mr-3 h-6 w-6" /> ABRIR WHATSAPP
                  </NeonButton>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="relative">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-white/60 uppercase text-[10px] font-black tracking-[0.2em]">WHATSAPP (NÚMERO COM DDD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="13997340823" 
                                className="bg-white text-black h-16 font-black border-none rounded-none text-xl uppercase placeholder:text-black/20 focus-visible:ring-primary ring-offset-0" 
                                {...field} 
                              />
                              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 animate-spin text-primary" />}
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase text-destructive" />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-white/60 uppercase text-[10px] font-black tracking-[0.2em]">NOME COMPLETO</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="EX: GUILHERME CABANAS VAZQUEZ" 
                            className="bg-white text-black h-16 font-black border-none rounded-none text-xl uppercase placeholder:text-black/20 focus-visible:ring-primary ring-offset-0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase text-destructive" />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-white/60 uppercase text-[10px] font-black tracking-[0.2em]">E-MAIL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="CONTATO@GMAIL.COM" 
                            className="bg-white text-black h-16 font-black border-none rounded-none text-xl uppercase placeholder:text-black/20 focus-visible:ring-primary ring-offset-0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase text-destructive" />
                      </FormItem>
                    )} />

                    <NeonButton type="submit" className="w-full h-20 rounded-none text-2xl font-impact group transition-all duration-300" variant="green" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin h-7 w-7" />
                          <span>SINCRONIZANDO...</span>
                        </div>
                      ) : (
                        <div className="flex items-center tracking-tighter">
                          <Send className="mr-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-500" /> 
                          <span>FINALIZAR PEDIDO</span>
                        </div>
                      )}
                    </NeonButton>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
