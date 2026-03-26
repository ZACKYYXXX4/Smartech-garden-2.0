import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, update, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let plants = [];
let selectedPlant = null;

// ==========================
// 🌱 LOAD DATA TANAMAN
// ==========================
async function loadPlants() {
  const snapshot = await get(ref(db, "e-book"));
  plants = snapshot.val() || [];
  renderPlants(plants);
}
loadPlants();

// ==========================
// 🎨 RENDER TANAMAN
// ==========================
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

// ==========================
// 🔍 SEARCH
// ==========================
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = plants.filter(p =>
    p.nama.toLowerCase().includes(keyword)
  );
  renderPlants(filtered);
});

// ==========================
// 📄 DETAIL TANAMAN
// ==========================
function showDetail(p) {
  selectedPlant = p;

  document.getElementById("detailBox").classList.remove("hidden");
  document.getElementById("detailImg").src = p.gambar;
  document.getElementById("detailNama").innerText = p.nama;
  document.getElementById("detailDesc").innerText = p.deskripsi;
  document.getElementById("detailCare").innerText = p.perawatan;
}

// ==========================
// 🚀 START QUEST (FIXED)
// ==========================
document.getElementById("startBtn").onclick = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Login dulu!");
    return;
  }

  if (!selectedPlant) {
    alert("Pilih tanaman dulu!");
    return;
  }

  const questRef = ref(db, "users/" + user.uid + "/quests/active");

  const newQuest = {
    plantId: selectedPlant.nama,
    status: "berjalan",
    progress: 0,
    start: Date.now()
  };

  await push(questRef, newQuest);

  alert("🌱 Quest dimulai!");

  // 🔥 optional: langsung ke profile
  window.location.href = "profile.html";
};

// ==========================
// 🔵 BLUETOOTH
// ==========================
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

// ==========================
// 🤖 AI IMAGE
// ==========================
window.analyzeImage = () => {
  const file = document.getElementById("cameraInput").files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 200;

    ctx.drawImage(img, 0, 0, 200, 200);

    const data = ctx.getImageData(0, 0, 200, 200).data;

    let green = 0;
    let brown = 0;
    let total = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 🌿 hijau sehat
      if (g > r && g > b && g > 100) {
        green++;
      }

      // 🍂 coklat / mati
      if (r > g && r > b && r > 120) {
        brown++;
      }
    }

    const greenRatio = green / total;
    const brownRatio = brown / total;

    const score = Math.floor((greenRatio * 100) - (brownRatio * 50));

    const result = getHealthStatus(score);

    document.getElementById("aiResult").innerHTML = `
      ${result.status} <br>
      Skor: ${score}
    `;

    giveXPAdvanced(score);
  };
};

// ==========================
// ⚡ XP SYSTEM
// ==========================
async function giveXP(result) {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = ref(db, "users/" + user.uid);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) return;

  const data = snapshot.val();

  let xp = data.xp || 0;

  xp += result.includes("sehat") ? 50 : 20;

  let level = Math.floor(xp / 50) + 1;

  const roles = [
    "🌱 Petani Pemula",
    "🌿 Petani Perintis",
    "🌴 Petani Nyawit",
    "🚜 Sultan Sawit",
    "👑 Juragan Sawit"
  ];

  await update(userRef, {
    xp,
    level,
    role: roles[level - 1] || "👑 Juragan Sawit"
  });
}
