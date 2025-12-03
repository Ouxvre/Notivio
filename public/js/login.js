// DOM Elements
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');

const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

// Toggle to Register Page
showRegisterBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    document.title = "Notivio - Sign Up";
});

// Toggle to Login Page
showLoginBtn.addEventListener('click', () => {
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    document.title = "Notivio - Sign In";
});

console.log("login.js UI logic loaded");
