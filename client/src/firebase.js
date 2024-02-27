// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vibe-v1.firebaseapp.com",
  projectId: "vibe-v1",
  storageBucket: "vibe-v1.appspot.com",
  messagingSenderId: "36807796298",
  appId: "1:36807796298:web:f64681f161114a042e68b3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);