import authManager from './auth.js';
import DreamChat from './chat.js';
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

function init(user) {
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userName').textContent = user.displayName || '';
  new DreamChat(user.uid);
  document.getElementById('logoutBtn')?.addEventListener('click', () => authManager.logout());
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    init(user);
  }
});
