import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

class AuthManager {
  constructor() {
    this.user = null;
    this.authReady = false;
    this.authStatePromise = new Promise((resolve) => {
      this.resolveAuthState = resolve;
    });
    this.initAuthListener();
  }

  initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      if (!this.authReady) {
        this.authReady = true;
        this.resolveAuthState(user);
      }
      this.handleAuthStateChange(user);
    });
  }

  async signUp(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await this.createUserProfile(userCredential.user, { name });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await this.createUserProfile(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async createUserProfile(user, additionalData = {}) {
    const { db } = await import('./firebase-config.js');
    const { doc, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        profile: {
          email: user.email,
          name: additionalData.name || user.displayName || '',
          createdAt: new Date(),
          subscription: {
            status: 'free',
            dreamsAnalyzed: 0
          }
        }
      });
    }
  }

  handleAuthStateChange(user) {
    if (!this.authReady) return;

    const intendedUrl = sessionStorage.getItem('intendedUrl');
    if (user) {
      if (intendedUrl) {
        sessionStorage.removeItem('intendedUrl');
        window.location.href = intendedUrl;
      } else if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/app.html';
      }
    } else {
      if (window.location.pathname.startsWith('/app') || window.location.pathname.startsWith('/pricing')) {
        window.location.href = '/';
      }
    }
  }

  async requireAuth() {
    await this.authStatePromise;
    if (!this.user) {
      sessionStorage.setItem('intendedUrl', window.location.href);
      window.location.href = '/';
      // Throw an error to stop execution of scripts on the page
      throw new Error('Redirecting to login');
    }
    return true;
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export default new AuthManager();
