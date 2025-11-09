// ===================== CONSTANTES =====================
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-Z9L00gE2wnlhgD1LSlSyNDo2dej3UcX_-UtnN2NBrV8tzHxib_Mxx28d3k9CoWjzhQUxcQjK7TA/pub?output=csv";
const csvUrlPatrons = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-Z9L00gE2wnlhgD1LSlSyNDo2dej3UcX_-UtnN2NBrV8tzHxib_Mxx28d3k9CoWjzhQUxcQjK7TA/pub?gid=1864789699&single=true&output=csv";

// ===================== VARIABLES GLOBALES =====================
let listePersos = [];
let listePatrons = [];
let listeBancs = [];
let listeClasses = [];
let listeRoles = [];
let headersOrder = [];

// Pagination
let currentPage = 1;
const itemsPerPage = 30;

// Images patrons
const imagesPatrons = {
  "Mirt": "../Images/Patrons/Mirt.jfif",
  "Vajra": "../Images/Patrons/Vajra.jfif",
  "Strahd": "../Images/Patrons/Strahd.jfif",
  "Zariel": "../Images/Patrons/Zariel.jfif",
  "Elminster": "../Images/Patrons/Elminster.jfif",
};

// Sections fiche
const sectionsFiche = [
  { title: "Général", fields: ["Banc", "Origine"] },
  { title: "Identité", fields: ["Genre", "Espèce", "Age"] },
  { title: "Classe & Rôle", fields: ["Classe", "Alignement", "Rôles", "Rôles secondaires", "Affiliation", "Accablement"] },
  { title: "Caractéristiques", fields: ["Force", "Dextérité", "Constitution", "Intelligence", "Sagesse", "Charisme", "Total"] },
  { title: "Attaque", fields: ["Type Attaque", "Type Ultime"] },
  { title: "Patrons", fields: Object.keys(imagesPatrons) }
];

// ===================== UTILITAIRES =====================
function normalizeString(str) {
  return str?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
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

function getFields(sectionTitle) {
  return sectionsFiche.find(s => s.title === sectionTitle)?.fields || [];
}

function renderPage(htmlContent) {
  const app = document.getElementById("app");

  const tempDiv = document.createElement("div");
  tempDiv.className = "page-transition";
  tempDiv.innerHTML = htmlContent;

  app.innerHTML = "";
  app.appendChild(tempDiv);

  requestAnimationFrame(() => {
    tempDiv.classList.add("active");
  });
}

// ===================== PAGE D'ACCUEIL =====================
function affichHome() {
  renderPage(`
    <div class="home-container">
      <img 
        src="Banner/dnd-banner.png"
        alt="D&D Banner" 
        class="home-banner"
      >
      <h1>D&D - Idle Champions</h1>
      <p class="home-intro">
        Salutations, héros en herbe !<br>
        Gérez vos champions, découvrez leurs patrons mystérieux et préparez des combos épiques.<br>
        Appuyez sur un bouton pour plonger dans l’aventure !
      </p>
      <div class="home-buttons">
        <button onclick="affichListe()">Champions</button>
        <button onclick="affichAffiliationList()">Affiliations</button>
        <button onclick="affichPatronsList()">Patrons</button>
        <button onclick="affichSynergies()">Synergies</button>
      </div>
    </div>
  `);
}

// ===================== FILTRAGE & TRI =====================
function filterAndSortPersos(filtresActuels) {
  const query = normalizeString(filtresActuels.search);

  let persosFiltres = listePersos.filter(p => {
    const bancOk = filtresActuels.banc === "Tous" || p.Banc === filtresActuels.banc;
    const classeOk = filtresActuels.classe === "Toutes" || (p.Classe || "").split(',').map(c => c.trim()).includes(filtresActuels.classe);
    const roleOk = filtresActuels.role === "Tous" || (p.Rôles || "").split(',').map(r => r.trim()).includes(filtresActuels.role);
    const searchOk = !query || normalizeString(p.Nom).includes(query);
    return bancOk && classeOk && roleOk && searchOk;
  });

  persosFiltres.sort((a, b) => {
    if (filtresActuels.sort === "nom-asc") return a.Nom.localeCompare(b.Nom);
    if (filtresActuels.sort === "nom-desc") return b.Nom.localeCompare(a.Nom);
    if (filtresActuels.sort === "banc-asc") return (a.Banc || "").localeCompare(b.Banc || "", undefined, { numeric: true });
    return 0;
  });

  return persosFiltres;
}

// ===================== LISTE DES PERSONNAGES =====================
function affichListe() {
  renderPage(`
    <a href="#" onclick="affichHome()" class="back-btn">⬅ Retour</a>
    <h2>Liste des champions</h2>
    ${renderFilters()}
    <div id="cardsContainer" class="cards"></div>
    <p id="noResultsMessage" class="no-results">Aucun personnage trouvé</p>
    <div id="pagination" class="pagination"></div>
  `);
  updateList();

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.name;
      affichPersoByName(name);
    });
  });
}

