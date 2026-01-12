// ===== Import Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js"; // import config

// ===== Inisialisasi Firebase =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ===== Auto redirect jika belum login =====
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "./login_pages.html";
  } else {
    console.log("User sudah login:", user.email);
    fetchHistory();
    fetchEbook();
  }
});

// ===== Tombol Logout =====
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login_pages.html";
    } catch (err) {
      console.error("Logout gagal:", err);
    }
  });
}

// ===== HTML Elements =====
const suhuEl = document.getElementById("suhu");
const kelembabanEl = document.getElementById("kelembaban");
const tanahEl = document.getElementById("tanah");
const cahayaEl = document.getElementById("cahaya");

const btnAuto = document.getElementById("btnAuto");
const btnManual = document.getElementById("btnManual");
const controls = document.querySelector(".controls");

const historyList = document.getElementById("historyList");
const ebookList = document.getElementById("ebookList");

// ===== Chart helper =====
function createChart(ctx, label, color) {
  return new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label, data: [], borderColor: color, borderWidth: 2, fill: false }] },
    options: {
      responsive: true,
      animation: false,
      scales: { x: { display: false }, y: { beginAtZero: true } }
    }
  });
}

// ===== Create charts =====
const chartSuhu = createChart(document.getElementById("chartSuhu"), "Suhu (°C)", "red");
const chartKelembaban = createChart(document.getElementById("chartKelembaban"), "Kelembaban (%)", "blue");
const chartTanah = createChart(document.getElementById("chartTanah"), "Tanah (%)", "green");
const chartCahaya = createChart(document.getElementById("chartCahaya"), "Cahaya (Lux)", "orange");

// ===== Realtime listener sensor =====
onValue(ref(db, "sensor"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  suhuEl.textContent = data.suhu ?? "--";
  kelembabanEl.textContent = data.kelembaban ?? "--";
  tanahEl.textContent = data.tanah ?? "--";
  cahayaEl.textContent = data.cahaya ?? "--";

  const time = new Date().toLocaleTimeString();
  const updateChart = (chart, value) => {
    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(value);
    if (chart.data.labels.length > 10) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();
  };

  updateChart(chartSuhu, data.suhu);
  updateChart(chartKelembaban, data.kelembaban);
  updateChart(chartTanah, data.tanah);
  updateChart(chartCahaya, data.cahaya);

  if (data.tanah < 30) showToast("💧 Tanah kering! Pompa aktif", "warning");
  if (data.suhu > 35) showToast("🌡️ Suhu tinggi! Ventilasi disarankan", "error");
});

// ===== Button animation =====
function animateButton(btn) {
  const overlay = btn.querySelector(".anim-overlay");
  const video = overlay.querySelector("video");

  overlay.style.opacity = 1;
  overlay.style.pointerEvents = "none";

  if (video) {
    video.currentTime = 0;
    video.play();
  }

  setTimeout(() => {
    overlay.style.opacity = 0;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, 2000);
}

// ===== AUTO =====
btnAuto.addEventListener("click", () => {
  animateButton(btnAuto);
  controls.querySelectorAll(".manual-pompa").forEach(el => el.style.display = "none");
  set(ref(db, "kontrol/mode"), "AUTO");
  showToast("🤖 Mode AUTO aktif", "info");
});

// ===== MANUAL =====
btnManual.addEventListener("click", () => {
  animateButton(btnManual);
  controls.querySelectorAll(".manual-pompa").forEach(el => el.style.display = "inline-block");
  set(ref(db, "kontrol/mode"), "MANUAL");
  showToast("🖐 Mode MANUAL aktif", "info");
});

// ===== Kontrol pompa =====
window.setPompa = function (status) {
  set(ref(db, "kontrol/pompa"), status);
  showToast(`💧 Pompa ${status}`, "info");
};

// ===== Status pompa realtime =====
onValue(ref(db, "kontrol/pompa"), (snapshot) => {
  const status = snapshot.val();
  if (!status) return;

  if (status === "ON") showToast("💧 Pompa MENYALA", "info");
  if (status === "OFF") showToast("🛑 Pompa MATI", "info");
});

// ===== STATUS ESP ONLINE / OFFLINE =====
let espOnline = false;
let espTimeout = null;

onValue(ref(db, "status"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const now = Math.floor(Date.now() / 1000);
  const lastSeen = data.lastSeen ?? 0;

  if (now - lastSeen < 15) {
    if (!espOnline) {
      espOnline = true;
      showToast("🟢 ESP32 ONLINE", "success");
    }
    if (espTimeout) clearTimeout(espTimeout);
    espTimeout = setTimeout(() => {
      espOnline = false;
      showToast("🔴 ESP32 OFFLINE", "error");
    }, 15000);
  }
});

// ===== Fetch History =====
function fetchHistory() {
  onValue(ref(db, "history"), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    historyList.innerHTML = "";
    Object.keys(data).forEach(key => {
      const item = data[key];
      const li = document.createElement("li");
      li.textContent = `${key} | Suhu:${item.suhu} Tanah:${item.tanah}`;
      historyList.appendChild(li);
    });
  });
}

// ===== Fetch E-book =====
function fetchEbook() {
  onValue(ref(db, "e-book"), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    ebookList.innerHTML = "";
    Object.values(data).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.nama;
      ebookList.appendChild(li);
    });
  });
}

// ===== TOAST =====
function showToast(message, type = "info", link = null) {
  const container = document.getElementById("notif-container");
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="msg">${message}</span>
    <span class="close-btn">&times;</span>
  `;

  toast.querySelector(".close-btn").onclick = () => toast.remove();
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  showToast("🔗 About Me", "link", "https://zackcode46.github.io/portfolioweb/");
});
