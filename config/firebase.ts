import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from your screenshot
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "measure-ai-97e94.firebaseapp.com",
  projectId: "measure-ai-97e94",
  storageBucket: "measure-ai-97e94.firebasestorage.app",
  messagingSenderId: "786388966844",
  appId: "1:786388966844:web:97e9494overview?lb-guhl=GYKCAjntfHRBt6AhG1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
