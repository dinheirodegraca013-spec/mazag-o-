
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NeonButton } from "@/components/ui/neon-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { Lock, User, Loader2, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export default function AdminLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "ACESSO NEGADO",
          description: "Verifique suas credenciais operacionais.",
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "ACESSO AUTORIZADO",
        description: "Bem-vindo à Central de Comando Mazagão Gás.",
      })
      
      router.push("/admin")
      router.refresh()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "ERRO DE SISTEMA",
        description: "Falha crítica na conexão com o servidor.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 blur-sm animate-scan" />
      
      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="flex justify-center mb-8">
          <Logo className="scale-125" />
        </div>

        <Card className="glass-morphism border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="font-impact text-3xl text-white uppercase tracking-wider">CENTRAL DE COMANDO</CardTitle>
            <CardDescription className="text-white/40 uppercase text-[10px] font-black tracking-[0.3em]">Operação Enterprise v2.0</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-[10px] uppercase font-black tracking-widest">EMAIL OPERACIONAL</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="admin@mazagao.com" 
                            className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-primary/50 transition-all rounded-none" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-[10px] uppercase font-black tracking-widest">CHAVE DE ACESSO</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-primary/50 transition-all rounded-none" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold" />
                    </FormItem>
                  )}
                />
                <NeonButton 
                  type="submit" 
                  className="w-full rounded-none h-14" 
                  variant="green" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : "AUTENTICAR NO SISTEMA"}
                </NeonButton>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-white/20 text-[10px] font-black uppercase tracking-widest">
          Mazagão Gás Ltda &copy; 2026 - Energia em Movimento
        </p>
      </div>
    </div>
  )
}
