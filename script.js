(function () {
  "use strict";

  /* ============================================================
     1. Bandeau cookies → chargement conditionnel de Google Analytics
     ============================================================ */
  var GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // TODO : remplacer par l'ID réel

  function loadGoogleAnalytics() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  var cookieBanner = document.getElementById("cookieBanner");
  var cookieChoice = localStorage.getItem("mm_cookie_choice");

  if (cookieChoice === "accepted") {
    loadGoogleAnalytics();
  } else if (!cookieChoice) {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  document.querySelectorAll("[data-cookie-accept]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.setItem("mm_cookie_choice", "accepted");
      loadGoogleAnalytics();
      if (cookieBanner) cookieBanner.hidden = true;
    });
  });

  document.querySelectorAll("[data-cookie-refuse]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.setItem("mm_cookie_choice", "refused");
      if (cookieBanner) cookieBanner.hidden = true;
    });
  });

  document.querySelectorAll("[data-cookie-settings]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("mm_cookie_choice");
      if (cookieBanner) cookieBanner.hidden = false;
    });
  });

  /* ============================================================
     2. Carrousels horizontaux (swipe / boutons)
     ============================================================ */
  function initCarouselNav() {
    document.querySelectorAll("[data-carousel-prev]").forEach(function (btn) {
      var track = document.getElementById(btn.getAttribute("data-carousel-prev"));
      btn.addEventListener("click", function () {
        if (!track) return;
        var card = track.querySelector("article");
        var step = card ? card.getBoundingClientRect().width + 24 : 300;
        track.scrollBy({ left: -step, behavior: "smooth" });
      });
    });
    document.querySelectorAll("[data-carousel-next]").forEach(function (btn) {
      var track = document.getElementById(btn.getAttribute("data-carousel-next"));
      btn.addEventListener("click", function () {
        if (!track) return;
        var card = track.querySelector("article");
        var step = card ? card.getBoundingClientRect().width + 24 : 300;
        track.scrollBy({ left: step, behavior: "smooth" });
      });
    });
  }
  initCarouselNav();

  /* Compteur "VERBATIMS 0X/0Y" basé sur la position de scroll */
  var verbatimsTrack = document.getElementById("verbatimsTrack");
  var counterEl = document.querySelector("[data-verbatims-counter]");
  function updateVerbatimsCounter() {
    if (!verbatimsTrack || !counterEl) return;
    var cards = verbatimsTrack.querySelectorAll("article");
    if (!cards.length) return;
    var cardWidth = cards[0].getBoundingClientRect().width + 24;
    var visiblePerPage = Math.max(1, Math.round(verbatimsTrack.clientWidth / cardWidth));
    var totalPages = Math.max(1, Math.ceil(cards.length / visiblePerPage));
    var currentPage = Math.min(
      totalPages,
      Math.round(verbatimsTrack.scrollLeft / (cardWidth * visiblePerPage)) + 1
    );
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    counterEl.textContent = "VERBATIMS " + pad(currentPage) + "/" + pad(totalPages);
  }
  if (verbatimsTrack) {
    verbatimsTrack.addEventListener("scroll", updateVerbatimsCounter, { passive: true });
    window.addEventListener("resize", updateVerbatimsCounter);
    updateVerbatimsCounter();
  }

  /* ============================================================
     3. Barre de conversion sticky — visible après le hero
     ============================================================ */
  var stickyCta = document.getElementById("stickyCta");
  var heroSection = document.getElementById("hero");
  var marqueSection = document.getElementById("marque");

  if (stickyCta && heroSection && marqueSection) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target === heroSection) {
            stickyCta.dataset.pastHero = entry.isIntersecting ? "false" : "true";
          }
          if (entry.target === marqueSection) {
            stickyCta.dataset.inMarque = entry.isIntersecting ? "true" : "false";
          }
        });
        var pastHero = stickyCta.dataset.pastHero === "true";
        var inMarque = stickyCta.dataset.inMarque === "true";
        stickyCta.classList.toggle("is-visible", pastHero && !inMarque);
      },
      { threshold: 0.15 }
    );
    io.observe(heroSection);
    io.observe(marqueSection);
  }

  document.querySelectorAll("[data-scroll-to]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-scroll-to"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ============================================================
     4. Formulaires email — à brancher sur Klaviyo (liste précommande)
     ============================================================ */
  document.querySelectorAll("[data-email-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      var input = form.querySelector("input[type=email]");
      if (!input || !input.value) return;

      // TODO : remplacer par l'appel API Klaviyo (liste précommande)
      // fetch("https://a.klaviyo.com/...", { method: "POST", body: ... })

      if (status) {
        status.textContent = "Merci, vous serez prévenue à l'ouverture des précommandes.";
      }
      form.reset();
    });
  });
})();
