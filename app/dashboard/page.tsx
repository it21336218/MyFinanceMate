import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, PiggyBank, Wallet } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your finances.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/expenses">
            <Button>Add Expense</Button>
          </Link>
          <Link href="/dashboard/income">
            <Button variant="outline">Add Income</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,550.00</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">-4.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,800.00</div>
            <p className="text-xs text-muted-foreground">+10.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your recent expenses from the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Groceries", amount: 120.5, date: "Today" },
                { category: "Transportation", amount: 45.0, date: "Yesterday" },
                { category: "Entertainment", amount: 65.75, date: "3 days ago" },
              ].map((expense, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-medium">{expense.category}</div>
                    <div className="text-sm text-muted-foreground">{expense.date}</div>
                  </div>
                  <div className="font-medium text-red-500">-${expense.amount.toFixed(2)}</div>
                </div>
              ))}
              <Link href="/dashboard/expenses">
                <Button variant="ghost" className="w-full justify-between" size="sm">
                  View all expenses
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Income</CardTitle>
            <CardDescription>Your recent income from the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: "Salary", amount: 3500.0, date: "2 days ago" },
                { source: "Freelance", amount: 850.0, date: "1 week ago" },
                { source: "Investments", amount: 125.5, date: "2 weeks ago" },
              ].map((income, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-medium">{income.source}</div>
                    <div className="text-sm text-muted-foreground">{income.date}</div>
                  </div>
                  <div className="font-medium text-green-500">+${income.amount.toFixed(2)}</div>
                </div>
              ))}
              <Link href="/dashboard/income">
                <Button variant="ghost" className="w-full justify-between" size="sm">
                  View all income
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

