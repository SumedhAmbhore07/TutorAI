// Import Firebase modules from firebase.js
import { loginWithGoogle, logoutUser, auth, getUserData, saveUserData } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {

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

// Focus Mode Elements
const focusModal = document.getElementById('focus-modal');
const focusModeBtn = document.getElementById('focus-mode-btn');
const floatingFocusBtn = document.getElementById('floating-focus-btn');
const focusClose = document.getElementById('focus-close');
const timerText = document.getElementById('timer-text');
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const presetBtns = document.querySelectorAll('.preset-btn');
const focusTimerView = document.getElementById('focus-timer-view');
const focusCongratsView = document.getElementById('focus-congrats-view');
const completedTime = document.getElementById('completed-time');
const startNewSessionBtn = document.getElementById('start-new-session');

// Profile Modal Elements
const profileModal = document.getElementById('profile-modal');
const profileClose = document.getElementById('profile-close');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileCourse = document.getElementById('profile-course');
const profileMemberSince = document.getElementById('profile-member-since');
const editProfileBtn = document.getElementById('edit-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const changeAvatarBtn = document.getElementById('change-avatar');

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
const chatSidebar = document.getElementById('chat-sidebar');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');

// New Chat Button Event Listener
newChatBtn.addEventListener('click', () => {
  const newSession = createNewChatSession();
  switchChatSession(newSession.id);
  renderChatList();
});

// Chat Session Management
let currentSessionId = null;
let chatSessions = [];

// PDF Upload Elements
const pdfUpload = document.getElementById('pdf-upload');
const pdfUploadBtn = document.getElementById('pdf-upload-btn');
const pdfStatus = document.getElementById('pdf-status');

// PDF Context Storage
let pdfContext = null;

// Data Persistence with localStorage
const STORAGE_KEYS = {
  CHAT_SESSIONS: 'tutorai_chat_sessions',
  SELECTED_COURSE: 'tutorai_selected_course',
  SELECTED_TOPIC: 'tutorai_selected_topic',
  PDF_CONTEXT: 'tutorai_pdf_context',
  COURSE_SLOTS: 'tutorai_course_slots'
};

// Helper functions for localStorage
function saveToStorage(key, data) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      showNotification('Storage limit exceeded. Some data may not be saved.', 'error');
    }
  }
}

function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
}

function clearStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

// Course Slots Management
const MAX_SLOTS = 3;

function getCourseSlots() {
  return loadFromStorage(STORAGE_KEYS.COURSE_SLOTS) || [];
}

function saveCourseSlots(slots) {
  saveToStorage(STORAGE_KEYS.COURSE_SLOTS, slots);
}

function addCourseToSlot(course, topic) {
  const slots = getCourseSlots();
  const nextSlotIndex = slots.length;
  
  if (nextSlotIndex >= MAX_SLOTS) {
    showNotification('All course slots are filled. Delete a slot to add a new course.', 'error');
    return false;
  }
  
  const newSlot = {
    id: Date.now(),
    course: course,
    topics: [],
    createdAt: new Date().toISOString()
  };
  
  slots.push(newSlot);
  saveCourseSlots(slots);
  renderCourseSlots();
  showNotification(`Course "${getCourseDisplayName(course)}" added to slot ${nextSlotIndex + 1}!`, 'success');
  return true;
}

function markTopicCovered(slotId, topic) {
  const slots = getCourseSlots();
  const slot = slots.find(s => s.id === slotId);
  if (slot && !slot.topics.includes(topic)) {
    slot.topics.push(topic);
    saveCourseSlots(slots);
    renderCourseSlots();
  }
}

function deleteCourseSlot(slotId) {
  const slots = getCourseSlots();
  const filteredSlots = slots.filter(s => s.id !== slotId);
  saveCourseSlots(filteredSlots);
  renderCourseSlots();
  showNotification('Course slot deleted!', 'success');
}

