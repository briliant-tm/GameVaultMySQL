import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vault — Game Library',
  description: 'Your personal game collection, organized.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
