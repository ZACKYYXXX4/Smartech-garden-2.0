// ===== Import Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";

// ===== Inisialisasi Firebase =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== HTML Elements =====
const plantListEl = document.getElementById("plant-list");
const searchInput = document.getElementById("searchPlant");

// ===== Fungsi buat render card tanaman =====
function renderPlantCard(plant) {
    const card = document.createElement("div");
    card.className = "plant-card";

    card.innerHTML = `
        <img src="${plant.gambar}" alt="${plant.nama}">
        <div class="plant-info">
            <h3>${plant.nama}</h3>
            <p><strong>Jenis:</strong> ${plant.jenis}</p>
            <p>${plant.deskripsi}</p>
            <p><strong>Perawatan:</strong> ${plant.perawatan}</p>
        </div>
    `;
    return card;
}

// ===== Ambil data e-book dari Firebase =====
const plantsRef = ref(db, "e-book");
onValue(plantsRef, (snapshot) => {
    const data = snapshot.val();
    plantListEl.innerHTML = ""; // reset

    if (data && data.length > 0) {
        data.forEach(plant => {
            plantListEl.appendChild(renderPlantCard(plant));
        });
    } else {
        plantListEl.innerHTML = "<p class='no-data'>Data tanaman tidak tersedia.</p>";
    }
});

// ===== Search filter =====
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const cards = plantListEl.querySelectorAll(".plant-card");

    cards.forEach(card => {
        const name = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = name.includes(query) ? "block" : "none";
    });
});

// ===== Optional: Toast Notification =====
function showToast(message, type = "info") {
    const container = document.getElementById("notif-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="msg">${message}</span>
        <span class="close-btn">&times;</span>
    `;
    toast.querySelector(".close-btn").addEventListener("click", () => {
        toast.remove();
    });
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ===== Contoh notifikasi saat halaman siap =====
document.addEventListener("DOMContentLoaded", () => {
    showToast("📚 E-Book siap digunakan!", "info");
});
