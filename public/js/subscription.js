import { auth, functions } from './firebase-config.js';
import { httpsCallable } from 'firebase/functions';

class SubscriptionManager {
  constructor() {
    this.stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('subscribePremium')?.addEventListener('click', () => {
      this.subscribe('monthly');
    });

    document.getElementById('subscribeAnnual')?.addEventListener('click', () => {
      this.subscribe('annual');
    });
  }

  async subscribe(plan) {
    try {
      if (!auth.currentUser) {
        localStorage.setItem('pendingSubscription', plan);
        window.location.href = '/?redirect=pricing';
        return;
      }

      const button = event.target;
      button.disabled = true;
      button.innerHTML = '<div class="spinner"></div> Processing...';

      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const { data } = await createCheckoutSession({
        priceId: plan === 'monthly' ? 'price_monthly_id' : 'price_annual_id',
        successUrl: window.location.origin + '/app.html?subscription=success',
        cancelUrl: window.location.origin + '/pricing.html'
      });

      const { error } = await this.stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        console.error('Stripe error:', error);
        this.showError('Payment failed. Please try again.');
      }

    } catch (error) {
      console.error('Subscription error:', error);
      this.showError('Unable to process subscription. Please try again.');
    } finally {
      if (event.target) {
        event.target.disabled = false;
        event.target.innerHTML = plan === 'monthly' ? 'Upgrade Now' : 'Save with Annual';
      }
    }
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
