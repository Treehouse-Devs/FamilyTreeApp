import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import * as dotenv from "dotenv";

dotenv.config();

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
const analytics = getAnalytics(app);
