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
    // Ambil data history dan e-book setelah login
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

// History & E-book containers
const historyList = document.getElementById("historyList"); // <ul> atau <div>
const ebookList = document.getElementById("ebookList"); // <ul> atau <div>

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
const dbRef = ref(db, "sensor");
onValue(dbRef, (snapshot) => {
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

// ===== Tombol Auto / Manual dengan overlay hanya untuk tombol =====
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

// Tombol AUTO
btnAuto.addEventListener("click", () => {
  animateButton(btnAuto);
  controls.querySelectorAll(".manual-pompa").forEach(el => el.style.display = "none");
  showToast("🤖 Mode AUTO aktif", "info");
});

// Tombol MANUAL
btnManual.addEventListener("click", () => {
  animateButton(btnManual);
  controls.querySelectorAll(".manual-pompa").forEach(el => el.style.display = "inline-block");
  showToast("🖐 Mode MANUAL aktif", "info");
});

// ===== Kontrol pompa manual =====
window.setPompa = function(status) {
  set(ref(db, "kontrol/pompa"), status);
  showToast(`💧 Pompa ${status}`, "info");
};

// ===== Fetch History =====
function fetchHistory() {
  const historyRef = ref(db, "history");
  onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    historyList.innerHTML = "";
    Object.keys(data).forEach(key => {
      const item = data[key];
      const li = document.createElement("li");
      li.textContent = `${item.tanggal || "-"} - ${item.keterangan || "-"}`;
      historyList.appendChild(li);
    });
  });
}

// ===== Fetch E-book =====
function fetchEbook() {
  const ebookRef = ref(db, "e-book");
  onValue(ebookRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    ebookList.innerHTML = "";
    Object.keys(data).forEach(key => {
      const item = data[key];
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.url}" target="_blank">${item.judul || "Untitled"}</a>`;
      ebookList.appendChild(li);
    });
  });
}

// ===== TOAST NOTIFIKASI =====
function showToast(message, type = "info", link = null) {
  const container = document.getElementById("notif-container");
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="msg">${message}</span>
    <span class="close-btn">&times;</span>
  `;

  if (link) {
    toast.classList.add("link");
    const msgEl = toast.querySelector(".msg");
    msgEl.classList.add("linkable");
    msgEl.addEventListener("click", () => {
      window.open(link, "_blank");
    });
  }

  toast.querySelector(".close-btn").addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  showToast("🔗 About Me", "link", "https://zackcode46.github.io/portfolioweb/");
});
