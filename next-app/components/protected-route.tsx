"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return <div className="text-center pt-20">Loading...</div>
  }

  return <>{children}</>
}
