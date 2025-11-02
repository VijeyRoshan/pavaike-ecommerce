import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  // Mock data - replace with actual data fetching
  const orders = [
    {
      id: "ORD-001",
      date: "2023-11-05",
      status: "Delivered",
      total: "$199.99",
      items: 2,
    },
    {
      id: "ORD-002",
      date: "2023-11-10",
      status: "Processing",
      total: "$349.99",
      items: 1,
    },
    {
      id: "ORD-003",
      date: "2023-11-15",
      status: "Shipped",
      total: "$89.99",
      items: 3,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'shipped':
        return <Package className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
        <Link href="/products">
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" /> Continue Shopping
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b">
                <div className="space-y-1">
                  <div className="font-medium">Order #{order.id}</div>
                  <div className="text-sm text-muted-foreground">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="font-medium">{order.total}</div>
              </div>
              <div className="border-t px-4 py-3 bg-muted/5 text-right">
                <Button variant="outline" size="sm" className="mr-2">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="mr-2">
                  Track Order
                </Button>
                <Button size="sm">
                  Buy Again
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
