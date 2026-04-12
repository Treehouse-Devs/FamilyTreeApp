import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as firebaseAdmin from 'firebase-admin'

async function bootstrap() {
  if (firebaseAdmin.apps.length === 0) {
    console.log(`Initialize Firebase Application`)
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.FB_PROJECT_ID,
        privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FB_CLIENT_EMAIL,
      }),
    })
  }

  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