// ===================== LISTE DES AFFILIATIONS =====================
function affichAffiliationList() {
  // On récupère toutes les affiliations uniques depuis listePersos
  let affiliationsUniques = [...new Set(listePersos
    .map(p => p.Affiliation)
    .filter(a => a && a.trim() !== ""))];

  // On trie alphabétiquement mais "Aucun" passe en bas
  affiliationsUniques.sort((a, b) => {
    if (a === "Aucun") return 1;   // "Aucun" toujours après
    if (b === "Aucun") return -1;  
    return a.localeCompare(b);      // sinon tri classique
  });

  renderPage(`
    <a href="#" onclick="affichHome()" class="back-btn">⬅ Retour</a>
    <h2>Liste des Affiliations</h2>
    <div class="affiliations-container">
      ${affiliationsUniques.map(nom => `
        <div class="affiliation-card" data-name="${nom}">
          ${nom !== "Aucun" ? `
            <img src="Images/Affiliations/${normalizeString(nom)}.png" alt="${nom}" class="affiliation-logo">
          ` : `
            <div class="affiliation-logo affiliation-logo-placeholder"></div>
          `}
          <span${nom === "Aucun" ? ' style="color:#888; font-style:italic;"' : ''}>${nom}</span>
        </div>
      `).join('')}
    </div>
  `);

  document.querySelectorAll(".affiliation-card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.name;
      affichAffiliationByName(name);
    });
  });
}

// ===================== FICHE AFFILIATION =====================
function affichAffiliationByName(name) {
  renderPage(`
    <a href="#" onclick="affichAffiliationList()" class="back-btn">⬅ Retour</a>
    <h1>${name}</h1>

    <div class="affiliation-members">
      <div class="section-title">Champions liés</div>
      <div class="linked-cards" id="linked-champions"></div>
    </div>
  `);

  showLinkedChampionsForAffiliation(name);
}

// ===================== CHAMPIONS LIÉS À UNE AFFILIATION =====================
function showLinkedChampionsForAffiliation(affiliationName) {
  const container = document.getElementById("linked-champions");
  container.innerHTML = "";

  const championsLies = listePersos.filter(champion => champion.Affiliation === affiliationName);

  if (championsLies.length === 0) {
    container.innerHTML = `<p style="color:#aaa; font-style:italic;">Aucun champion lié</p>`;
    return;
  }

  championsLies.forEach(champion => {
    const card = document.createElement("div");
    card.className = "linked-champion-card";

    card.innerHTML = `
      <img src="${champion.Image || 'images/champions/default.png'}" 
           alt="${champion.Nom}" 
           title="${champion.Nom}"
           class="linked-champion-img"
           onerror="this.src='images/champions/default.png'">
      <div class="linked-champion-name">${champion.Nom}</div>
    `;

    // Clique sur le champion → ouvre sa fiche
    card.addEventListener("click", () => {
      affichPersoByName(champion.Nom);
    });

    container.appendChild(card);
  });
}

// ===================== LISTE DES PATRONS =====================
function affichPatronsList() {
  renderPage(`
    <a href="#" onclick="affichHome()" class="back-btn">⬅ Retour</a>
    <h2>Liste des Patrons</h2>
    <div class="patrons-container-large">
      ${listePatrons.map(p => `
        <div class="patron-card" data-name="${p.Nom}">
          <img src="${p.Image}" alt="${p.Nom}" class="patron-img-large">
          <span>${p.Nom}</span>
        </div>
      `).join('')}
    </div>
  `);

  document.querySelectorAll(".patron-card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.name;
      affichPatronByName(name);
    });
  });
}

