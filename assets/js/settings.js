import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  get, 
  update 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let currentUser = null;


// ==========================
// 🔥 LOAD SETTINGS (FIXED)
// ==========================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const snapshot = await get(ref(db, "users/" + user.uid));

  if (snapshot.exists()) {
    const data = snapshot.val();

    // notif
    const notif = data.settings?.notifications ?? true;
    document.getElementById("notifToggle").checked = notif;

    // dark mode
    const isDark = data.settings?.darkMode ?? false;
    document.getElementById("darkToggle").checked = isDark;

    // 🔥 APPLY KE UI
    applyDarkMode(isDark);
  } else {
    // fallback dari localStorage
    const isDark = localStorage.getItem("darkMode") === "true";
    applyDarkMode(isDark);
  }
});


// ==========================
// 🌙 APPLY DARK MODE (GLOBAL)
// ==========================
function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  // sync localStorage (BIAR SEMUA PAGE NGIKUT)
  localStorage.setItem("darkMode", isDark);
}


// ==========================
// ✏️ UPDATE NAME
// ==========================
window.updateName = async () => {
  const name = document.getElementById("nameInput").value;

  if (!name || !currentUser) return;

  await updateProfile(currentUser, {
    displayName: name
  });

  alert("Nama berhasil diubah!");
};


// ==========================
// 🔔 NOTIFICATION TOGGLE
// ==========================
document.getElementById("notifToggle").addEventListener("change", async (e) => {
  if (!currentUser) return;

  await update(ref(db, "users/" + currentUser.uid), {
    "settings/notifications": e.target.checked
  });
});


// ==========================
// 🌙 DARK MODE TOGGLE (FIXED)
// ==========================
document.getElementById("darkToggle").addEventListener("change", async (e) => {
  if (!currentUser) return;

  const isDark = e.target.checked;

  // 🔥 APPLY LANGSUNG
  applyDarkMode(isDark);

  // 🔥 SAVE KE FIREBASE
  await update(ref(db, "users/" + currentUser.uid), {
    "settings/darkMode": isDark
  });
});


// ==========================
// 🔥 RESET PROGRESS
// ==========================
window.resetProgress = async () => {
  if (!confirm("Yakin mau reset semua progress?")) return;

  await update(ref(db, "users/" + currentUser.uid), {
    xp: 0,
    level: 1,
    role: "🌱 Petani Pemula",
    quests: {
      active: {},
      completed: {}
    }
  });

  alert("Progress direset!");
};


// ==========================
// 🚪 LOGOUT
// ==========================
window.logout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};
