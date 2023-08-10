// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSToI0wVSrAzft3c8EHM99jkn7PCoCzqE",
  authDomain: "twitter-clone-695cb.firebaseapp.com",
  projectId: "twitter-clone-695cb",
  storageBucket: "twitter-clone-695cb.appspot.com",
  messagingSenderId: "533095311450",
  appId: "1:533095311450:web:bcbe96f9906014c2e29063",
  measurementId: "G-ML7Q87MV98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

if (app.name && typeof window !== 'undefined') {
    const analytics = getAnalytics(app);
}
//const analytics = getAnalytics(app);

export const storage = getStorage(app);