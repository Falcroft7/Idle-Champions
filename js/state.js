// ===================== CONSTANTES =====================
export const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-Z9L00gE2wnlhgD1LSlSyNDo2dej3UcX_-UtnN2NBrV8tzHxib_Mxx28d3k9CoWjzhQUxcQjK7TA/pub?output=csv";
export const CSV_URL_PATRONS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-Z9L00gE2wnlhgD1LSlSyNDo2dej3UcX_-UtnN2NBrV8tzHxib_Mxx28d3k9CoWjzhQUxcQjK7TA/pub?gid=1864789699&single=true&output=csv";

export const sectionsFiche = [
  { title: "Général", fields: ["Banc", "Origine"] },
  { title: "Identité", fields: ["Genre", "Espèce", "Age"] },
  { title: "Classe & Rôle", fields: ["Classe", "Alignement", "Rôles", "Rôles secondaires", "Affiliation", "Accablement"] },
  { title: "Caractéristiques", fields: ["Force", "Dextérité", "Constitution", "Intelligence", "Sagesse", "Charisme", "Total"] },
  { title: "Attaque", fields: ["Type Attaque", "Type Ultime"] },
];

// ===================== ÉTAT GLOBAL =====================
export let listePersos = [];
export let listePatrons = [];
export let listeBancs = [];
export let listeClasses = [];
export let listeRoles = [];

// ===================== PAGINATION =====================
export let currentPage = 1;
export const ITEMS_PER_PAGE = 30;
