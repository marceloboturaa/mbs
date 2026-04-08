document.addEventListener("DOMContentLoaded", function () {
  var pageFilter = document.getElementById("page-filter");
  var chapterFilter = document.getElementById("chapter-filter");
  var filterStatus = document.getElementById("filter-status");
  var filterReset = document.getElementById("filter-reset");
  var exerciseItems = Array.prototype.slice.call(document.querySelectorAll("[data-exercise-item]"));
  var emptyState = document.getElementById("exercise-empty");
  var state = {
    page: "",
    chapter: ""
  };
  var facets;

  function normalizeSearchText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function parseItemMeta(item) {
    var metaLine = item.querySelector(".exercise-meta-line");
    var text = normalizeSearchText(metaLine ? metaLine.textContent : "");
    var pageMatch = text.match(/pagina\s+(\d+)/);
    var chapterMatch = text.match(/cap\.?\s*([0-9.]+)/);

    return {
      page: pageMatch ? pageMatch[1] : "",
      chapter: chapterMatch ? chapterMatch[1] : ""
    };
  }

  function collectFacets() {
    var pages = new Map();
    var chapters = new Map();

    exerciseItems.forEach(function (item) {
      var meta = parseItemMeta(item);

      item.dataset.page = meta.page;
      item.dataset.chapter = meta.chapter;

      if (meta.page && !pages.has(meta.page)) {
        pages.set(meta.page, "Página " + meta.page);
      }

      if (meta.chapter && !chapters.has(meta.chapter)) {
        chapters.set(meta.chapter, "Cap. " + meta.chapter);
      }
    });

    facets = {
      pages: Array.from(pages.keys()).sort(function (a, b) {
        return Number(a) - Number(b);
      }),
      chapters: Array.from(chapters.keys()).sort(function (a, b) {
        var left = a.split(".").map(Number);
        var right = b.split(".").map(Number);
        var length = Math.max(left.length, right.length);
        var i;

        for (i = 0; i < length; i += 1) {
          if ((left[i] || 0) !== (right[i] || 0)) {
            return (left[i] || 0) - (right[i] || 0);
          }
        }

        return 0;
      })
    };
  }

  function countItemsFor(page, chapter) {
    var count = 0;

    exerciseItems.forEach(function (item) {
      var itemPage = item.dataset.page || "";
      var itemChapter = item.dataset.chapter || "";
      var matchesPage = !page || itemPage === page;
      var matchesChapter = !chapter || itemChapter === chapter;

      if (matchesPage && matchesChapter) {
        count += 1;
      }
    });

    return count;
  }

  function createChip(label, value, count, active, onClick) {
    var button = document.createElement("button");

    button.type = "button";
    button.className = active ? "filter-chip is-active" : "filter-chip";
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.dataset.value = value;
    button.innerHTML = "<span>" + label + "</span><strong>" + count + "</strong>";
    button.addEventListener("click", function () {
      onClick(value);
    });

    return button;
  }

  function renderFacetGroup(container, kind, values, activeValue, otherValue) {
    var fragment = document.createDocumentFragment();
    var allCount = countItemsFor(kind === "page" ? "" : otherValue, kind === "page" ? otherValue : "");
    var allButton = createChip("Todos", "", allCount, activeValue === "", function () {
      state[kind] = "";
      applyFilters();
    });

    fragment.appendChild(allButton);

    values.forEach(function (value) {
      var label = kind === "page" ? "Página " + value : "Cap. " + value;
      var count = kind === "page" ? countItemsFor(value, otherValue) : countItemsFor(otherValue, value);
      var chip = createChip(label, value, count, activeValue === value, function (clickedValue) {
        state[kind] = state[kind] === clickedValue ? "" : clickedValue;
        applyFilters();
      });

      fragment.appendChild(chip);
    });

    container.innerHTML = "";
    container.appendChild(fragment);
  }

  function updateStatus(visibleCount) {
    if (!filterStatus) {
      return;
    }

    if (!state.page && !state.chapter) {
      filterStatus.textContent = "Mostrando todos os exercícios.";
      return;
    }

    filterStatus.textContent =
      visibleCount +
      " exercício" +
      (visibleCount === 1 ? "" : "s") +
      " · " +
      (state.page ? "Página " + state.page : "todas as páginas") +
      " · " +
      (state.chapter ? "Cap. " + state.chapter : "todos os capítulos");
  }

  function syncUrl() {
    var params = new URLSearchParams(window.location.search);

    if (state.page) {
      params.set("page", state.page);
    } else {
      params.delete("page");
    }

    if (state.chapter) {
      params.set("chapter", state.chapter);
    } else {
      params.delete("chapter");
    }

    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function applyFilters() {
    var visibleCount = 0;

    exerciseItems.forEach(function (item) {
      var matchesPage = !state.page || item.dataset.page === state.page;
      var matchesChapter = !state.chapter || item.dataset.chapter === state.chapter;
      var matches = matchesPage && matchesChapter;

      item.style.display = matches ? "" : "none";

      if (matches) {
        visibleCount += 1;
      }
    });

    renderFacetGroup(pageFilter, "page", facets.pages, state.page, state.chapter);
    renderFacetGroup(chapterFilter, "chapter", facets.chapters, state.chapter, state.page);
    updateStatus(visibleCount);

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }

    if (filterReset) {
      filterReset.disabled = !state.page && !state.chapter;
    }

    syncUrl();
  }

  function hydrateStateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    state.page = params.get("page") || "";
    state.chapter = params.get("chapter") || "";
  }

  if (!exerciseItems.length || !pageFilter || !chapterFilter) {
    return;
  }

  collectFacets();
  hydrateStateFromUrl();

  if (filterReset) {
    filterReset.addEventListener("click", function () {
      state.page = "";
      state.chapter = "";
      applyFilters();
    });
  }

  applyFilters();
});
