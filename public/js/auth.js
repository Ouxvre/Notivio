// Linear-Style Auth Logic

// DOM Elements
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

// Toggle Views
showRegisterBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    document.title = 'Notivio - Sign Up';
});

showLoginBtn.addEventListener('click', () => {
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    document.title = 'Notivio - Sign In';
});

// Helper to show errors (can be improved with a custom toast)
function showError(message) {
    alert(message);
}

// Firebase Auth Logic
// Note: 'auth' is initialized in firebase-config.js

// Sign Up
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Update profile and save to Firestore
            const profileUpdate = user.updateProfile({
                displayName: name
            });

            const firestoreSave = db.collection('users').doc(user.uid).set({
                fullName: name,
                email: email,
                phoneNumber: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return Promise.all([profileUpdate, firestoreSave])
                .then(() => {
                    console.log('User registered and data saved:', user);
                    alert('Registration successful! Please log in.');

                    // Switch to Login View
                    registerView.classList.add('hidden');
                    loginView.classList.remove('hidden');
                    document.title = 'Notivio - Sign In';

                    // Reset form
                    registerForm.reset();
                });
        })
        .catch((error) => {
            showError(error.message);
        });
});

// Sign In
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user);
            window.location.href = '../../index.html';
        })
        .catch((error) => {
            showError(error.message);
        });
});

// Google Sign In (Handlers for both buttons)
const handleGoogleSignIn = (e) => {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('Google sign in success:', result.user);
            window.location.href = '../../index.html';
        }).catch((error) => {
            showError(error.message);
        });
};

document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleSignIn);
document.getElementById('googleRegisterBtn').addEventListener('click', handleGoogleSignIn);
