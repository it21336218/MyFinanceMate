"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Mic, DollarSign, PieChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-background to-secondary/20">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center space-y-10 text-center">
              <div className="space-y-6 max-w-3xl mx-auto">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                  Manage Your Finances with Voice
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mx-auto">
                  Track expenses, manage income, and set budgets using voice
                  commands. Get alerts when you're approaching your budget
                  limits.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="text-lg h-14 px-8 w-full sm:w-auto"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard/speech-test">
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section at Bottom */}
        <section className="py-16 bg-secondary/5">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
              <div className="bg-background rounded-xl p-8 border shadow-sm flex flex-col items-center text-center h-full">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Expense Tracking</h3>
                <p className="text-muted-foreground flex-grow">
                  Add expenses via speech, edit or delete them with ease.
                  Natural language processing makes it simple.
                </p>
              </div>

              <div className="bg-background rounded-xl p-8 border shadow-sm flex flex-col items-center text-center h-full">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Income Management</h3>
                <p className="text-muted-foreground flex-grow">
                  Track your income sources with voice input, manage and
                  categorize them effortlessly.
                </p>
              </div>

              <div className="bg-background rounded-xl p-8 border shadow-sm flex flex-col items-center text-center h-full">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <PieChart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Budget Alerts</h3>
                <p className="text-muted-foreground flex-grow">
                  Set budget limits and receive voice alerts when you're
                  approaching them. Stay on top of your spending.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 FinanceVoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
