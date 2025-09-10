// ===== Import Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js"; 

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== Elemen HTML =====
const ebookList = document.getElementById("ebook-list");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");

// ===== Render Card sesuai struktur =====
function renderEbooks(data) {
  ebookList.innerHTML = ""; // reset

  if (!data || Object.keys(data).length === 0) {
    ebookList.innerHTML = "<p style='text-align:center;'>📭 Belum ada e-book tersedia.</p>";
    return;
  }

  // Kumpulkan semua jenis untuk filter
  const jenisSet = new Set();

  Object.entries(data).forEach(([id, ebook]) => {
    const { nama, jenis, deskripsi, gambar, perawatan } = ebook;

    // Tambahin jenis ke filter
    if (jenis) jenisSet.add(jenis);

    // Buat card
    const card = document.createElement("div");
    card.className = "ebook-card";
    card.innerHTML = `
      <img src="${gambar}" alt="${nama}" class="ebook-img">
      <h3>${nama}</h3>
      <p><b>Jenis:</b> ${jenis || "-"}</p>
      <p>${deskripsi || ""}</p>
      <p><b>Perawatan:</b> ${perawatan || ""}</p>
    `;
    ebookList.appendChild(card);
  });

  // Isi filter dropdown (kalau masih kosong aja biar ga dobel)
  if (tagFilter.options.length === 1) {
    jenisSet.forEach(jenis => {
      const opt = document.createElement("option");
      opt.value = jenis;
      opt.textContent = jenis;
      tagFilter.appendChild(opt);
    });
  }
}

// ===== Search & Filter =====
function applyFilter(data) {
  const query = searchInput.value.toLowerCase();
  const selectedJenis = tagFilter.value;

  const filtered = {};
  Object.entries(data).forEach(([id, ebook]) => {
    const { nama, jenis, deskripsi, perawatan } = ebook;

    const matchQuery =
      nama.toLowerCase().includes(query) ||
      deskripsi.toLowerCase().includes(query) ||
      (perawatan && perawatan.toLowerCase().includes(query));

    const matchJenis = selectedJenis === "all" || jenis === selectedJenis;

    if (matchQuery && matchJenis) {
      filtered[id] = ebook;
    }
  });

  renderEbooks(filtered);
}

// ===== Listener ke Firebase =====
const ebookRef = ref(db, "ebook");
let ebookData = {};

onValue(ebookRef, (snapshot) => {
  ebookData = snapshot.val() || {};
  renderEbooks(ebookData);
});

// ===== Event Listener =====
searchInput.addEventListener("input", () => applyFilter(ebookData));
tagFilter.addEventListener("change", () => applyFilter(ebookData));
