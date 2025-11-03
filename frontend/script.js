// Import Firebase modules from firebase.js
import { loginWithGoogle, logoutUser, auth, getUserData, saveUserData } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// DOM Elements
const authModal = document.getElementById('auth-modal');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const themeToggle = document.getElementById('theme-toggle');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

// Auth Modal Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('login-form-element');
const registerForm = document.getElementById('register-form-element');
const googleLoginBtn = document.getElementById('google-login');
const googleRegisterBtn = document.getElementById('google-register');

// Chat Elements
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

// Theme Management
let currentTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  currentTheme = theme;
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = themeToggle.querySelector('i');
  icon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

themeToggle.addEventListener('click', () => {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// Initialize theme
setTheme(currentTheme);

// Navigation Toggle for Mobile
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Auth Modal Management
function openModal() {
  authModal.style.display = 'block';
}

function closeModal() {
  authModal.style.display = 'none';
}

loginBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
  if (e.target === authModal) {
    closeModal();
  }
});

// Tab Switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));

    btn.classList.add('active');
    const targetForm = document.getElementById(btn.dataset.tab + '-form');
    targetForm.classList.add('active');
  });
});

// Email/Password Authentication
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
    showNotification('Login successful!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const stream = document.getElementById('register-stream').value;

  if (!stream) {
    showNotification('Please select a stream.', 'error');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await userCredential.user.updateProfile({ displayName: name });

    // Save user data with stream to Firestore
    await saveUserData(userCredential.user.uid, {
      name: name,
      email: email,
      stream: stream,
      createdAt: new Date()
    });

    closeModal();
    showNotification('Registration successful!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

// Google Authentication
googleLoginBtn.addEventListener('click', async () => {
  try {
    await loginWithGoogle();
    closeModal();
    showNotification('Google sign-in successful!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

googleRegisterBtn.addEventListener('click', async () => {
  try {
    await loginWithGoogle();
    closeModal();
    showNotification('Google sign-up successful!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await logoutUser();
    showNotification('Logged out successfully!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

// Auth State Listener
auth.onAuthStateChanged(async (user) => {
  console.log('Auth state changed:', user ? 'logged in' : 'logged out');
  if (user) {
    // User is signed in
    userInfo.style.display = 'flex';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';

    userName.textContent = user.displayName || user.email;
    userPhoto.src = user.photoURL || 'https://via.placeholder.com/35x35?text=U';

    console.log('Loading user data for:', user.uid);
    // Load user data and update profile/courses
    const userData = await getUserData(user.uid);
    console.log('User data retrieved:', userData);

    if (userData && userData.stream) {
      updateProfile(userData);
      loadCourses(userData.stream);
    } else {
      console.log('No user data or stream found, using default');
      // If no user data or no stream, use default Computer Science
      const defaultData = {
        name: user.displayName,
        email: user.email,
        stream: 'computer-science'
      };
      updateProfile(defaultData);
      loadCourses('computer-science');
    }

    // Show home content
    document.querySelector('main').style.display = 'block';
  } else {
    // User is signed out
    userInfo.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';

    // Reset profile and courses
    resetProfile();
    resetCourses();

    // Hide home content and show login prompt
    document.querySelector('main').style.display = 'none';
    openModal();
  }
});

// Notification System
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1001;
    animation: slideIn 0.3s ease-out;
    ${type === 'success' ? 'background-color: #10b981;' : 'background-color: #ef4444;'}
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Chat Functionality
async function askTutorAI() {
  const question = chatInput.value.trim();
  if (!question) return;

  // Add user message
  addMessage(question, 'user');

  // Clear input
  chatInput.value = '';

  // Add loading message
  const loadingMsg = addMessage('Thinking...', 'ai', true);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch('https://tutorai-backend-a4la.onrender.com/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    // Remove loading message
    loadingMsg.remove();

    // Add AI response
    addMessage(data.answer, 'ai');
  } catch (error) {
    // Remove loading message
    loadingMsg.remove();

    // Add error message
    addMessage('Error: Could not connect to TutorAI. Please try again.', 'ai');
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(content, sender, isLoading = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';

  const text = document.createElement('p');
  text.textContent = content;
  messageContent.appendChild(text);

  if (!isLoading) {
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageContent.appendChild(timestamp);
  }

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  chatMessages.appendChild(messageDiv);

  return messageDiv;
}

// Event Listeners
sendButton.addEventListener('click', askTutorAI);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') askTutorAI();
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    navLinks.classList.remove('active'); // Close mobile menu
  });
});

// Get Started Button
document.querySelector('.cta-button').addEventListener('click', () => {
  document.getElementById('ai-tutor').scrollIntoView({ behavior: 'smooth' });
});

// Profile and Courses Functions
function updateProfile(userData) {
  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = `
    <div class="profile-info">
      <div class="profile-avatar">
        <img src="${userPhoto.src}" alt="Profile Picture">
      </div>
      <div class="profile-details">
        <h3>${userData.name || 'User'}</h3>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Stream:</strong> ${userData.stream || 'Not specified'}</p>
        <p><strong>Member since:</strong> ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  `;
}

function resetProfile() {
  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = '<p>Please log in to view your profile.</p>';
}

async function loadCourses(stream) {
  const coursesContent = document.getElementById('courses-content');
  coursesContent.innerHTML = '<p>Loading courses...</p>';

  console.log('Loading courses for stream:', stream);

  // Force default stream for testing
  if (!stream) {
    stream = 'computer-science';
    console.log('No stream provided, defaulting to:', stream);
  }

  try {
    // YouTube API key
    const API_KEY = 'AIzaSyCCvt0OroWtStviDBth37KUPaFZmk4GAVI';
    const query = getQueryForStream(stream);
    console.log('YouTube query:', query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_KEY}`;
    console.log('API URL:', url);

    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    displayVideos(data.items);
  } catch (error) {
    console.error('Error loading courses:', error);
    // Fallback: load some default videos
    console.log('Loading fallback videos...');
    displayFallbackVideos();
  }
}

function displayFallbackVideos() {
  const coursesContent = document.getElementById('courses-content');

  const videoGrid = document.createElement('div');
  videoGrid.className = 'video-grid';

  // Sample videos for demonstration
  const sampleVideos = [
    {
      id: 'Y_9t3eQFmU4',
      title: 'Computer Science Basics: Programming Languages',
      channelTitle: 'LearnFree',
      thumbnail: 'https://i.ytimg.com/vi/Y_9t3eQFmU4/mqdefault.jpg'
    },
    {
      id: 'zOjov-2OZ0E',
      title: 'Introduction to Programming and Computer Science',
      channelTitle: 'freeCodeCamp.org',
      thumbnail: 'https://i.ytimg.com/vi/zOjov-2OZ0E/mqdefault.jpg'
    },
    {
      id: 'l26oaHV7D40',
      title: 'Programming Basics: Statements & Functions',
      channelTitle: 'CrashCourse',
      thumbnail: 'https://i.ytimg.com/vi/l26oaHV7D40/mqdefault.jpg'
    }
  ];

  sampleVideos.forEach(video => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';

    videoCard.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">
        <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/320x180?text=Error'">
        <h4>${video.title}</h4>
        <p>${video.channelTitle}</p>
      </a>
    `;
    videoGrid.appendChild(videoCard);
  });

  coursesContent.innerHTML = '';
  coursesContent.appendChild(videoGrid);
  console.log('Fallback videos displayed successfully');
}

function getQueryForStream(stream) {
  const queries = {
    'computer-science': 'computer science programming tutorials',
    'mathematics': 'mathematics algebra calculus tutorials',
    'physics': 'physics mechanics thermodynamics tutorials',
    'chemistry': 'chemistry organic inorganic tutorials',
    'biology': 'biology cell genetics tutorials',
    'english': 'english literature grammar tutorials',
    'history': 'world history ancient modern tutorials'
  };
  return queries[stream] || 'educational tutorials';
}

function displayVideos(videos) {
  const coursesContent = document.getElementById('courses-content');
  console.log('Displaying videos:', videos);

  if (!videos || videos.length === 0) {
    coursesContent.innerHTML = '<p>No videos found for your stream.</p>';
    return;
  }

  const videoGrid = document.createElement('div');
  videoGrid.className = 'video-grid';

  videos.forEach(video => {
    console.log('Processing video:', video);
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';

    // Ensure we have the necessary data
    const videoId = video.id?.videoId;
    const title = video.snippet?.title || 'Untitled';
    const thumbnail = video.snippet?.thumbnails?.medium?.url || 'https://via.placeholder.com/320x180?text=No+Thumbnail';
    const channelTitle = video.snippet?.channelTitle || 'Unknown Channel';

    videoCard.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
        <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/320x180?text=Error'">
        <h4>${title}</h4>
        <p>${channelTitle}</p>
      </a>
    `;
    videoGrid.appendChild(videoCard);
  });

  coursesContent.innerHTML = '';
  coursesContent.appendChild(videoGrid);
  console.log('Videos displayed successfully');
}

function resetCourses() {
  const coursesContent = document.getElementById('courses-content');
  coursesContent.innerHTML = '<p>Please log in to view personalized courses based on your stream.</p>';
}
