// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8c112KnJUksZmQwloe8w0iPk2slnPJUo",
  authDomain: "sonar-3e6d1.firebaseapp.com",
  projectId: "sonar-3e6d1",
  storageBucket: "sonar-3e6d1.firebasestorage.app",
  messagingSenderId: "570710500919",
  appId: "1:570710500919:web:edc8834407458bd0be41b2",
  measurementId: "G-K4P3SGS9RC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);