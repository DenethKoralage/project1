"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { setAuth } from "@/lib/auth"

const initialForm = {
  fullName: "",
  designation: "",
  email: "",
  password: "",
  confirmPassword: "",
  avgIncome: ""
}

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        fullName: form.fullName,
        designation: form.designation,
        email: form.email,
        password: form.password,
        avgIncome: Number(form.avgIncome || 0)
      }

      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: payload
      })

      setAuth(response.token, response.user)
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-xl rounded-xl border border-white/10 bg-black/20 p-6 shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="mb-1 text-2xl font-bold text-emerald-800">Create an account</h2>
        <p className="mb-5 text-sm text-gray-500">Join us to manage your finances better.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">Full name</label>
          <input id="fullName" name="fullName" type="text" required value={form.fullName} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div className="mb-3">
          <label htmlFor="designation" className="mb-1 block text-sm font-medium">Designation</label>
          <input id="designation" name="designation" type="text" value={form.designation} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div className="mb-3">
          <label htmlFor="avgIncome" className="mb-1 block text-sm font-medium">Average Monthly income</label>
          <input id="avgIncome" name="avgIncome" type="number" min="0" value={form.avgIncome} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">{isSubmitting ? "Registering..." : "Register"}</button>
        <button type="button" onClick={() => router.push("/dashboard/login")} className="ml-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700">Login</button>
      </form>
    </div>
  )
}
