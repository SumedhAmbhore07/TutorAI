// Firebase configuration and authentication for TutorAI

// Import Firebase SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCglyscAoGWbGlmfWE2_H4ZCOPx8kEePPE",
  authDomain: "tutorai-65455.firebaseapp.com",
  projectId: "tutorai-65455",
  storageBucket: "tutorai-65455.firebasestorage.app",
  messagingSenderId: "683176139271",
  appId: "1:683176139271:web:cc9eec74d96fbc945a28a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Authentication functions
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User logged in:', user.displayName);

    // Save user info to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date()
    });

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (user) {
    // User is signed in
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    console.log('User is signed in:', user.displayName);
  } else {
    // User is signed out
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    console.log('User is signed out');
  }
});

// Export functions for use in script.js
export { loginWithGoogle, logoutUser, auth, db };
