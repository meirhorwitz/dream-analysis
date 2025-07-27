import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBUmGhmZkktNU-_QwFtERl-T6oRf-_sAgQ",
  authDomain: "dreamanalysis-39322.firebaseapp.com",
  projectId: "dreamanalysis-39322",
  storageBucket: "dreamanalysis-39322.firebasestorage.app",
  messagingSenderId: "222523234712",
  appId: "1:222523234712:web:b508d345729d98ad4133ed",
  measurementId: "G-0RKJVBCC8K"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { app, analytics, auth, db, functions, storage };
