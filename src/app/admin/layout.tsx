import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'

/**
 * Admin Layout.
 * Estrutura base para a central de comando.
 * A proteção de rota foi movida para as páginas individuais para evitar loops no redirecionamento do login.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {children}
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
