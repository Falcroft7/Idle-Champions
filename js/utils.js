export function normalizeString(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s.-]/g, "");
}

export function imageFor(p) {
  if (!p) return "Champions/default.jpg";
  if (p.Image && p.Image.trim()) return p.Image.trim();
  const normalized = normalizeString(p.Nom || "");
  return `Champions/${normalized}.jpg`;
}

export function attachNameClickListeners(selector, handler) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener("click", () => {
      const name = el.dataset.name;
      if (name) handler(name);
    });
  });
}

export function renderPage(html) {
  const app = document.getElementById("app");
  const tempDiv = document.createElement("div");
  tempDiv.className = "page-transition";
  tempDiv.innerHTML = html;
  app.innerHTML = "";
  app.appendChild(tempDiv);
  requestAnimationFrame(() => tempDiv.classList.add("active"));
}
