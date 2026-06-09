/* Right-rail TOC scroll-spy.
   Highlights the .toc-link whose section is currently in view.
   Smooths anchor jumps and accounts for sticky header.
*/
(function () {
  if (window.__pbToc) return;
  window.__pbToc = true;

  function init() {
    var links = document.querySelectorAll(".toc-rail .toc-link");
    if (!links.length) return;

    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) sections.push({ el: el, link: a });
    });
    if (!sections.length) return;

    var HEADER_OFFSET = 90; // sticky header + crumbs

    function setActive() {
      var y = window.scrollY + HEADER_OFFSET + 10;
      var active = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.offsetTop <= y) active = sections[i];
        else break;
      }
      sections.forEach(function (s) {
        if (s === active) s.link.classList.add("active");
        else s.link.classList.remove("active");
      });
    }

    setActive();
    window.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);

    // Smooth scroll with header offset
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        var top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: top, behavior: "smooth" });
        history.replaceState(null, "", "#" + id);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
