import { ReactNode } from 'react'

export const metadata = {
  title: 'Ocean Mining Game',
  description: 'Deep-sea mining adventure with Web3 integration',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}