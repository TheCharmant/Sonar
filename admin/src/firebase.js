// Import necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth to manage authentication

// Your Firebase configuration object (replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyC-Fh1dfuXRw3tm85G4DGUTdHuM023Ylsk",
  authDomain: "sonar-2025.firebaseapp.com",
  projectId: "sonar-2025",
  storageBucket: "sonar-2025.firebasestorage.app",
  messagingSenderId: "934904778488",
  appId: "1:934904778488:web:b00752ef24e5cb1a4af50d",
  measurementId: "G-08C8HLY9ZJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app); // This exports the 'auth' object that you can use in Login.jsx

// You can also export the app if needed (optional)
export { app };
