// Ambil data tanaman dari JSON
async function loadPlants() {
  const res = await fetch("assets/data/plants.json");
  const data = await res.json();
  return data;
}

// Render data tanaman ke halaman
function renderPlants(plants) {
  const list = document.getElementById("ebookList");
  list.innerHTML = "";

  if (plants.length === 0) {
    list.innerHTML = "<p style='text-align:center;'>❌ Tidak ada tanaman ditemukan</p>";
    return;
  }

  plants.forEach(plant => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${plant.gambar}" alt="${plant.nama}">
      <h3>${plant.nama}</h3>
      <p class="jenis">Jenis: ${plant.jenis}</p>
      <p><strong>Deskripsi:</strong> ${plant.deskripsi}</p>
      <p><strong>Perawatan:</strong> ${plant.perawatan}</p>
    `;
    list.appendChild(card);
  });
}

// Search filter
function setupSearch(plants) {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = plants.filter(plant =>
      plant.nama.toLowerCase().includes(keyword) ||
      plant.jenis.toLowerCase().includes(keyword)
    );
    renderPlants(filtered);
  });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  const plants = await loadPlants();
  renderPlants(plants);
  setupSearch(plants);
});
