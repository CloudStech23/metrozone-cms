// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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


export { db, storage };