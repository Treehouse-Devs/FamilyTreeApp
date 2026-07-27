import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import * as dotenv from 'dotenv'
import { validateEnvironment } from './config/env.validation'
import { FailureCaptureMiddleware } from './log-monitor/failure-capture.middleware'

async function bootstrap() {
  dotenv.config()
  validateEnvironment(process.env)
  const { AppModule } = await import('./app.module')

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })
  const failureCapture = app.get(FailureCaptureMiddleware)
  app.use(failureCapture.use.bind(failureCapture))
  app.useBodyParser('json')
  app.useBodyParser('urlencoded', { extended: true })
  app.enableShutdownHooks()
  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
