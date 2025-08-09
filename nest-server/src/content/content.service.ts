import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { HttpService } from '@nestjs/axios'
import { PageContent, PageContentDocument } from './schemas/page-content.schema'
import { PromptLog, PromptLogDocument } from './schemas/prompt-log.schema'

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(PageContent.name) private readonly pageModel: Model<PageContentDocument>,
    @InjectModel(PromptLog.name) private readonly promptModel: Model<PromptLogDocument>,
    private readonly http: HttpService,
  ) {}

  private validatePrompt(prompt: string) {
    const p = prompt.trim().toLowerCase()
    const reasons: string[] = []
    if (p.length < 12) reasons.push('Prompt too short.')
    if (p.split(/\s+/).filter(Boolean).length < 3) reasons.push('Add more detail.')
    if (/^[\W_]+$/.test(p)) reasons.push('Prompt seems meaningless.')
    const keywords = [
      'landing',
      'homepage',
      'store',
      'shop',
      'blog',
      'portfolio',
      'restaurant',
      'bakery',
      'agency',
      'app',
      'dashboard',
      'event',
      'product',
      'course',
      'saas',
    ]
    const hasKeyword = keywords.some((k) => p.includes(k))
    if (!hasKeyword) reasons.push('Mention website type or industry.')
    if (reasons.length) throw new BadRequestException(reasons.join(' '))
  }

  private buildDummySections(prompt: string) {
    const baseTitle = prompt.replace(/\.$/, '')
    return [
      {
        key: 'hero',
        type: 'Hero',
        title: `${baseTitle}`,
        body: 'A compelling hero section with a clear call-to-action.',
        image: '',
      },
      {
        key: 'about',
        type: 'About',
        title: 'About',
        body: 'Share your story, mission, and values to build trust.',
      },
      {
        key: 'contact',
        type: 'Contact',
        title: 'Get in touch',
        body: 'Provide contact options so visitors can reach you easily.',
      },
    ]
  }

  private cleanJsonString(str: string): string {
    return str
      .trim()
      .replace(/^```json\s*/, '')   // Remove starting ```json
      .replace(/^```\s*/, '')        // Or starting ```
      .replace(/```$/, '')           // Remove ending ```
      .trim()
  }

  private parseSections(reply: string) {
    try {
      const cleaned = this.cleanJsonString(reply)
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // ignore parse errors
    }
    return null
  }

  async generateContent(prompt: string) {
    this.validatePrompt(prompt)

    let reply = ''
    let sections = this.buildDummySections(prompt)
    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
        const body = {
          contents: [
            {
              parts: [{ text: `
You are an assistant that outputs website sections in JSON format.
Each section is an object with keys: key, type, title, body.
Create three sections: hero, about, and contact.
The prompt is: ${prompt}

Respond ONLY with valid JSON array of sections.
` }],
            },
          ],
        }
        const result = await this.http.axiosRef.post(apiUrl, body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000,
        })

        reply = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        const parsed = this.parseSections(reply)
        if (parsed) sections = parsed
      } catch {
        // fallback to dummy sections if error or parse fails
      }
    }

    const page = await this.pageModel.create({ prompt, sections })
    await this.promptModel.create({ prompt, reply, pageId: page._id.toString() })

    return {
      success: true,
      pageId: page._id.toString(),
      message: `Page created. Visit /p/${page._id.toString()}`,
      reply,
      sections,
    }
  }

  async fetchContent(id: string) {
    try {
      const page = await this.pageModel.findById(id).lean()
      if (!page) return null
      return {
        id: page._id.toString(),
        prompt: page.prompt,
        sections: page.sections,
      }
    } catch {
      throw new InternalServerErrorException('Failed to fetch content.')
    }
  }
}
