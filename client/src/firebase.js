// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-restate.firebaseapp.com",
  projectId: "mern-restate",
  storageBucket: "mern-restate.appspot.com",
  messagingSenderId: "678656264425",
  appId: "1:678656264425:web:d917cb288dde3770348878",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
