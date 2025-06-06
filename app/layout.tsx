import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { UserProvider } from "@/contexts/user-context"

export const metadata: Metadata = {
  title: "Ocean Mining Game",
  description: "Web3 ocean mining simulation game",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
