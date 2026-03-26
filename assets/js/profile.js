import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let currentUser = null;

// Load user profile
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

      const desc = data.deskripsi || "Belum ada deskripsi";

      document.getElementById("userDesc").innerText = desc;
      document.getElementById("userRole").innerText = data.role || "Beginner";

      renderPlants(data.plants || []);
    } else {
      document.getElementById("userDesc").innerText = "Belum ada deskripsi";
    }
  } else {
    alert("Belum login!");
    window.location.href = "login.html";
  }
});


// ==========================
// ✏️ EDIT DESKRIPSI
// ==========================

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const descText = document.getElementById("userDesc");
const descInput = document.getElementById("descInput");

// Klik EDIT
editBtn.onclick = () => {
  descInput.value = descText.innerText;

  descText.style.display = "none";
  descInput.style.display = "block";

  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
};

// Klik SIMPAN
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
// 🌱 RENDER TANAMAN
// ==========================

function renderPlants(plants) {
  const container = document.getElementById("userPlants");
  container.innerHTML = "";

  if (plants.length === 0) {
    container.innerHTML = "<p>Tidak ada tanaman</p>";
    return;
  }

  plants.forEach(p => {
    const div = document.createElement("div");
    div.className = "plant-item";
    div.innerText = p;
    container.appendChild(div);
  });
}
