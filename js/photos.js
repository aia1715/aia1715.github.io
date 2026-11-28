// На телефоне (без курсора) фото становится цветным, когда проезжает середину экрана.
(function () {
  if (!("IntersectionObserver" in window)) return;
  var touch = window.matchMedia && window.matchMedia("(hover: none)").matches;
  if (!touch) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle("on", e.isIntersecting); });
  }, { rootMargin: "-35% 0px -35% 0px" });
  document.querySelectorAll(".photo").forEach(function (p) { io.observe(p); });
})();
