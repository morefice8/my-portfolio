/* Michele Orefice portfolio runtime — lightweight project-owned navigation and page behaviour. */
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
  close.innerHTML = '<svg class="brand-nav-close-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

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

  var homepageSections = ["#projects", "#about", "#contact"];

  function normalisePath(pathname) {
    var clean = pathname.replace(/index\.html$/i, "").replace(/\/+$/, "");
    return clean || "/";
  }

  function headerOffset() {
    var header = document.getElementById("header");
    return header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  }

  function scrollToHomepageSection(hash, behavior) {
    if (homepageSections.indexOf(hash) === -1) return false;

    var target = document.querySelector(hash);
    if (!target) return false;

    var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({
      top: Math.max(0, Math.round(top)),
      behavior: behavior || "auto"
    });
    return true;
  }

  function isSamePageHomepageLink(link) {
    if (!link || !link.getAttribute("href")) return null;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return null;
    }

    if (url.origin !== window.location.origin) return null;
    if (normalisePath(url.pathname) !== normalisePath(window.location.pathname)) return null;
    if (homepageSections.indexOf(url.hash) === -1) return null;

    return url;
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

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    var url = isSamePageHomepageLink(link);
    if (!url) return;

    event.preventDefault();
    setPanel(false);

    if (window.location.hash !== url.hash) {
      window.history.pushState(null, "", url.hash);
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollToHomepageSection(url.hash, reduceMotion ? "auto" : "smooth");
  });

  function correctInitialSectionPosition() {
    if (homepageSections.indexOf(window.location.hash) === -1) return;

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        scrollToHomepageSection(window.location.hash, "auto");
      });
    });
  }

  if (document.readyState === "complete") {
    correctInitialSectionPosition();
  } else {
    window.addEventListener("load", correctInitialSectionPosition, { once: true });
  }

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
