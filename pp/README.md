# PayPal Integration

This folder contains server-side code for creating PayPal subscriptions.
The Cloud Function `createPayPalSubscription` uses the PayPal Checkout SDK
and requires `paypal.client_id` and `paypal.client_secret` to be set in
Firebase functions config (see `.runtimeconfig.json`).
