import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Load user profile
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("userName").innerText = user.displayName || "User";
    document.getElementById("userEmail").innerText = user.email;
    document.getElementById("userPhoto").src = user.photoURL || "https://via.placeholder.com/150";

    // Ambil data tambahan dari database
    const snapshot = await get(ref(db, "users/" + user.uid));

    if (snapshot.exists()) {
      const data = snapshot.val();

      document.getElementById("userDesc").innerText = data.deskripsi || "Belum ada deskripsi";
      document.getElementById("userRole").innerText = data.role || "Beginner";

      renderPlants(data.plants || []);
    }
  } else {
    alert("Belum login!");
    window.location.href = "login.html";
  }
});

// Render tanaman user
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
