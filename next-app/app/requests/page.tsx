"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { useAuthStore } from "@/lib/store"
import apiClient from "@/lib/api"

interface SwapRequest {
  id: string
  requester_id: string
  requester_name: string
  requester_email: string
  my_slot_title: string
  my_slot_start: string
  my_slot_end: string
  their_slot_title: string
  their_slot_start: string
  their_slot_end: string
  status: string
}

interface OutgoingRequest {
  id: string
  target_user_name: string
  target_user_email: string
  my_slot_title: string
  my_slot_start: string
  my_slot_end: string
  their_slot_title: string
  their_slot_start: string
  their_slot_end: string
  status: string
}

export default function RequestsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [incoming, setIncoming] = useState<SwapRequest[]>([])
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchRequests()
  }, [user, router])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const [incomingRes, outgoingRes] = await Promise.all([
        apiClient.get("/swap/incoming"),
        apiClient.get("/swap/outgoing"),
      ])
      setIncoming(incomingRes.data)
      setOutgoing(outgoingRes.data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch requests")
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      setError("")
      setSuccess("")
      await apiClient.post(`/swap/response/${requestId}`, { accept })
      setSuccess(accept ? "Swap accepted!" : "Swap rejected")
      setTimeout(() => {
        fetchRequests()
        setSuccess("")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to respond to request")
    }
  }

  if (loading) {
    return (
      
        <main className="min-h-screen pt-20">
          <div className="text-center">Loading requests...</div>
        </main>
      
    )
  }

  return (
  
      <main className="flex-1 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Swap Requests</h1>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Incoming Requests */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Incoming Requests</h2>
              {incoming.length === 0 ? (
                <p className="text-gray-600">No incoming swap requests</p>
              ) : (
                <div className="space-y-4">
                  {incoming.map((request) => (
                    <div key={request.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{request.requester_name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{request.requester_email}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-red-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">They offer:</p>
                            <p className="font-semibold text-sm">{request.their_slot_title}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(request.their_slot_start).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">You offer:</p>
                            <p className="font-semibold text-sm">{request.my_slot_title}</p>
                            <p className="text-xs text-gray-600">{new Date(request.my_slot_start).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResponse(request.id, true)}
                          className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleResponse(request.id, false)}
                          className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Outgoing Requests</h2>
              {outgoing.length === 0 ? (
                <p className="text-gray-600">No outgoing swap requests</p>
              ) : (
                <div className="space-y-4">
                  {outgoing.map((request) => (
                    <div key={request.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{request.target_user_name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{request.target_user_email}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">You offered:</p>
                            <p className="font-semibold text-sm">{request.my_slot_title}</p>
                            <p className="text-xs text-gray-600">{new Date(request.my_slot_start).toLocaleString()}</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Requested:</p>
                            <p className="font-semibold text-sm">{request.their_slot_title}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(request.their_slot_start).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              request.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status === "PENDING" ? "⏳ Pending..." : request.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  )
}
