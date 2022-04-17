import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database";

import * as fb2 from "firebase/app";

import { getAuth, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfouSpK_vDGaapu-1o7AJ4i0DbHvOLjfg",
  authDomain: "spoton-1fb20.firebaseapp.com",
  projectId: "spoton-1fb20",
  storageBucket: "spoton-1fb20.appspot.com",
  messagingSenderId: "553671254858",
  appId: "1:553671254858:web:af74c1b2237d9ebeb897b3",
  measurementId: "G-2K91H411J4",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

const realtimeDb = firebaseApp.database();

export { auth, db, realtimeDb };
