import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mazagão Gás - Energia Urbana',
  description: 'A distribuidora mais rápida do litoral. Peça seu gás agora pelo WhatsApp.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary selection:text-black">
        {children}
      </body>
    </html>
  );
}
