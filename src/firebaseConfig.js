// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSLAdyTpA2wpMn2znpfNSzJgSsvgmk8fY",
    authDomain: "metrozone-csr.firebaseapp.com",
    projectId: "metrozone-csr",
    storageBucket: "metrozone-csr.appspot.com",
    messagingSenderId: "644891710232",
    appId: "1:644891710232:web:b293ead8d9b53ade55846d",
    measurementId: "G-YX7QS641BY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
