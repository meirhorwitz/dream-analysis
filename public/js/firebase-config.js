import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-functions.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

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

// Connect to Firebase emulators when running locally
if (location.hostname === 'localhost') {
  const { connectAuthEmulator } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js');
  const { connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
  const { connectFunctionsEmulator } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-functions.js');

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, analytics, auth, db, functions, storage };
