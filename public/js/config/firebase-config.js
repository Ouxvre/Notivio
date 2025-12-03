import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDaaG2zjtz_wb_ipEXbYmIWXQSPoySb5-g",
    authDomain: "notivio-id.firebaseapp.com",
    projectId: "notivio-id",
    storageBucket: "notivio-id.appspot.com",
    messagingSenderId: "1023764187526",
    appId: "1:1023764187526:web:618822fdffc023c9fa0407",
    measurementId: "G-ZGWF7WEZ95"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase v10 modular initialized.");
