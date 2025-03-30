"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, LogOut, Menu, Mic, PieChart, Plus, Wallet, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      name: "Expenses",
      path: "/dashboard/expenses",
      icon: Wallet,
    },
    {
      name: "Income",
      path: "/dashboard/income",
      icon: Plus,
    },
    {
      name: "Budget",
      path: "/dashboard/budget",
      icon: PieChart,
    },
    {
      name: "Speech Test",
      path: "/dashboard/speech-test",
      icon: Mic,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold">
              FinanceVoice
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {routes.map((route) => {
              const isActive = pathname === route.path
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <route.icon className="mr-3 h-5 w-5" />
                  {route.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                // Handle logout
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

