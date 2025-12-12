import { renderPage } from "../utils.js";
import { affichListe } from "./liste.js";
import { affichAffiliationList } from "./affiliation.js";
import { affichPatronsList } from "./patrons.js";

export function affichHome() {
  renderPage(`
    <div class="home-container">
      <img src="Banner/dnd-banner.png" class="home-banner">
      <h1>D&D - Idle Champions</h1>
      <p class="home-intro">
        Salutations, héros en herbe !<br>
        Préparez vos champions pour la gloire !
      </p>

      <div class="home-buttons">
        <button id="btn-champions">Champions</button>
        <button id="btn-affiliations">Affiliations</button>
        <button id="btn-patrons">Patrons</button>
      </div>
    </div>
  `);

  document.getElementById("btn-champions").onclick = affichListe;
  document.getElementById("btn-affiliations").onclick = affichAffiliationList;
  document.getElementById("btn-patrons").onclick = affichPatronsList;
}
