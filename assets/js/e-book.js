// ebook.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";

// init firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM
const listEl = document.getElementById("ebook-list");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");
const loadSampleBtn = document.getElementById("loadSampleBtn");

// helper toast (re-usable)
function showToast(message, type = "info", link = null) {
  const container = document.getElementById("notif-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="msg ${link ? "linkable" : ""}">${message}</span><span class="close-btn">&times;</span>`;
  if (link) {
    toast.querySelector(".msg").addEventListener("click", () => window.open(link, "_blank"));
    toast.style.cursor = "pointer";
  }
  toast.querySelector(".close-btn").addEventListener("click", () => { toast.classList.remove("show"); setTimeout(()=>toast.remove(),300); });
  container.appendChild(toast);
  setTimeout(()=>toast.classList.add("show"), 100);
  setTimeout(()=>{ if (toast.parentElement){ toast.classList.remove("show"); setTimeout(()=>toast.remove(),500); } }, 6000);
}

// expected DB node: "ebooks" -> each child: { title, author, coverUrl, fileUrl, tags: "tag1,tag2", description }
let ebooks = {}; // cache

function renderList(items){
  listEl.innerHTML = "";
  const query = (searchInput.value||"").toLowerCase().trim();
  const tag = tagFilter.value;

  const arr = Object.entries(items || {}).map(([id, val]) => ({ id, ...val }));
  const filtered = arr.filter(item => {
    if (query) {
      const hay = (item.title + " " + (item.author||"") + " " + (item.tags||"") + " " + (item.description||"")).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    if (tag) {
      const tags = (item.tags||"").split(",").map(t => t.trim().toLowerCase());
      if (!tags.includes(tag.toLowerCase())) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="card" style="padding:18px;text-align:center">Data e-book kosong. Coba <button class="btn" id="sampleBtnInline">load sample</button></div>`;
    const b = document.getElementById("sampleBtnInline");
    if (b) b.addEventListener("click", loadSampleData);
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "ebook-card";
    const cover = item.coverUrl || "https://via.placeholder.com/400x240?text=E-Book";
    card.innerHTML = `
      <div class="ebook-cover" style="background-image:url('${cover}')"></div>
      <div class="ebook-meta">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="author">by ${escapeHtml(item.author||"Unknown")}</p>
        <p class="desc">${escapeHtml(item.description || "")}</p>
        <div class="tag-list">${(item.tags||"").split(",").map(t=>t.trim()).filter(Boolean).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      </div>
      <div class="card-actions">
        <div>
          <button class="btn" data-id="${item.id}" data-file="${encodeURI(item.fileUrl||'')}">📥 Download</button>
          <button class="btn alt" data-preview="${item.fileUrl||''}">👁️ Preview</button>
        </div>
        <div style="font-size:.85rem;color:#33691e99">ID: ${item.id}</div>
      </div>
    `;
    listEl.appendChild(card);

    // events
    const dlBtn = card.querySelector("button[data-id]");
    dlBtn && dlBtn.addEventListener("click", (e) => {
      const file = e.currentTarget.dataset.file;
      if (!file) { showToast("File tidak tersedia", "warning"); return; }
      window.open(file, "_blank");
    });
    const pvBtn = card.querySelector("button[data-preview]");
    pvBtn && pvBtn.addEventListener("click", (e) => {
      const file = e.currentTarget.dataset.preview;
      if (!file) { showToast("Preview tidak tersedia", "warning"); return; }
      window.open(file, "_blank");
    });
  });
}

function escapeHtml(s){
  if(!s) return "";
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// populate tags select
function refreshTags(items){
  const set = new Set();
  Object.values(items||{}).forEach(it=>{
    (it.tags||"").split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>set.add(t));
  });
  // clear and add
  tagFilter.innerHTML = `<option value="">Semua tag</option>` + Array.from(set).map(t=>`<option value="${t}">${t}</option>`).join("");
}

// firebase listener
try {
  const ebooksRef = ref(db, "ebooks");
  onValue(ebooksRef, (snap)=>{
    const val = snap.val();
    if (!val) {
      // data null -> maybe rules prevent read
      showToast("Gagal ambil data e-book (null). Cek rules atau isi data di DB.", "error");
      ebooks = {};
      renderList(ebooks);
      return;
    }
    ebooks = val;
    refreshTags(ebooks);
    renderList(ebooks);
    showToast("E-book berhasil dimuat", "info");
  }, (err) => {
    console.error("firebase onValue error:", err);
    showToast("Error akses Firebase: " + (err?.message || "check console"), "error");
    renderList({});
  });
} catch (e) {
  console.error(e);
  showToast("Error inisialisasi Firebase. Lihat console", "error");
  renderList({});
}

// UI events
searchInput.addEventListener("input", ()=> renderList(ebooks));
tagFilter.addEventListener("change", ()=> renderList(ebooks));
loadSampleBtn.addEventListener("click", loadSampleData);

function loadSampleData(){
  const sample = {
    "ebook-1": {
      title: "Panduan Hidroponik untuk Pemula",
      author: "Smartech Team",
      coverUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=60&auto=format&fit=crop",
      fileUrl: "https://example.com/ebook/hidroponik.pdf",
      tags: "hidroponik,pemula",
      description: "Belajar hidroponik dari nol sampai panen."
    },
    "ebook-2": {
      title: "Perawatan Tanaman Organik",
      author: "Zack",
      coverUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60&auto=format&fit=crop",
      fileUrl: "https://example.com/ebook/organik.pdf",
      tags: "organik,perawatan",
      description: "Teknik organik dan pemupukan alami."
    }
  };
  ebooks = sample;
  refreshTags(ebooks);
  renderList(ebooks);
  showToast("Sample e-book dimuat untuk testing", "info", "https://zackcode46.github.io/portfolioweb/");
}
