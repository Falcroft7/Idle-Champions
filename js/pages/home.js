import { affichListe, affichAffiliationList, affichPatronsList } from "./liste.js";

export function affichHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
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
  `;

  document.getElementById("btn-champions").addEventListener("click", affichListe);
  document.getElementById("btn-affiliations").addEventListener("click", affichAffiliationList);
  document.getElementById("btn-patrons").addEventListener("click", affichPatronsList);
  document.getElementById("btn-synergies").addEventListener("click", () => alert("En développement"));
}
