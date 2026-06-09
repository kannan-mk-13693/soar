/* Shared diagram lightbox — click any <img class="diagram"> to zoom + pan.
   No dependencies. Esc / click outside closes. +/- and mouse wheel zoom.
   Drag to pan when zoomed.
*/
(function () {
  if (window.__pbLightbox) return;
  window.__pbLightbox = true;

  // Inject overlay markup + styles
  var css = `
.lb-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.92);
  z-index: 9999; display: none; align-items: center; justify-content: center;
  overflow: hidden; user-select: none;
}
.lb-overlay.open { display: flex; }
.lb-stage {
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; cursor: grab;
}
.lb-stage.panning { cursor: grabbing; }
.lb-img {
  max-width: 100%; max-height: 100%;
  transform-origin: center center;
  transition: transform .12s ease-out;
  will-change: transform;
  pointer-events: none;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  background: #fff;
}
.lb-toolbar {
  position: absolute; top: 16px; right: 16px;
  display: flex; gap: 8px; z-index: 2;
}
.lb-btn {
  background: rgba(255,255,255,0.95);
  border: 1px solid rgba(255,255,255,0.3);
  color: #1a1f36;
  width: 38px; height: 38px;
  border-radius: 8px;
  font-size: 18px; font-weight: 600;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, transform .1s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.lb-btn:hover { background: #fff; transform: translateY(-1px); }
.lb-btn.close { font-size: 22px; }
.lb-caption {
  position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
  background: rgba(15,23,42,0.85); color: #fff;
  padding: 8px 16px; border-radius: 20px; font-size: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  z-index: 2;
}
.lb-hint {
  position: absolute; top: 18px; left: 18px;
  background: rgba(15,23,42,0.7); color: #cdd4e3;
  padding: 6px 12px; border-radius: 6px; font-size: 11px;
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 2;
}
img.diagram, .diagram.svg-host { cursor: zoom-in; transition: box-shadow .15s, transform .1s; border: 1px solid var(--border); border-radius: 8px; background: #fff; padding: 8px; }
img.diagram:hover, .diagram.svg-host:hover { box-shadow: 0 4px 14px rgba(15,23,42,0.18); transform: translateY(-1px); }
.diagram.svg-host { position: relative; }
.diagram.svg-host::after {
  content: "Click to zoom";
  position: absolute; top: 10px; right: 10px;
  background: rgba(15,23,42,0.75); color: #fff;
  font-size: 10px; padding: 4px 8px; border-radius: 4px;
  pointer-events: none;
}
.diagram.svg-host > object { pointer-events: none; }
`;

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.className = "lb-overlay";
  overlay.innerHTML = `
    <div class="lb-stage">
      <div class="lb-hint">Scroll to zoom · Drag to pan · Esc to close</div>
      <div class="lb-toolbar">
        <button class="lb-btn" data-act="zoom-out" title="Zoom out">−</button>
        <button class="lb-btn" data-act="reset" title="Reset (1:1)">⟳</button>
        <button class="lb-btn" data-act="zoom-in" title="Zoom in">+</button>
        <button class="lb-btn close" data-act="close" title="Close">×</button>
      </div>
      <img class="lb-img" alt="" />
      <div class="lb-caption"></div>
    </div>`;
  document.body.appendChild(overlay);

  var stage = overlay.querySelector(".lb-stage");
  var img = overlay.querySelector(".lb-img");
  var caption = overlay.querySelector(".lb-caption");

  var state = { scale: 1, tx: 0, ty: 0, dragging: false, sx: 0, sy: 0 };

  function apply() {
    img.style.transform = "translate(" + state.tx + "px, " + state.ty + "px) scale(" + state.scale + ")";
  }

  function reset() {
    state.scale = 1; state.tx = 0; state.ty = 0; apply();
  }

  function open(src, alt) {
    img.src = src;
    img.alt = alt || "";
    caption.textContent = alt || "";
    overlay.classList.add("open");
    reset();
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("open");
    img.src = "";
    document.body.style.overflow = "";
  }

  function zoom(factor, cx, cy) {
    var newScale = Math.max(0.5, Math.min(8, state.scale * factor));
    // anchor zoom at cx,cy (relative to stage)
    if (cx !== undefined && cy !== undefined) {
      var rect = stage.getBoundingClientRect();
      var ox = cx - rect.left - rect.width / 2 - state.tx;
      var oy = cy - rect.top - rect.height / 2 - state.ty;
      var k = newScale / state.scale;
      state.tx -= ox * (k - 1);
      state.ty -= oy * (k - 1);
    }
    state.scale = newScale;
    apply();
  }

  overlay.addEventListener("click", function (e) {
    var act = e.target.getAttribute("data-act");
    if (act === "close") close();
    else if (act === "zoom-in") zoom(1.25);
    else if (act === "zoom-out") zoom(1 / 1.25);
    else if (act === "reset") reset();
    else if (e.target === overlay) close();
  });

  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    var f = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoom(f, e.clientX, e.clientY);
  }, { passive: false });

  stage.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("lb-btn")) return;
    state.dragging = true;
    state.sx = e.clientX - state.tx;
    state.sy = e.clientY - state.ty;
    stage.classList.add("panning");
  });
  window.addEventListener("mousemove", function (e) {
    if (!state.dragging) return;
    state.tx = e.clientX - state.sx;
    state.ty = e.clientY - state.sy;
    img.style.transition = "none";
    apply();
  });
  window.addEventListener("mouseup", function () {
    state.dragging = false;
    stage.classList.remove("panning");
    img.style.transition = "";
  });

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "+" || e.key === "=") zoom(1.25);
    else if (e.key === "-" || e.key === "_") zoom(1 / 1.25);
    else if (e.key === "0") reset();
  });

  // Wire up all .diagram images and .diagram.svg-host hosts on the page
  function wire() {
    document.querySelectorAll("img.diagram").forEach(function (el) {
      if (el.__wired) return;
      el.__wired = true;
      el.addEventListener("click", function () { open(el.src, el.alt); });
    });
    document.querySelectorAll(".diagram.svg-host").forEach(function (el) {
      if (el.__wired) return;
      el.__wired = true;
      var src = el.getAttribute("data-zoom-src");
      var alt = el.getAttribute("data-zoom-alt") || "";
      el.addEventListener("click", function () { if (src) open(src, alt); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
