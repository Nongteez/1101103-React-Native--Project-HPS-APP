// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore'
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/compat/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmRj0IOGmAstEl8bYwian6bCPA7kuBZmE",
  authDomain: "app1101103.firebaseapp.com",
  projectId: "app1101103",
  storageBucket: "app1101103.appspot.com",
  messagingSenderId: "554912752422",
  appId: "1:554912752422:web:77a6b5ec8e2468e1ea57e7",
  measurementId: "G-2BCLC0BSF2"
};



if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig)
}
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const firestore = firebase.firestore();

export {firebase, app, analytics, auth, db,firestore,  };
