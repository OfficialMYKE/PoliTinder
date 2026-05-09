// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChjI-KKohCJh-6xs9i7lMeptdzqHQ2MOg",
  authDomain: "politinder-9772a.firebaseapp.com",
  projectId: "politinder-9772a",
  storageBucket: "politinder-9772a.firebasestorage.app",
  messagingSenderId: "826290448866",
  appId: "1:826290448866:web:f78abd2da70f42e864b1bb",
  measurementId: "G-EY2S1XB6KD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);