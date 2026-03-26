import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let plants = [];
let selectedPlant = null;

// LOAD DATA TANAMAN
async function loadPlants() {
  const snapshot = await get(ref(db, "e-book"));
  plants = snapshot.val() || [];
  renderPlants(plants);
}
loadPlants();

// RENDER
function renderPlants(data) {
  const list = document.getElementById("plantList");
  list.innerHTML = "";

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "plant-card";
    card.innerHTML = `
      <img src="${p.gambar}">
      <h4>${p.nama}</h4>
    `;

    card.onclick = () => showDetail(p);
    list.appendChild(card);
  });
}

// SEARCH
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = plants.filter(p =>
    p.nama.toLowerCase().includes(keyword)
  );
  renderPlants(filtered);
});

// DETAIL
function showDetail(p) {
  selectedPlant = p;

  document.getElementById("detailBox").classList.remove("hidden");
  document.getElementById("detailImg").src = p.gambar;
  document.getElementById("detailNama").innerText = p.nama;
  document.getElementById("detailDesc").innerText = p.deskripsi;
  document.getElementById("detailCare").innerText = p.perawatan;
}

// START QUEST
document.getElementById("startBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user || !selectedPlant) return;

  await update(ref(db, "users/" + user.uid), {
    currentQuest: {
      nama: selectedPlant.nama,
      status: "berjalan",
      start: Date.now()
    }
  });

  alert("🌱 Quest dimulai!");
};

// BLUETOOTH
window.connectBluetooth = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true
    });
    alert("Connected ke " + device.name);
  } catch (e) {
    console.log(e);
  }
};

// ================= AI IMAGE =================

// ANALISA GAMBAR (SIMPLE COLOR DETECTION)
window.analyzeImage = () => {
  const file = document.getElementById("cameraInput").files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let green = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (g > r && g > b) green++;
    }

    const result = green > 5000 ? "🌿 Tanaman sehat" : "⚠️ Tanaman kurang sehat";

    document.getElementById("aiResult").innerText = result;

    giveXP(result);
  };
};

// XP SYSTEM
async function giveXP(result) {
  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await get(ref(db, "users/" + user.uid));
  const data = snapshot.val();

  let xp = data.xp || 0;

  xp += result.includes("sehat") ? 50 : 20;

  let level = Math.floor(xp / 50) + 1;

  const roles = [
    "Petani Pemula",
    "Petani Perintis",
    "Petani Nyawit",
    "Sultan Sawit",
    "Juragan Sawit"
  ];

  await update(ref(db, "users/" + user.uid), {
    xp,
    level,
    role: roles[level - 1] || "Juragan Sawit"
  });
}
