"use client"

import Navbar from "@/components/navbar"
import AuthForm from "@/components/auth-form"
import Link from "next/link"

export default function LoginPage() {
  return (
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          <AuthForm isSignup={false} />

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </main>
  )
}
