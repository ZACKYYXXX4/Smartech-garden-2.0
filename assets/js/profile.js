import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let currentUser = null;

// ==========================
// 🔥 LOAD USER PROFILE
// ==========================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    document.getElementById("userName").innerText = user.displayName || "User";
    document.getElementById("userEmail").innerText = user.email;
    document.getElementById("userPhoto").src =
      user.photoURL || "https://via.placeholder.com/150";

    const snapshot = await get(ref(db, "users/" + user.uid));

    if (snapshot.exists()) {
      const data = snapshot.val();

      // ===== BASIC =====
      document.getElementById("userDesc").innerText =
        data.deskripsi || "Belum ada deskripsi";

      document.getElementById("userRole").innerText =
        data.role || "🌱 Petani Pemula";

      document.getElementById("userLevel").innerText =
        "Level: " + (data.level || 1);

      document.getElementById("userXP").innerText =
        "XP: " + (data.xp || 0);

      updateXPBar(data.xp || 0);

      // ===== QUEST =====
      renderActive(data.quests?.active || {});
      renderCompleted(data.quests?.completed || {});
    } else {
      document.getElementById("userDesc").innerText = "Belum ada deskripsi";
    }
  } else {
    alert("Belum login!");
    window.location.href = "login.html";
  }
});


// ==========================
// 🔥 XP BAR
// ==========================
function updateXPBar(xp) {
  const percent = xp % 100;
  document.getElementById("xpFill").style.width = percent + "%";
}


// ==========================
// ✏️ EDIT DESKRIPSI
// ==========================
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const descText = document.getElementById("userDesc");
const descInput = document.getElementById("descInput");

editBtn.onclick = () => {
  descInput.value = descText.innerText;

  descText.style.display = "none";
  descInput.style.display = "block";

  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
};

saveBtn.onclick = async () => {
  const newDesc = descInput.value;

  if (!currentUser) return;

  await update(ref(db, "users/" + currentUser.uid), {
    deskripsi: newDesc
  });

  descText.innerText = newDesc;

  descText.style.display = "block";
  descInput.style.display = "none";

  editBtn.style.display = "inline-block";
  saveBtn.style.display = "none";
};


// ==========================
// 🌱 QUEST AKTIF
// ==========================
function renderActive(active) {
  const container = document.getElementById("activePlants");
  container.innerHTML = "";

  if (Object.keys(active).length === 0) {
    container.innerHTML = "<p>Tidak ada tanaman aktif</p>";
    return;
  }

  Object.keys(active).forEach(id => {
    const q = active[id];

    const div = document.createElement("div");
    div.className = "plant-item active";

    div.innerHTML = `
      <h4>${q.plantId}</h4>
      <p>Status: ${q.status}</p>
      <p>Progress: ${q.progress || 0}%</p>
    `;

    container.appendChild(div);
  });
}


// ==========================
// ✅ QUEST SELESAI
// ==========================
function renderCompleted(completed) {
  const container = document.getElementById("completedPlants");
  container.innerHTML = "";

  if (Object.keys(completed).length === 0) {
    container.innerHTML = "<p>Belum ada tanaman selesai</p>";
    return;
  }

  Object.keys(completed).forEach(id => {
    const q = completed[id];

    const div = document.createElement("div");
    div.className = "plant-item done";

    div.innerHTML = `
      <h4>${q.plantId}</h4>
      <p>✔ Selesai</p>
      <p>XP: ${q.xpGained || 0}</p>
    `;

    container.appendChild(div);
  });
}
