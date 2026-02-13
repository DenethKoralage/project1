'use client'; // This is a client component

import React from 'react'
import RollingNumber from '@/components/RollingNumber'

var balance = 25000;

const metadata = {
  title: 'Dashboard',
  description: 'Welcome to your dashboard! Here you can manage your account, view your activity, and access exclusive content.',
}

export async function getCurrentAccountBalance(balance) {
  // Fetch the current account balance from the API
  // Update the balance state variable with the fetched balance
  return balance;
  
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-10 flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">{metadata.title}</h1>
      <p className="text-slate-500 mt-2">{metadata.description}</p>
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">Manage Account</button>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">View Activity</button>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">Exclusive Content</button>
      </div>
      <div className="mt-10 text-center">
        <h2 className="text-9xl font-bold mt-10"><RollingNumber target={balance} duration={2000} /></h2>
        <p className="text-slate-500 mt-2">Your current balance</p>
      </div>
      <div className="mt-10 w-full md:w-2/3 items-center">
        <h2 className="text-2xl font-bold mt-10 text-center">Yearly Summary</h2>
      </div>
      <div className="mt-10 w-full md:w-2/3 items-center">
        <h2 className="text-2xl font-bold mt-10 text-center">Upcoming Events</h2>
        <div>
          <div>
            <h3 className="text-xl font-semibold mt-4">Financial Planning Webinar</h3>
            <p className="text-slate-500">Join us for an exclusive webinar on financial planning strategies. Learn how to create a personalized financial plan that aligns with your goals and helps you achieve financial freedom.</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600 mb-2">Starting in:</p>
              <div className="flex gap-4 justify-center">
                <div className="bg-slate-100 rounded-lg p-3 min-w-[60px]">
                  <span className="text-2xl font-bold text-emerald-600" id="days">00</span>
                  <p className="text-xs text-slate-500">Days</p>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 min-w-[60px]">
                  <span className="text-2xl font-bold text-emerald-600" id="hours">00</span>
                  <p className="text-xs text-slate-500">Hours</p>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 min-w-[60px]">
                  <span className="text-2xl font-bold text-emerald-600" id="minutes">00</span>
                  <p className="text-xs text-slate-500">Minutes</p>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 min-w-[60px]">
                  <span className="text-2xl font-bold text-emerald-600" id="seconds">00</span>
                  <p className="text-xs text-slate-500">Seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
