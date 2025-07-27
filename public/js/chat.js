import { db, functions, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import authManager from './auth.js';

class DreamChat {
  constructor(userId) {
    this.userId = userId;
    this.chatContainer = document.getElementById('chatMessages');
    this.dreamInput = document.getElementById('dreamInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.analysisCount = 0;
    this.initChat();
  }

  initChat() {
    this.loadChatHistory();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('chatForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendDream();
    });
  }

  async sendDream() {
    const dreamText = this.dreamInput.value.trim();
    if (!dreamText) return;

    this.dreamInput.disabled = true;
    this.sendBtn.disabled = true;

    this.addMessage('user', dreamText);

    this.dreamInput.value = '';

    const typingId = this.showTypingIndicator();

    try {
      const analyzeDream = httpsCallable(functions, 'analyzeDream');
      const result = await analyzeDream({
        dreamDescription: dreamText,
        userId: this.userId
      });

      this.removeTypingIndicator(typingId);

      this.addMessage('assistant', result.data.analysis);

      this.updateUsageCounter(result.data.dreamsAnalyzed);
      this.analysisCount++;
      this.checkGooglePrompt();

    } catch (error) {
      this.removeTypingIndicator(typingId);

      if (error.code === 'functions/unauthenticated') {
        this.addMessage('assistant', 'Please sign in to analyze your dreams.');
      } else if (error.message && error.message.includes('limit reached')) {
        this.showUpgradePrompt();
      } else {
        this.addMessage('assistant', 'I apologize, but I encountered an error analyzing your dream. Please try again.');
      }
    } finally {
      this.dreamInput.disabled = false;
      this.sendBtn.disabled = false;
      this.dreamInput.focus();
    }
  }

  addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageDiv.innerHTML = `
      <div class="message-content">
        ${this.formatContent(content)}
      </div>
      <div class="message-time">${timestamp}</div>
    `;

    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();

    this.saveMessage(role, content);
  }

  formatContent(content) {
    return content
      .split('\n\n')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    const id = `typing-${Date.now()}`;
    typingDiv.id = id;
    typingDiv.className = 'message assistant typing';
    typingDiv.innerHTML = `
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    this.chatContainer.appendChild(typingDiv);
    this.scrollToBottom();
    return id;
  }

  removeTypingIndicator(id) {
    const typingDiv = document.getElementById(id);
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  showUpgradePrompt() {
    const upgradeMessage = `
      You've reached your free limit of 10 dream analyses! 🌟
      
      To continue exploring your dreams and unlock premium features like:
      • Unlimited dream analyses
      • Dream pattern trends
      • Bulk dream upload
      • Export capabilities
      
      Please upgrade to DreamCoach Premium.
    `;

    this.addMessage('assistant', upgradeMessage);

    const upgradeBtn = document.createElement('button');
    upgradeBtn.className = 'inline-upgrade-btn';
    upgradeBtn.innerHTML = '<i class="material-icons">star</i> Upgrade Now';
    upgradeBtn.onclick = () => window.location.href = '/pricing.html';

    this.chatContainer.appendChild(upgradeBtn);
  }

  async saveMessage(role, content) {
    try {
      await addDoc(collection(db, `chats/${this.userId}/messages`), {
        role,
        content,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  loadChatHistory() {
    const q = query(
      collection(db, `chats/${this.userId}/messages`),
      orderBy('timestamp', 'asc')
    );

    onSnapshot(q, (snapshot) => {
      if (this.chatContainer.children.length === 1) {
        snapshot.forEach((doc) => {
          const data = doc.data();
          this.addMessage(data.role, data.content);
        });
      }
    });
  }

  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  updateUsageCounter(count) {
    document.getElementById('dreamCount').textContent = count;
    const percentage = (count / 10) * 100;
    document.getElementById('usageFill').style.width = `${percentage}%`;

    if (count >= 10) {
      document.getElementById('upgradeBtn').classList.add('pulse');
    }
  }

  checkGooglePrompt() {
    if (this.analysisCount === 2) {
      const isGoogle = auth.currentUser?.providerData?.some(p => p.providerId === 'google.com');
      if (!isGoogle) {
        const prompt = document.createElement('div');
        prompt.className = 'google-prompt';
        prompt.innerHTML = `
          <p>Save your progress by creating a Google account.</p>
          <button class="google-signup-btn">Create Google Account</button>
        `;
        prompt.querySelector('button').addEventListener('click', () => authManager.signInWithGoogle());
        this.chatContainer.appendChild(prompt);
        this.scrollToBottom();
      }
    }
  }
}

export default DreamChat;
