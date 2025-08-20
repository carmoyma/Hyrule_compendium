// API Endpoint
const API_URL = "https://botw-compendium.herokuapp.com/api/v3/compendium/all";

let allEntries = [];
let currentCategory = "all";
let currentPage = 1;
const entriesPerPage = 10;

// Cargar todos los datos del compendio
function loadEntries() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data?.data) throw new Error("No data found in API response.");
            allEntries = data.data;
            filterEntries();
        })
        .catch(error => {
            console.error("Error fetching entries:", error);
            document.getElementById("entry-list").innerHTML =
                `<p style="color: red;">Failed to load compendium.</p>`;
        });
}

// Mostrar entradas en pantalla
function displayEntries(entries) {
    const entryList = document.getElementById("entry-list");
    entryList.innerHTML = "";

    if (entries.length === 0) {
        entryList.innerHTML = "<p>No entries found.</p>";
        return;
    }

    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedEntries = entries.slice(start, end);

    paginatedEntries.forEach(entry => {
        const card = document.createElement("div");
        card.classList.add("entry-card");
        card.innerHTML = `
            <img src="${entry.image}" alt="${entry.name}" loading="lazy">
            <p>${entry.name}</p>
        `;
        card.addEventListener("click", () => {
            window.location.href = `entry.html?name=${encodeURIComponent(entry.name)}`;
        });
        entryList.appendChild(card);
    });

    renderPagination(entries.length);
}

// Renderizar paginación
function renderPagination(totalEntries) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (totalPages <= 1) return;

    const createBtn = (text, callback, active = false) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        if (active) btn.classList.add("active");
        btn.addEventListener("click", callback);
        return btn;
    };

    if (currentPage > 1) pagination.appendChild(createBtn("Prev", () => { currentPage--; filterEntries(); }));

    const pageRange = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
    let endPage = Math.min(totalPages, startPage + pageRange - 1);
    startPage = Math.max(1, endPage - pageRange + 1);

    if (startPage > 1) {
        pagination.appendChild(createBtn("1", () => { currentPage = 1; filterEntries(); }));
        if (startPage > 2) pagination.appendChild(Object.assign(document.createElement("span"), { textContent: "…", style: "margin:0 5px;" }));
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createBtn(i, () => { currentPage = i; filterEntries(); }, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pagination.appendChild(Object.assign(document.createElement("span"), { textContent: "…", style: "margin:0 5px;" }));
        pagination.appendChild(createBtn(totalPages, () => { currentPage = totalPages; filterEntries(); }));
    }

    if (currentPage < totalPages) pagination.appendChild(createBtn("Next", () => { currentPage++; filterEntries(); }));
}

// Filtrar por categoría y búsqueda
function filterEntries() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    let filtered = allEntries;

    if (currentCategory !== "all") filtered = filtered.filter(entry => entry.category === currentCategory);
    if (query) filtered = filtered.filter(entry => entry.name.toLowerCase().includes(query));

    displayEntries(filtered);
}

// Filtrar por categoría
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    localStorage.setItem("activeFilter", category);

    document.querySelectorAll("#filters button").forEach(btn => btn.classList.remove("active"));
    const activeBtn = [...document.querySelectorAll("#filters button")].find(btn => btn.dataset.category === category);
    if (activeBtn) activeBtn.classList.add("active");

    filterEntries();
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadEntries();

    // Recuperar último filtro guardado
    const savedFilter = localStorage.getItem("activeFilter");
    if (savedFilter) currentCategory = savedFilter;

    // Asignar eventos a botones de filtro
    document.querySelectorAll("#filters button").forEach(btn => {
        btn.addEventListener("click", () => filterByCategory(btn.dataset.category));
    });

    // Asignar evento al buscador
    document.getElementById("search-bar").addEventListener("input", filterEntries);

    // Aplicar filtro inicial
    filterByCategory(currentCategory);
});
