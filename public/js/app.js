import AuthManager from './auth.js';
import DreamChat from './chat.js';

async function initializeApp() {
    try {
        await AuthManager.requireAuth();
        const user = AuthManager.user;

        document.getElementById('userEmail').textContent = user.email;
        const displayName = user.displayName || user.email.split('@')[0];
        document.getElementById('userName').textContent = displayName;
        
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) {
            avatarEl.src = user.photoURL || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
        }

        new DreamChat(user.uid);

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            AuthManager.logout();
        });

        // Other initializations
        setupUI();

    } catch (error) {
        console.log(error.message); // Should log "Redirecting to login"
    }
}

function setupUI() {
    // Add any other UI setup logic here
    const pricingLink = document.querySelector('a[href="pricing.html"]');
    if (pricingLink) {
        pricingLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'pricing.html';
        });
    }
}

initializeApp();
