import authManager from './auth.js';
import DreamChat from './chat.js';
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

function init(user) {
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userName').textContent = user.displayName || '';
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) {
    avatarEl.src = user.photoURL || 'https://via.placeholder.com/40';
  }
  new DreamChat(user.uid);
  document.getElementById('logoutBtn')?.addEventListener('click', () => authManager.logout());
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    init(user);
  }
});
