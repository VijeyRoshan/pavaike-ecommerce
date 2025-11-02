import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, TrendingUp, Users, Package } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  // Test MongoDB connection
  try {
    const response = await fetch('http://localhost:3000/api/test-connection', { cache: 'no-store' })
    const data = await response.json()
    console.log(data.status)
  } catch (error) {
    console.error("Failed to test connection:", error)
  }

  const featuredProducts = [
    { id: 1, name: "Premium Wireless Headphones", price: "$199.99", rating: 4.8 },
    { id: 2, name: "Smart Watch Pro", price: "$349.99", rating: 4.9 },
    { id: 3, name: "USB-C Cable Pack", price: "$29.99", rating: 4.7 },
    { id: 4, name: "Portable Charger", price: "$89.99", rating: 4.6 },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Pavaike</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost">Browse Products</Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline">Cart</Button>
            </Link>
            <Link href="/admin">
              <Button variant="secondary">Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-5xl font-bold text-balance mb-6 text-foreground">
            Your One-Stop Shop for Premium Products
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Discover top-quality items with seamless checkout and fast delivery
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-12 px-4">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">1000+</div>
            <div className="text-muted-foreground">Products</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent">50K+</div>
            <div className="text-muted-foreground">Customers</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">98%</div>
            <div className="text-muted-foreground">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <ShoppingCart className="h-8 w-8 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent">100K+</div>
            <div className="text-muted-foreground">Orders</div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20" />
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{product.price}</span>
                    <span className="text-sm text-muted-foreground">★ {product.rating}</span>
                  </div>
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90">Add to Cart</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