function renderCourseSlots() {
  const slots = getCourseSlots();
  const slotsContainer = document.getElementById('course-slots');
  
  if (!slotsContainer) return;
  
  slotsContainer.innerHTML = '';
  
  for (let i = 0; i < MAX_SLOTS; i++) {
    const slot = slots[i];
    const slotDiv = document.createElement('div');
    slotDiv.className = `course-slot ${slot ? 'filled' : 'empty'}`;
    
    if (slot) {
      const courseName = getCourseDisplayName(slot.course);
      const coveredTopics = slot.topics.length;
      const totalTopics = topics[slot.course]?.length || 0;
      
      slotDiv.innerHTML = `
        <div class="slot-header">
          <h4>${courseName}</h4>
          <button class="delete-slot" data-slot-id="${slot.id}">×</button>
        </div>
        <div class="slot-progress">
          <span>Topics: ${coveredTopics}/${totalTopics}</span>
        </div>
        <div class="slot-topics">
          ${(topics[slot.course] || []).map(topic => `
            <label class="topic-checkbox">
              <input type="checkbox" 
                     ${slot.topics.includes(topic.toLowerCase().replace(/\s+/g, '-')) ? 'checked' : ''} 
                     data-slot-id="${slot.id}" 
                     data-topic="${topic.toLowerCase().replace(/\s+/g, '-')}" />
              ${topic}
            </label>
          `).join('')}
        </div>
      `;
    } else {
      slotDiv.innerHTML = `
        <div class="empty-slot">
          <p>Empty Slot ${i + 1}</p>
          <small>Select a course to fill this slot</small>
        </div>
      `;
    }
    
    slotsContainer.appendChild(slotDiv);
  }
  
  // Add event listeners
  document.querySelectorAll('.delete-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slotId = parseInt(e.target.dataset.slotId);
      deleteCourseSlot(slotId);
    });
  });
  
  document.querySelectorAll('.topic-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const slotId = parseInt(e.target.dataset.slotId);
      const topic = e.target.dataset.topic;
      if (e.target.checked) {
        markTopicCovered(slotId, topic);
      } else {
        // Unmark topic (remove from array)
        const slots = getCourseSlots();
        const slot = slots.find(s => s.id === slotId);
        if (slot) {
          slot.topics = slot.topics.filter(t => t !== topic);
          saveCourseSlots(slots);
          renderCourseSlots();
        }
      }
    });
  });
}

// Chat Session Management Functions
function createNewChatSession(title = null) {
  const sessionId = Date.now().toString();
  const session = {
    id: sessionId,
    title: title || `Chat ${new Date().toLocaleDateString()}`,
    messages: [
      {
        sender: 'ai',
        content: "Hello! I'm your AI tutor. Ask me anything about learning, and I'll help you understand it better!",
        timestamp: 'Just now'
      }
    ],
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    messageCount: 1
  };

  chatSessions.push(session);
  saveChatSessions();
  return session;
}

function switchChatSession(sessionId) {
  // Save current session messages
  if (currentSessionId) {
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
      currentSession.messages = [];
      const messageElements = chatMessages.querySelectorAll('.message');
      messageElements.forEach(msg => {
        const sender = msg.classList.contains('user') ? 'user' : 'ai';
        const content = msg.querySelector('.message-content p').textContent;
        const timestamp = msg.querySelector('.timestamp')?.textContent || '';
        currentSession.messages.push({ sender, content, timestamp });
      });
      currentSession.lastAccessed = new Date().toISOString();
      saveChatSessions();
    }
  }

  // Switch to new session
  currentSessionId = sessionId;
  const session = chatSessions.find(s => s.id === sessionId);
  if (session) {
    session.lastAccessed = new Date().toISOString();
    saveChatSessions();

    // Clear current messages and load new ones
    chatMessages.innerHTML = '';
    session.messages.forEach(msg => {
      addMessage(msg.content, msg.sender, true);
    });

    // Update UI
    renderChatList();
  }
}

function deleteChatSession(sessionId) {
  chatSessions = chatSessions.filter(s => s.id !== sessionId);
  saveChatSessions();

  // If deleting current session, switch to another or create new
  if (currentSessionId === sessionId) {
    if (chatSessions.length > 0) {
      switchChatSession(chatSessions[0].id);
    } else {
      createNewChatSession();
    }
  }

  renderChatList();
}

