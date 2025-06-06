import type React from "react"
import type { Metadata } from "next"

import { Inter } from "next/font/google"
import "./globals.css"
import { UserProvider } from "@/contexts/user-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ocean Mining Simulation",
  description: "A blockchain-based underwater mining game",
    generator: 'v0.dev'

import "./globals.css"
import { UserProvider } from "@/contexts/user-context"

export const metadata: Metadata = {
  title: "Ocean Mining Game",
  description: "Web3 ocean mining simulation game",
  generator: "v0.dev",

}

export default function RootLayout({
  children,

}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>

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
