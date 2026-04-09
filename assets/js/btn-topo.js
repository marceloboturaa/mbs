document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector(".btn-topo");

  function getBasePath() {
    return window.location.pathname.indexOf("/mbs/") === 0 ? "/mbs/" : "/";
  }

  function normalizeSitePath(pathname) {
    var path = String(pathname || "").toLowerCase();

    return path.indexOf("/mbs/") === 0 ? path.slice(4) : path;
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function isInternalPage(pathname) {
    var normalized = normalizeSitePath(pathname);

    return (
      normalized.indexOf("/resumos/") === 0 ||
      normalized.indexOf("/exercicios/") === 0 ||
      normalized.indexOf("/notas-de-aula/") === 0
    );
  }

  function applyEnvironmentFavicon() {
    var host = String(window.location.hostname || "").toLowerCase();
    var basePath = getBasePath();
    var flavor = "blue";
    var faviconHref = basePath + "icons/favicon-azul.svg?v=blue";
    var iconLinks = Array.prototype.slice.call(document.querySelectorAll('link[rel~="icon"]'));

    if (host === "localhost" || host === "127.0.0.1") {
      if (isInternalPage(window.location.pathname)) {
        flavor = "green";
        faviconHref = basePath + "icons/favicon-verde.svg?v=green";
      } else {
        flavor = "orange";
        faviconHref = basePath + "icons/favicon-laranja.svg?v=orange";
      }
    }

    if (!iconLinks.length) {
      iconLinks = [document.createElement("link")];
      iconLinks[0].setAttribute("rel", "icon");
      document.head.appendChild(iconLinks[0]);
    }

    iconLinks.forEach(function (icon) {
      icon.href = faviconHref;
      icon.type = "image/svg+xml";

      if (icon.hasAttribute("sizes")) {
        icon.removeAttribute("sizes");
      }

      if (icon.hasAttribute("color")) {
        icon.removeAttribute("color");
      }
    });

    document.documentElement.setAttribute("data-favicon-flavor", flavor);
  }

  function applyEnvironmentClasses() {
    var host = String(window.location.hostname || "").toLowerCase();

    if (!document.body) {
      return;
    }

    if (host === "localhost" || host === "127.0.0.1") {
      document.body.classList.add("is-localhost");
    } else {
      document.body.classList.remove("is-localhost");
    }
  }

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
    var basePath = getBasePath();
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

  function parseExerciseIndexItem(link) {
    var metaLine = link.querySelector(".exercise-meta-line");
    var metaText = normalizeText((metaLine ? metaLine.textContent : link.getAttribute("data-search")) || "");
    var pageMatch = metaText.match(/\bp(?:agina)?\s*(\d+)\b/);
    var exerciseMatch = metaText.match(/\bexercicio\s*(\d+)\b/);
    var href = new URL(link.getAttribute("href"), window.location.href).pathname;

    return {
      href: href,
      normalizedHref: normalizeSitePath(href),
      page: pageMatch ? Number(pageMatch[1]) : 0,
      exercise: exerciseMatch ? Number(exerciseMatch[1]) : 0,
      label: metaLine ? metaLine.textContent.trim() : link.textContent.trim()
    };
  }

  function getExerciseSequence() {
    return [
      { page: 51, chapter: "Cap. 2.2", exercise: 1, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-1-dy-sen-5x.html" },
      { page: 51, chapter: "Cap. 2.2", exercise: 2, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-2-dy-x-1-ao-quadrado.html" },
      { page: 51, chapter: "Cap. 2.2", exercise: 3, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-3-dx-e-3x-dy-0-cap22.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 11, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-11-dx-e-3x-dy-0.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 13, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-13-x-dx-y-2x-dy-0.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 14, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-14-y-dx-2x-y-dy.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 15, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-15-y2-yx-dx-x2-dy-0.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 17, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-17-dy-dx-y-x-sobre-y-x.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 19, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-19-y-dx-x-raiz-xy-dy-0.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 21, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-21-2x2y-dx-3x3-y3-dy.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 23, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-23-dy-dx-y-x-x-y.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 25, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-25-y-dx-dy-x-4y-e-2x-sobre-y.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 27, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-27-y-cotg-y-sobre-x-dx-x-dy.html" },
      { page: 59, chapter: "Cap. 2.3", exercise: 29, href: "exercicios/calculo-3/equacoes-diferenciais/exercicio-29-x2-xy-y2-dx-xydy-0.html" }
    ];
  }

  function buildExerciseNavLink(item, rel, label) {
    var link = document.createElement("a");
    var title = document.createElement("strong");
    var meta = document.createElement("span");
    var chapterLabel = item.chapter || "";
    var exerciseLabel = "Exercício " + item.exercise;

    link.className = "exercise-nav-link exercise-nav-" + rel;
    link.href = item.href;
    link.rel = rel;

    title.className = "exercise-nav-title";
    title.textContent = chapterLabel;

    meta.className = "exercise-nav-meta";
    meta.textContent = exerciseLabel;

    link.setAttribute("aria-label", label + ": " + chapterLabel + ", " + exerciseLabel);
    link.appendChild(title);
    link.appendChild(meta);

    return link;
  }

  function buildExerciseNavDisabled(label, rel) {
    var span = document.createElement("span");
    var title = document.createElement("strong");
    var meta = document.createElement("span");

    span.className = "exercise-nav-link is-disabled exercise-nav-" + rel;
    span.setAttribute("aria-hidden", "true");

    title.className = "exercise-nav-title";
    title.textContent = label;

    meta.className = "exercise-nav-meta";
    meta.textContent = "";

    span.appendChild(title);
    span.appendChild(meta);

    return span;
  }

  function enhanceExerciseNavigation() {
    var card = document.querySelector(".exercise-card");
    var anchor = document.querySelector(".exercise-actions");
    var currentPath = normalizeSitePath(window.location.pathname);
    var items;

    if (!card || currentPath.indexOf("/exercicios/") !== 0 || document.querySelector(".exercise-nav")) {
      return;
    }

    items = getExerciseSequence().map(function (item) {
      var href = getBasePath() + item.href;

      return {
        href: href,
        normalizedHref: normalizeSitePath(href),
        page: item.page,
        exercise: item.exercise,
        chapter: item.chapter
      };
    });

    var currentIndex = items.findIndex(function (item) {
      return item.normalizedHref === currentPath;
    });
    var nav;
    var prev;
    var next;
    var listLink;

    if (currentIndex === -1) {
      return;
    }

    prev = currentIndex > 0 ? items[currentIndex - 1] : null;
    next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    nav = document.createElement("nav");
    nav.className = "exercise-nav";
    nav.setAttribute("aria-label", "Navegação entre exercícios");

    if (prev) {
      nav.appendChild(buildExerciseNavLink(prev, "prev", "Exercício anterior"));
    } else {
      nav.appendChild(buildExerciseNavDisabled("Início da lista", "prev"));
    }

    listLink = document.createElement("a");
    listLink.className = "exercise-nav-link exercise-nav-list";
    listLink.href = getBasePath() + "exercicios.html";
    listLink.innerHTML = '<strong class="exercise-nav-title">Índice de exercícios</strong><span class="exercise-nav-meta">Voltar à lista</span>';
    listLink.setAttribute("aria-label", "Voltar ao índice de exercícios");

    nav.appendChild(listLink);

    if (next) {
      nav.appendChild(buildExerciseNavLink(next, "next", "Próximo exercício"));
    } else {
      nav.appendChild(buildExerciseNavDisabled("Fim da lista", "next"));
    }

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(nav, anchor.nextSibling);
    } else {
      card.parentNode.insertBefore(nav, card);
    }
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
  applyEnvironmentClasses();
  applyEnvironmentFavicon();
  enhanceSiteNav();
  enhanceExerciseNavigation();

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
