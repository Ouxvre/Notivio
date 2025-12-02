// For Firebase JS SDK v7.20.0 and later, measurementId is optional const
firebaseConfig = {
    apiKey: "AIzaSyDaaG2zjtz_wb_ipEXbYmIWXQSPoySb5-g",
    authDomain: "notivio-id.firebaseapp.com", projectId: "notivio-id",
    storageBucket: "notivio-id.firebasestorage.app", messagingSenderId:
        "1023764187526", appId: "1:1023764187526:web:618822fdffc023c9fa0407",
    measurementId: "G-ZGWF7WEZ95"
};

firebase.initializeApp(firebaseConfig);

//Export firebase config

const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase Initialized successfully");