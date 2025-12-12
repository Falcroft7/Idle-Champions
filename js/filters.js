import { normalizeString } from "./utils.js";
import { listePersos } from "./state.js";

export function getCurrentFilters() {
  return {
    banc: document.getElementById("bancSelect")?.value || "Tous",
    classe: document.getElementById("classeSelect")?.value || "Toutes",
    role: document.getElementById("roleSelect")?.value || "Tous",
    search: document.getElementById("searchInput")?.value || "",
    sort: document.getElementById("sortSelect")?.value || "banc-asc"
  };
}

export function filterAndSortPersos(filters) {
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
