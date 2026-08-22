/* Michele Orefice portfolio runtime — replaces the legacy Massively JS stack. */
(function () {
  "use strict";

  var body = document.body;
  var nav = document.getElementById("nav");
  var wrapper = document.getElementById("wrapper");

  function finishPreload() {
    window.setTimeout(function () {
      body.classList.remove("is-preload");
    }, 80);
  }

  if (document.readyState === "complete") {
    finishPreload();
  } else {
    window.addEventListener("load", finishPreload, { once: true });
  }

  if (!nav || !wrapper) return;

  var toggle = document.createElement("a");
  toggle.href = "#navPanel";
  toggle.id = "navPanelToggle";
  toggle.setAttribute("aria-controls", "navPanel");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Menu";

  var panel = document.createElement("div");
  panel.id = "navPanel";
  panel.setAttribute("aria-hidden", "true");

  var panelNav = document.createElement("nav");
  panelNav.setAttribute("aria-label", "Mobile navigation");
  panelNav.innerHTML = nav.innerHTML;

  var close = document.createElement("a");
  close.href = "#navPanel";
  close.className = "close";
  close.setAttribute("aria-label", "Close menu");
  close.innerHTML = '<span aria-hidden="true">×</span>';

  panel.appendChild(panelNav);
  panel.appendChild(close);
  wrapper.appendChild(toggle);
  body.appendChild(panel);

  function setPanel(open) {
    body.classList.toggle("is-navPanel-visible", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) {
      var firstLink = panel.querySelector("a[href]");
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, 30);
      }
    }
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    setPanel(!body.classList.contains("is-navPanel-visible"));
  });

  close.addEventListener("click", function (event) {
    event.preventDefault();
    setPanel(false);
    toggle.focus();
  });

  panel.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link || link === close) return;
    setPanel(false);
  });

  document.addEventListener("pointerdown", function (event) {
    if (!body.classList.contains("is-navPanel-visible")) return;
    if (panel.contains(event.target) || toggle.contains(event.target)) return;
    setPanel(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !body.classList.contains("is-navPanel-visible")) return;
    setPanel(false);
    toggle.focus();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 980 && body.classList.contains("is-navPanel-visible")) {
      setPanel(false);
    }
  });
}());
