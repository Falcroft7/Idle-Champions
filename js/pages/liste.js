import { renderPage, attachNameClickListeners, imageFor } from "../utils.js";
import { listePersos, listeBancs, listeClasses, listeRoles, ITEMS_PER_PAGE, currentPage } from "../state.js";
import { getCurrentFilters, filterAndSortPersos } from "../filters.js";
import { affichPersoByName } from "./perso.js";

export function affichListe() {
  renderPage(`
    <a href="#" id="back-home" class="back-btn">⬅ Retour</a>
    <h2>Liste des champions</h2>

    <div id="filters"></div>
    <div id="cardsContainer" class="cards"></div>
    <p id="noResultsMessage" class="no-results">Aucun personnage trouvé</p>
    <div id="pagination" class="pagination"></div>
  `);

  document.getElementById("back-home").onclick = e => { e.preventDefault(); history.back(); };

  updateList();
}

export function updateList(page = 1) {
  const filters = getCurrentFilters();
  const filtered = filterAndSortPersos(filters);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const items = filtered.slice(start, start + ITEMS_PER_PAGE);

  const container = document.getElementById("cardsContainer");
  container.innerHTML = items.map(p => `
    <div class="card" data-name="${p.Nom}">
      <img src="${imageFor(p)}" class="card-img">
      <span class="card-name">${p.Nom}</span>
    </div>
  `).join("");

  attachNameClickListeners(".card", name => affichPersoByName(name));
}

export function renderPagination(totalItems) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => updateList(i));
    paginationContainer.appendChild(btn);
  }
}


export function renderFilters() {
  return `
    <div class="filters">
      <div class="top-line">
        ${renderSelect("Banc", "bancSelect", "Tous", listeBancs)}
        ${renderSelect("Classe", "classeSelect", "Toutes", listeClasses)}
        ${renderSelect("Rôle", "roleSelect", "Tous", listeRoles)}
        ${renderSelect("Trier par", "sortSelect", null, [
          { value: "banc-asc", label: "Banc croissant" },
          { value: "nom-asc", label: "Nom A → Z" },
          { value: "nom-desc", label: "Nom Z → A" }
        ])}
      </div>

      <div class="bottom-line">
        <div id="search-container">
          <span>🔍</span>
          <input type="text" id="searchInput" placeholder="Rechercher un personnage...">
        </div>
        <div id="reset-container">
          <button class="reset-btn" id="resetFiltersBtn">⟳</button>
        </div>
      </div>
    </div>
  `;
}