// ===================== RENDER FILTERS =====================
function renderFilters() {
  return `
    <div class="filters">
      <div class="top-line">
        ${renderSelect("Banc", "bancSelect", "Tous", listeBancs, "updateList()")}
        ${renderSelect("Classe", "classeSelect", "Toutes", listeClasses, "updateList()")}
        ${renderSelect("Rôle", "roleSelect", "Tous", listeRoles, "updateList()")}
        ${renderSelect("Trier par", "sortSelect", null, [
          { value: "banc-asc", label: "Banc croissant" },
          { value: "nom-asc", label: "Nom A → Z" },
          { value: "nom-desc", label: "Nom Z → A" }
        ], "updateList()")}
      </div>

      <div class="bottom-line">
        <div id="search-container">
          <span>🔍</span>
          <input type="text" id="searchInput" placeholder="Rechercher un personnage..." oninput="updateList()">
        </div>
        <div id="reset-container">
          <button class="reset-btn" onclick="resetFilters()">⟳</button>
        </div>
      </div>
    </div>
  `;
}

function renderSelect(label, id, defaultValue, options, onChange) {
  const opts = options.map(opt => {
    if (typeof opt === "string") return `<option value="${opt}">${opt}</option>`;
    return `<option value="${opt.value}">${opt.label}</option>`;
  }).join("");

  return `
    <div class="filter-group">
      <label class="filter-label">${label}:</label>
      <select id="${id}" onchange="${onChange}">
        ${defaultValue ? `<option value="${defaultValue}">${defaultValue}</option>` : ""}
        ${opts}
      </select>
    </div>
  `;
}

// ===================== RESET FILTRES =====================
function resetFilters() {
  document.getElementById("bancSelect").value = "Tous";
  document.getElementById("classeSelect").value = "Toutes";
  document.getElementById("roleSelect").value = "Tous";
  document.getElementById("searchInput").value = "";
  document.getElementById("sortSelect").value = "banc-asc";
  currentPage = 1;
  updateList();
}

// ===================== LISTE & PAGINATION =====================
function updateList(page = currentPage) {
  const filtresActuels = getCurrentFilters();
  const persosFiltres = filterAndSortPersos(filtresActuels);

  currentPage = page;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const persosPage = persosFiltres.slice(startIndex, endIndex);

  const cardsContainer = document.querySelector(".cards");
  const noResultsMessage = document.getElementById("noResultsMessage");

  if (persosFiltres.length === 0) {
    noResultsMessage.style.display = "block";
    cardsContainer.innerHTML = "";
  } else {
    noResultsMessage.style.display = "none";
    cardsContainer.innerHTML = persosPage.map(p => `
      <div class="card" onclick="affichPersoByName('${p.Nom.replace(/'/g,"\\'")}')">
        ${p.Image ? `<img src="${p.Image}" alt="${p.Nom}" class="card-img">` : ""}
        <span class="card-name">${p.Nom}</span>
      </div>
    `).join("");
  }

  affichPagination(persosFiltres);
}

function affichPagination(filteredData) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => updateList(i));
    paginationContainer.appendChild(btn);
  }
}

// ===================== FICHE PERSONNAGE =====================
function affichPersoByName(name) {
  const perso = listePersos.find(p => p.Nom === name);
  if (perso) affichPerso(perso);
}

function affichPerso(perso) {
  const html = `
    <a href="#" onclick="goBackToList()" class="back-btn">⬅ Retour</a>
    <h1>${perso.Nom}</h1>

    <div class="fiche-top">
      <img src="${perso.Image || ''}" alt="${perso.Nom}" class="perso-img-large">
      <div class="section-general-right">
        ${affichSectionFields(perso, getFields("Général"))}
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
        ${affichSectionFields(perso, getFields("Caractéristiques"))}
      </div>
      <div class="fiche-right">
        <h3 class="section-title">Attaque</h3>
        ${affichSectionFields(perso, getFields("Attaque"))}
        <h3 class="section-title">Patrons</h3>
        ${affichSectionFields(perso, getFields("Patrons"))}
      </div>
    </div>
  `;

  document.getElementById("app").innerHTML = html;
}

function goBackToList() {
  affichListe();
  updateList(currentPage);
}

// ===================== SECTIONS PERSOS =====================
function affichSectionFields(perso, fields, inline = false) {
  const patronKeys = Object.keys(imagesPatrons);

  if (fields.some(f => patronKeys.includes(f))) {
    return dispoPatrons(perso);
  }

  return fields.map(key => {
    if (perso[key]) {
      let values = perso[key].split(',').map(v => v.trim()).filter(Boolean);

      if (key === "Description") {
        values = values.map(v => v.replace(/\.\s*/g, '.<br>'));
        values = [values.join(', ')];
      }

      return inline
        ? `<div class="card-detail-inline"><strong>${key}:</strong> ${values.join(' / ')}</div>`
        : `<div class="card-detail"><strong>${key}:</strong> ${values.join(' / ')}</div>`;
    }
    return "";
  }).join("");
}

