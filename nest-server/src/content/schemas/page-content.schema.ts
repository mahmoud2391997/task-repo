import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { HydratedDocument } from "mongoose"

export type PageContentDocument = HydratedDocument<PageContent>

@Schema({ collection: "pages-content", timestamps: true })
export class PageContent {
  @Prop({ required: true })
  prompt!: string

  @Prop({ required: true })
  sections!: Array<{
    key: string
    type: string
    title?: string
    body?: string
    image?: string
  }>
}

export const PageContentSchema = SchemaFactory.createForClass(PageContent)
