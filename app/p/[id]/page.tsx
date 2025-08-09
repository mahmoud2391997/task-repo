import { notFound } from "next/navigation"
import PreviewPage from "@/components/preview-page"
import type { PageContent } from "@/lib/types"

// Direct server-side fetch
async function getPage(id: string): Promise<PageContent | null> {
  try {
    const base = process.env.NEXT_PUBLIC_NEXT_PUBLIC_NEST_API_BASE

    if (!base) {
      // Mock page for preview if no backend
      return {
        id,
        prompt: "Mock prompt",
        sections: [
          { key: "hero", type: "Hero", title: "Mock Hero", body: "Hero section text", image: "/placeholder.svg" },
          { key: "about", type: "About", title: "About", body: "About section text" },
          { key: "contact", type: "Contact", title: "Contact", body: "Contact section text" },
        ],
      }
    }

    // Directly request from NestJS backend
    const res = await fetch(`${base}/fetch-content/${encodeURIComponent(id)}`, {
      cache: "no-store",
    })

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await getPage(id)
  if (!page) return notFound()

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="font-semibold tracking-tight">Generated Page</h1>
          <p className="text-sm text-muted-foreground">Page ID: {id}</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <PreviewPage page={page} dense={false} />
      </section>
    </main>
  )
}