function getActiveSession() {
  return chatSessions.find(s => s.id === currentSessionId);
}

function saveChatSessions() {
  saveToStorage(STORAGE_KEYS.CHAT_SESSIONS, chatSessions);
}

function loadChatSessions() {
  chatSessions = loadFromStorage(STORAGE_KEYS.CHAT_SESSIONS) || [];
  if (chatSessions.length === 0) {
    createNewChatSession();
  } else {
    // Check for auto-create condition
    const lastSession = chatSessions.reduce((latest, session) =>
      new Date(session.lastAccessed) > new Date(latest.lastAccessed) ? session : latest
    );
    const hoursSinceLastAccess = (new Date() - new Date(lastSession.lastAccessed)) / (1000 * 60 * 60);
    if (hoursSinceLastAccess >= 12) {
      createNewChatSession();
    }
  }
}

function renderChatList() {
  chatList.innerHTML = '';

  // Sort sessions by last accessed (most recent first)
  const sortedSessions = [...chatSessions].sort((a, b) =>
    new Date(b.lastAccessed) - new Date(a.lastAccessed)
  );

  sortedSessions.forEach(session => {
    const sessionItem = document.createElement('div');
    sessionItem.className = `chat-session-item ${session.id === currentSessionId ? 'active' : ''}`;
    sessionItem.dataset.sessionId = session.id;

    const lastMessage = session.messages.length > 0 ?
      session.messages[session.messages.length - 1].content.substring(0, 50) + '...' :
      'No messages yet';

    sessionItem.innerHTML = `
      <div class="session-info">
        <div class="session-title">${session.title}</div>
        <div class="session-preview">${lastMessage}</div>
        <div class="session-meta">
          ${session.messageCount} messages • ${new Date(session.lastAccessed).toLocaleDateString()}
        </div>
      </div>
      <button class="delete-session" data-session-id="${session.id}">×</button>
    `;

    sessionItem.addEventListener('click', (e) => {
      if (!e.target.classList.contains('delete-session')) {
        switchChatSession(session.id);
      }
    });

    sessionItem.querySelector('.delete-session').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this chat session?')) {
        deleteChatSession(session.id);
      }
    });

    chatList.appendChild(sessionItem);
  });
}

// Chat message persistence functions
function saveChatMessages() {
  if (!currentSessionId) return;

  const session = getActiveSession();
  if (!session) return;

  session.messages = [];
  const messageElements = chatMessages.querySelectorAll('.message');
  messageElements.forEach(msg => {
    const sender = msg.classList.contains('user') ? 'user' : 'ai';
    const content = msg.querySelector('.message-content p').textContent;
    const timestamp = msg.querySelector('.timestamp')?.textContent || '';
    session.messages.push({ sender, content, timestamp });
  });

  session.messageCount = session.messages.length;
  session.lastAccessed = new Date().toISOString();
  saveChatSessions();
}

