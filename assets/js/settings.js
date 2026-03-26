import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  get, 
  update, 
  remove 
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
// LOAD SETTINGS
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

    document.getElementById("notifToggle").checked =
      data.settings?.notifications ?? true;

    document.getElementById("darkToggle").checked =
      data.settings?.darkMode ?? false;
  }
});


// ==========================
// UPDATE NAME
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
// TOGGLE SETTINGS
// ==========================
document.getElementById("notifToggle").onchange = async (e) => {
  await update(ref(db, "users/" + currentUser.uid), {
    "settings/notifications": e.target.checked
  });
};

document.getElementById("darkToggle").onchange = async (e) => {
  await update(ref(db, "users/" + currentUser.uid), {
    "settings/darkMode": e.target.checked
  });
};


// ==========================
// RESET PROGRESS
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
// LOGOUT
// ==========================
window.logout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};
