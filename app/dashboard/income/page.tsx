"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Edit, Mic, MicOff, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Income = {
  id: string
  amount: number
  source: string
  description: string
  date: string
}

// Declare SpeechRecognition
declare var SpeechRecognition: any
declare var webkitSpeechRecognition: any

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      amount: 3500.0,
      source: "Salary",
      description: "Monthly salary",
      date: "2024-03-23",
    },
    {
      id: "2",
      amount: 850.0,
      source: "Freelance",
      description: "Website development",
      date: "2024-03-18",
    },
    {
      id: "3",
      amount: 125.5,
      source: "Investments",
      description: "Dividend payment",
      date: "2024-03-10",
    },
  ])

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newIncome, setNewIncome] = useState({
    amount: "",
    source: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const { toast } = useToast()

  // Speech recognition setup
  useEffect(() => {
    let recognition: any = null

    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        setTranscript(transcript)

        // Try to parse income from speech
        parseIncomeFromSpeech(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    setTranscript("")
    setIsListening(true)

    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.start()

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        setTranscript(transcript)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      setIsListening(false)
    }
  }

  const stopListening = () => {
    setIsListening(false)
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.stop()
    }
  }

  const parseIncomeFromSpeech = (text: string) => {
    // Simple parsing logic - can be enhanced with more sophisticated NLP
    const amountRegex = /\$?(\d+(\.\d{1,2})?)/
    const sourceKeywords: Record<string, string[]> = {
      Salary: ["salary", "paycheck", "wage", "monthly pay"],
      Freelance: ["freelance", "contract", "gig", "project"],
      Investments: ["investment", "dividend", "interest", "stock", "bond"],
      Rental: ["rent", "rental", "property"],
      Business: ["business", "profit", "sale", "revenue"],
      Gift: ["gift", "present", "donation"],
    }

    // Extract amount
    const amountMatch = text.match(amountRegex)
    if (amountMatch) {
      const amount = amountMatch[1]

      // Try to determine source
      let source = "Other"
      for (const [src, keywords] of Object.entries(sourceKeywords)) {
        if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
          source = src
          break
        }
      }

      // Set the form values
      setNewIncome({
        ...newIncome,
        amount,
        source,
        description: text.replace(amountRegex, "").trim(),
      })

      // Open the dialog with pre-filled values
      setIsDialogOpen(true)
    }
  }

  const handleAddIncome = () => {
    if (!newIncome.amount || !newIncome.source) {
      toast({
        title: "Missing Information",
        description: "Please provide an amount and source.",
        variant: "destructive",
      })
      return
    }

    const income: Income = {
      id: Date.now().toString(),
      amount: Number.parseFloat(newIncome.amount),
      source: newIncome.source,
      description: newIncome.description,
      date: newIncome.date,
    }

    setIncomes([income, ...incomes])
    setNewIncome({
      amount: "",
      source: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(false)

    toast({
      title: "Income Added",
      description: `Added ${income.source} income of $${income.amount.toFixed(2)}`,
    })
  }

  const handleEditIncome = () => {
    if (!editingIncome) return

    const updatedIncomes = incomes.map((income) => (income.id === editingIncome.id ? editingIncome : income))

    setIncomes(updatedIncomes)
    setEditingIncome(null)
    setIsDialogOpen(false)

    toast({
      title: "Income Updated",
      description: `Updated ${editingIncome.source} income`,
    })
  }

  const handleDeleteIncome = (id: string) => {
    setIncomes(incomes.filter((income) => income.id !== id))

    toast({
      title: "Income Deleted",
      description: "The income entry has been deleted.",
    })
  }

  const openEditDialog = (income: Income) => {
    setEditingIncome(income)
    setIsDialogOpen(true)
  }

  const sources = ["Salary", "Freelance", "Investments", "Rental", "Business", "Gift", "Other"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">Manage your income sources and track your earnings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={toggleListening} variant={isListening ? "destructive" : "default"}>
            {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isListening ? "Stop Recording" : "Add via Speech"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIncome ? "Edit Income" : "Add New Income"}</DialogTitle>
                <DialogDescription>
                  {editingIncome ? "Edit the income details below." : "Fill in the details to add a new income entry."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                    value={editingIncome ? editingIncome.amount : newIncome.amount}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({ ...editingIncome, amount: Number.parseFloat(e.target.value) })
                        : setNewIncome({ ...newIncome, amount: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">
                    Source
                  </Label>
                  <Select
                    value={editingIncome ? editingIncome.source : newIncome.source}
                    onValueChange={(value) =>
                      editingIncome
                        ? setEditingIncome({ ...editingIncome, source: value })
                        : setNewIncome({ ...newIncome, source: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Description"
                    className="col-span-3"
                    value={editingIncome ? editingIncome.description : newIncome.description}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({ ...editingIncome, description: e.target.value })
                        : setNewIncome({ ...newIncome, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={editingIncome ? editingIncome.date : newIncome.date}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({ ...editingIncome, date: e.target.value })
                        : setNewIncome({ ...newIncome, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingIncome ? handleEditIncome : handleAddIncome}>
                  {editingIncome ? "Save Changes" : "Add Income"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isListening && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <p className="font-medium">Listening...</p>
            </div>
            <p className="mt-2 text-muted-foreground">
              {transcript || "Say something like 'Received $850 from freelance project'"}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>You have {incomes.length} recorded income entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No income recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                    <TableCell>{income.source}</TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell className="text-right font-medium text-green-500">${income.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(income)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

