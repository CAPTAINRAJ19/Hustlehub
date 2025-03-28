import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBRm3LihgVNB0DvAiQlWOkemHZzOspcQMc",
  authDomain: "hustlehub-daa03.firebaseapp.com",
  projectId: "hustlehub-daa03",
  storageBucket: "hustlehub-daa03.appspot.com",
  messagingSenderId: "967580487335",
  appId: "1:967580487335:web:432d0017f1d94ee7935582",
  measurementId: "G-NDSZLEQTHW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // Initialize Firestore

export default app;
