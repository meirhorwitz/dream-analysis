const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require('openai');
const stripeHandlers = require('./stripe');

admin.initializeApp();

const configuration = new Configuration({
  apiKey: functions.config().openai.key,
});
const openai = new OpenAIApi(configuration);

exports.analyzeDream = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to analyze dreams.');
  }

  const userId = context.auth.uid;
  const { dreamDescription } = data;

  try {
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const userData = userDoc.data();
    const subscription = userData.profile.subscription;

    if (subscription.status === 'free' && subscription.dreamsAnalyzed >= 10) {
      throw new functions.https.HttpsError('resource-exhausted', 'Free usage limit reached. Please upgrade to continue.');
    }

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional Jungian dream analyst and personal development coach. 
                   Analyze the user's dream, identifying symbols and archetypes from a Jungian perspective.
                   Provide insights about what the dream might reveal about the dreamer's unconscious mind,
                   current life situation, or psychological state. Be warm, insightful, and helpful.`
        },
        {
          role: 'user',
          content: dreamDescription
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = completion.data.choices[0].message.content;

    const symbols = extractSymbols(analysis);
    const themes = extractThemes(analysis);

    const dreamRef = await admin.firestore()
      .collection(`users/${userId}/dreams`)
      .add({
        date: admin.firestore.FieldValue.serverTimestamp(),
        description: dreamDescription,
        analysis,
        symbols,
        themes,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    await admin.firestore().doc(`users/${userId}`).update({
      'profile.subscription.dreamsAnalyzed': admin.firestore.FieldValue.increment(1)
    });

    return {
      analysis,
      dreamId: dreamRef.id,
      symbols,
      themes,
      dreamsAnalyzed: subscription.dreamsAnalyzed + 1
    };

  } catch (error) {
    console.error('Error analyzing dream:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze dream. Please try again.');
  }
});

function extractSymbols(text) {
  const symbolKeywords = ['symbol', 'represents', 'signifies', 'archetype'];
  const symbols = [];
  const sentences = text.split('.');
  sentences.forEach(sentence => {
    if (symbolKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      const matches = sentence.match(/["']([^"']+)["']/g);
      if (matches) {
        symbols.push(...matches.map(m => m.replace(/["']/g, '')));
      }
    }
  });
  return [...new Set(symbols)].slice(0, 5);
}

function extractThemes(text) {
  const themeKeywords = ['theme', 'pattern', 'suggests', 'indicates', 'reveals'];
  const themes = [];
  const sentences = text.split('.');
  sentences.forEach(sentence => {
    if (themeKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      const words = sentence.split(' ').slice(0, 10).join(' ');
      themes.push(words.trim());
    }
  });
  return themes.slice(0, 3);
}

exports.analyzeDreamTrends = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  const userId = context.auth.uid;
  const userDoc = await admin.firestore().doc(`users/${userId}`).get();
  const subscription = userDoc.data().profile.subscription;

  if (subscription.status !== 'premium') {
    throw new functions.https.HttpsError('permission-denied', 'This feature requires a premium subscription.');
  }

  // Trend analysis logic would go here
});

exports.createCheckoutSession = stripeHandlers.createCheckoutSession;
