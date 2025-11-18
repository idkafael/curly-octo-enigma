import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mercado Livre',
  description: 'Mercado Livre - Checkout',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://sdk.mercadopago.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://data.mercadolibre.com" />
        <link rel="preconnect" href="https://http2.mlstatic.com" />
        <link rel="preconnect" href="https://stats.g.doubleclick.net" />
        <link rel="preconnect" href="https://www.google.com.br" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
