import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`NestJS server running on http://localhost:${port}`)
}

bootstrap()
