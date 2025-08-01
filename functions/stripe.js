const functions = require('firebase-functions');
const Stripe = require('stripe');

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2022-11-15'
});

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  const { priceId, successUrl, cancelUrl } = data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: context.auth.token.email,
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return { sessionId: session.id };
  } catch (err) {
    console.error('Stripe session error', err);
    throw new functions.https.HttpsError('internal', 'Unable to create checkout session');
  }
});
