const planIds = {
  monthly: 'PAYPAL_MONTHLY_PLAN_ID',
  annual: 'PAYPAL_ANNUAL_PLAN_ID'
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan') || 'monthly';
  const planId = planIds[plan];

  paypal.Buttons({
    createSubscription(data, actions) {
      return actions.subscription.create({ plan_id: planId });
    },
    onApprove(data, actions) {
      window.location.href = '/app.html?subscription=success';
    }
  }).render('#paypal-button-container');
});
