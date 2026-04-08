document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector(".btn-topo");

  function getCurrentSection(pathname) {
    var path = String(pathname || "").toLowerCase();

    if (path.indexOf("/busca.html") !== -1) {
      return "busca";
    }

    if (path.indexOf("/exercicios.html") !== -1 || path.indexOf("/buscador-resolucoes.html") !== -1) {
      return "exercicios";
    }

    if (path.indexOf("/notas-de-aula/") !== -1 || path.indexOf("/notas-de-aula.html") !== -1) {
      return "resumos";
    }

    if (path.indexOf("/resumos/") !== -1 || path.indexOf("/resumos-livros") !== -1) {
      return "resumos";
    }

    return "inicio";
  }

  function enhanceSiteNav() {
    var nav = document.querySelector(".site-nav");
    var basePath = window.location.pathname.indexOf("/mbs/") === 0 ? "/mbs/" : "/";
    var currentSection;
    var links;
    var markup;

    if (!nav) {
      return;
    }

    currentSection = getCurrentSection(window.location.pathname);
    links = [
      { key: "inicio", label: "In&iacute;cio", href: basePath + "index.html" },
      { key: "busca", label: "Busca", href: basePath + "busca.html" },
      { key: "exercicios", label: "Exerc&iacute;cios", href: basePath + "exercicios.html" },
      { key: "resumos", label: "Resumos", href: basePath + "resumos/index.html" }
    ];

    markup = links.map(function (item) {
      var className = item.key === currentSection ? "nav-link is-current" : "nav-link";
      return '<a class="' + className + '" href="' + item.href + '">' + item.label + "</a>";
    }).join("");

    nav.innerHTML = markup;
  }

  function ensureTopAnchor() {
    if (!document.getElementById("top") && document.body) {
      document.body.id = "top";
    }
  }

  function updateVisibility() {
    if (!button) {
      return;
    }

    var isMobile = window.matchMedia("(max-width: 640px)").matches;
    var threshold = isMobile ? 24 : 120;
    var shouldShow = window.scrollY > threshold;
    button.classList.toggle("is-visible", shouldShow);
  }

  function scrollToTop(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  ensureTopAnchor();
  enhanceSiteNav();

  if (!button) {
    button = document.createElement("a");
    button.className = "btn-topo";
    button.href = "#top";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.setAttribute("title", "Voltar ao topo");
    button.textContent = "Topo";
    document.body.appendChild(button);
  }

  button.addEventListener("click", scrollToTop);
  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility);
  updateVisibility();
});
