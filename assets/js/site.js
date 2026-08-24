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

  function setupAnalysisLightbox() {
    var images = Array.prototype.slice.call(document.querySelectorAll(
      ".lab-article-cover img, .lab-article-body .analysis-figure img, .lab-article-body .lab-data-exhibit img"
    ));

    if (!images.length) return;

    var lang = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
    var copy = {
      en: { open: "Open image", close: "Close", previous: "Previous image", next: "Next image", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset zoom" },
      it: { open: "Apri immagine", close: "Chiudi", previous: "Immagine precedente", next: "Immagine successiva", zoomIn: "Ingrandisci", zoomOut: "Riduci", reset: "Ripristina zoom" },
      es: { open: "Abrir imagen", close: "Cerrar", previous: "Imagen anterior", next: "Imagen siguiente", zoomIn: "Ampliar", zoomOut: "Reducir", reset: "Restablecer zoom" },
      fr: { open: "Ouvrir l’image", close: "Fermer", previous: "Image précédente", next: "Image suivante", zoomIn: "Agrandir", zoomOut: "Réduire", reset: "Réinitialiser le zoom" }
    }[lang] || null;

    if (!copy) {
      copy = { open: "Open image", close: "Close", previous: "Previous image", next: "Next image", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset zoom" };
    }

    var items = images.map(function (image) {
      var figure = image.closest("figure");
      var captionNode = figure ? figure.querySelector("figcaption") : null;
      var localLabel = image.parentElement ? image.parentElement.querySelector(":scope > span") : null;
      return {
        image: image,
        src: image.currentSrc || image.src,
        alt: image.alt || "",
        caption: captionNode ? captionNode.textContent.trim() : "",
        label: image.dataset.lightboxTitle || (localLabel ? localLabel.textContent.trim() : ""),
        meta: (image.dataset.lightboxMeta || "").split("|").map(function (value) { return value.trim(); }).filter(Boolean),
        insight: image.dataset.lightboxInsight || ""
      };
    });

    var modal = document.createElement("div");
    modal.className = "analysis-lightbox";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");

    var toolbar = document.createElement("div");
    toolbar.className = "analysis-lightbox__toolbar";

    var title = document.createElement("div");
    title.className = "analysis-lightbox__title";

    var controls = document.createElement("div");
    controls.className = "analysis-lightbox__controls";

    function makeButton(label, content) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "analysis-lightbox__button";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.innerHTML = content;
      return button;
    }

    var zoomOut = makeButton(copy.zoomOut, "−");
    var zoomLabel = document.createElement("span");
    zoomLabel.className = "analysis-lightbox__zoom-label";
    zoomLabel.textContent = "100%";
    var zoomIn = makeButton(copy.zoomIn, "+");
    var reset = makeButton(copy.reset, "100%");
    var closeButton = makeButton(copy.close, "×");

    controls.appendChild(zoomOut);
    controls.appendChild(zoomLabel);
    controls.appendChild(zoomIn);
    controls.appendChild(reset);
    controls.appendChild(closeButton);
    toolbar.appendChild(title);
    toolbar.appendChild(controls);

    var stage = document.createElement("div");
    stage.className = "analysis-lightbox__stage";
    var canvas = document.createElement("div");
    canvas.className = "analysis-lightbox__canvas";
    var viewerImage = document.createElement("img");
    viewerImage.className = "analysis-lightbox__image";
    viewerImage.alt = "";
    canvas.appendChild(viewerImage);
    stage.appendChild(canvas);

    var footer = document.createElement("div");
    footer.className = "analysis-lightbox__footer";
    var previous = makeButton(copy.previous, "←");
    var info = document.createElement("div");
    info.className = "analysis-lightbox__info";
    var caption = document.createElement("p");
    caption.className = "analysis-lightbox__caption";
    var metaList = document.createElement("div");
    metaList.className = "analysis-lightbox__meta";
    metaList.hidden = true;
    var insight = document.createElement("p");
    insight.className = "analysis-lightbox__insight";
    insight.hidden = true;
    info.appendChild(caption);
    info.appendChild(metaList);
    info.appendChild(insight);
    var next = makeButton(copy.next, "→");
    var navigation = document.createElement("div");
    navigation.className = "analysis-lightbox__navigation";
    navigation.appendChild(previous);
    navigation.appendChild(next);
    var counter = document.createElement("span");
    counter.className = "analysis-lightbox__counter";

    footer.appendChild(navigation);
    footer.appendChild(info);
    footer.appendChild(counter);

    modal.appendChild(toolbar);
    modal.appendChild(stage);
    modal.appendChild(footer);
    document.body.appendChild(modal);

    var currentIndex = 0;
    var scale = 1;
    var baseWidth = 0;
    var baseHeight = 0;
    var restoreFocus = null;
    var drag = null;

    function fitCurrentImage() {
      if (!viewerImage.naturalWidth || !viewerImage.naturalHeight) return;
      var availableWidth = Math.max(160, stage.clientWidth - 48);
      var availableHeight = Math.max(160, stage.clientHeight - 48);
      var ratio = Math.min(
        1,
        availableWidth / viewerImage.naturalWidth,
        availableHeight / viewerImage.naturalHeight
      );
      baseWidth = Math.round(viewerImage.naturalWidth * ratio);
      baseHeight = Math.round(viewerImage.naturalHeight * ratio);
      applyZoom(true);
    }

    function applyZoom(recenter) {
      if (!baseWidth || !baseHeight) return;
      var width = Math.round(baseWidth * scale);
      var height = Math.round(baseHeight * scale);
      viewerImage.style.width = width + "px";
      canvas.style.width = Math.max(stage.clientWidth, width + 48) + "px";
      canvas.style.height = Math.max(stage.clientHeight, height + 48) + "px";
      zoomLabel.textContent = Math.round(scale * 100) + "%";
      stage.classList.toggle("is-zoomed", scale > 1.01);
      zoomOut.disabled = scale <= 1.01;
      zoomIn.disabled = scale >= 4;

      if (recenter) {
        window.requestAnimationFrame(function () {
          stage.scrollLeft = Math.max(0, (canvas.scrollWidth - stage.clientWidth) / 2);
          stage.scrollTop = Math.max(0, (canvas.scrollHeight - stage.clientHeight) / 2);
        });
      }
    }

    function setScale(nextScale) {
      scale = Math.min(4, Math.max(1, nextScale));
      applyZoom(true);
    }

    function showItem(index) {
      currentIndex = (index + items.length) % items.length;
      var item = items[currentIndex];
      scale = 1;
      baseWidth = 0;
      baseHeight = 0;
      viewerImage.src = item.src;
      viewerImage.alt = item.alt;
      title.textContent = item.label || item.alt || copy.open;
      caption.textContent = item.caption || item.alt;
      metaList.innerHTML = "";
      item.meta.forEach(function (value) {
        var chip = document.createElement("span");
        chip.textContent = value;
        metaList.appendChild(chip);
      });
      metaList.hidden = !item.meta.length;
      insight.textContent = item.insight;
      insight.hidden = !item.insight;
      counter.textContent = (currentIndex + 1) + " / " + items.length;
      previous.disabled = items.length < 2;
      next.disabled = items.length < 2;
      stage.scrollLeft = 0;
      stage.scrollTop = 0;

      if (viewerImage.complete) {
        window.requestAnimationFrame(fitCurrentImage);
      }
    }

    function openLightbox(index, sourceElement) {
      restoreFocus = sourceElement || document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("analysis-lightbox-open");
      showItem(index);
      window.setTimeout(function () { closeButton.focus(); }, 20);
    }

    function closeLightbox() {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("analysis-lightbox-open");
      viewerImage.removeAttribute("src");
      scale = 1;
      if (restoreFocus && typeof restoreFocus.focus === "function") restoreFocus.focus();
    }

    viewerImage.addEventListener("load", fitCurrentImage);
    closeButton.addEventListener("click", closeLightbox);
    previous.addEventListener("click", function () { showItem(currentIndex - 1); });
    next.addEventListener("click", function () { showItem(currentIndex + 1); });
    zoomIn.addEventListener("click", function () { setScale(scale + 0.5); });
    zoomOut.addEventListener("click", function () { setScale(scale - 0.5); });
    reset.addEventListener("click", function () { setScale(1); });

    stage.addEventListener("dblclick", function () {
      setScale(scale > 1 ? 1 : 2);
    });

    stage.addEventListener("pointerdown", function (event) {
      if (scale <= 1.01 || event.button !== 0) return;
      drag = {
        x: event.clientX,
        y: event.clientY,
        left: stage.scrollLeft,
        top: stage.scrollTop
      };
      stage.classList.add("is-dragging");
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener("pointermove", function (event) {
      if (!drag) return;
      stage.scrollLeft = drag.left - (event.clientX - drag.x);
      stage.scrollTop = drag.top - (event.clientY - drag.y);
    });

    function endDrag(event) {
      if (!drag) return;
      drag = null;
      stage.classList.remove("is-dragging");
      if (event && stage.hasPointerCapture && stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
    }

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowLeft" && items.length > 1) {
        event.preventDefault();
        showItem(currentIndex - 1);
      } else if (event.key === "ArrowRight" && items.length > 1) {
        event.preventDefault();
        showItem(currentIndex + 1);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setScale(scale + 0.5);
      } else if (event.key === "-") {
        event.preventDefault();
        setScale(scale - 0.5);
      }
    });

    window.addEventListener("resize", function () {
      if (modal.classList.contains("is-open")) fitCurrentImage();
    });

    items.forEach(function (item, index) {
      var image = item.image;
      image.setAttribute("tabindex", "0");
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", copy.open + (item.alt ? ": " + item.alt : ""));

      var parent = image.parentNode;
      var frame = document.createElement("div");
      frame.className = "analysis-zoom-frame";
      parent.insertBefore(frame, image);
      frame.appendChild(image);

      var hint = document.createElement("span");
      hint.className = "analysis-zoom-hint";
      hint.setAttribute("aria-hidden", "true");
      hint.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"></circle><path d="m15 15 4.5 4.5M10.5 8v5M8 10.5h5"></path></svg>';
      frame.appendChild(hint);

      image.addEventListener("click", function () { openLightbox(index, image); });
      image.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openLightbox(index, image);
      });
    });
  }

  setupAnalysisLightbox();

}());
