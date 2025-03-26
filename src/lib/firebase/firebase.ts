
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCdflWEvUffx9_oFUevPSl4IXnLO_uG9s",
  authDomain: "verses2-f2526.firebaseapp.com",
  databaseURL: "https://verses2-f2526-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "verses2-f2526",
  storageBucket: "verses2-f2526.firebasestorage.app",
  messagingSenderId: "1004664117130",
  appId: "1:1004664117130:web:6a3473a6bbc9e1bfd41a73",
  measurementId: "G-KH2XMHFFHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, firestore, database, storage, analytics };
