import { NextRequest, NextResponse } from "next/server"
import { verifyToken, extractToken } from "@/lib/auth"

export function requireAuth(handler: (request: NextRequest, user: any) => Promise<Response> | Response) {
  return async (request: NextRequest) => {
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return handler(request, payload)
  }
}
