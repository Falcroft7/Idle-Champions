import { affichHome } from "./pages/home.js";
import { listePersos, listePatrons, listeBancs, listeClasses, listeRoles } from "./state.js";
import { normalizeString } from "./utils.js";

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  complete(results) {
    // Ton code merge CSV ici
    // Puis :
    affichHome();
  }
});

Papa.parse(CSV_URL_PATRONS, {
  download: true,
  header: true,
  complete(results) {
    listePatrons = results.data.filter(p => p.Nom && p.Nom.trim());
  }
});
