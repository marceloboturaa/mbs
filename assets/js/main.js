document.addEventListener("DOMContentLoaded", function () {
  var pageFilter = document.getElementById("exercise-page-filter");
  var filterStatus = document.getElementById("filter-status");
  var filterReset = document.getElementById("filter-reset");
  var exerciseItems = Array.prototype.slice.call(document.querySelectorAll("[data-exercise-item]"));
  var emptyState = document.getElementById("exercise-empty");
  var index = [];
  var pages = [];

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseItemMeta(item) {
    var metaLine = item.querySelector(".exercise-meta-line");
    var text = normalizeText(metaLine ? metaLine.textContent : item.textContent || "");
    var pageMatch = text.match(/\bp(?:agina)?\s*(\d+)\b/);

    return {
      page: pageMatch ? pageMatch[1] : ""
    };
  }

  function collectIndex() {
    var pageSet = new Set();

    exerciseItems.forEach(function (item) {
      var meta = parseItemMeta(item);

      item.dataset.page = meta.page;

      if (meta.page) {
        pageSet.add(meta.page);
      }

      index.push({
        item: item,
        page: meta.page
      });
    });

    pages = Array.from(pageSet).sort(function (a, b) {
      return Number(a) - Number(b);
    });
  }

  function populatePageFilter(selectedPage) {
    var currentValue = selectedPage || "";
    var fragment = document.createDocumentFragment();
    var option = document.createElement("option");

    option.value = "";
    option.textContent = "Todas as páginas";
    fragment.appendChild(option);

    pages.forEach(function (page) {
      var item = document.createElement("option");

      item.value = page;
      item.textContent = "Página " + page;
      fragment.appendChild(item);
    });

    pageFilter.innerHTML = "";
    pageFilter.appendChild(fragment);
    pageFilter.value = pages.indexOf(currentValue) !== -1 ? currentValue : "";
  }

  function getQuery() {
    return {
      page: pageFilter ? pageFilter.value : ""
    };
  }

  function matchesItem(entry, query) {
    if (query.page && entry.page !== query.page) {
      return false;
    }

    return true;
  }

  function updateStatus(visibleCount, query) {
    if (!filterStatus) {
      return;
    }

    if (!query.page) {
      filterStatus.textContent = "";
      return;
    }

    filterStatus.textContent =
      visibleCount +
      " exercício" +
      (visibleCount === 1 ? "" : "s") +
      " encontrado" +
      (visibleCount === 1 ? "" : "s") +
      " · Página " +
      query.page;
  }

  function syncUrl(query) {
    var params = new URLSearchParams(window.location.search);

    if (query.page) {
      params.set("page", query.page);
    } else {
      params.delete("page");
    }

    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function applyFilters() {
    var query = getQuery();
    var visibleCount = 0;

    index.forEach(function (entry) {
      var matches = matchesItem(entry, query);

      entry.item.style.display = matches ? "" : "none";

      if (matches) {
        visibleCount += 1;
      }
    });

    updateStatus(visibleCount, query);

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }

    if (filterReset) {
      filterReset.disabled = !query.page;
    }

    syncUrl(query);
  }

  function hydrateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var page = params.get("page") || "";

    if (pageFilter) {
      pageFilter.value = page;
    }
  }

  if (!exerciseItems.length || !pageFilter) {
    return;
  }

  collectIndex();
  hydrateFromUrl();
  populatePageFilter(pageFilter.value);

  pageFilter.addEventListener("change", function () {
    applyFilters();
  });

  pageFilter.addEventListener("input", function () {
    applyFilters();
  });

  if (filterReset) {
    filterReset.addEventListener("click", function () {
      pageFilter.value = "";
      applyFilters();
      pageFilter.focus();
    });
  }

  applyFilters();
});
