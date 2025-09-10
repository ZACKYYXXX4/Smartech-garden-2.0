import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Import config Firebase lo
import { firebaseConfig } from "./firebase_config.js";

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ambil data tanaman dari Firebase (node: "e-book")
async function loadPlants() {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, "e-book"));
    if (snapshot.exists()) {
      return snapshot.val(); // hasil array
    } else {
      console.warn("❌ Tidak ada data di Firebase");
      return [];
    }
  } catch (error) {
    console.error("🔥 Error ambil data:", error);
    return [];
  }
}

// Render data tanaman ke halaman
function renderPlants(plants) {
  const list = document.getElementById("ebookList");
  list.innerHTML = "";

  if (!plants || plants.length === 0) {
    list.innerHTML = "<p style='text-align:center;'>❌ Tidak ada tanaman ditemukan</p>";
    return;
  }

  plants.forEach(plant => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${plant.gambar}" alt="${plant.nama}">
      <h3>${plant.nama}</h3>
      <p class="jenis">Jenis: ${plant.jenis}</p>
      <p><strong>Deskripsi:</strong> ${plant.deskripsi}</p>
      <p><strong>Perawatan:</strong> ${plant.perawatan}</p>
    `;
    list.appendChild(card);
  });
}

// Search filter
function setupSearch(plants) {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = plants.filter(plant =>
      plant.nama.toLowerCase().includes(keyword) ||
      plant.jenis.toLowerCase().includes(keyword)
    );
    renderPlants(filtered);
  });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  const plants = await loadPlants();
  renderPlants(plants);
  setupSearch(plants);
});
