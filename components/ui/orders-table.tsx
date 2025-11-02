import { Button } from "@/components/ui/button"
import { OrderDetailsDialog } from "./order-details-dialog"
import { useState } from "react"

interface OrdersTableProps {
  orders: any[]
  loading: boolean
  error: string
  onUpdateStatus: (orderId: string, status: string) => void
}

export function OrdersTable({ orders, loading, error, onUpdateStatus }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-destructive">{error}</div>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-muted/50">
                <td className="p-4">{order._id}</td>
                <td className="p-4">{order.customerName || order.email}</td>
                <td className="p-4">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                    className="bg-background border rounded px-2 py-1"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order)
                      setDetailsOpen(true)
                    }}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  )
}