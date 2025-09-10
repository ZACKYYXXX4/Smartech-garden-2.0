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
const loadSampleBtn = document.getElementById("loadSampleBtn");

// ===== Render Card =====
function renderEbooks(data) {
  ebookList.innerHTML = ""; // reset

  if (!data || Object.keys(data).length === 0) {
    ebookList.innerHTML = "<p style='text-align:center;'>📭 Belum ada e-book tersedia.</p>";
    return;
  }

  // Kumpulkan semua tag unik untuk filter
  const tags = new Set();

  Object.entries(data).forEach(([id, ebook]) => {
    const { judul, penulis, deskripsi, link, tags: ebookTags = [] } = ebook;

    // Simpan tags ke Set
    ebookTags.forEach(tag => tags.add(tag));

    // Buat card
    const card = document.createElement("div");
    card.className = "ebook-card";
    card.innerHTML = `
      <h3>${judul}</h3>
      <p><b>✍️ Penulis:</b> ${penulis || "-"}</p>
      <p>${deskripsi || ""}</p>
      <div class="tag-list">
        ${ebookTags.map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <a href="${link}" target="_blank" class="nav-link">📖 Baca</a>
    `;
    ebookList.appendChild(card);
  });

  // Isi filter dropdown (kalau masih kosong aja biar ga dobel)
  if (tagFilter.options.length === 1) {
    tags.forEach(tag => {
      const opt = document.createElement("option");
      opt.value = tag;
      opt.textContent = tag;
      tagFilter.appendChild(opt);
    });
  }
}

// ===== Search & Filter =====
function applyFilter(data) {
  const query = searchInput.value.toLowerCase();
  const selectedTag = tagFilter.value;

  const filtered = {};
  Object.entries(data).forEach(([id, ebook]) => {
    const matchQuery =
      ebook.judul?.toLowerCase().includes(query) ||
      ebook.penulis?.toLowerCase().includes(query) ||
      ebook.deskripsi?.toLowerCase().includes(query);

    const matchTag = selectedTag === "all" || ebook.tags?.includes(selectedTag);

    if (matchQuery && matchTag) {
      filtered[id] = ebook;
    }
  });

  renderEbooks(filtered);
}

// ===== Ambil data dari Firebase =====
let ebookData = {};

const ebookRef = ref(db, "ebook"); // pastikan sesuai dengan nama node di DB
onValue(
  ebookRef,
  (snapshot) => {
    const data = snapshot.val();
    ebookData = data || {};
    renderEbooks(ebookData);
  },
  (error) => {
    console.error("Firebase error:", error);
    ebookList.innerHTML = `<p style="color:red; text-align:center;">❌ Error akses Firebase: ${error.message}</p>`;
  }
);

// ===== Event Listener =====
searchInput.addEventListener("input", () => applyFilter(ebookData));
tagFilter.addEventListener("change", () => applyFilter(ebookData));

// ===== Dummy Data Loader =====
if (loadSampleBtn) {
  loadSampleBtn.addEventListener("click", () => {
    const sample = {
      ebook1: {
        judul: "Panduan Menanam Tomat",
        penulis: "Zacky",
        deskripsi: "Tips menanam tomat dengan sistem hidroponik.",
        link: "https://example.com/tomat.pdf",
        tags: ["sayur", "hidroponik"]
      },
      ebook2: {
        judul: "Budidaya Cabai Rawit",
        penulis: "Ahmad",
        deskripsi: "Langkah-langkah sukses budidaya cabai rawit.",
        link: "https://example.com/cabai.pdf",
        tags: ["sayur", "organik"]
      }
    };
    ebookData = sample;
    renderEbooks(ebookData);
  });
}
