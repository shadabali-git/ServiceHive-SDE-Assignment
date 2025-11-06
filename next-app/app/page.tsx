"use client"

import Link from "next/link"
import Navbar from "@/components/navbar"
import { useAuthStore } from "@/lib/store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem("token")
    if (token && user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">Swap Your Time Slots</h1>
          <p className="text-xl text-gray-600 mb-8">
            A peer-to-peer scheduling platform where you can exchange calendar slots with other users. Mark your busy
            times as swappable and find the perfect exchange.
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-16">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Manage Events</h3>
              <p className="text-gray-600">Create and manage your calendar events with ease.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Request Swaps</h3>
              <p className="text-gray-600">Browse available slots and request swaps from other users.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get instant notifications when swaps are accepted or rejected.</p>
            </div>
          </div>

          <div className="space-y-4 mt-12">
            <Link
              href="/signup"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 mr-4"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
