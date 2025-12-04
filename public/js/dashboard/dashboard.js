import { auth, db } from "/js/config/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// State
let currentUser = null;
let interviews = [];
let unsubscribe = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const addInterviewForm = document.getElementById('addInterviewForm');
const interviewList = document.getElementById('interviewList');
const interviewCount = document.getElementById('interviewCount');
const notificationToast = document.getElementById('notificationToast');
const toastMessage = document.getElementById('toastMessage');

// --- Authentication ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userNameSpan.textContent = user.displayName || user.email;
        initDashboard();
    } else {
        // Redirect to login if not authenticated
        window.location.href = '/pages/login/login.html';
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '/pages/login/login.html';
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
});

// --- Dashboard Logic ---

function initDashboard() {
    // Request Notification Permission for "IoT" alerts
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    // Load Interviews
    const q = query(
        collection(db, `users/${currentUser.uid}/interviews`),
        orderBy("scheduledAt", "asc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        interviews = [];
        interviewList.innerHTML = '';

        snapshot.forEach((doc) => {
            interviews.push({ id: doc.id, ...doc.data() });
        });

        updateInterviewListUI();
        updateCount();
    });

    // Start "IoT Sensor"
    startIoTSensor();
}

// --- Add Interview ---

addInterviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('candidateName').value;
    const position = document.getElementById('position').value;
    const date = document.getElementById('interviewDate').value;
    const time = document.getElementById('interviewTime').value;
    const whatsapp = document.getElementById('whatsappNumber').value;

    // Create timestamp
    const scheduledAt = new Date(`${date}T${time}`);

    try {
        await addDoc(collection(db, `users/${currentUser.uid}/interviews`), {
            candidateName: name,
            position: position,
            whatsappNumber: whatsapp,
            scheduledAt: scheduledAt.toISOString(), // Store as ISO string for easier parsing
            notified: false,
            createdAt: serverTimestamp()
        });

        addInterviewForm.reset();
        showToast("Interview scheduled successfully!", "success");

    } catch (error) {
        console.error("Error adding interview: ", error);
        showToast("Error scheduling interview.", "error");
    }
});

// --- UI Updates ---

function updateInterviewListUI() {
    if (interviews.length === 0) {
        interviewList.innerHTML = `
            <div class="p-12 text-center text-muted-foreground">
                <p class="text-sm">No upcoming interviews scheduled.</p>
            </div>
        `;
        return;
    }

    interviewList.innerHTML = interviews.map(interview => {
        const dateObj = new Date(interview.scheduledAt);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const statusBadge = interview.notified ?
            `<div class="inline-flex items-center rounded-full border border-transparent bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                Notified
            </div>` :
            `<div class="inline-flex items-center rounded-full border border-transparent bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                Pending
            </div>`;

        return `
            <div class="flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors group">
                <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        ${interview.candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-medium leading-none">${interview.candidateName}</p>
                        <p class="text-xs text-muted-foreground mt-1">${interview.position}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-6">
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-medium leading-none">${timeStr}</p>
                        <p class="text-xs text-muted-foreground mt-1">${dateStr}</p>
                    </div>
                    ${statusBadge}
                    <button onclick="deleteInterview('${interview.id}')" class="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

function updateCount() {
    // Update Stats
    const total = interviews.length;
    const notified = interviews.filter(i => i.notified).length;
    const pending = total - notified;

    // Safely update elements if they exist
    const statTotal = document.getElementById('statTotal');
    const statPending = document.getElementById('statPending');
    const statNotified = document.getElementById('statNotified');

    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statNotified) statNotified.textContent = notified;

    // Also update the original count if it still exists (optional)
    if (interviewCount) interviewCount.textContent = total;
}

// Expose delete function to window
window.deleteInterview = async (id) => {
    if (confirm('Are you sure you want to delete this interview?')) {
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/interviews`, id));
            showToast("Interview deleted.", "success");
        } catch (error) {
            console.error("Error deleting: ", error);
        }
    }
}

// --- IoT Sensor Logic (The Core Feature) ---

function startIoTSensor() {
    // Check every 10 seconds
    setInterval(() => {
        const now = new Date();

        interviews.forEach(async (interview) => {
            if (interview.notified) return; // Already notified

            const scheduledTime = new Date(interview.scheduledAt);
            const timeDiff = scheduledTime - now;
            const minutesDiff = timeDiff / (1000 * 60);

            // Logic: If time is within 30 minutes AND in the future
            if (minutesDiff <= 30 && minutesDiff > 0) {

                // 1. Trigger System Notification
                triggerNotification(interview);

                // 2. Update Firestore
                try {
                    await updateDoc(doc(db, `users/${currentUser.uid}/interviews`, interview.id), {
                        notified: true
                    });
                } catch (err) {
                    console.error("Error updating notification status:", err);
                }

                // 3. Send WhatsApp (Simulated by opening link)
                sendWhatsApp(interview);
            }
        });

    }, 10000); // 10 seconds interval
}

function triggerNotification(interview) {
    // Browser Notification
    if (Notification.permission === "granted") {
        new Notification("Interview Reminder", {
            body: `Upcoming interview with ${interview.candidateName} in 30 minutes!`,
            icon: "/assets/logo.png" // Optional
        });
    }

    // In-App Toast
    showToast(`Reminder: Interview with ${interview.candidateName} is starting soon!`, "success");
}

function sendWhatsApp(interview) {
    const message = `Hello ${interview.candidateName}, this is a reminder for your interview for the ${interview.position} position at Notivio. It is scheduled in 30 minutes. Please be ready.`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${interview.whatsappNumber}?text=${encodedMessage}`;

    // Open in new tab
    window.open(url, '_blank');
}

// --- Utilities ---

function showToast(message, type = "success") {
    toastMessage.textContent = message;
    notificationToast.classList.remove('translate-y-full');

    // Auto hide after 3s
    setTimeout(() => {
        notificationToast.classList.add('translate-y-full');
    }, 3000);
}
