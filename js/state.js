export let listePersos = [];
export let listePatrons = [];
export let listeBancs = [];
export let listeClasses = [];
export let listeRoles = [];
export let currentPage = 1;

export const ITEMS_PER_PAGE = 30;

export const sectionsFiche = [
  { title: "Général", fields: ["Banc", "Origine"] },
  { title: "Identité", fields: ["Genre", "Espèce", "Age"] },
  { title: "Classe & Rôle", fields: ["Classe", "Alignement", "Rôles", "Rôles secondaires", "Affiliation", "Accablement"] },
  { title: "Caractéristiques", fields: ["Force", "Dextérité", "Constitution", "Intelligence", "Sagesse", "Charisme", "Total"] },
  { title: "Attaque", fields: ["Type Attaque", "Type Ultime"] },
];
