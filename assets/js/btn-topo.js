document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector(".btn-topo");

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
