import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Toaster } from "sonner"
import Link from "next/link"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pavaike - E-commerce Platform",
  description: "Shop premium products at Pavaike",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <SidebarProvider defaultOpen={false}>
              <Sidebar collapsible="icon">
                <SidebarHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="text-lg font-bold text-foreground">Pavaike</Link>
                    <SidebarTrigger />
                  </div>
                </SidebarHeader>
                <SidebarContent className="px-4 py-2">
                  <nav className="flex flex-col gap-3">
                    <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Store
                    </Link>
                    <Link href="/cart" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Cart
                    </Link>
                    <Link href="/orders" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Orders
                    </Link>
                    <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Login
                    </Link>
                    <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Admin
                    </Link>
                  </nav>
                </SidebarContent>
                <SidebarFooter />
                <SidebarRail />
              </Sidebar>
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
