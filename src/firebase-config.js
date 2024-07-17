// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, updateProfile} from 'firebase/auth';
import {getFirestore, doc, setDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBD342sFYKfjQ1UDeSecmghjolH5uYZA1s",
  authDomain: "unimatchup-backup.firebaseapp.com",
  projectId: "unimatchup-backup",
  storageBucket: "unimatchup-backup.appspot.com",
  messagingSenderId: "368121686458",
  appId: "1:368121686458:web:49de40e02bc2bd3cc91583",
  measurementId: "G-2M9XTDEFZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

//Firestore
const database = getFirestore(app);
export { auth, database}