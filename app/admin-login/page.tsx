"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Admin login failed")
      }

      const data = await response.json()
      
      // Note: localStorage usage here - see comments below
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      router.push("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Admin Portal</span>
          </Link>
        </div>
      </nav>

      <section className="py-12 px-4 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Card className="w-full max-w-md p-8 shadow-lg bg-white">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <ShieldCheck className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-center">Admin Login</h1>
            <p className="text-gray-600 mt-2">Access your admin dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-semibold mb-2 text-blue-900">
                Test Credentials (Demo):
              </p>
              <p className="text-blue-800">Email: admin@example.com</p>
              <p className="text-blue-800">Password: Admin123!</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">Logging in</span>
                  <span className="animate-pulse">...</span>
                </span>
              ) : (
                "Login to Admin Portal"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600 text-sm">
              Not an admin?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Go to User Login
              </Link>
            </p>
            <p className="text-gray-600 text-sm">
              Back to{" "}
              <Link href="/" className="text-blue-600 font-semibold hover:underline">
                Store
              </Link>
            </p>
          </div>
        </Card>
      </section>
    </main>
  )
}