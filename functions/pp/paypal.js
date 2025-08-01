const functions = require('firebase-functions');
const paypal = require('@paypal/checkout-server-sdk');

function client() {
  const env = new paypal.core.SandboxEnvironment(
    functions.config().paypal.client_id,
    functions.config().paypal.client_secret
  );
  return new paypal.core.PayPalHttpClient(env);
}

exports.createPayPalSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  const { planId } = data;

  const request = new paypal.subscriptions.SubscriptionsCreateRequest();
  request.requestBody({ plan_id: planId });

  try {
    const response = await client().execute(request);
    return { id: response.result.id, status: response.result.status };
  } catch (err) {
    console.error('PayPal subscription error', err);
    throw new functions.https.HttpsError('internal', 'Unable to create subscription');
  }
});
