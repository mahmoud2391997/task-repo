import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import PromptWorkspace from "@/components/prompt-workspace"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            <span className="font-semibold tracking-tight">PromptSite</span>
          </div>
      
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Make your website by prompt</h1>
          <p className="text-muted-foreground mt-2">
            Describe your idea (e.g., {"'"}Landing page for bakery{"'"}). We{"'"}ll generate a preview instantly.
          </p>
        </div>

        <PromptWorkspace />
      </section>
    </main>
  )
}
