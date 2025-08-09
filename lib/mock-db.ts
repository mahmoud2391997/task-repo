import type { PageContent } from "./types"

const map = new Map<string, PageContent>()

export function savePage(page: PageContent) {
  map.set(page.id, page)
  return page
}

export function getPage(id: string) {
  return map.get(id) || null
}
