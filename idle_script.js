// ===================== CONSTANTES =====================
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-Z9L00gE2wnlhgD1LSlSyNDo2dej3UcX_-UtnN2NBrV8tzHxib_Mxx28d3k9CoWjzhQUxcQjK7TA/pub?output=csv";
const CSV_URL_PATRONS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-Z9L00gE2wnlhgD1LSlSyNDo2dej3UcX_-UtnN2NBrV8tzHxib_Mxx28d3k9CoWjzhQUxcQjK7TA/pub?gid=1864789699&single=true&output=csv";

const ITEMS_PER_PAGE = 30;

// ===================== ÉTAT GLOBAL =====================
let listePersos = [];
let listePatrons = [];
let listeBancs = [];
let listeClasses = [];
let listeRoles = [];
let currentPage = 1;

const sectionsFiche = [
  { title: "Général", fields: ["Banc", "Origine"] },
  { title: "Identité", fields: ["Genre", "Espèce", "Age"] },
  { title: "Classe & Rôle", fields: ["Classe", "Alignement", "Rôles", "Rôles secondaires", "Affiliation", "Accablement"] },
  { title: "Caractéristiques", fields: ["Force", "Dextérité", "Constitution", "Intelligence", "Sagesse", "Charisme", "Total"] },
  { title: "Attaque", fields: ["Type Attaque", "Type Ultime"] },
];

// ===================== UTILITAIRES =====================
function normalizeString(str) {
  if (!str) return "";
  
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")     // remplace les espaces par des tirets
    .replace(/[^\w-]/g, "");  // supprime tout sauf lettres, chiffres et tirets
}

function getCurrentFilters() {
  return {
    banc: document.getElementById("bancSelect")?.value || "Tous",
    classe: document.getElementById("classeSelect")?.value || "Toutes",
    role: document.getElementById("roleSelect")?.value || "Tous",
    search: document.getElementById("searchInput")?.value || "",
    sort: document.getElementById("sortSelect")?.value || "banc-asc"
  };
}

function renderPage(htmlContent) {
  const app = document.getElementById("app");
  const tempDiv = document.createElement("div");
  tempDiv.className = "page-transition";
  tempDiv.innerHTML = htmlContent;
  app.innerHTML = "";
  app.appendChild(tempDiv);
  requestAnimationFrame(() => tempDiv.classList.add("active"));
}

function attachNameClickListeners(selector, handler) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener("click", () => {
      const name = el.dataset.name;
      if (name) handler(name);
    });
  });
}

function imageFor(p) {
  if (!p) return "Champions/default.jpg";
  if (p.Image && p.Image.trim()) return p.Image.trim();
  const normalized = normalizeString(p.Nom || "");
  return `Champions/${normalized}.jpg`;
}

// ===================== PAGE D'ACCUEIL =====================
function affichHome() {
  renderPage(`
    <div class="home-container">
      <img src="Banner/dnd-banner.png" alt="D&D Banner" class="home-banner">
      <h1>D&D - Idle Champions</h1>
      <p class="home-intro">
        Salutations, héros en herbe !<br>
        Gérez vos champions, découvrez leurs patrons mystérieux et préparez des combos épiques.<br>
        Appuyez sur un bouton pour plonger dans l’aventure !
      </p>
      <div class="home-buttons">
        <button id="btn-champions">Champions</button>
        <button id="btn-affiliations">Affiliations</button>
        <button id="btn-patrons">Patrons</button>
        <button id="btn-synergies">Synergies</button>
      </div>
    </div>
  `);

  document.getElementById("btn-champions").addEventListener("click", () => affichListe());
  document.getElementById("btn-affiliations").addEventListener("click", () => affichAffiliationList());
  document.getElementById("btn-patrons").addEventListener("click", () => affichPatronsList());
  document.getElementById("btn-synergies").addEventListener("click", () => alert("En développement"));
}

