// src/firebase.js - THIS IS CORRECT, DON'T CHANGE
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-eMH9MajkbH50-YfkG_v0xOxA4X0X1mQ",
  authDomain: "shorts-app-fb37f.firebaseapp.com",
  projectId: "shorts-app-fb37f",
  storageBucket: "shorts-app-fb37f.firebasestorage.app",
  messagingSenderId: "950042070581",
  appId: "1:950042070581:web:52b2e71838e880c4cbeb7c",
  measurementId: "G-ZMQFGL06JV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;