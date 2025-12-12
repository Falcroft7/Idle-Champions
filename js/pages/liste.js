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
