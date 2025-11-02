import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"

interface Product {
  _id?: string
  name: string
  price: number
  stock: number
  category: string
}

interface ProductTableProps {
  loading: boolean
  error: string | null
  products: Product[]
  handleDeleteProduct: (id: string) => void
  setEditingProduct: (id: string) => void
  setNewProduct: (product: { name: string; price: string; stock: string; category: string }) => void
}

export default function ProductTable({
  loading,
  error,
  products,
  handleDeleteProduct,
  setEditingProduct,
  setNewProduct,
}: ProductTableProps) {
  return loading ? (
    <div className="text-center py-4">Loading products...</div>
  ) : error ? (
    <div className="text-center py-4 text-destructive">{error}</div>
  ) : (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="p-4 text-left">Name</th>
          <th className="p-4 text-left">Price</th>
          <th className="p-4 text-left">Stock</th>
          <th className="p-4 text-left">Category</th>
          <th className="p-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product._id} className="border-b hover:bg-muted/50">
            <td className="p-4">{product.name}</td>
            <td className="p-4">${product.price.toFixed(2)}</td>
            <td className="p-4">{product.stock}</td>
            <td className="p-4">{product.category}</td>
            <td className="p-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => product._id && handleDeleteProduct(product._id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (product._id) {
                      setEditingProduct(product._id)
                      setNewProduct({
                        name: product.name,
                        price: product.price.toString(),
                        stock: product.stock.toString(),
                        category: product.category,
                      })
                    }
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}