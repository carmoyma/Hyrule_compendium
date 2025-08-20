// API Endpoint para todo el compendio
const API_URL = "https://botw-compendium.herokuapp.com/api/v3/compendium/all";

let allEntries = [];
let currentCategory = "all";
let currentPage = 1;
const entriesPerPage = 10;

// Cargar todos los datos del compendio
function loadEntries() {
    console.log("Fetching compendium...");

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.data) {
                throw new Error("No data found in API response.");
            }

            allEntries = data.data;
            filterEntries(); // mostrar por primera vez
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

    // Calcular índices de la página
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

function renderPagination(totalEntries) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (totalPages <= 1) return;

    // Botón "Prev"
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "Prev";
        prev.onclick = () => { currentPage--; filterEntries(); };
        pagination.appendChild(prev);
    }

    const pageRange = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
    let endPage = Math.min(totalPages, startPage + pageRange - 1);
    startPage = Math.max(1, endPage - pageRange + 1);

    // Primera página + puntos suspensivos si no está en rango
    if (startPage > 1) {
        const firstBtn = document.createElement("button");
        firstBtn.textContent = "1";
        firstBtn.onclick = () => { currentPage = 1; filterEntries(); };
        pagination.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.textContent = "…";
            dots.style.margin = "0 5px";
            pagination.appendChild(dots);
        }
    }

    // Botones de páginas cercanas
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.classList.add("active");
        pageBtn.onclick = () => { currentPage = i; filterEntries(); };
        pagination.appendChild(pageBtn);
    }

    // Última página + puntos suspensivos si no está en rango
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement("span");
            dots.textContent = "…";
            dots.style.margin = "0 5px";
            pagination.appendChild(dots);
        }

        const lastBtn = document.createElement("button");
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => { currentPage = totalPages; filterEntries(); };
        pagination.appendChild(lastBtn);
    }

    // Botón "Next"
    if (currentPage < totalPages) {
        const next = document.createElement("button");
        next.textContent = "Next";
        next.onclick = () => { currentPage++; filterEntries(); };
        pagination.appendChild(next);
    }
}




// Filtrar por categoría y búsqueda
function filterEntries() {
    const query = document.getElementById("search-bar").value.toLowerCase();

    let filtered = allEntries;

    if (currentCategory !== "all") {
        filtered = filtered.filter(entry => entry.category === currentCategory);
    }

    if (query) {
        filtered = filtered.filter(entry => entry.name.toLowerCase().includes(query));
    }

    displayEntries(filtered);
}

// Filtros por botones
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;

    // Guardar en localStorage
    localStorage.setItem("activeFilter", category);

    // Quitar la clase activa de todos los botones
    document.querySelectorAll("#filters button").forEach(btn => btn.classList.remove("active"));

    // Añadir la clase activa al botón actual
    const activeBtn = [...document.querySelectorAll("#filters button")]
        .find(btn => btn.textContent.toLowerCase().includes(category === "all" ? "all" : category));
    if (activeBtn) activeBtn.classList.add("active");

    filterEntries();
}



// Cargar entradas al iniciar
// Cargar entradas al iniciar
document.addEventListener("DOMContentLoaded", () => {
    loadEntries();

    // Recuperar el último filtro guardado
    const savedFilter = localStorage.getItem("activeFilter");
    if (savedFilter) {
        currentCategory = savedFilter;
        filterByCategory(savedFilter);
    }
});

