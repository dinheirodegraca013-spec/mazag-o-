
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
import { CheckCircle2, Loader2, Send, MessageCircle } from "lucide-react"
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
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: ""
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // 1. Registrar no novo esquema (Customer -> Order)
      await createOrder({
        customerName: values.name,
        customerPhone: values.phone,
        customerEmail: values.email,
        notes: "Pedido captado via Site Mazagão",
        total: 115.00
      })

      // 2. IA para Personalização
      let finalMessage = `Olá, vim pelo site da Mazagão Gás. Meu nome é ${values.name}. Gostaria de pedir um P13 Prata.`
      try {
        const response = await generatePersonalizedWhatsAppOrderMessage({
          customerName: values.name,
          customerPhone: values.phone,
          customerEmail: values.email,
          productName: "P13 Prata"
        })
        if (response?.whatsappMessage) finalMessage = response.whatsappMessage
      } catch (e) {
        console.warn("Usando fallback padrão.")
      }

      const encodedMsg = encodeURIComponent(finalMessage)
      const url = `https://wa.me/5513996253286?text=${encodedMsg}`
      
      setWhatsappUrl(url)
      setIsSuccess(true)
      
      setTimeout(() => {
        window.location.assign(url)
      }, 1500)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ERRO DE CONEXÃO",
        description: error.message || "Verifique as configurações de RLS no Supabase."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="order-form" className="py-24 container px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-impact text-7xl text-white uppercase leading-[0.85] tracking-tighter">
            MÁQUINA DE <br/><span className="text-primary neon-text-green">PEDIDOS ATIVA</span>
          </h2>
          <p className="text-xl text-white/70 max-w-md font-light">
            Seu pedido será registrado automaticamente em nossa central operacional de alta performance.
          </p>
        </div>

        <Card className="bg-[#0a0c1a]/80 backdrop-blur-xl border border-white/5 relative overflow-hidden group shadow-2xl rounded-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/60 animate-scan z-20" />
          <CardHeader className="pb-8 border-b border-white/5">
            <CardTitle className="font-impact text-5xl text-white uppercase tracking-tight">{isSuccess ? "REGISTRADO" : "PEDIR AGORA"}</CardTitle>
            <CardDescription className="text-white/40 uppercase text-[10px] tracking-[0.3em] font-black mt-2">SISTEMA INTEGRADO MAZAGÃO</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {isSuccess ? (
              <div className="py-12 flex flex-col items-center text-center space-y-6">
                <CheckCircle2 className="h-16 w-16 text-primary animate-bounce" />
                <h3 className="text-3xl font-impact text-white uppercase">REDIRECIONANDO...</h3>
                <NeonButton className="w-full h-16 rounded-none text-xl" variant="green" onClick={() => window.location.assign(whatsappUrl)}>
                  <MessageCircle className="mr-2 h-6 w-6" /> ABRIR WHATSAPP
                </NeonButton>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-white/60 uppercase text-[10px] font-black tracking-widest">NOME COMPLETO</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu Nome" 
                          className="bg-white text-black h-14 font-bold border-none rounded-none text-lg focus-visible:ring-primary ring-offset-0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase text-red-500" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-white/60 uppercase text-[10px] font-black tracking-widest">WHATSAPP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1399..." 
                          className="bg-white text-black h-14 font-bold border-none rounded-none text-lg focus-visible:ring-primary ring-offset-0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase text-red-500" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-white/60 uppercase text-[10px] font-black tracking-widest">E-MAIL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@exemplo.com" 
                          className="bg-white text-black h-14 font-bold border-none rounded-none text-lg focus-visible:ring-primary ring-offset-0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase text-red-500" />
                    </FormItem>
                  )} />
                  <NeonButton type="submit" className="w-full h-16 rounded-none text-xl font-impact group" variant="green" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className="mr-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />} 
                    FINALIZAR PEDIDO
                  </NeonButton>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
