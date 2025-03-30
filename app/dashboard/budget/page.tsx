"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Edit, Plus, Trash2, VolumeX, Volume2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

type Budget = {
  id: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  alertThreshold: number
  alertEnabled: boolean
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Groceries",
      amount: 500,
      spent: 320,
      period: "monthly",
      alertThreshold: 80,
      alertEnabled: true,
    },
    {
      id: "2",
      category: "Entertainment",
      amount: 200,
      spent: 175,
      period: "monthly",
      alertThreshold: 90,
      alertEnabled: true,
    },
    {
      id: "3",
      category: "Transportation",
      amount: 150,
      spent: 85,
      period: "monthly",
      alertThreshold: 75,
      alertEnabled: false,
    },
  ])

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly" as const,
    alertThreshold: "80",
    alertEnabled: true,
  })
  const [audioEnabled, setAudioEnabled] = useState(true)

  const { toast } = useToast()

  // Check for budget alerts on component mount
  useEffect(() => {
    checkBudgetAlerts()
  }, [])

  const checkBudgetAlerts = () => {
    if (!audioEnabled) return

    budgets.forEach((budget) => {
      if (!budget.alertEnabled) return

      const percentUsed = (budget.spent / budget.amount) * 100
      if (percentUsed >= budget.alertThreshold) {
        // Play alert sound
        const utterance = new SpeechSynthesisUtterance(
          `Alert: You've used ${Math.round(percentUsed)}% of your ${budget.category} budget.`,
        )
        window.speechSynthesis.speak(utterance)

        // Show toast
        toast({
          title: `${budget.category} Budget Alert`,
          description: `You've used ${Math.round(percentUsed)}% of your budget.`,
          variant: "destructive",
        })
      }
    })
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)

    if (!audioEnabled) {
      // Test the audio when enabling
      const utterance = new SpeechSynthesisUtterance("Voice alerts are now enabled.")
      window.speechSynthesis.speak(utterance)
    } else {
      // Confirm audio is disabled
      toast({
        title: "Voice Alerts Disabled",
        description: "You will no longer receive voice alerts for budget limits.",
      })
    }
  }

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Missing Information",
        description: "Please provide a category and amount.",
        variant: "destructive",
      })
      return
    }

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: Number.parseFloat(newBudget.amount),
      spent: 0,
      period: newBudget.period,
      alertThreshold: Number.parseInt(newBudget.alertThreshold),
      alertEnabled: newBudget.alertEnabled,
    }

    setBudgets([...budgets, budget])
    setNewBudget({
      category: "",
      amount: "",
      period: "monthly",
      alertThreshold: "80",
      alertEnabled: true,
    })
    setIsDialogOpen(false)

    toast({
      title: "Budget Added",
      description: `Added ${budget.category} budget of $${budget.amount.toFixed(2)}`,
    })
  }

  const handleEditBudget = () => {
    if (!editingBudget) return

    const updatedBudgets = budgets.map((budget) => (budget.id === editingBudget.id ? editingBudget : budget))

    setBudgets(updatedBudgets)
    setEditingBudget(null)
    setIsDialogOpen(false)

    toast({
      title: "Budget Updated",
      description: `Updated ${editingBudget.category} budget`,
    })
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter((budget) => budget.id !== id))

    toast({
      title: "Budget Deleted",
      description: "The budget has been deleted.",
    })
  }

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget)
    setIsDialogOpen(true)
  }

  const categories = [
    "Groceries",
    "Transportation",
    "Entertainment",
    "Dining",
    "Utilities",
    "Shopping",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
  ]

  const periods = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ]

  const getProgressColor = (spent: number, total: number) => {
    const percentage = (spent / total) * 100
    if (percentage < 50) return "bg-green-500"
    if (percentage < 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground">Set and manage your budget limits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={toggleAudio} variant="outline" className="gap-2">
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {audioEnabled ? "Voice Alerts On" : "Voice Alerts Off"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
                <DialogDescription>
                  {editingBudget ? "Edit the budget details below." : "Fill in the details to add a new budget."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={editingBudget ? editingBudget.category : newBudget.category}
                    onValueChange={(value) =>
                      editingBudget
                        ? setEditingBudget({ ...editingBudget, category: value })
                        : setNewBudget({ ...newBudget, category: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="col-span-3"
                    value={editingBudget ? editingBudget.amount : newBudget.amount}
                    onChange={(e) =>
                      editingBudget
                        ? setEditingBudget({ ...editingBudget, amount: Number.parseFloat(e.target.value) })
                        : setNewBudget({ ...newBudget, amount: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Select
                    value={editingBudget ? editingBudget.period : newBudget.period}
                    onValueChange={(value: "weekly" | "monthly" | "yearly") =>
                      editingBudget
                        ? setEditingBudget({ ...editingBudget, period: value })
                        : setNewBudget({ ...newBudget, period: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alertThreshold" className="text-right">
                    Alert at %
                  </Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    min="1"
                    max="100"
                    className="col-span-3"
                    value={editingBudget ? editingBudget.alertThreshold : newBudget.alertThreshold}
                    onChange={(e) =>
                      editingBudget
                        ? setEditingBudget({ ...editingBudget, alertThreshold: Number.parseInt(e.target.value) })
                        : setNewBudget({ ...newBudget, alertThreshold: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alertEnabled" className="text-right">
                    Enable Alerts
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="alertEnabled"
                      checked={editingBudget ? editingBudget.alertEnabled : newBudget.alertEnabled}
                      onCheckedChange={(checked) =>
                        editingBudget
                          ? setEditingBudget({ ...editingBudget, alertEnabled: checked })
                          : setNewBudget({ ...newBudget, alertEnabled: checked })
                      }
                    />
                    <Label htmlFor="alertEnabled">
                      {editingBudget
                        ? editingBudget.alertEnabled
                          ? "Alerts enabled"
                          : "Alerts disabled"
                        : newBudget.alertEnabled
                          ? "Alerts enabled"
                          : "Alerts disabled"}
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingBudget ? handleEditBudget : handleAddBudget}>
                  {editingBudget ? "Save Changes" : "Add Budget"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentUsed = (budget.spent / budget.amount) * 100
          const isOverBudget = percentUsed > 100
          const isNearLimit = percentUsed >= budget.alertThreshold && !isOverBudget

          return (
            <Card
              key={budget.id}
              className={`${isOverBudget ? "border-red-500" : isNearLimit ? "border-yellow-500" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{budget.category}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(budget)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                  </span>
                  <span
                    className={`text-sm font-medium ${isOverBudget ? "text-red-500" : isNearLimit ? "text-yellow-500" : "text-green-500"}`}
                  >
                    {Math.min(Math.round(percentUsed), 100)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(percentUsed, 100)}
                  className={`h-2 ${getProgressColor(budget.spent, budget.amount)}`}
                />
                {budget.alertEnabled && (
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Volume2 className="mr-1 h-3 w-3" />
                    Alert at {budget.alertThreshold}%
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  {isOverBudget
                    ? `Over budget by $${(budget.spent - budget.amount).toFixed(2)}`
                    : `$${(budget.amount - budget.spent).toFixed(2)} remaining`}
                </div>
              </CardFooter>
            </Card>
          )
        })}

        {budgets.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-center text-muted-foreground">You haven't set up any budgets yet.</p>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Budget
                </Button>
              </DialogTrigger>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

