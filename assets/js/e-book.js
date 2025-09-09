import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const plantListEl = document.getElementById("plant-list");
const searchInput = document.getElementById("searchPlant");

// Fungsi render kartu tanaman
function renderPlantCard(plant) {
    const card = document.createElement("div");
    card.className = "plant-card";
    card.innerHTML = `
        <img src="${plant.gambar}" alt="${plant.nama}">
        <h3>${plant.nama}</h3>
        <p>Jenis: ${plant.jenis}</p>
        <p>${plant.deskripsi}</p>
        <p><strong>Perawatan:</strong> ${plant.perawatan}</p>
    `;
    return card;
}

// Ambil data dari Firebase
const plantsRef = ref(db, "e-book"); // pastikan sama seperti di database
onValue(plantsRef, (snapshot) => {
    const data = snapshot.val();
    plantListEl.innerHTML = ""; // reset dulu
    if(data) {
        Object.values(data).forEach(plant => {
            plantListEl.appendChild(renderPlantCard(plant));
        });
    } else {
        plantListEl.innerHTML = "<p>Data tanaman tidak tersedia.</p>";
    }
});

// Search filter
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const cards = plantListEl.querySelectorAll(".plant-card");
    cards.forEach(card => {
        const name = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = name.includes(query) ? "block" : "none";
    });
});
