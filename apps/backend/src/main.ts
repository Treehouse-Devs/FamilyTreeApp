import { NestFactory } from '@nestjs/core'
import * as dotenv from 'dotenv'
import { validateEnvironment } from './config/env.validation'

async function bootstrap() {
  dotenv.config()
  validateEnvironment(process.env)
  const { AppModule } = await import('./app.module')

  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
