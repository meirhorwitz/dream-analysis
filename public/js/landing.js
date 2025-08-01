import authManager from './auth.js';

const authModal = document.getElementById('authModal');
const closeBtn = authModal.querySelector('.close');
const authForm = document.getElementById('authForm');
const switchLink = document.getElementById('authSwitchLink');
const switchText = document.getElementById('authSwitchText');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const nameGroup = document.getElementById('nameGroup');

let isSignUp = true;

function openModal() {
  authModal.style.display = 'block';
}
function closeModal() {
  authModal.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);

switchLink.addEventListener('click', (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
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
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  const name = document.getElementById('userName').value;

  try {
    if (isSignUp) {
      await authManager.signUp(email, password, name);
    } else {
      await authManager.signIn(email, password);
    }
    closeModal();
  } catch (err) {
    alert(err.message);
  }
});

export {};
