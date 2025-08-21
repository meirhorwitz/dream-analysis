const functions = require('firebase-functions');
const paypal = require('@paypal/paypal-server-sdk');

// Configure PayPal environment
function environment() {
  let clientId = functions.config().paypal.client_id;
  let clientSecret = functions.config().paypal.client_secret;

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

exports.createPayPalSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a subscription.');
  }

  const { planId } = data;

  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan ID is required.');
  }

  const request = new paypal.subscriptions.SubscriptionsCreateRequest();
  request.requestBody({
    plan_id: planId
  });

  try {
    const response = await client().execute(request);
    return {
      id: response.result.id,
      status: response.result.status
    };
  } catch (error) {
    console.error('PayPal API Error:', error);
    // It's helpful to see the full error from PayPal
    if (error.response) {
      console.error(error.response.data);
    }
    throw new functions.https.HttpsError('internal', 'Unable to create PayPal subscription.');
  }
});
