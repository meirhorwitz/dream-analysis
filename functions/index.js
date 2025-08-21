const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Initialize OpenAI only if API key is available
let openai = null;
try {
  const { OpenAI } = require('openai');
  const apiKey = functions.config().openai?.key;
  if (apiKey) {
    openai = new OpenAI({ apiKey });
  }
} catch (error) {
  console.log('OpenAI initialization skipped:', error.message);
}

// Main dream analysis function
exports.analyzeDream = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to analyze dreams.');
  }

  // Check OpenAI configuration
  if (!openai) {
    throw new functions.https.HttpsError('failed-precondition', 'OpenAI API not configured. Please contact support.');
  }

  const userId = context.auth.uid;
  const { dreamDescription } = data;

  // Validate input
  if (!dreamDescription || dreamDescription.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Dream description is required.');
  }

  try {
    // Get or create user document
    const userRef = admin.firestore().doc(`users/${userId}`);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      await userRef.set({
        profile: {
          email: context.auth.token.email || '',
          name: context.auth.token.name || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          subscription: {
            status: 'free',
            dreamsAnalyzed: 0
          }
        }
      });
    }
    
    // Get updated user data
    const userData = (await userRef.get()).data();
    const subscription = userData.profile.subscription;

    // Check free tier limits
    if (subscription.status === 'free' && subscription.dreamsAnalyzed >= 10) {
      throw new functions.https.HttpsError('resource-exhausted', 'Free usage limit reached. Please upgrade to continue.');
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional Jungian dream analyst and personal development coach. 
                   Analyze the user's dream, identifying symbols and archetypes from a Jungian perspective.
                   Provide insights about what the dream might reveal about the dreamer's unconscious mind,
                   current life situation, or psychological state. Be warm, insightful, and helpful.
                   
                   Structure your response with:
                   1. A brief overview of the dream's main themes
                   2. Key symbols and their potential meanings
                   3. Jungian interpretation (archetypes, shadow, anima/animus if relevant)
                   4. Personal insights and what this might reveal about the dreamer
                   5. Reflection questions for deeper understanding`
        },
        {
          role: 'user',
          content: dreamDescription
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = completion.choices[0].message.content;

    // Extract symbols and themes
    const symbols = extractSymbols(analysis);
    const themes = extractThemes(analysis);

    // Save dream to Firestore
    const dreamRef = await admin.firestore()
      .collection(`users/${userId}/dreams`)
      .add({
        date: admin.firestore.FieldValue.serverTimestamp(),
        description: dreamDescription,
        analysis: analysis,
        symbols: symbols,
        themes: themes,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Update user's usage count
    await userRef.update({
      'profile.subscription.dreamsAnalyzed': admin.firestore.FieldValue.increment(1)
    });

    // Return response
    return {
      analysis: analysis,
      dreamId: dreamRef.id,
      symbols: symbols,
      themes: themes,
      dreamsAnalyzed: subscription.dreamsAnalyzed + 1
    };

  } catch (error) {
    console.error('Error analyzing dream:', error);
    
    // Handle specific OpenAI errors
    if (error.response?.status === 401) {
      throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key is invalid.');
    } else if (error.response?.status === 429) {
      throw new functions.https.HttpsError('resource-exhausted', 'API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 500) {
      throw new functions.https.HttpsError('unavailable', 'OpenAI service is temporarily unavailable.');
    }
    
    // Generic error
    throw new functions.https.HttpsError('internal', 'Failed to analyze dream. Please try again.');
  }
});

// Premium feature: Analyze dream trends
exports.analyzeDreamTrends = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  
  try {
    // Check user subscription
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    
    const subscription = userDoc.data().profile.subscription;
    
    if (subscription.status !== 'premium') {
      throw new functions.https.HttpsError('permission-denied', 'This feature requires a premium subscription.');
    }
    
    // TODO: Implement actual trend analysis
    // For now, return placeholder
    return { 
      message: 'Trend analysis feature coming soon!',
      status: 'success'
    };
    
  } catch (error) {
    console.error('Error in trend analysis:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to analyze trends.');
  }
});

// Stripe checkout session creation
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  
  try {
    // TODO: Implement Stripe checkout
    // For now, return placeholder
    return { 
      message: 'Payment integration coming soon!',
      status: 'success'
    };
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session.');
  }
});

exports.activateTestSubscription = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const userId = context.auth.uid;
    const { planType } = data;

    if (!['monthly', 'annual'].includes(planType)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type specified.');
    }

    try {
        const userRef = admin.firestore().doc(`users/${userId}`);
        await userRef.update({
            'profile.subscription.status': 'premium',
            'profile.subscription.plan': planType,
            'profile.subscription.startDate': admin.firestore.FieldValue.serverTimestamp(),
        });

        return { status: 'success', message: `Test subscription (${planType}) activated.` };
    } catch (error) {
        console.error('Error activating test subscription:', error);
        throw new functions.https.HttpsError('internal', 'Failed to activate test subscription.');
    }
});


// Helper function to extract symbols from analysis
function extractSymbols(text) {
  const symbolKeywords = ['symbol', 'represents', 'signifies', 'archetype', 'symbolizes'];
  const symbols = [];
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (symbolKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      // Look for quoted words or key terms after symbol keywords
      const matches = sentence.match(/["']([^"']+)["']|(?:symbol|archetype|represents?)\s+(?:of\s+)?(\w+)/gi);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/["']/g, '').replace(/symbol|archetype|represents?|of/gi, '').trim();
          if (cleaned && cleaned.length > 2) {
            symbols.push(cleaned);
          }
        });
      }
    }
  });
  
  // Remove duplicates and limit to 5
  return [...new Set(symbols)].slice(0, 5);
}

// Helper function to extract themes from analysis
function extractThemes(text) {
  const themeKeywords = ['theme', 'pattern', 'suggests', 'indicates', 'reveals', 'represents'];
  const themes = [];
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (themeKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      // Extract the core message of sentences containing theme keywords
      const cleaned = sentence.trim();
      if (cleaned.length > 20 && cleaned.length < 150) {
        // Get the most relevant part of the sentence
        const parts = cleaned.split(/,|;/);
        const relevantPart = parts.find(part => 
          themeKeywords.some(keyword => part.toLowerCase().includes(keyword))
        ) || parts[0];
        
        themes.push(relevantPart.trim());
      }
    }
  });
  
  // Remove duplicates and limit to 3
  return [...new Set(themes)].slice(0, 3);
}

// Test function for deployment verification
exports.testFunction = functions.https.onRequest((request, response) => {
  response.json({
    status: 'success',
    message: 'DreamCoach functions are deployed!',
    timestamp: new Date().toISOString()
  });
});

// PayPal subscription function
exports.createPayPalSubscription = require('./pp/paypal').createPayPalSubscription;
