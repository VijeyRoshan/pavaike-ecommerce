"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, Package, ShoppingCart, DollarSign, Plus, Trash2, Edit2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

import type { Product } from "@/types/product"

import { OrdersTable } from "@/components/ui/orders-table"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/products", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          // If unauthorized, clear token and redirect to admin login
          if (response.status === 401) {
            localStorage.removeItem("token")
            router.push("/admin-login")
            return
          }
          const errBody = await response.json().catch(() => ({}))
          throw new Error(errBody.error || errBody.message || "Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        // Use admin orders endpoint
        const adminEndpoint = "/api/admin/orders"
        const resp = await fetch(adminEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!resp.ok) {
          // If unauthorized, clear token and redirect to admin login
          if (resp.status === 401) {
            localStorage.removeItem("token")
            router.push("/admin-login")
            return
          }
          const errBody = await resp.json().catch(() => ({}))
          throw new Error(errBody.error || errBody.message || "Failed to fetch orders")
        }
        const data = await resp.json()
        // Normalize orders shape for the UI
        const normalized = (data || []).map((o: any) => {
          // id normalization
          let id = o.id || o.orderId || null
          if (!id && o._id) {
            try {
              id = typeof o._id === "string" ? o._id : o._id.toString()
            } catch {
              id = String(o._id)
            }
          }

          // customer name fallback
          const customer = o.customer || o.customerName || o.fullName || o.email || "—"

          // amount normalization: prefer total, then subtotal+tax+shipping, then compute from items
          let amount: number | null = null
          if (typeof o.total === "number") amount = o.total
          else if (typeof o.amount === "number") amount = o.amount
          else if (typeof o.subtotal === "number") {
            amount = o.subtotal + (o.tax || 0) + (o.shipping || 0)
          } else if (Array.isArray(o.items)) {
            amount = o.items.reduce((sum: number, it: any) => {
              const price = Number(it.price ?? it.unit_price ?? 0)
              const qty = Number(it.quantity ?? it.qty ?? 1)
              return sum + price * qty
            }, 0)
          }

          const status = o.status || "Pending"

          return {
            // keep original object for details if needed
            _raw: o,
            id,
            customer,
            amount,
            status,
          }
        })

        setOrders(normalized)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setOrdersError("Failed to load orders")
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "" })
  const [editingProduct, setEditingProduct] = useState<string | null>(null)

  const [analyticsData] = useState([
    { month: "Jan", revenue: 4000, orders: 120 },
    { month: "Feb", revenue: 3000, orders: 100 },
    { month: "Mar", revenue: 2000, orders: 80 },
    { month: "Apr", revenue: 2780, orders: 95 },
    { month: "May", revenue: 1890, orders: 70 },
    { month: "Jun", revenue: 2390, orders: 85 },
  ])

  const stats = [
    { label: "Total Revenue", value: "$45,231.89", icon: DollarSign, trend: "+12.5%" },
    { label: "Total Orders", value: String(orders.length), icon: ShoppingCart, trend: "+8.2%" },
    { label: "Products", value: String(products.length), icon: Package, trend: "+2.3%" },
    { label: "Growth", value: "23.5%", icon: TrendingUp, trend: "+4.3%" },
  ]

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price && newProduct.stock && newProduct.category) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newProduct.name,
            price: Number.parseFloat(newProduct.price),
            stock: Number.parseInt(newProduct.stock),
            category: newProduct.category,
          }),
        })

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}))
          throw new Error(errBody.error || errBody.message || "Failed to create product")
        }

        const createdProduct = await response.json()
        setProducts([...products, createdProduct])
        setNewProduct({ name: "", price: "", stock: "", category: "" })
      } catch (err) {
        console.error("Error creating product:", err)
        setError("Failed to create product")
      }
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: productId }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || errBody.message || "Failed to delete product")
      }

      setProducts(products.filter((p) => p._id !== productId))
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Failed to delete product")
    }
  }

  const handleUpdateProduct = async (productId: string, updateData: Partial<Product>) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: productId, ...updateData }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || errBody.message || "Failed to update product")
      }

      const updatedProduct = await response.json()
      setProducts(products.map((p) => p._id === productId ? updatedProduct : p))
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Failed to update product")
    }
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: "Pending" | "Processing" | "Delivered") => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pavaike Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your e-commerce platform</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Back to Store</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-8">
            {["dashboard", "products", "orders", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <Card key={index} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </Card>
                  )
                })}
              </div>

              {/* Recent Orders */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-foreground font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-foreground">{order.customer}</td>
                          <td className="py-3 px-4 text-primary font-bold">{order.amount != null ? `$${order.amount.toFixed(2)}` : "—"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground">{order._raw?.createdAt ? new Date(order._raw.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {activeTab === "products" && (
            <>
              {/* Add New Product */}
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Add New Product</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Input
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                  <Input
                    placeholder="Stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                  <Input
                    placeholder="Category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                  <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </Card>

              {/* Products List */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Products</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                          <td className="py-3 px-4 text-foreground">{product.category}</td>
                          <td className="py-3 px-4 text-primary font-bold">${product.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-foreground">{product.stock}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => product._id && handleDeleteProduct(product._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {activeTab === "orders" && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground font-medium">{order.id}</td>
                        <td className="py-3 px-4 text-foreground">{order.customer}</td>
                        <td className="py-3 px-4 text-primary font-bold">
                          {order.amount != null ? `$${order.amount.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                order.id,
                                e.target.value as "Pending" | "Processing" | "Delivered",
                              )
                            }
                            className={`px-3 py-1 rounded text-xs font-semibold border ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              {/* Revenue Chart */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Monthly Revenue</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#35 0.15 258.71" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Orders Chart */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Orders per Month</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#35 0.15 258.71" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