// ===================== FILTRAGE & TRI =====================
function filterAndSortPersos(filters) {
  const query = normalizeString(filters.search);

  let filtered = listePersos.filter(p => {
    const bancOk = filters.banc === "Tous" || p.Banc === filters.banc;
    const classeOk = filters.classe === "Toutes" || (p.Classe || "").split(',').map(c => c.trim()).includes(filters.classe);
    const roleOk = filters.role === "Tous" || (p.Rôles || "").split(',').map(r => r.trim()).includes(filters.role);
    const searchOk = !query || normalizeString(p.Nom).includes(query);
    return bancOk && classeOk && roleOk && searchOk;
  });

  filtered.sort((a, b) => {
    if (filters.sort === "nom-asc") return a.Nom.localeCompare(b.Nom);
    if (filters.sort === "nom-desc") return b.Nom.localeCompare(a.Nom);
    if (filters.sort === "banc-asc") return (a.Banc || "").localeCompare(b.Banc || "", undefined, { numeric: true });
    return 0;
  });

  return filtered;
}

// ===================== RENDER FILTER UI =====================
function renderSelect(label, id, defaultValue, options) {
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

function renderFilters() {
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

function attachFilterHandlers() {
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

// ===================== LISTE & PAGINATION =====================
function affichListe() {
  renderPage(`
    <a href="#" id="back-home" class="back-btn">⬅ Retour</a>
    <h2>Liste des champions</h2>
    ${renderFilters()}
    <div id="cardsContainer" class="cards"></div>
    <p id="noResultsMessage" class="no-results">Aucun personnage trouvé</p>
    <div id="pagination" class="pagination"></div>
  `);

  document.getElementById("back-home").addEventListener("click", (e) => { e.preventDefault(); affichHome(); });

  attachFilterHandlers();
  updateList();
}

function updateList(page = currentPage) {
  const filters = getCurrentFilters();
  const filtered = filterAndSortPersos(filters);

  currentPage = page;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  const cardsContainer = document.getElementById("cardsContainer");
  const noResultsMsg = document.getElementById("noResultsMessage");

  if (!cardsContainer) return;

  if (filtered.length === 0) {
    noResultsMsg.style.display = "block";
    cardsContainer.innerHTML = "";
  } else {
    noResultsMsg.style.display = "none";
    cardsContainer.innerHTML = pageItems.map(p => `
      <div class="card" data-name="${p.Nom}">
        ${p.Image || imageFor(p) ? `<img src="${imageFor(p)}" alt="${p.Nom}" class="card-img" onerror="this.onerror=null;this.src='Champions/default.jpg'">` : ""}
        <span class="card-name">${p.Nom}</span>
      </div>
    `).join("");
    // attache des listeners sur les cartes
    attachNameClickListeners(".card", name => affichPersoByName(name));
  }

  renderPagination(filtered.length);
}

function renderPagination(totalItems) {
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

// ===================== AFFILIATIONS =====================
function affichAffiliationList() {
  const affiliationsUniques = [...new Set(listePersos.map(p => p.Affiliation).filter(a => a && a.trim() !== ""))];
  affiliationsUniques.sort((a, b) => {
    if (a === "Aucun") return 1;
    if (b === "Aucun") return -1;
    return a.localeCompare(b);
  });

  renderPage(`
    <a href="#" id="back-home-aff" class="back-btn">⬅ Retour</a>
    <h2>Liste des Affiliations</h2>
    <div class="affiliations-container">
      ${affiliationsUniques.map(nom => `
        <div class="affiliation-card" data-name="${nom}">
          ${nom !== "Aucun" ? `<img src="Affiliations/${normalizeString(nom)}.png" alt="${nom}" class="affiliation-logo" onerror="this.onerror=null;this.style.display='none'">` : `<div class="affiliation-logo affiliation-logo-placeholder"></div>`}
          <span ${nom === "Aucun" ? 'style="color:#888; font-style:italic;"' : ''}>${nom}</span>
        </div>
      `).join('')}
    </div>
  `);

  document.getElementById("back-home-aff").addEventListener("click", (e) => { e.preventDefault(); affichHome(); });

  attachNameClickListeners(".affiliation-card", name => affichAffiliationByName(name));
}

function affichAffiliationByName(name) {
  renderPage(`
    <a href="#" id="back-aff" class="back-btn">⬅ Retour</a>
    <h1>${name}</h1>
    <div class="affiliation-members">
      <div class="section-title">Champions liés</div>
      <div class="linked-cards" id="linked-champions"></div>
    </div>
  `);

  document.getElementById("back-aff").addEventListener("click", (e) => { e.preventDefault(); affichAffiliationList(); });

  showLinkedChampions("#linked-champions", champion => champion.Affiliation === name);
}

// ===================== CHAMPIONS LIÉS =====================
function showLinkedChampions(containerSelector, filterFn) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = "";

  const champions = listePersos.filter(filterFn);

  if (champions.length === 0) {
    container.innerHTML = `<p style="color:#aaa; font-style:italic;">Aucun champion lié</p>`;
    return;
  }

  champions.forEach(champion => {
    const card = document.createElement("div");
    card.className = "linked-card";
    card.dataset.name = champion.Nom;

    const img = document.createElement("img");
    img.src = imageFor(champion);
    img.alt = champion.Nom;
    img.title = champion.Nom;
    img.className = "linked-champion-img";
    img.onerror = function () { this.onerror = null; this.src = "Champions/default.jpg"; };

    const nameSpan = document.createElement("span");
    nameSpan.className = "linked-champion-name";
    nameSpan.textContent = champion.Nom;

    card.appendChild(img);
    card.appendChild(nameSpan);
    container.appendChild(card);
  });

  attachNameClickListeners(`${containerSelector} .linked-card`, name => affichPersoByName(name));
}

// ===================== LISTE DES PATRONS =====================
function affichPatronsList() {
  renderPage(`
    <a href="#" id="back-home-patrons" class="back-btn">⬅ Retour</a>
    <h2>Liste des Patrons</h2>
    <div class="patrons-container-large">
      ${listePatrons.map(p => `
        <div class="patron-card" data-name="${p.Nom}">
          <img src="${p.Image || ''}" alt="${p.Nom}" class="patron-img-large" onerror="this.onerror=null;this.style.display='none'">
          <span>${p.Nom}</span>
        </div>
      `).join('')}
    </div>
  `);

  document.getElementById("back-home-patrons").addEventListener("click", (e) => { e.preventDefault(); affichHome(); });

  attachNameClickListeners(".patron-card", name => affichPatronByName(name));
}

function affichPatronByName(name) {
  const patron = listePatrons.find(p => p.Nom === name);
  if (patron) affichPatron(patron);
}

function affichPatron(patron) {
  renderPage(`
    <a href="#" id="back-patron" class="back-btn">⬅ Retour</a>
    <h1>${patron.Nom}</h1>

    <div class="patron-fiche">
      <div class="patron-top">
        <img src="${patron.Image || ''}" alt="${patron.Nom}" class="perso-img-large" onerror="this.onerror=null;this.style.display='none'">
        <div class="patron-constraints">
          <div class="patron-constraints-title">Contraintes</div>
          ${affichSectionFields(patron, ["Contraintes"])}
        </div>
      </div>

      <div class="patron-description">
        <div class="patron-constraints-title">Description</div>
        ${affichSectionFields(patron, ["Description"])}
      </div>

      <div class="patron-champions">
        <h3>Champions liés</h3>
        <div class="linked-cards" id="linked-champions"></div>
      </div>
    </div>
  `);

  document.getElementById("back-patron").addEventListener("click", (e) => { e.preventDefault(); affichPatronsList(); });

  showLinkedChampions("#linked-champions", champ => champ[patron.Nom] && champ[patron.Nom].toUpperCase() === "TRUE");
}

// ===================== FICHE PERSONNAGE =====================
function affichPersoByName(name) {
  const perso = listePersos.find(p => p.Nom === name);
  if (perso) affichPerso(perso);
}

function affichPerso(perso) {
  renderPage(`
    <a href="#" id="back-to-list" class="back-btn">⬅ Retour</a>
    <h1>${perso.Nom}</h1>

    <div class="fiche-top">
      <img src="${imageFor(perso)}" alt="${perso.Nom}" class="perso-img-large" onerror="this.onerror=null;this.src='Champions/default.jpg'">
      <div class="section-general-right">
        ${affichSectionFields(perso, ["Banc","Origine"])}
      </div>
    </div>

    <div class="bandeau-sections">
      ${sectionsFiche.slice(1,3).map(section => `
        <div class="section-bandeau">
          <div class="section-bandeau-title">${section.title}</div>
          ${affichSectionFields(perso, section.fields, false)}
        </div>
      `).join('')}
    </div>

    <div class="fiche-container">
      <div class="fiche-left">
        <h3 class="section-title">Caractéristiques</h3>
        ${affichSectionFields(perso, ["Force","Dextérité","Constitution","Intelligence","Sagesse","Charisme","Total"])}
      </div>
      <div class="fiche-right">
        <h3 class="section-title">Attaque</h3>
        ${affichSectionFields(perso, ["Type Attaque","Type Ultime"])}
        <h3 class="section-title">Patrons</h3>
        ${dispoPatrons(perso)}
      </div>
    </div>
  `);

  document.getElementById("back-to-list").addEventListener("click", (e) => { e.preventDefault(); goBackToList(); });
}

function goBackToList() {
  affichListe();
  updateList(currentPage);
}

// ===================== RENDU DES CHAMPS =====================
function affichSectionFields(item, fields, inline = false) {
  return fields.map(key => {
    if (!item[key]) return "";
    let values = item[key].split(',').map(v => v.trim()).filter(Boolean);
    if (key === "Description") {
      values = values.map(v => v.replace(/\.\s*/g, '.<br>'));
      values = [values.join(', ')];
    }
    return inline
      ? `<div class="card-detail-inline"><strong>${key}:</strong> ${values.join(' / ')}</div>`
      : `<div class="card-detail"><strong>${key}:</strong> ${values.join(' / ')}</div>`;
  }).join("");
}

function createPatronsColumn(perso, keys) {
  return keys.map(k => {
    const patron = listePatrons.find(p => p.Nom === k);
    if (!patron) return "";

    const hasPatron = perso[k] && perso[k].toUpperCase() === "TRUE";

    return `
      <div class="patrons-row">
        <img src="${patron.Image}" alt="${k}" class="patron-icon"
             onclick="affichPatronByName('${k}')">
        <span>${hasPatron ? "🟢" : "⚪"}</span>
      </div>
    `;
  }).join("");
}

function dispoPatrons(perso) {
  const col1 = ["Mirt", "Vajra", "Strahd"];
  const col2 = ["Zariel", "Elminster"];

  return `
    <div class="patrons-container">
      <div class="patrons-column">${createPatronsColumn(perso, col1)}</div>
      <div class="patrons-column">${createPatronsColumn(perso, col2)}</div>
    </div>
  `;
}

function attachPatronIconListeners() {
  document.getElementById("app").addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.classList.contains("patron-icon") && target.dataset.name) {
      affichPatronByName(target.dataset.name);
    }
  });
}

