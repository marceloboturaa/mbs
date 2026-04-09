document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.getElementById("global-search");
  var resultsContainer = document.getElementById("global-results");
  var emptyState = document.getElementById("global-empty");
  var searchIndex = [];
  var siteBase = window.location.pathname.indexOf("/mbs/") === 0 ? "/mbs/" : "/";

  function repairMojibake(value) {
    var text = String(value || "");
    var replacements = [
      ["Ã¡", "á"], ["Ã ", "à"], ["Ã¢", "â"], ["Ã£", "ã"], ["Ã¤", "ä"],
      ["Ã©", "é"], ["Ãª", "ê"], ["Ã­", "í"], ["Ã³", "ó"], ["Ã´", "ô"],
      ["Ãµ", "õ"], ["Ãº", "ú"], ["Ã§", "ç"], ["Ã�", "Á"], ["Ã‰", "É"],
      ["Ã“", "Ó"], ["Ãš", "Ú"], ["Ã‡", "Ç"], ["Âª", "ª"], ["Âº", "º"],
      ["Â·", "·"], ["â†—", "↗"], ["âˆŽ", "∎"], ["â€œ", "\""], ["â€\u009d", "\""],
      ["â€˜", "'"], ["â€™", "'"], ["Â", ""]
    ];

    try {
      while (/[ÃÂâ]/.test(text)) {
        text = decodeURIComponent(escape(text));
      }
    } catch (error) {
      text = String(value || "");
    }

    replacements.forEach(function (entry) {
      text = text.split(entry[0]).join(entry[1]);
    });

    return text;
  }

  function normalizeSearchText(value) {
    return repairMojibake(String(value || ""))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanContent(item) {
    var title = repairMojibake(String(item.title || "")).trim();
    var content = repairMojibake(String(item.content || ""));
    var boilerplatePatterns = [
      /\bIn[ií]cio\s+Busca\s+Exerc[ií]cios\s+Notas de aula\s+Resumos?\b/gi,
      /\bIn[ií]cio\s+Exerc[ií]cios\s+Notas de aula\s+Resumos?\b/gi,
      /\bIn[ií]cio\s+Busca\s+Exerc[ií]cios\s+Resumos?\b/gi,
      /\bIn[ií]cio\s+Exerc[ií]cios\s+Resumos?\b/gi,
      /\bBusca global\b/gi,
      /\bPesquise em todo o site:[^.]*\./gi,
      /\b0 resultados\.[^.]*?/gi,
      /\bNenhum conte[úu]do encontrado\./gi,
      /\bResolução\b/gi,
      /\bNota de aula\b/gi,
      /\bImprimir\b/gi,
      /\bTeX\b/gi,
      /\bArquivo original LaTeX indispon[ií]vel\b/gi,
      /@sabormatematica\s*\|\s*20\d{2}.*/gi,
      /\bTopo\b/gi,
      /\s+↗/g
    ];

    if (title && content.indexOf(title) === 0) {
      content = content.slice(title.length);
    }

    boilerplatePatterns.forEach(function (pattern) {
      content = content.replace(pattern, " ");
    });

    return content
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim();
  }

  function normalizeResultUrl(url) {
    var value = String(url || "");

    if (value === "/mbs/notas-de-aula/index.html") {
      return siteBase + "resumos/index.html";
    }

    if (value === "/mbs/notas-de-aula/calculo-3/calculo-3-aula-16-marco.html") {
      return siteBase + "resumos/derivada/calculo-3-aula-16-marco.html";
    }

    if (value.indexOf("/mbs/") === 0) {
      return siteBase + value.slice("/mbs/".length);
    }

    return value;
  }

  function normalizeLegacyEntry(item) {
    var url = String(item.url || "");

    if (url === "/mbs/notas-de-aula/index.html") {
      return {
        title: "Resumos | Marcelo Botura Souza",
        section: "Resumos",
        content: "Resumos Guias e resumos organizados por tema para consulta direta. Derivada Guia introdutório com interpretação geométrica, regras básicas e exemplos resolvidos. Nota de aula Aula de Cálculo III do dia 16 de março."
      };
    }

    if (url === "/mbs/notas-de-aula/calculo-3/calculo-3-aula-16-marco.html") {
      return {
        title: "Cálculo III · Equações Diferenciais · Notas Completas",
        section: "Resumos",
        content: "Notas de aula de Cálculo III sobre equações diferenciais, com exemplos, gráficos e observações. Derivadas representam taxas de variação. Matemáticos fazem análises diferentes das dos físicos e químicos. Conteúdo com definição, classificação, linearidade e solução de equações diferenciais."
      };
    }

    return {
      title: repairMojibake(item.title),
      section: repairMojibake(item.section),
      content: cleanContent(item)
    };
  }

  function trimBrokenLatexEdges(snippet) {
    var text = String(snippet || "");
    var firstInlineOpen = text.indexOf("\\(");
    var firstInlineClose = text.indexOf("\\)");
    var firstDisplayOpen = text.indexOf("\\[");
    var firstDisplayClose = text.indexOf("\\]");
    var lastInlineOpen = text.lastIndexOf("\\(");
    var lastInlineClose = text.lastIndexOf("\\)");
    var lastDisplayOpen = text.lastIndexOf("\\[");
    var lastDisplayClose = text.lastIndexOf("\\]");

    if (firstInlineClose !== -1 && (firstInlineOpen === -1 || firstInlineClose < firstInlineOpen)) {
      text = text.slice(firstInlineClose + 2).trim();
    }

    if (firstDisplayClose !== -1 && (firstDisplayOpen === -1 || firstDisplayClose < firstDisplayOpen)) {
      text = text.slice(firstDisplayClose + 2).trim();
    }

    if (lastInlineOpen !== -1 && lastInlineOpen > lastInlineClose) {
      text = text.slice(0, lastInlineOpen).trim();
    }

    if (lastDisplayOpen !== -1 && lastDisplayOpen > lastDisplayClose) {
      text = text.slice(0, lastDisplayOpen).trim();
    }

    return text;
  }

  function formatLatexSnippet(snippet) {
    return trimBrokenLatexEdges(String(snippet || ""))
      .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, "\\($1\\)")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildSnippet(item, normalizedQuery) {
    var content = String(item.content || "");
    var normalizedContent = normalizeSearchText(content);
    var index = normalizedQuery ? normalizedContent.indexOf(normalizedQuery) : -1;
    var start;
    var end;
    var snippet;

    if (index === -1) {
      snippet = content.slice(0, 180).trim() + (content.length > 180 ? "..." : "");
      return formatLatexSnippet(snippet);
    }

    start = Math.max(0, index - 70);
    end = Math.min(content.length, start + 220);
    snippet = content.slice(start, end).trim();

    if (start > 0) {
      snippet = "..." + snippet;
    }

    if (end < content.length) {
      snippet += "...";
    }

    return formatLatexSnippet(snippet);
  }

  function renderResults(items, normalizedQuery) {
    var fragment;

    if (!resultsContainer) {
      return;
    }

    resultsContainer.innerHTML = "";
    fragment = document.createDocumentFragment();

    items.forEach(function (item, index) {
      var link = document.createElement("a");
      var summary = document.createElement("p");
      var icon = document.createElement("span");
      var contentWrapper = document.createElement("div");
      var snippet = buildSnippet(item, normalizedQuery);

      link.className = "exercise-item search-result-item";
      link.href = item.url;
      link.style.animationDelay = String(index * 60) + "ms";

      summary.className = "search-result-snippet";
      summary.innerHTML = escapeHtml(snippet);

      icon.className = "exercise-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = "&#8599;";

      contentWrapper.appendChild(summary);
      link.appendChild(contentWrapper);
      link.appendChild(icon);
      fragment.appendChild(link);
    });

    resultsContainer.appendChild(fragment);

    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetClear([resultsContainer]);
      window.MathJax.typesetPromise([resultsContainer]);
    }
  }

  function applySearch() {
    var query = searchInput ? searchInput.value : "";
    var normalizedQuery = normalizeSearchText(query);
    var filtered = searchIndex.filter(function (item) {
      return normalizedQuery === "" || item.searchable.indexOf(normalizedQuery) !== -1;
    });
    var visibleItems = normalizedQuery === "" ? filtered.slice(0, 3) : filtered;

    renderResults(visibleItems, normalizedQuery);

    if (emptyState) {
      emptyState.hidden = filtered.length !== 0;
    }
  }

  function hydrateQueryFromUrl() {
    var params;
    var query;

    if (!searchInput) {
      return;
    }

    params = new URLSearchParams(window.location.search);
    query = params.get("q");

    if (query) {
      searchInput.value = query;
    }
  }

  function updateUrl() {
    var params = new URLSearchParams(window.location.search);
    var query = searchInput ? searchInput.value.trim() : "";

    if (!query) {
      params.delete("q");
    } else {
      params.set("q", query);
    }

    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  if (!searchInput || !resultsContainer) {
    return;
  }

  hydrateQueryFromUrl();

  fetch(siteBase + "search-index.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Falha ao carregar o índice de busca.");
      }

      return response.json();
    })
    .then(function (items) {
      searchIndex = items.filter(function (item) {
        return item.url !== "/mbs/busca.html" &&
          item.url !== "/mbs/index.html";
      }).map(function (item) {
        var normalizedItem = normalizeLegacyEntry(item);

        return {
          title: normalizedItem.title,
          url: normalizeResultUrl(item.url),
          section: normalizedItem.section,
          content: normalizedItem.content,
          searchable: normalizeSearchText([normalizedItem.title, normalizedItem.section, normalizedItem.content].join(" "))
        };
      });

      applySearch();
    })
    .catch(function () {
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "Índice de busca indisponível.";
      }
    });

  searchInput.addEventListener("input", function () {
    updateUrl();
    applySearch();
  });

  searchInput.addEventListener("search", function () {
    updateUrl();
    applySearch();
  });
});
