export type Section = {
  key: string
  type: string // e.g., "Hero" | "About" | "Contact"
  title?: string
  body?: string
  image?: string
}

export type PageContent = {
  id: string
  prompt: string
  sections: Section[]
}

export type GenerateResponse = {
  success: boolean
  pageId?: string
  message?: string
}
