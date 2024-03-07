// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBza-k81kga32NjBqRGS-8Iy6uHyuSUdtk",
  authDomain: "cows-and-bulls-90f26.firebaseapp.com",
  projectId: "cows-and-bulls-90f26",
  storageBucket: "cows-and-bulls-90f26.appspot.com",
  messagingSenderId: "1052701179691",
  appId: "1:1052701179691:web:2fa21e6b833070c18e0f6e",
  measurementId: "G-WEKZ6QYGLL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, analytics, db };
