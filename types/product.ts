export interface Product {
  _id?: string
  name: string
  price: number
  stock: number
  category: string
  description?: string
  image?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateProductInput {
  name: string
  price: number
  stock: number
  category: string
  description?: string
  image?: string
}

export interface UpdateProductInput {
  name?: string
  price?: number
  stock?: number
  category?: string
  description?: string
  image?: string
}