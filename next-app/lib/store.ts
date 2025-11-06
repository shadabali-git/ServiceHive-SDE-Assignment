"use client"

import { create } from "zustand"
import { useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token })
    if (token) {
      localStorage.setItem("token", token)
    }
  },
  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem("token")
  },
  initialize: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      set({ token })
    }
  },
}))

export function useInitializeAuth() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])
}
