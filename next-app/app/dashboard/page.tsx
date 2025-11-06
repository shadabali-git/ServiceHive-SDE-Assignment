"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { useAuthStore } from "@/lib/store"
import apiClient from "@/lib/api"

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING"
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ title: "", startTime: "", endTime: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchEvents()
  }, [user, router])

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/events")
      setEvents(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await apiClient.post("/events", {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
      })
      setFormData({ title: "", startTime: "", endTime: "" })
      fetchEvents()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create event")
    }
  }

  const handleUpdateStatus = async (eventId: string, status: "SWAPPABLE" | "BUSY") => {
    try {
      await apiClient.patch(`/events/${eventId}`, { status })
      fetchEvents()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update event")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiClient.delete(`/events/${eventId}`)
      fetchEvents()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete event")
    }
  }

  if (loading) {
    return (
    
        <main className="min-h-screen pt-20">
          <div className="text-center">Loading...</div>
        </main>
    )
  }

  return (
   
      <main className="flex-1 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">My Calendar</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Create Event Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Create Event</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <input
                  type="text"
                  placeholder="Event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Event
                </button>
              </form>
              {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            </div>

            {/* Events List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Your Events</h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-600">No events yet. Create one to get started!</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            event.status === "SWAPPABLE"
                              ? "bg-green-100 text-green-800"
                              : event.status === "SWAP_PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(event.id, event.status === "SWAPPABLE" ? "BUSY" : "SWAPPABLE")
                          }
                          className={`flex-1 py-2 rounded font-medium transition ${
                            event.status === "SWAPPABLE"
                              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {event.status === "SWAPPABLE" ? "Mark Busy" : "Make Swappable"}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}
