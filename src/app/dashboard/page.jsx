import React from 'react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-500 mt-2">Welcome to your dashboard! Here you can manage your account, view your activity, and access exclusive content.</p>
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">Manage Account</button>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">View Activity</button>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">Exclusive Content</button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mt-10">Recent Activity</h2>
        <ul className="mt-4 space-y-2">
          <li className="bg-white p-4 rounded-md shadow ">Logged in from a new device</li>
          <li className="bg-white p-4 rounded-md shadow">Updated profile information</li>
          <li className="bg-white p-4 rounded-md shadow">Accessed exclusive content</li>
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold mt-10">Upcoming Events</h2>
        <ul className="mt-4 space-y-2">
          <li className="bg-white p-4 rounded-md shadow ">Event 1</li>
          <li className="bg-white p-4 rounded-md shadow">Event 2</li>
          <li className="bg-white p-4 rounded-md shadow">Event 3</li>
        </ul>
      </div>
    </div>
  )
}
