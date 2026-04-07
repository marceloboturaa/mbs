document.addEventListener("DOMContentLoaded", function () {
  var exerciseSearch = document.getElementById("exercise-search");
  var exerciseItems = document.querySelectorAll("[data-exercise-item]");
  var emptyState = document.getElementById("exercise-empty");

  function normalizeSearchText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function applyExerciseSearch() {
    var query = normalizeSearchText(exerciseSearch ? exerciseSearch.value : "");
    var visibleCount = 0;
    var i;

    for (i = 0; i < exerciseItems.length; i += 1) {
      var item = exerciseItems[i];
      var haystack = normalizeSearchText(item.getAttribute("data-search"));
      var matches = query === "" || haystack.indexOf(query) !== -1;

      item.style.display = matches ? "" : "none";

      if (matches) {
        visibleCount += 1;
      }
    }

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (!exerciseSearch || !exerciseItems.length) {
    return;
  }

  exerciseSearch.addEventListener("input", applyExerciseSearch);
  exerciseSearch.addEventListener("keyup", applyExerciseSearch);
  exerciseSearch.addEventListener("search", applyExerciseSearch);

  applyExerciseSearch();
});
