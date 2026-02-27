import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCglyscAoGWbGlmfWE2_H4ZCOPx8kEePPE",
  authDomain: "tutorai-65455.firebaseapp.com",
  projectId: "tutorai-65455",
  storageBucket: "tutorai-65455.firebasestorage.app",
  messagingSenderId: "683176139271",
  appId: "1:683176139271:web:cc9eec74d96fbc945a28a2"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
