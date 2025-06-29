import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as firebaseAdmin from "firebase-admin";
import * as fs from "fs";

async function bootstrap() {
  const firebaseKeyPath = "firebase.json";
  const firebaseServiceAccount = JSON.parse(
    fs.readFileSync(firebaseKeyPath).toString(),
  );

  if (firebaseAdmin.apps.length === 0) {
    console.log(`Initialize Firebase Application`);
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
    });
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
