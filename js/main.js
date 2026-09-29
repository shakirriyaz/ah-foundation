(function () {
  "use strict";

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");

    var toTop = document.querySelector(".back-to-top");
    if (toTop) {
      if (window.scrollY > 700) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var navClose = document.querySelector(".mobile-nav-close");
  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    document.body.classList.add("nav-open");
    mobileNav.setAttribute("aria-hidden", "false");
  }
  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    mobileNav.setAttribute("aria-hidden", "true");
  }
  if (navToggle) navToggle.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* Back to top */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });

    /* Safety net: a fast fling-scroll or instant anchor jump can move an
       element past the viewport between two IntersectionObserver samples,
       so it never registers as intersecting and stays invisible forever.
       Reveal anything whose position shows it has already been scrolled to. */
    var forceRevealPassed = function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.1 && rect.bottom > -window.innerHeight) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    };
    document.addEventListener("scroll", forceRevealPassed, { passive: true });
    window.addEventListener("resize", forceRevealPassed);
    forceRevealPassed();
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Animated counters */
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-count-suffix") || "";
      var duration = 1600;
      var start = null;
      var from = 0;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = from + (target - from) * eased;
        el.textContent = (target % 1 === 0 ? Math.floor(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var countIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { countIo.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* Photo slideshow */
  document.querySelectorAll("[data-slideshow]").forEach(function (root) {
    var slides = root.querySelectorAll(".slide");
    var dots = root.querySelectorAll(".dot");
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      slides[current].classList.remove("is-active");
      if (dots[current]) dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      if (dots[current]) dots[current].classList.add("is-active");
    }
    function next() { show(current + 1); }
    function start() {
      stop();
      timer = setInterval(next, 5000);
    }
    function stop() {
      if (timer) clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();
  });

  /* Partner filter (Our Partners page) */
  var chips = document.querySelectorAll(".filter-chip");
  var cards = document.querySelectorAll("[data-category]");
  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var filter = chip.getAttribute("data-filter");
        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-category") || "").split(",");
          var show = filter === "all" || cats.indexOf(filter) !== -1;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Contact form (static front-end demo submit) */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = document.querySelector(".form-success");
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("role", "status");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  /* Active nav link based on current path */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });
})();
