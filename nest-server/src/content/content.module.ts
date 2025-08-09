import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HttpModule } from '@nestjs/axios'
import { ContentController } from './content.controller'
import { ContentService } from './content.service'
import { PageContent, PageContentSchema } from './schemas/page-content.schema'
import { PromptLog, PromptLogSchema } from './schemas/prompt-log.schema'

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: PageContent.name, schema: PageContentSchema },
      { name: PromptLog.name, schema: PromptLogSchema },
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
