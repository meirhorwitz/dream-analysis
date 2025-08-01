# DreamCoach

This project contains Firebase functions and a front-end for dream analysis. The repository now includes configuration for running the Firebase emulators and a basic PayPal subscription flow.

## Local Setup

1. Install the Firebase CLI and project dependencies:

```bash
npm install -g firebase-tools
cd functions && npm install && cd ..
```

2. Add your API keys in `.runtimeconfig.json`:

```json
{
  "openai": { "key": "YOUR_OPENAI_API_KEY" },
  "stripe": { "secret": "YOUR_STRIPE_SECRET_KEY" },
  "paypal": {
    "client_id": "YOUR_PAYPAL_CLIENT_ID",
    "client_secret": "YOUR_PAYPAL_SECRET"
  }
}
```

3. Start the emulators:

```bash
firebase emulators:start
```

The front-end will connect automatically when served from `localhost`.
