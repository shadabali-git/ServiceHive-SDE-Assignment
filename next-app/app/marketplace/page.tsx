"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { useAuthStore } from "@/lib/store"
import apiClient from "@/lib/api"

interface SwappableSlot {
  id: string
  user_id: string
  owner_id: string
  name: string
  title: string
  start_time: string
  end_time: string
  status: string
}

interface UserEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  status: string
}

export default function MarketplacePage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [slots, setSlots] = useState<SwappableSlot[]>([])
  const [userEvents, setUserEvents] = useState<UserEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [slotsRes, eventsRes] = await Promise.all([
        apiClient.get("/swap/swappable-slots"),
        apiClient.get("/events"),
      ])
      setSlots(slotsRes.data)
      setUserEvents(eventsRes.data.filter((e: UserEvent) => e.status === "SWAPPABLE"))
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = async () => {
    if (!selectedSlot || !selectedEvent) {
      setError("Please select both a slot to offer and a slot to request")
      return
    }

    try {
      setError("")
      setSuccess("")
      await apiClient.post("/swap/request", {
        mySlotId: selectedEvent,
        theirSlotId: selectedSlot.id,
      })
      setSuccess(`Swap request sent to ${selectedSlot.name}!`)
      setSelectedSlot(null)
      setSelectedEvent("")
      setTimeout(() => {
        fetchData()
        setSuccess("")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to request swap")
    }
  }

  if (loading) {
    return (
    
        <main className="min-h-screen pt-20">
          <div className="text-center">Loading marketplace...</div>
        </main>
     
    )
  }

  return (
    
      <main className="flex-1 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Slot Marketplace</h1>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Available Slots */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
              {slots.length === 0 ? (
                <p className="text-gray-600">No swappable slots available at the moment</p>
              ) : (
                <div className="space-y-4">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedSlot?.id === slot.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{slot.title}</h3>
                          <p className="text-sm text-gray-600">by {slot.name}</p>
                        </div>
                        <input
                          type="radio"
                          name="selectedSlot"
                          checked={selectedSlot?.id === slot.id}
                          onChange={() => setSelectedSlot(slot)}
                          className="w-4 h-4"
                        />
                      </div>
                      <p className="text-gray-600 text-sm">
                        {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Request Swap</h2>

              {selectedSlot && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Selected slot:</p>
                  <p className="font-semibold">{selectedSlot.title}</p>
                  <p className="text-sm text-gray-600">{selectedSlot.name}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Swappable Slot</label>
                <select
                  disabled={userEvents.length === 0}
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-300 ${slots.length === 0 ? "bg-gray-100 cursor-not-allowed" : "rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"}`}
                >
                  <option value="">Select a slot to offer</option>
                  {userEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.start_time).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {userEvents.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  You don't have any swappable slots yet. Create some in your dashboard first.
                </div>
              )}

              <button
                onClick={handleRequestSwap}
                disabled={!selectedSlot || !selectedEvent}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                Send Swap Request
              </button>
            </div>
          </div>
        </div>
      </main>
  )
}
