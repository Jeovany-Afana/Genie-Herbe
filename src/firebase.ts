// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAMaxFR6VpG98Y5w7kdp82CHGxFrlyb_8k",
    authDomain: "admin-competitions.firebaseapp.com",
    projectId: "admin-competitions",
    storageBucket: "admin-competitions.firebasestorage.app",
    messagingSenderId: "614912504926",
    appId: "1:614912504926:web:56bb5333206fc1106630cf",
    measurementId: "G-XSP2S8YBER"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
