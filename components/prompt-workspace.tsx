"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, LinkIcon, TriangleAlert } from "lucide-react"
import Link from "next/link"
import PreviewPage from "./preview-page"
import type { PageContent } from "@/lib/types"
import { cn } from "@/lib/utils"

type Status = "idle" | "validating" | "loading" | "success" | "error"

const meaninglessSet = new Set(["hi", "hello", "hey", "test", "asdf", "qwerty", "123", "??", "help", "okay", "ok"])

function validatePrompt(prompt: string) {
  const p = prompt.trim().toLowerCase()
  const reasons: string[] = []

  if (p.length < 12) reasons.push("Please provide a longer description (at least 12 characters).")
  const wordCount = p.split(/\s+/).filter(Boolean).length
  if (wordCount < 3) reasons.push("Add more details (at least 3 words).")
  if (meaninglessSet.has(p) || /^[\W_]+$/.test(p)) reasons.push("Message seems meaningless. Please describe your idea.")
  const keywords = [
    "landing",
    "homepage",
    "store",
    "shop",
    "blog",
    "portfolio",
    "restaurant",
    "bakery",
    "agency",
    "app",
    "dashboard",
    "event",
    "product",
    "course",
    "saas",
  ]
  const hasKeyword = keywords.some((k) => p.includes(k))
  if (!hasKeyword) reasons.push("Include the website type or industry (e.g., landing, blog, bakery).")

  return { ok: reasons.length === 0, reasons }
}

export default function PromptWorkspace() {
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [pageId, setPageId] = useState<string | null>(null)
  const [page, setPage] = useState<PageContent | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const validation = useMemo(() => validatePrompt(prompt), [prompt])

  async function generate() {
    setError(null)
    setStatus("validating")

    if (!validation.ok) {
      setStatus("error")
      setError(validation.reasons.join(" "))
      return
    }

    setStatus("loading")
    try {
      const base = process.env.NEXT_PUBLIC_NEST_API_BASE

      if (!base) {
        // Mock response
        const id = crypto.randomUUID()
        const mockPage: PageContent = {
          id,
          prompt,
          sections: [
            { key: "hero", type: "Hero", title: prompt, body: "Hero section text", image: "/placeholder.svg" },
            { key: "about", type: "About", title: "About", body: "About section text" },
            { key: "contact", type: "Contact", title: "Contact", body: "Contact section text" },
          ],
        }
        setPageId(id)
        setPage(mockPage)
        setMessage(`Page created. Visit /p/${id}`)
        setStatus("success")
        return
      }

      // Generate content
      const res = await fetch(`${base}/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      console.log(data);
      
      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to generate content.")
      }

      setPageId(data.pageId)
      setMessage(data.message ?? "Page created successfully.")

      // Fetch generated page
      const cRes = await fetch(`${base}/fetch-content/${data.pageId}`, { cache: "no-store" })
      if (!cRes.ok) throw new Error("Failed to fetch generated content.")
      const content: PageContent = await cRes.json()
    console.log(content);
    
      setPage(content)

      setStatus("success")
    } catch (e: any) {
      setError(e?.message || "Unexpected error.")
      setStatus("error")
    }
  }

  useEffect(() => {
    if (status === "success") {
      setStatus("idle")
      setMessage(null)
      setPage(null)
      setPageId(null)
    }
  }, [prompt])

  const showTwoPane = status === "loading" || status === "success" || (!!page && !!pageId)

  return (
    <div className={cn("w-full", showTwoPane ? "grid grid-cols-1 md:grid-cols-5 gap-6" : "")}>
      {showTwoPane && (
        <div className="md:col-span-4 order-2 md:order-1">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {status === "loading" && (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
              {page && <PreviewPage page={page} dense />}
            </CardContent>
          </Card>
        </div>
      )}

      <div className={cn(showTwoPane ? "md:col-span-1 order-1 md:order-2" : "")}>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold tracking-tight">Your Prompt</h2>
              <Badge variant="outline">AI Builder</Badge>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Landing page for bakery with hero, about, and contact"
              className="min-h-[120px] resize-y"
            />
            {!validation.ok && prompt.trim().length > 0 && (
              <div className="mt-3">
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Improve your prompt</AlertTitle>
                  <AlertDescription>{validation.reasons.join(" ")}</AlertDescription>
                </Alert>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={generate} disabled={status === "loading"} className="w-full">
                {status === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  "Generate preview"
                )}
              </Button>
            </div>

            {status === "error" && error && (
              <div className="mt-3">
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Couldn't generate</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {status === "success" && pageId && (
              <div className="mt-4 p-3 rounded-md bg-emerald-50 text-emerald-900 text-sm">
                <div className="font-semibold">{message ?? "Your page is ready!"}</div>
                <div className="mt-1 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <Link href={`/p/${pageId}`} className="underline underline-offset-4">
                    View your page
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
