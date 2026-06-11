/* Techzy — Awwwards redesign: GSAP choreography, cursor, magnetic, tilt.
   Degrades gracefully: if GSAP fails to load or user prefers reduced
   motion, content stays fully visible and interactive. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    setupMobileNav();

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

    if (finePointer) {
      setupCursor();
      setupMagnetic();
      setupTilt();
    }
  });

  /* ---------- Mobile nav ---------- */
  function setupMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- Intro: preloader + hero reveal ---------- */
  function runIntro() {
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
      })
      .from(".hero-title .word", {
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

  /* ---------- Scroll scenes ---------- */
  function setupScrollScenes() {
    // Manifesto: word-by-word ink-in tied to scroll
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

    // Featured cards rise in
    gsap.utils.toArray(".product-card").forEach(function (card, i) {
      gsap.from(card, {
        y: 60,
        autoAlpha: 0,
        duration: 0.8,
        delay: (i % 4) * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%" },
      });
    });

    // Why items stagger
    gsap.from("[data-stagger]", {
      y: 40,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: { trigger: ".why-grid", start: "top 80%" },
    });

    // CTA lines
    gsap.from(".cta-line", {
      yPercent: 110,
      duration: 1,
      stagger: 0.12,
      ease: "power4.out",
      scrollTrigger: { trigger: ".cta", start: "top 70%" },
    });

    // Subtle hero parallax out
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

  /* ---------- Marquee ---------- */
  function setupMarquee() {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;
    var tween = gsap.to(track, { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
    // Scroll direction nudges marquee speed
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
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = "";
    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(" "));
          } else if (part) {
            var s = document.createElement("span");
            s.className = "mword";
            s.textContent = part;
            el.appendChild(s);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add("mword");
        el.appendChild(node);
      }
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

    // Hover states
    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        label.textContent = el.getAttribute("data-cursor") || "";
        cursor.classList.add("is-active");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-active");
      });
    });
    document.querySelectorAll("[data-hover]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        gsap.to(ring, { scale: 1.6, duration: 0.25 });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(ring, { scale: 1, duration: 0.25 });
      });
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

  /* ---------- 3D tilt on cards ---------- */
  function setupTilt() {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
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
