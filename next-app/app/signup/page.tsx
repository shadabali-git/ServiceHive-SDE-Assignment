"use client"
import AuthForm from "@/components/auth-form"
import Link from "next/link"

export default function SignupPage() {
  return (
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-600">Join SlotSwapper today</p>
          </div>

          <AuthForm isSignup={true} />

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </main>
  )
}
