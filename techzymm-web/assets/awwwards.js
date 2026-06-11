/* Techzy — Awwwards redesign: GSAP choreography, cursor, magnetic, tilt.
   Runs on every page, after main.js (which owns i18n, nav, products,
   forms, testimonials). Degrades gracefully: if GSAP fails to load or
   user prefers reduced motion, content stays visible and interactive. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.gsap || reduceMotion) {
      // No animation path: remove preloader, leave everything visible.
      var pre = document.getElementById("preloader");
      if (pre) pre.remove();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    splitManifesto();
    runIntro();
    setupScrollScenes();
    setupMarquee();
    setupLangRefresh();

    if (finePointer) {
      setupCursor();
      setupMagnetic();
      setupTilt();
    }
  });

  /* ---------- Intro: preloader + reveal (all pages) ---------- */
  function runIntro() {
    // Safety net: if the GSAP ticker is throttled (background tab, frozen
    // rAF), remove the preloader anyway so content is never blocked.
    setTimeout(function () {
      var pre = document.getElementById("preloader");
      if (pre) pre.remove();
    }, 3000);

    var tl = gsap.timeline();

    tl.to("#preloaderFill", { scaleX: 1, duration: 0.9, ease: "power2.inOut" })
      .to("#preloader", {
        yPercent: -100,
        duration: 0.7,
        ease: "power3.inOut",
        onComplete: function () {
          var pre = document.getElementById("preloader");
          if (pre) pre.remove();
        },
      });

    // Home hero
    if (document.querySelector(".hero-title .word")) {
      tl.from(".hero-title .word", {
        yPercent: 110,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out",
      }, "-=0.25")
        .from(".reveal-line > span", {
          yPercent: 110,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }, "-=0.7")
        .from(".hero-actions .btn", {
          y: 24,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }, "-=0.5")
        .from(".hero-meta", { autoAlpha: 0, duration: 0.6 }, "-=0.3");
    }

    // Inner pages hero
    if (document.querySelector(".page-hero")) {
      tl.from(".page-hero .kicker, .page-hero .title-xl, .page-hero .lede", {
        y: 36,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      }, "-=0.25")
        .from(".page-hero-img-wrap", {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
        }, "-=0.6");
    }
  }

  /* ---------- Scroll scenes ---------- */
  function setupScrollScenes() {
    // Manifesto: word-by-word ink-in tied to scroll (home)
    var words = document.querySelectorAll("#manifestoText .mword");
    if (words.length) {
      gsap.to(words, {
        opacity: 1,
        stagger: 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: "#manifesto",
          start: "top 75%",
          end: "bottom 55%",
          scrub: true,
        },
      });
    }

    // Why items stagger (home)
    if (document.querySelector(".why-grid")) {
      gsap.from("[data-stagger]", {
        y: 40,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: ".why-grid", start: "top 80%" },
      });
    }

    // Big CTA lines (home)
    if (document.querySelector(".big-cta")) {
      gsap.from(".cta-line", {
        yPercent: 110,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: { trigger: ".big-cta", start: "top 70%" },
      });
    }

    // Subtle hero parallax out (home)
    if (document.querySelector(".hero-content")) {
      gsap.to(".hero-content", {
        yPercent: -12,
        autoAlpha: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  /* ---------- Marquee ---------- */
  function setupMarquee() {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;
    var tween = gsap.to(track, { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
    ScrollTrigger.create({
      onUpdate: function (self) {
        gsap.to(tween, {
          timeScale: self.direction === -1 ? -1.5 : 1.5,
          duration: 0.4,
          onComplete: function () {
            gsap.to(tween, { timeScale: self.direction === -1 ? -1 : 1, duration: 0.8 });
          },
        });
      },
    });
  }

  /* ---------- Manifesto word-splitting ---------- */
  function splitManifesto() {
    var el = document.getElementById("manifestoText");
    if (!el) return;
    var text = el.textContent;
    el.textContent = "";
    text.split(/(\s+)/).forEach(function (part) {
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(" "));
      } else if (part) {
        var s = document.createElement("span");
        s.className = "mword";
        s.textContent = part;
        el.appendChild(s);
      }
    });
  }

  /* ---------- Language switch: re-split manifesto, re-bind tilt ----------
     main.js's #langToggle handler re-translates [data-i18n] nodes and
     re-renders #featuredGrid. Our handler runs after it (registered later,
     plus a microtask delay) to restore the split words and tilt. */
  function setupLangRefresh() {
    var btn = document.getElementById("langToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      setTimeout(function () {
        splitManifesto();
        document.querySelectorAll("#manifestoText .mword").forEach(function (s) {
          s.style.opacity = "1";
        });
        if (finePointer) setupTilt();
      }, 0);
    });
  }

  /* ---------- Custom cursor ---------- */
  function setupCursor() {
    var cursor = document.getElementById("cursor");
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var label = document.getElementById("cursorLabel");
    if (!cursor || !dot || !ring) return;

    document.body.classList.add("has-cursor");

    var dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    var dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    var ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power2.out" });
    var ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power2.out" });
    var labX = gsap.quickTo(label, "x", { duration: 0.35, ease: "power2.out" });
    var labY = gsap.quickTo(label, "y", { duration: 0.35, ease: "power2.out" });

    window.addEventListener("mousemove", function (e) {
      cursor.classList.add("is-visible");
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
      labX(e.clientX); labY(e.clientY);
    }, { passive: true });

    // Hover states (delegated so dynamically rendered cards work too)
    document.addEventListener("mouseover", function (e) {
      var t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      var labeled = t.closest("[data-cursor]");
      if (labeled) {
        label.textContent = labeled.getAttribute("data-cursor") || "";
        cursor.classList.add("is-active");
        return;
      }
      if (t.closest("[data-hover], a, button, input, textarea, .chip")) {
        gsap.to(ring, { scale: 1.6, duration: 0.25 });
      }
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      if (t.closest("[data-cursor]")) cursor.classList.remove("is-active");
      if (t.closest("[data-hover], a, button, input, textarea, .chip")) {
        gsap.to(ring, { scale: 1, duration: 0.25 });
      }
    });
  }

  /* ---------- Magnetic elements ---------- */
  function setupMagnetic() {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = 0.35;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- 3D tilt on product cards ---------- */
  function setupTilt() {
    document.querySelectorAll(".product-card").forEach(function (card) {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateY: px * 10,
          rotateX: -py * 8,
          transformPerspective: 800,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
      });
    });
  }
})();