// ===================== CHARGEMENT CSV =====================
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  complete: function(results) {
    const merged = {};

    results.data
      .filter(row => row.Nom && row.Nom.trim())
      .forEach(row => {
        const name = row.Nom.trim();
        // Recompose l'alignement si colonnes séparées (si présentes)
        if ('Alignement Loyal Chaotique' in row || 'Alignement Bon Mauvais' in row) {
          row['Alignement'] = [row['Alignement Loyal Chaotique'], row['Alignement Bon Mauvais']].filter(Boolean).join(' / ');
          delete row['Alignement Loyal Chaotique'];
          delete row['Alignement Bon Mauvais'];
        }

        if (!merged[name]) {
          merged[name] = { ...row };
        } else {
          for (let key in row) {
            if (key === 'Nom' || key === 'Image') continue;
            if (!row[key]) continue;
            const existing = (merged[name][key] || "").split(',').map(v => v.trim()).filter(Boolean);
            const additions = row[key].split(',').map(v => v.trim()).filter(Boolean);
            merged[name][key] = [...new Set([...existing, ...additions])].join(', ');
          }
          if (!merged[name].Image && row.Image) merged[name].Image = row.Image;
        }
      });

    listePersos = Object.values(merged).map(p => {
      if (!p.Image) p.Image = `Champions/${normalizeString(p.Nom)}.jpg`;
      return p;
    });

    listeBancs = [...new Set(listePersos.map(p => p.Banc).filter(Boolean))].sort((a,b) => Number(a) - Number(b));
    listeClasses = [...new Set(listePersos.flatMap(p => (p.Classe || "").split(',').map(c => c.trim()).filter(Boolean)))].sort();
    listeRoles = [...new Set(listePersos.flatMap(p => (p.Rôles || "").split(',').map(r => r.trim()).filter(Boolean)))].sort();

    attachPatronIconListeners();

    affichHome();
  }
});

Papa.parse(CSV_URL_PATRONS, {
  download: true,
  header: true,
  complete: function(results) {
    listePatrons = results.data.filter(p => p.Nom && p.Nom.trim());
  }
});



