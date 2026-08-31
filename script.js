(function () {
  "use strict";

  /* ============================================================
     0bis. Suivi d'événements Google Analytics
     ============================================================ */
  function trackEvent(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
    }
  }

  /* ============================================================
     0. Retour à une section précise via #ancre (le scroll se fait
        dans .scroll-container, pas dans le document — un simple
        lien #ancre ne suffit pas nativement)
     ============================================================ */
  if (window.location.hash) {
    var targetSection = document.querySelector(window.location.hash);
    if (targetSection) {
      window.addEventListener("load", function () {
        targetSection.scrollIntoView({ behavior: "auto" });
      });
    }
  }

  /* ============================================================
     1. Bandeau cookies → chargement conditionnel de Google Analytics
     ============================================================ */
  var GA_MEASUREMENT_ID = "G-E8WD35QJWF";

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
      trackEvent("cookie_consent_accept");
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
      var trackId = btn.getAttribute("data-carousel-prev");
      var track = document.getElementById(trackId);
      btn.addEventListener("click", function () {
        if (!track) return;
        var card = track.querySelector("article");
        var step = card ? card.getBoundingClientRect().width + 24 : 300;
        track.scrollBy({ left: -step, behavior: "smooth" });
        trackEvent("click_carousel_nav", { carousel: trackId, direction: "prev" });
      });
    });
    document.querySelectorAll("[data-carousel-next]").forEach(function (btn) {
      var trackId = btn.getAttribute("data-carousel-next");
      var track = document.getElementById(trackId);
      btn.addEventListener("click", function () {
        if (!track) return;
        var card = track.querySelector("article");
        var step = card ? card.getBoundingClientRect().width + 24 : 300;
        track.scrollBy({ left: step, behavior: "smooth" });
        trackEvent("click_carousel_nav", { carousel: trackId, direction: "next" });
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
  var marqueSection = document.getElementById("precommande");

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
        if (stickyCta.dataset.dismissed === "true") return;
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
      // Le sticky n'a pas son propre champ email : on trace le clic,
      // et on retient que la prochaine inscription (via le formulaire de bas
      // de page vers lequel il renvoie) doit être attribuée à "sticky".
      trackEvent("click_signup_sticky");
      sessionStorage.setItem("mm_cta_attribution", "sticky");
    });
  });

  var stickyCloseBtn = document.querySelector("[data-sticky-close]");
  if (stickyCloseBtn && stickyCta) {
    stickyCloseBtn.addEventListener("click", function () {
      stickyCta.classList.remove("is-visible");
      stickyCta.dataset.dismissed = "true";
    });
  }

  /* ============================================================
     5. Mémorise la section visible pour le retour depuis les pages légales
     ============================================================ */
  var sections = document.querySelectorAll("main.scroll-container > section[id]");
  if (sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            sessionStorage.setItem("mm_last_section", entry.target.id);
            trackEvent("section_view", { section_id: entry.target.id });
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ============================================================
     4. Formulaires email → Klaviyo (liste précommande) + GA4
     ============================================================ */
  var KLAVIYO_LIST_ID = "VB6dKy";
  var KLAVIYO_PUBLIC_API_KEY = "SczpWt";

  function subscribeToKlaviyo(email, source) {
    return fetch(
      "https://a.klaviyo.com/client/subscriptions/?company_id=" + KLAVIYO_PUBLIC_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          revision: "2024-10-15"
        },
        body: JSON.stringify({
          data: {
            type: "subscription",
            attributes: {
              profile: {
                data: {
                  type: "profile",
                  attributes: {
                    email: email,
                    properties: { source: source } // ex : "hero" / "sticky" / "footer"
                  }
                }
              }
            },
            relationships: {
              list: { data: { type: "list", id: KLAVIYO_LIST_ID } }
            }
          }
        })
      }
    );
  }

  document.querySelectorAll("[data-email-form]").forEach(function (form) {
    var defaultSource = form.getAttribute("data-email-form"); // "hero" ou "footer"
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      var input = form.querySelector("input[type=email]");
      if (!input || !input.value) return;

      // Si on arrive ici après un clic sur le sticky, l'inscription lui est attribuée
      var attributedSource = sessionStorage.getItem("mm_cta_attribution") || defaultSource;

      trackEvent("click_signup_" + defaultSource);

      subscribeToKlaviyo(input.value, attributedSource)
        .then(function (res) {
          if (!res.ok) throw new Error("Klaviyo subscription failed");
          if (status) status.textContent = "Merci, vous serez prévenue à l'ouverture des précommandes.";
          trackEvent("signup_complete", { location: attributedSource });
          sessionStorage.removeItem("mm_cta_attribution");
          form.reset();
        })
        .catch(function () {
          if (status) status.textContent = "Une erreur est survenue, merci de réessayer.";
        });
    });
  });

  /* ============================================================
     6. Réseaux sociaux
     ============================================================ */
  document.querySelectorAll('a[href*="instagram.com"]').forEach(function (link) {
    link.addEventListener("click", function () { trackEvent("click_instagram"); });
  });
  document.querySelectorAll('a[href*="tiktok.com"]').forEach(function (link) {
    link.addEventListener("click", function () { trackEvent("click_tiktok"); });
  });

  /* ============================================================
     7. Liens légaux (footer)
     ============================================================ */
  var legalLink = document.querySelector('a[href="mentions-legales.html"]');
  if (legalLink) legalLink.addEventListener("click", function () { trackEvent("click_mentions_legales"); });
  document.querySelectorAll('a[href="politique-confidentialite.html"]').forEach(function (link) {
    link.addEventListener("click", function () { trackEvent("click_politique_confidentialite"); });
  });
})();
