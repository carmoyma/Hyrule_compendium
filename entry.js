const urlParams = new URLSearchParams(window.location.search);
const entryName = decodeURIComponent(urlParams.get("name") || "");

if (!entryName) {
    alert("No entry name provided!");
    window.location.href = "index.html";
}

// Go Back button
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("go-back-btn").addEventListener("click", () => {
        window.history.back();
    });

    loadEntryDetails();
});

function loadEntryDetails() {
    const API_URL = `https://botw-compendium.herokuapp.com/api/v3/compendium/entry/${entryName}`;

    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.data) throw new Error("Entry not found in direct endpoint");
            showEntryDetails(data.data);
        })
        .catch(error => {
            console.warn("Primary fetch failed, fallback to /all:", error);

            fetch("https://botw-compendium.herokuapp.com/api/v3/compendium/all")
                .then(res => res.json())
                .then(allData => {
                    const found = allData.data.find(e => e.name.toLowerCase() === entryName.toLowerCase());
                    if (found) {
                        showEntryDetails(found);
                    } else {
                        document.getElementById("entry-details").innerHTML = `
                            <p style="color:red;">Entry not found.</p>
                            <button id="go-back-btn">Go Back</button>
                        `;
                        document.getElementById("go-back-btn").addEventListener("click", () => window.history.back());
                    }
                });
        });
}

function showEntryDetails(entry) {
    // Nombre capitalizado
    document.getElementById("entry-name").textContent = entry.name
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    // Imagen y descripción
    document.getElementById("entry-image").src = entry.image || "";
    document.getElementById("entry-description").textContent = entry.description || "No description available.";

    const extraList = document.getElementById("entry-extra");
    extraList.innerHTML = "";

    const category = entry.category || "";

    // DROPS (solo enemigos/creaturas)
    if (category === "monsters" || category === "creatures") {
    if (entry.drops && entry.drops.length > 0) {
        entry.drops.forEach(drop => {
            const li = document.createElement("li");
            li.textContent = drop
                .split(" ")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            extraList.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "Does not drop any items.";
        extraList.appendChild(li);
    }
    } else if (category === "equipment") {
        const props = entry.properties || {};

        // Mostrar ataque si existe
        if (props.attack && props.attack > 0) {
            const li = document.createElement("li");
            li.textContent = `Attack: ${props.attack}`;
            extraList.appendChild(li);
        }
        // Si no tiene ataque, mostrar defensa si existe
        else if (props.defense && props.defense > 0) {
            const li = document.createElement("li");
            li.textContent = `Defense: ${props.defense}`;
            extraList.appendChild(li);
        }
        const name = entry.name.toLowerCase();
            // Flechas elementales
        if (name.includes("shock")||name.includes("thunder")) {
            li = document.createElement("li");
            li.textContent = "Elemental Damage: Electric";
            extraList.appendChild(li);
        } else if (name.includes("fire")||name.includes("flame")) {
            li = document.createElement("li");
            li.textContent = "Elemental Damage: Fire";
            extraList.appendChild(li);
        } else if (name.includes("ice")||name.includes("frost")) {
            li = document.createElement("li");
            li.textContent = "Elemental Damage: Ice";
            extraList.appendChild(li);
        } else if (name.includes("bomb")) {
            li = document.createElement("li");
            li.textContent = "Elemental Damage: Bomb";
            extraList.appendChild(li);
        }else if (name.includes("ancient arrow")) {
            li = document.createElement("li");
            li.textContent = "Absorb creatures and normal enemies.";
            extraList.appendChild(li);
        } else if (name.includes("arrow")) {
            li = document.createElement("li");
            li.textContent = "Elemental Damage: None";
            extraList.appendChild(li);
        }else if (name.includes("master")) {
            li = document.createElement("li");
            li.textContent = "Near ganon creatures and guardians → Attack: 60";
            extraList.appendChild(li);
        }
    } else if (category === "treasure") {
        const chestContents = [
            "Weapons → Swords, Spears, Two-Handed Weapons",
            "Shields → Wooden, Metal, Guardian Shields",
            "Bows → Traveler's Bow, Soldier's Bow, Royal Bow",
            "Arrows → Fire Arrows, Ice Arrows, Bomb Arrows",
            "Armor → Tunics, Trousers, Boots, Circlets",
            "Materials → Gems (Amber, Ruby, Sapphire, Diamond), Ancient Parts",
            "Food → Cooked Meals, Elixirs",
            "Rupees → Green (1), Blue (5), Red (20), Purple (50), Silver (100), Gold (300)",
            "Key Items → Special quest items, Maps, or Rare Treasures"
        ];

        if (entry.drops && entry.drops.length > 0 && entry.name.toLowerCase() !== "treasure chest") {
            // Mostrar drops reales del cofre
            entry.drops.forEach(drop => {
                const li = document.createElement("li");
                li.textContent = drop
                    .split(" ")
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
                extraList.appendChild(li);
            });
        } else {
            // Mostrar lista genérica de posibles contenidos
            chestContents.forEach(content => {
                const li = document.createElement("li");
                li.textContent = content;
                extraList.appendChild(li);
            });
        }
    }else if (category === "materials") {
        function renderHeartsSVG(hearts) {
            const container = document.createElement("span");
            container.style.display = "inline-block";
            container.style.verticalAlign = "-14px"; // baja un poco los corazones

            const fullHearts = Math.floor(hearts);
            const hasHalf = hearts % 1 === 0.5;

        for (let i = 0; i < fullHearts; i++) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "18");   // mismo que medio
                svg.setAttribute("height", "36");  // mismo que medio
                svg.setAttribute("viewBox", "0 0 32 32");
                svg.style.marginRight = "3px";
                svg.innerHTML = `<path fill="red" d="M23.6,2c-2.5,0-4.6,1.9-5.6,3.9C16.9,3.9,14.8,2,12.3,2C8.2,2,5,5.2,5,9.3c0,4.8,7.4,10.9,12,15.7c4.6-4.8,12-10.9,12-15.7C27,5.2,23.8,2,23.6,2z"/>`;
                container.appendChild(svg);
            }

            if (hasHalf) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "18");   // mitad del ancho
                svg.setAttribute("height", "36");  // igual altura
                svg.setAttribute("viewBox", "0 0 32 32");
                svg.style.marginRight = "3px";
                svg.innerHTML = `
                    <defs>
                        <clipPath id="half-heart">
                            <rect x="0" y="0" width="16" height="32"/>
                        </clipPath>
                    </defs>
                    <path fill="red" d="M23.6,2c-2.5,0-4.6,1.9-5.6,3.9C16.9,3.9,14.8,2,12.3,2C8.2,2,5,5.2,5,9.3c0,4.8,7.4,10.9,12,15.7c4.6-4.8,12-10.9,12-15.7C27,5.2,23.8,2,23.6,2z" clip-path="url(#half-heart)"/>
                `;
                container.appendChild(svg);
            }

            return container;
        }


        const hearts = entry.hearts_recovered ?? entry.properties?.hearts_recovered ?? 0;
        const li = document.createElement("li");
        li.textContent = "Hearts Recovered: ";
        li.appendChild(renderHeartsSVG(hearts));
        extraList.appendChild(li);

        // Mostrar cooking effect si existe
        if (entry.cooking_effect && entry.cooking_effect.trim() !== "") {
            const li = document.createElement("li");
            li.textContent = `Cooking Effect: ${entry.cooking_effect}`;
            extraList.appendChild(li);
        }
    



    }



}

