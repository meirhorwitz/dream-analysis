// PayPal integration is handled on a separate payment page

class SubscriptionManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('subscribePremium')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `/paypal.html?plan=monthly`;
    });

    document.getElementById('subscribeAnnual')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `/paypal.html?plan=annual`;
    });
  }



  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SubscriptionManager());
} else {
  new SubscriptionManager();
}
