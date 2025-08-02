// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { 
  getAuth, 
  connectAuthEmulator 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
  getFirestore, 
  connectFirestoreEmulator 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { 
  getFunctions, 
  connectFunctionsEmulator 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-functions.js";
import { 
  getStorage, 
  connectStorageEmulator 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUmGhmZkktNU-_QwFtERl-T6oRf-_sAgQ",
  authDomain: "dreamanalysis-39322.firebaseapp.com",
  projectId: "dreamanalysis-39322",
  storageBucket: "dreamanalysis-39322.firebasestorage.app",
  messagingSenderId: "222523234712",
  appId: "1:222523234712:web:b508d345729d98ad4133ed",
  measurementId: "G-0RKJVBCC8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Only initialize Analytics in production
let analytics = null;
if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Track if emulators are already connected
let emulatorsConnected = false;

// Connect to Firebase emulators when running locally
if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') && !emulatorsConnected) {
  console.log('🔧 Connecting to Firebase Emulators...');
  
  try {
    // Connect Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ Auth Emulator connected');
    
    // Connect Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore Emulator connected');
    
    // Connect Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Functions Emulator connected');
    
    // Connect Storage emulator (uncomment if using storage)
    // connectStorageEmulator(storage, 'localhost', 9199);
    // console.log('✅ Storage Emulator connected');
    
    emulatorsConnected = true;
    console.log('✅ All Firebase Emulators connected successfully');
  } catch (error) {
    // Emulators might already be connected if hot-reloading
    if (error.message && error.message.includes('already been called')) {
      console.log('ℹ️ Emulators already connected');
      emulatorsConnected = true;
    } else {
      console.error('❌ Error connecting to emulators:', error);
    }
  }
}

// Export services for use in other modules
export { 
  app, 
  analytics, 
  auth, 
  db, 
  functions, 
  storage,
  emulatorsConnected 
};
