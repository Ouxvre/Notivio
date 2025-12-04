import { auth, db } from "/js/config/firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Register
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Save profile to Firestore
        await setDoc(doc(db, "users", user.uid), {
            fullName: name,
            email,
            phoneNumber: phone,
            createdAt: serverTimestamp()
        });

        registerForm.reset();

        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');

    } catch (err) {
        alert(err.message);
    }
});

// Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = '/pages/dashboard/dashboard.html';

    } catch (err) {
        alert(err.message);
    }
});

// Google Sign-in
const provider = new GoogleAuthProvider();

function googleSignIn(e) {
    e.preventDefault();
    signInWithPopup(auth, provider)
        .then(() => {
            window.location.href = '/pages/dashboard/dashboard.html';
        })
        .catch((err) => alert(err.message));
}

document.getElementById('googleLoginBtn').addEventListener('click', googleSignIn);
document.getElementById('googleRegisterBtn').addEventListener('click', googleSignIn);
