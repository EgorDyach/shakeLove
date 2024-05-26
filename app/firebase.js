// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBP-UVIDNdne3Uef8J3jro2sgTkPY3dokM",
    authDomain: "shakelove-8d5c7.firebaseapp.com",
    projectId: "shakelove-8d5c7",
    storageBucket: "shakelove-8d5c7.appspot.com",
    messagingSenderId: "596256988429",
    appId: "1:596256988429:web:f21e2037c042eb04c86444"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