function loadChatMessages() {
  loadChatSessions();
  if (chatSessions.length > 0) {
    // Switch to most recent session or create new if needed
    const mostRecent = chatSessions.reduce((latest, session) =>
      new Date(session.lastAccessed) > new Date(latest.lastAccessed) ? session : latest
    );
    switchChatSession(mostRecent.id);
  }
  renderChatList();
}

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
  const navMenu = document.getElementById('nav-menu');
  navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.remove('active');
  });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
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
  const course = document.getElementById('register-course').value;

  if (!course) {
    showNotification('Please select a course.', 'error');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await userCredential.user.updateProfile({ displayName: name });

    // Save user data with course to Firestore
    await saveUserData(userCredential.user.uid, {
      name: name,
      email: email,
      course: course,
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
    userPhoto.src = user.photoURL || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6FUiv-It6tyoajJLen0-3K6B9OsvgOaRM0g&s";

    console.log('Loading user data for:', user.uid);
    // Load user data and update profile/courses
    const userData = await getUserData(user.uid);
    console.log('User data retrieved:', userData);

    if (userData && userData.course) {
      updateProfile(userData);
      // No automatic course loading - users select manually
    } else {
      console.log('No user data or course found');
      // If no user data or no course, just show profile without course
      const defaultData = {
        name: user.displayName,
        email: user.email,
        course: null
      };
      updateProfile(defaultData);
    }

    // Load saved PDF context
    const savedPdfContext = loadFromStorage(STORAGE_KEYS.PDF_CONTEXT);
    if (savedPdfContext) {
      pdfContext = savedPdfContext.text;
      pdfStatus.textContent = `PDF uploaded: ${savedPdfContext.filename} (${savedPdfContext.pages} pages)`;
    }

    // Load saved chat messages
    loadChatMessages();

    // Load and render course slots
    renderCourseSlots();

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

    // Clear PDF context
    pdfContext = null;
    pdfStatus.textContent = 'No PDF uploaded';

    // Clear chat messages
    chatMessages.innerHTML = '';

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

// PDF Upload Functionality
pdfUploadBtn.addEventListener('click', () => {
  pdfUpload.click();
});

pdfUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    showNotification('Please select a PDF file.', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    showNotification('File size must be less than 10MB.', 'error');
    return;
  }

  pdfStatus.textContent = 'Uploading PDF...';
  pdfUploadBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch('http://localhost:5000/api/upload-pdf', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      pdfContext = data.text;
      // Save PDF context to localStorage
      saveToStorage(STORAGE_KEYS.PDF_CONTEXT, {
        text: data.text,
        filename: data.filename,
        pages: data.pages,
        uploadedAt: new Date().toISOString()
      });
      pdfStatus.textContent = `PDF uploaded: ${data.filename} (${data.pages} pages)`;
      showNotification('PDF uploaded successfully!', 'success');
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('PDF upload error:', error);
    pdfStatus.textContent = 'Upload failed';
    showNotification('Failed to upload PDF. Please try again.', 'error');
  } finally {
    pdfUploadBtn.disabled = false;
  }
});

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
    const requestBody = { question };
    if (pdfContext) {
      requestBody.pdfContext = pdfContext;
    }

    const response = await fetch('http://localhost:5000/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
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

function addMessage(content, sender, isLoading = false, customTimestamp = null) {
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
    timestamp.textContent = customTimestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageContent.appendChild(timestamp);
  }

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  chatMessages.appendChild(messageDiv);

  // Save chat messages to localStorage after adding
  if (!isLoading) {
    saveChatMessages();
  }

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
        <p><strong>Course:</strong> ${userData.course ? getCourseDisplayName(userData.course) : 'Not specified'}</p>
        <p><strong>Member since:</strong> ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  `;
}

function resetProfile() {
  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = '<p>Please log in to view your profile.</p>';
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
  coursesContent.innerHTML = '<p>Please select a course to view related videos.</p>';
}

// Topics mapping for each course
const topics = {
  'dsa': ['Arrays', 'Linked Lists', 'Stacks and Queues', 'Trees', 'Graphs', 'Sorting Algorithms', 'Searching Algorithms', 'Dynamic Programming', 'Greedy Algorithms', 'Backtracking'],
  'web-dev': ['HTML Basics', 'CSS Fundamentals', 'JavaScript Essentials', 'Responsive Design', 'React Components', 'State Management', 'Routing', 'APIs and Fetch', 'Deployment', 'Version Control'],
  'python': ['Python Basics', 'Data Types', 'Control Structures', 'Functions', 'Modules and Packages', 'File Handling', 'Object-Oriented Programming', 'Data Structures', 'Libraries (NumPy, Pandas)', 'Web Development with Flask/Django'],
  'dbms': ['Database Concepts', 'SQL Basics', 'Normalization', 'ER Diagrams', 'Joins and Subqueries', 'Indexing', 'Transactions', 'PL/SQL', 'NoSQL Databases', 'Database Security'],
  'oop': ['Classes and Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'Design Patterns', 'Exception Handling', 'Memory Management', 'Java/C++ Specific Features', 'Advanced OOP Concepts'],
  'ai-ml': ['Machine Learning Basics', 'Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning', 'Model Evaluation', 'AI Ethics'],
  'data-science': ['Data Analysis', 'Statistics', 'Data Visualization', 'Pandas and NumPy', 'Machine Learning', 'Big Data', 'Data Cleaning', 'Feature Engineering', 'Time Series Analysis', 'Data Ethics'],
  'cybersecurity': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Web Security', 'Malware Analysis', 'Incident Response', 'Security Tools', 'Compliance and Standards', 'Social Engineering', 'Cloud Security'],
  'os-networks': ['Operating System Basics', 'Process Management', 'Memory Management', 'File Systems', 'Networking Fundamentals', 'TCP/IP', 'Routing and Switching', 'Network Security', 'Distributed Systems', 'Cloud Computing'],
  'mobile-dev': ['Mobile UI/UX', 'React Native Basics', 'Flutter Fundamentals', 'State Management', 'APIs Integration', 'Device Features', 'App Deployment', 'Performance Optimization', 'Testing', 'Cross-Platform Development']
};

// Course and Topic selection functionality
const courseSelect = document.getElementById('course-select');
const topicSelect = document.getElementById('topic-select');

courseSelect.addEventListener('change', async (e) => {
  const selectedCourse = e.target.value;
  if (selectedCourse) {
    // Populate topic select with relevant topics
    populateTopicSelect(selectedCourse);
    topicSelect.style.display = 'block';
    // Reset topic selection
    topicSelect.value = '';
    resetCourses();
  } else {
    // Hide topic select and reset
    topicSelect.style.display = 'none';
    topicSelect.value = '';
    resetCourses();
  }
});

topicSelect.addEventListener('change', async (e) => {
  const selectedTopic = e.target.value;
  const selectedCourse = courseSelect.value;
  if (selectedTopic && selectedCourse) {
    await loadCourses(selectedCourse, selectedTopic);
    
    // Check if course is already in a slot, if not, offer to add it
    const slots = getCourseSlots();
    const existingSlot = slots.find(s => s.course === selectedCourse);
    if (!existingSlot) {
      // Show add to slot button or auto-add
      setTimeout(() => {
        if (confirm(`Add "${getCourseDisplayName(selectedCourse)}" to a course slot?`)) {
          addCourseToSlot(selectedCourse, selectedTopic);
        }
      }, 1000);
    } else {
      // Mark topic as covered if not already
      markTopicCovered(existingSlot.id, selectedTopic);
    }
  } else if (selectedCourse) {
    await loadCourses(selectedCourse);
  } else {
    resetCourses();
  }
});

function populateTopicSelect(course) {
  topicSelect.innerHTML = '<option value="">Select a Topic</option>';
  const courseTopics = topics[course] || [];
  courseTopics.forEach(topic => {
    const option = document.createElement('option');
    option.value = topic.toLowerCase().replace(/\s+/g, '-');
    option.textContent = topic;
    topicSelect.appendChild(option);
  });
}

// Update getQueryForStream to getQueryForCourse and map new courses
function getQueryForCourse(course) {
  const queries = {
    'dsa': 'data structures algorithms tutorials',
    'web-dev': 'web development HTML CSS JavaScript React tutorials',
    'python': 'python programming tutorials',
    'dbms': 'database management systems SQL DBMS tutorials',
    'oop': 'object oriented programming Java C++ tutorials',
    'ai-ml': 'artificial intelligence machine learning tutorials',
    'data-science': 'data science analytics tutorials',
    'cybersecurity': 'cybersecurity ethical hacking tutorials',
    'os-networks': 'operating systems computer networks tutorials',
    'mobile-dev': 'mobile app development Flutter React Native tutorials'
  };
  return queries[course] || 'educational tutorials';
}

// Update loadCourses to use course and optional topic
async function loadCourses(course, topic = null) {
  const coursesContent = document.getElementById('courses-content');
  coursesContent.innerHTML = '<p>Loading videos...</p>';

  console.log('Loading videos for course:', course, 'topic:', topic);

  try {
    // YouTube API key
    const API_KEY = 'AIzaSyCCvt0OroWtStviDBth37KUPaFZmk4GAVI';
    let query = getQueryForCourse(course);
    if (topic) {
      // Convert topic back to readable format for query
      const readableTopic = topic.replace(/-/g, ' ');
      query = `${readableTopic} ${query}`;
    }
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
    console.error('Error loading videos:', error);
    // Fallback: load some default videos
    console.log('Loading fallback videos...');
    displayFallbackVideos();
  }
}

// Helper function to get course display name
function getCourseDisplayName(course) {
  const names = {
    'dsa': 'Data Structures & Algorithms (DSA)',
    'web-dev': 'Web Development (HTML, CSS, JavaScript, React)',
    'python': 'Python Programming',
    'dbms': 'Database Management Systems (SQL + DBMS)',
    'oop': 'Object-Oriented Programming (Java / C++)',
    'ai-ml': 'Artificial Intelligence & Machine Learning',
    'data-science': 'Data Science & Analytics',
    'cybersecurity': 'Cybersecurity & Ethical Hacking',
    'os-networks': 'Operating Systems & Computer Networks',
    'mobile-dev': 'Mobile App Development (Flutter / React Native)'
  };
  return names[course] || course;
}

// Focus Mode Timer Functionality
let timerInterval;
let timeLeft = 25 * 60; // Default 25 minutes in seconds
let isRunning = false;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  if (!isRunning && timeLeft > 0) {
    isRunning = true;
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    resetTimerBtn.disabled = false;
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showCongratsView();
      }
    }, 1000);
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = false;
  // Hide congrats view and show timer view
  focusCongratsView.style.display = 'none';
  focusTimerView.style.display = 'block';
}

function setTimer(minutes) {
  if (!isRunning) {
    timeLeft = minutes * 60;
    updateTimerDisplay();
  }
}

function showCongratsView() {
  // Hide timer view and show congrats view
  focusTimerView.style.display = 'none';
  focusCongratsView.style.display = 'block';

  // Calculate completed time
  const initialTime = 25 * 60;
  const completedMinutes = Math.floor((initialTime - timeLeft) / 60);
  completedTime.textContent = `${completedMinutes} minutes`;

  // Reset timer state
  isRunning = false;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = false;
}

// Focus Mode Modal Management
function openFocusModal() {
  focusModal.style.display = 'block';
  resetTimer(); // Reset timer when opening modal
}

function closeFocusModal() {
  focusModal.style.display = 'none';
  pauseTimer();
}

// Focus Mode Modal Management
if (focusModeBtn) focusModeBtn.addEventListener('click', openFocusModal);
if (floatingFocusBtn) floatingFocusBtn.addEventListener('click', openFocusModal);
if (focusClose) focusClose.addEventListener('click', closeFocusModal);

window.addEventListener('click', (e) => {
  if (e.target === focusModal) {
    closeFocusModal();
  }
});

// Timer Event Listeners
startTimerBtn.addEventListener('click', startTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const minutes = parseInt(btn.dataset.minutes);
    setTimer(minutes);
  });
});

// Initialize timer display
updateTimerDisplay();

// Start New Session Button Event Listener
startNewSessionBtn.addEventListener('click', () => {
  // Hide congrats view and show timer view
  focusCongratsView.style.display = 'none';
  focusTimerView.style.display = 'block';
  resetTimer();
});



// Scroll to Top Button Functionality
const scrollToTopBtn = document.getElementById('scroll-to-top');

function toggleScrollToTopButton() {
  if (window.scrollY > 200) {
    scrollToTopBtn.classList.add('show');
  } else {
    scrollToTopBtn.classList.remove('show');
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Floating Focus Button Functionality
function toggleFloatingFocusButton() {
  if (window.scrollY > 300) {
    floatingFocusBtn.classList.add('show');
  } else {
    floatingFocusBtn.classList.remove('show');
  }
}

// Event listeners for scroll to top button
window.addEventListener('scroll', toggleScrollToTopButton);
scrollToTopBtn.addEventListener('click', scrollToTop);

});
