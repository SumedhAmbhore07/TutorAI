// Theme toggle functionality with localStorage persistence
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', newTheme);
});

// Responsive navbar toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Smooth scroll for navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu after clicking
    navLinks.classList.remove('active');
  });
});

// AI chat behavior
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    addMessage('user', message);
    chatInput.value = '';

    // Show typing indicator
    const typingIndicator = addMessage('ai', 'Typing...');

    // Call getAIResponse (placeholder for backend integration)
    getAIResponse(message).then(response => {
      // Remove typing indicator
      chatMessages.removeChild(typingIndicator);
      addMessage('ai', response);
    });
  }
}

function addMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageDiv; // Return for typing indicator removal
}

async function getAIResponse(userMessage) {
  // Placeholder for backend API call
  // In a real implementation, this would send a request to your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Thank you for your question! I\'m here to help with your learning journey.');
    }, 1500);
  });
}

// Firebase authentication event listeners
import { loginWithGoogle, logoutUser } from './firebase.js';

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

loginBtn.addEventListener('click', async () => {
  try {
    await loginWithGoogle();
  } catch (error) {
    alert('Login failed. Please try again.');
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await logoutUser();
  } catch (error) {
    alert('Logout failed. Please try again.');
  }
});

// Add initial welcome message
addMessage('ai', 'Hello! I\'m your AI Tutor. How can I help you learn today?');
