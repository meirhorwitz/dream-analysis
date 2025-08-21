import AuthManager from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;

    const closeBtn = authModal.querySelector('.close');
    const authForm = document.getElementById('authForm');
    const switchLink = document.getElementById('authSwitchLink');
    const switchText = document.getElementById('authSwitchText');
    const authTitle = document.getElementById('authTitle');
    const authSubmit = document.getElementById('authSubmit');
    const nameGroup = document.getElementById('nameGroup');
    const googleSignInBtn = document.getElementById('googleSignIn');
    const getStartedButtons = document.querySelectorAll('.cta-button');

    let isSignUp = true;

    function openModal(isSignUpFlow = true) {
        isSignUp = isSignUpFlow;
        updateModalUI();
        authModal.classList.remove('hidden');
    }

    function closeModal() {
        authModal.classList.add('hidden');
    }

    function updateModalUI() {
        if (isSignUp) {
            authTitle.textContent = 'Create Your Account';
            authSubmit.textContent = 'Create Account';
            switchText.textContent = 'Already have an account?';
            switchLink.textContent = 'Sign In';
            nameGroup.style.display = 'block';
        } else {
            authTitle.textContent = 'Sign In';
            authSubmit.textContent = 'Sign In';
            switchText.textContent = "Don't have an account?";
            switchLink.textContent = 'Create one';
            nameGroup.style.display = 'none';
        }
    }

    getStartedButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(true); // Default to sign up
        });
    });

    closeBtn.addEventListener('click', closeModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;
        updateModalUI();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        const name = document.getElementById('userName').value;
        
        try {
            await AuthManager.authStatePromise; // Wait for auth to be ready
            if (isSignUp) {
                await AuthManager.signUp(email, password, name);
            } else {
                await AuthManager.signIn(email, password);
            }
            // The onAuthStateChanged handler in auth.js will handle redirects
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    googleSignInBtn.addEventListener('click', async () => {
        try {
            await AuthManager.authStatePromise; // Wait for auth to be ready
            await AuthManager.signInWithGoogle();
            // The onAuthStateChanged handler in auth.js will handle redirects
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });
});
