"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Package } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Order {
  orderId: string
  customerId: string
  customerName: string
  customerEmail: string
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
  }>
  shippingAddress: {
    address: string
    city: string
    state: string
    zipCode: string
  }
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: string
  createdAt: string
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const lastOrder = localStorage.getItem("lastOrder")
    if (lastOrder) {
      setOrder(JSON.parse(lastOrder))
      return
    }

    // If no local lastOrder, try to fetch by Stripe session id from URL
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")
    if (!sessionId) return

    ;(async () => {
      try {
        const res = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`)
        if (!res.ok) {
          console.error("Failed to fetch order by session", await res.text())
          return
        }
        const data = await res.json()
        localStorage.setItem("lastOrder", JSON.stringify(data))
        setOrder(data)
      } catch (err) {
        console.error("Error fetching order details:", err)
      }
    })()
  }, [])

  if (!order) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">Loading order details...</p>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Order Placed!</h1>
        </div>
      </div>

      {/* Confirmation Content */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Success Message */}
          <Card className="p-8 mb-8 text-center border-green-200 bg-green-50">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank you for your order!</h2>
            <p className="text-muted-foreground mb-4">We've received your order and are processing it right away.</p>
            <p className="text-lg font-semibold text-primary">Order ID: {order.orderId}</p>
          </Card>

          {/* Order Details */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
                <p className="font-semibold text-foreground">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold text-foreground">{order.customerEmail}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                <p className="font-semibold text-foreground">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-foreground">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6 mb-8 bg-primary/5">
            <div className="space-y-3">
              <div className="flex justify-between text-foreground">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
