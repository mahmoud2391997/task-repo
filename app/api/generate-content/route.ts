import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { savePage } from "@/lib/mock-db"
import type { PageContent, GenerateResponse, Section } from "@/lib/types"

// Server-side validation similar to client, to handle meaningless/insufficient prompts robustly
function validatePromptSrv(prompt: string) {
  const p = prompt.trim().toLowerCase()
  const reasons: string[] = []
  if (p.length < 12) reasons.push("Prompt too short.")
  if (p.split(/\s+/).filter(Boolean).length < 3) reasons.push("Add more detail.")
  if (/^[\W_]+$/.test(p)) reasons.push("Prompt seems meaningless.")
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
  if (!hasKeyword) reasons.push("Mention website type or industry.")
  return { ok: reasons.length === 0, reasons }
}

function makeDummySections(prompt: string): Section[] {
  const baseTitle = prompt.replace(/\.$/, "")
  return [
    {
      key: "hero",
      type: "Hero",
      title: `${baseTitle}`,
      body: "A compelling hero section with a clear call-to-action.",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      key: "about",
      type: "About",
      title: "About",
      body: "Share your story, mission, and values to build trust.",
    },
    {
      key: "contact",
      type: "Contact",
      title: "Get in touch",
      body: "Provide contact options so visitors can reach you easily.",
    },
  ]
}

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string }
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json<GenerateResponse>({ success: false, message: "Missing prompt." }, { status: 400 })
    }

    // If NEXT_PUBLIC_NEST_API_BASE is set, proxy to NestJS
    const base = process.env.NEXT_PUBLIC_NEST_API_BASE
    if (base) {
      const res = await fetch(new URL("/generate-content", base).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = (await res.json()) as GenerateResponse
      
      return NextResponse.json<GenerateResponse>(data, { status: res.status })
    }

    // Otherwise, mock for preview in this environment
    const v = validatePromptSrv(prompt)
    if (!v.ok) {
      return NextResponse.json<GenerateResponse>({ success: false, message: v.reasons.join(" ") }, { status: 400 })
    }

    const id = randomUUID()
    const page: PageContent = {
      id,
      prompt,
      sections: makeDummySections(prompt),
    }
    savePage(page)

    return NextResponse.json<GenerateResponse>({
      success: true,
      pageId: id,
      message: `Page created. Visit /p/${id}`,
    })
  } catch (e: any) {
    console.log(e);
    
    return NextResponse.json<GenerateResponse>({ success: false, message: "Internal error." }, { status: 500 })
  }
}
