const revealItems = [...document.querySelectorAll("[data-reveal]")];

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 90}ms`;
    revealObserver.observe(item);
  });
}
