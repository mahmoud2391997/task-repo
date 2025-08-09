import { Controller, Get, Param, Post, Body } from "@nestjs/common"
import { ContentService } from "./content.service"
import { GenerateDto } from "./dto/generate.dto"

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post("generate-content")
  async generate(@Body() dto: GenerateDto) {
    const { prompt } = dto
    return this.contentService.generateContent(prompt)
  }

  @Get('fetch-content/:id')
  async fetch(@Param('id') id: string) {
    const page = await this.contentService.fetchContent(id)
    if (!page) return { message: 'Not found' }
    return page
  }
}
