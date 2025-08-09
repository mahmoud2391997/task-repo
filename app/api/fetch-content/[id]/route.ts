import { NextResponse } from "next/server"
import { getPage } from "@/lib/mock-db"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const base = process.env.NEXT_PUBLIC_NEST_API_BASE
  if (base) {
    const res = await fetch(new URL(`/fetch-content/${encodeURIComponent(id)}`, base).toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    const data = await res.json().catch(() => null)
    return NextResponse.json(data, { status: res.status })
  }

  const page = getPage(id)
  if (!page) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(page)
}