function createPatronsColumn(perso, keys) {
  return keys.map(k => {
    if (!perso[k]) return "";
    const icon = perso[k].toUpperCase() === "TRUE" ? "🟢" : "⚪";
    return `
      <div>
        <img src="${imagesPatrons[k]}" alt="${k}" class="patron-icon" onclick="affichPatronByName('${k}')">
        ${icon}
      </div>
    `;
  }).join("");
}

function dispoPatrons(perso) {
  return `
    <div class="patrons-container">
      <div class="patrons-column">${createPatronsColumn(perso, ["Mirt","Vajra","Strahd"])}</div>
      <div class="patrons-column">${createPatronsColumn(perso, ["Zariel","Elminster"])}</div>
    </div>
  `;
}

// ===================== FICHE PATRON =====================
function affichPatronByName(name) {
  const patron = listePatrons.find(p => p.Nom === name);
  if (patron) affichPatron(patron);
}

function affichPatron(patron) {
  const app = document.getElementById("app");

  app.innerHTML = `
    <a href="#" onclick="affichPatronsList()" class="back-btn">⬅ Retour</a>
    <h1>${patron.Nom}</h1>

    <div class="patron-fiche">
      <div class="patron-top">
        <img src="${patron.Image || ''}" alt="${patron.Nom}" class="perso-img-large">
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
        <div class="linked-cards" id="linked-champions">
        </div>
      </div>
    </div>
  `;

  showLinkedChampions(patron);
}

function showLinkedChampions(patron) {
  const container = document.getElementById("linked-champions");
  container.innerHTML = "";

  const patronKey = patron.Nom;

  listePersos.forEach(champion => {
    if (champion[patronKey] && champion[patronKey].toUpperCase() === "TRUE") {
      const card = document.createElement("div");
      card.className = "linked-card";

      const img = document.createElement("img");
      img.src = champion.Image || "images/champions/default.png"; // fallback si pas d'image
      img.alt = champion.Nom;
      img.title = champion.Nom;
      img.className = "linked-champion-img";

      img.onclick = () => affichPersoByName(champion.Nom);

      const nameSpan = document.createElement("span");
      nameSpan.textContent = champion.Nom;
      nameSpan.className = "linked-champion-name";

      card.appendChild(img);
      card.appendChild(nameSpan);

      container.appendChild(card);
    }
  });

  if (container.innerHTML === "") {
    container.innerHTML = `<p style="color:#aaa; font-style:italic;">Aucun champion lié</p>`;
  }
}

// ===================== CHARGEMENT CSV =====================
Papa.parse(csvUrl, {
  download: true,
  header: true,
  complete: function(results) {
    headersOrder = results.meta.fields;
    const merged = {};

    results.data
      .filter(row => row.Nom && row.Nom.trim())
      .forEach(row => {
        const name = row.Nom.trim();
        row['Alignement'] = [row['Alignement Loyal Chaotique'], row['Alignement Bon Mauvais']].filter(Boolean).join(' / ');
        delete row['Alignement Loyal Chaotique'];
        delete row['Alignement Bon Mauvais'];

        if (!merged[name]) {
          merged[name] = { ...row };
        } else {
          for (let key in row) {
            if (key !== 'Nom' && key !== 'Image' && row[key]) {
              const existing = merged[name][key]?.split(',').map(v => v.trim()) || [];
              const additions = row[key].split(',').map(v => v.trim());
              merged[name][key] = [...new Set([...existing, ...additions])].join(', ');
            }
          }
          if (!merged[name].Image && row.Image) merged[name].Image = row.Image;
        }
      });

    listePersos = Object.values(merged);
    
    listeBancs = [...new Set(listePersos.map(p => p.Banc).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
    listeClasses = [...new Set(listePersos.flatMap(p => (p.Classe || "").split(',').map(c => c.trim()).filter(Boolean)))].sort();
    listeRoles = [...new Set(listePersos.flatMap(p => (p.Rôles || "").split(',').map(r => r.trim()).filter(Boolean)))].sort();

    affichHome();
  }
});

Papa.parse(csvUrlPatrons, {
  download: true,
  header: true,
  complete: function(results) {
    listePatrons = results.data.filter(p => p.Nom && p.Nom.trim());
  }
});



