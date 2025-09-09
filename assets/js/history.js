// history.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Chart helper
function createChart(ctx, label, color) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor: color,
        borderWidth: 2,
        fill: false,
        tension: 0.3 // membuat garis lebih smooth
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 500 },
      scales: { x: { display: true }, y: { beginAtZero: true } },
      plugins: { legend: { position: 'top' } }
    }
  });
}

const chartSuhu = createChart(document.getElementById("chartSuhuHistory"), "Suhu (°C)", "red");
const chartKelembaban = createChart(document.getElementById("chartKelembabanHistory"), "Kelembaban (%)", "blue");
const chartTanah = createChart(document.getElementById("chartTanahHistory"), "Tanah (%)", "green");
const chartCahaya = createChart(document.getElementById("chartCahayaHistory"), "Cahaya (Lux)", "orange");

// Ambil data history dari Firebase
const historyRef = ref(db, "history");
onValue(historyRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;

  // Reset chart data
  function resetChart(chart) { chart.data.labels = []; chart.data.datasets[0].data = []; }
  resetChart(chartSuhu); resetChart(chartKelembaban); resetChart(chartTanah); resetChart(chartCahaya);

  // Urutkan timestamp ascending
  const timestamps = Object.keys(data).sort();
  timestamps.forEach(time => {
    const entry = data[time];
    chartSuhu.data.labels.push(time); chartSuhu.data.datasets[0].data.push(entry.suhu ?? 0);
    chartKelembaban.data.labels.push(time); chartKelembaban.data.datasets[0].data.push(entry.kelembaban ?? 0);
    chartTanah.data.labels.push(time); chartTanah.data.datasets[0].data.push(entry.tanah ?? 0);
    chartCahaya.data.labels.push(time); chartCahaya.data.datasets[0].data.push(entry.cahaya ?? 0);
  });

  // Update semua chart
  chartSuhu.update();
  chartKelembaban.update();
  chartTanah.update();
  chartCahaya.update();
});
