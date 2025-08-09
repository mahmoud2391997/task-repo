import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { HydratedDocument } from "mongoose"
import { Types } from "mongoose"

export type PromptLogDocument = HydratedDocument<PromptLog>

@Schema({ collection: "prompts", timestamps: true })
export class PromptLog {
  @Prop({ required: true })
  prompt!: string

  @Prop()
  reply?: string

  @Prop({ type: Types.ObjectId, ref: "PageContent" })
  pageId?: string
}

export const PromptLogSchema = SchemaFactory.createForClass(PromptLog)
