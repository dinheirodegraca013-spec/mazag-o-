
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
import { OrderService } from "@/services/order-service"
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
      // 1. Salvar no Banco de Dados (Supabase)
      // Ajustamos para não falhar se a busca de usuário falhar
      await OrderService.createOrder({
        customerName: values.name,
        customerPhone: values.phone,
        customerEmail: values.email,
        neighborhood: "Identificando...",
        total_value: 115.00
      })

      // 2. Gerar mensagem de WhatsApp via IA
      const response = await generatePersonalizedWhatsAppOrderMessage({
        customerName: values.name,
        customerPhone: values.phone,
        customerEmail: values.email,
        productName: "P13 Prata (Padrão)"
      })

      const phone = "5513996253286"
      const encodedMsg = encodeURIComponent(response.whatsappMessage)
      const url = `https://wa.me/${phone}?text=${encodedMsg}`
      
      setWhatsappUrl(url)
      setIsSuccess(true)
      
      setTimeout(() => {
        window.location.assign(url)
      }, 1500)

    } catch (error) {
      console.error("Erro ao processar pedido:", error)
      toast({
        variant: "destructive",
        title: "Erro na central de comando",
        description: "Não conseguimos processar seu pedido agora. Verifique a conexão e tente novamente."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="order-form" className="py-24 container px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-impact text-7xl text-white tracking-tight uppercase leading-[0.85]">
            MÁQUINA DE <br/><span className="text-primary neon-text-green">PEDIDOS ATIVA</span>
          </h2>
          <p className="text-xl text-white/70 max-w-md font-light">
            Preencha os dados abaixo e seja redirecionado para nossa central oficial. 
            Seu pedido será registrado automaticamente em nosso sistema.
          </p>
          <ul className="space-y-4">
            {[
              "Pedido registrado no sistema operacional",
              "Sem espera no telefone",
              "Pagamento via PIX ou Cartão",
              "Atendimento prioritário Guarujá"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-white/90 font-bold uppercase text-sm tracking-widest">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-neon-green" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Card className="glass-morphism border-primary/20 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 blur-sm animate-scan z-20" />
          
          <CardHeader className="pb-8">
            <CardTitle className="font-impact text-4xl text-white uppercase tracking-wider">
              {isSuccess ? "SOLICITAÇÃO REGISTRADA" : "INICIAR PEDIDO AGORA"}
            </CardTitle>
            <CardDescription className="text-white/40 uppercase text-[10px] tracking-[0.3em] font-black">
              {isSuccess ? "REDIRECIONANDO PARA A CENTRAL..." : "CENTRAL DE COMANDO MAZAGÃO"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary animate-pulse shadow-neon-green">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-impact text-white uppercase tracking-tighter">PEDIDO SALVO!</h3>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Aguarde o link oficial...</p>
                </div>
                
                <div className="w-full pt-6">
                  <NeonButton 
                    className="w-full h-16" 
                    variant="green" 
                    onClick={() => window.location.assign(whatsappUrl)}
                  >
                    <MessageCircle className="mr-3 h-6 w-6" />
                    ABRIR WHATSAPP
                  </NeonButton>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 uppercase text-[10px] tracking-[0.2em] font-black">NOME COMPLETO</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="mazagão" 
                            className="bg-white text-black h-14 font-bold border-none rounded-sm placeholder:text-black/40" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 uppercase text-[10px] tracking-[0.2em] font-black">WHATSAPP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="13997340823" 
                            className="bg-white text-black h-14 font-bold border-none rounded-sm placeholder:text-black/40" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 uppercase text-[10px] tracking-[0.2em] font-black">E-MAIL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin@mazagao.com" 
                            className="bg-white text-black h-14 font-bold border-none rounded-sm placeholder:text-black/40" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />
                  <NeonButton 
                    type="submit" 
                    className="w-full h-16 rounded-sm" 
                    variant="green" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    ) : (
                      <Send className="mr-3 h-6 w-6" />
                    )}
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
