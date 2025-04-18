// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbY9CjEBHUVA8Cw_DU02PvoRmaHV1GX4A",
  authDomain: "exensetracker-fd111.firebaseapp.com",
  projectId: "exensetracker-fd111",
  storageBucket: "exensetracker-fd111.firebasestorage.app",
  messagingSenderId: "519121220064",
  appId: "1:519121220064:web:8fc1794232bdd9a8a4bb85",
  measurementId: "G-5S098JDSTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize and export auth
export const auth = getAuth(app);

// ✅ Initialize and export Firestore DB
export const db = getFirestore(app);
