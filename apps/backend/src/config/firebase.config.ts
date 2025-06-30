import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const firebaseServiceAccountPath = path.join(__dirname, '../firebase.json');
const firebaseServiceAccount = JSON.parse(fs.readFileSync(firebaseServiceAccountPath, 'utf8'));

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASURMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseServiceAccount.project_id,
      clientEmail: firebaseServiceAccount.client_email,
      privateKey: firebaseServiceAccount.private_key,
    }),
  });
}

export { app, auth, admin };
