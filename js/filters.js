import { currentPage, ITEMS_PER_PAGE } from "./state.js";

export function renderSelect(label, id, defaultValue, options) {
  const opts = options.map(opt => {
    if (typeof opt === "string") return `<option value="${opt}">${opt}</option>`;
    return `<option value="${opt.value}">${opt.label}</option>`;
  }).join("");

  return `
    <div class="filter-group">
      <label class="filter-label">${label}:</label>
      <select id="${id}">
        ${defaultValue ? `<option value="${defaultValue}">${defaultValue}</option>` : ""}
        ${opts}
      </select>
    </div>
  `;
}

export function renderFilters(listeBancs, listeClasses, listeRoles) {
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

export function attachFilterHandlers(updateList) {
  ["bancSelect", "classeSelect", "roleSelect", "sortSelect"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => { currentPage = 1; updateList(); });
  });
  const search = document.getElementById("searchInput");
  if (search) search.addEventListener("input", () => { currentPage = 1; updateList(); });
  const resetBtn = document.getElementById("resetFiltersBtn");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    document.getElementById("bancSelect").value = "Tous";
    document.getElementById("classeSelect").value = "Toutes";
    document.getElementById("roleSelect").value = "Tous";
    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "banc-asc";
    currentPage = 1;
    updateList();
  });
}
