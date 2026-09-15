(function () {
  var html = document.documentElement;
  var body = document.body;
  body.classList.remove('no-js');
  html.classList.add('is-loading');

  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var hasLenis = typeof Lenis !== 'undefined';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 720;

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ================= Project data (work-grid + hero thumbs + case overlay) ================= */
  var PROJECTS = {
    'alder-house': {
      name: 'Alder House',
      year: '2025',
      image: 'images/alder-house.jpg',
      alt: 'Living room with warm plaster walls and a low linen sofa at Alder House',
      statement: 'A ground floor redesigned around how the family actually sits, eats, and stops for the day.',
      description: "Alder House began as a request to fix a living room that never got used. The brief widened once the clients saw what proportion and better light could do: a full reworking of the ground floor, built around a low linen sofa, warm plaster walls, and furniture chosen to be lived on rather than looked at. Nothing in the room was purchased for the photograph.",
      client: 'Private residence',
      scope: 'Full ground-floor interior, furniture & lighting',
      location: 'Los Feliz, CA'
    },
    'farro-and-salt': {
      name: 'Farro & Salt',
      year: '2024',
      image: 'images/farro-and-salt.jpg',
      alt: 'Restaurant dining room with a travertine bar and rattan chairs for Farro & Salt',
      statement: "A neighborhood restaurant's identity, built to feel as unhurried as the food.",
      description: "Farro & Salt came to us with a menu built around slow-cooked grains and a dining room that hadn't caught up to it. We redrew the identity around the same restraint the kitchen already had — a wordmark set in a single warm weight, a palette pulled from travertine and rattan, and signage that reads from the sidewalk without shouting. The interior followed the same logic: a horseshoe bar, low pendant light, and materials repeated from the menu cards to the matchbooks. Nothing about the space or the mark was designed to trend.",
      client: 'Independently owned restaurant',
      scope: 'Brand identity, signage & dining room interior',
      location: 'Silver Lake, CA'
    },
    'bindery-loft': {
      name: 'The Bindery Loft',
      year: '2023',
      image: 'images/bindery-loft.jpg',
      alt: 'Converted loft with exposed beams and a reading nook at The Bindery Loft',
      statement: 'A converted bookbindery turned into a single open studio for living and working.',
      description: "The Bindery Loft occupies the top floor of a converted bookbindery, and the brief was simple: don't cover up what the building already does well. We kept the exposed beams and steel windows and built everything else around them — a kitchen in blackened oak, a reading nook tucked under the roofline, and furniture low enough to keep the ceiling height honest. Storage was built into the walls rather than added as furniture, so the room could stay as open as the building intended. The result reads more like an edit of the space than a decoration of it.",
      client: 'Private client, live/work conversion',
      scope: 'Full interior & custom millwork',
      location: 'Arts District, Los Angeles, CA'
    },
    'casa-ventura': {
      name: 'Casa Ventura',
      year: '2024',
      image: 'images/casa-ventura.jpg',
      alt: 'Hotel lobby with arched doorways and terracotta tile at Casa Ventura',
      statement: 'Twelve rooms and a lobby designed to feel like somebody’s actual house.',
      description: "Casa Ventura is a twelve-room hotel built inside a 1920s courtyard building, and the goal was to make it feel considered rather than curated. We worked room by room rather than from a single repeatable template, pairing terracotta tile and archways original to the building with furniture sourced from nearby makers. The lobby doubles as the only pathway between rooms, so it was built to be lingered in — low seating, warm light, and a bar that runs on local hours rather than hotel ones. Every material choice was picked to age the way the original building already had.",
      client: 'Independent hospitality group',
      scope: 'Full interior, lobby & twelve guest rooms',
      location: 'Downtown Los Angeles, CA'
    }
  };

  /* ================= Preloader ================= */
  var preloader = document.getElementById('preloader');
  var countEl = document.getElementById('preloaderCount');
  var barEl = document.getElementById('preloaderBarFill');

  function finishPreloader() {
    html.classList.remove('is-loading');
    if (preloader) preloader.style.display = 'none';
    revealHero();
    startPostLoad();
  }

  if (!hasGsap || prefersReducedMotion) {
    finishPreloader();
  } else {
    var counter = { val: 0 };
    var tl = gsap.timeline({ onComplete: finishPreloader });
    tl.to(counter, {
      val: 100,
      duration: 0.85,
      ease: 'power1.inOut',
      onUpdate: function () {
        var v = Math.round(counter.val);
        if (countEl) countEl.textContent = v;
        if (barEl) barEl.style.width = v + '%';
      }
    });
    tl.to(preloader, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut'
    }, '-=0.05');
  }

  /* ================= Hero split-text reveal ================= */
  function revealHero() {
    if (!hasGsap || prefersReducedMotion) {
      document.querySelectorAll('.reveal-word > span').forEach(function (el) {
        el.style.transform = 'none';
      });
      var sub = document.querySelector('.hero-subhead');
      var cue = document.querySelector('.scroll-cue');
      if (sub) { sub.style.opacity = 1; sub.style.transform = 'none'; }
      if (cue) { cue.style.opacity = 1; }
      return;
    }

    var tl = gsap.timeline();
    tl.to('.reveal-word > span', {
      y: '0%',
      duration: 1,
      ease: 'power4.out',
      stagger: 0.045
    });
    tl.to('.hero-subhead', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.55');
    tl.to('.scroll-cue', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4');
  }

  /* ================= Post-load: scroll, reveals, cursor, magnetic ================= */
  function startPostLoad() {
    initSmoothScroll();
    initNav();
    initScrollReveals();
    initSectionTransitions();
    initCaseStudy();
    if (!isTouch) {
      initCustomCursor();
      initMagnetic();
      initHeroParallax();
    }
  }

  var lenis = null;

  function initSmoothScroll() {
    if (hasLenis && !prefersReducedMotion) {
      lenis = new Lenis({
        lerp: 0.11,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.2
      });

      if (hasGsap) {
        gsap.ticker.add(function (time) {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        lenis.on('scroll', ScrollTrigger.update);
      } else {
        requestAnimationFrame(function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        });
      }
    }
  }

  /* ================= Nav: scrolled bg + mobile toggle ================= */
  function initNav() {
    var nav = document.getElementById('nav');
    var navLinks = document.getElementById('navLinks');
    var navToggle = document.getElementById('navToggle');
    if (!nav) return;

    function updateNavBg() {
      var y = lenis ? lenis.scroll : window.scrollY;
      nav.classList.toggle('is-scrolled', y > 12);
    }

    if (lenis) {
      lenis.on('scroll', updateNavBg);
    } else {
      window.addEventListener('scroll', updateNavBg, { passive: true });
    }
    updateNavBg();

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('is-open');
        navToggle.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });

      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          navLinks.classList.remove('is-open');
          navToggle.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ================= Scroll reveals ================= */
  function initScrollReveals() {
    if (!hasGsap || prefersReducedMotion) {
      document.querySelectorAll('.reveal, .step-reveal').forEach(function (el) {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      document.querySelectorAll('.mask-reveal').forEach(function (el) {
        el.style.clipPath = 'inset(0 0 0 0)';
        el.style.webkitClipPath = 'inset(0 0 0 0)';
      });
      return;
    }

    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });

    gsap.utils.toArray('.step-reveal').forEach(function (el, i) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    gsap.utils.toArray('.mask-reveal').forEach(function (el) {
      gsap.fromTo(
        el,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.1,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });
  }

  /* ================= Section handoff (scroll-scrubbed, no pin) ================= */
  function initSectionTransitions() {
    if (!hasGsap || prefersReducedMotion) return;

    var hero = document.querySelector('.hero');
    var statement = document.querySelector('.statement');
    var work = document.querySelector('.work');
    var process = document.querySelector('.process');
    var footer = document.querySelector('.footer');

    // Light-bg sections (share the page background, so scaling them in from
    // a hair smaller reveals more of the same color underneath — safe).
    // The dark footer gets opacity only, further down, to avoid a pale halo
    // where its ink background would shrink away from its own edges.
    [statement, work, process].forEach(function (section) {
      if (!section) return;

      gsap.fromTo(
        section,
        { scale: 0.97, opacity: 0.88 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 92%', end: 'top 55%', scrub: true }
        }
      );

      gsap.to(section, {
        scale: 0.97,
        opacity: 0.9,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'bottom 65%', end: 'bottom 5%', scrub: true }
      });
    });

    // Hero only eases out on its way past — its own load-time reveal
    // handles the entrance and isn't touched here.
    if (hero) {
      gsap.to(hero, {
        scale: 0.97,
        opacity: 0.9,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'bottom 65%', end: 'bottom 5%', scrub: true }
      });
    }

    // Footer only eases in (it's the last section) and skips the scale to
    // avoid revealing page background at its edges against the dark fill.
    if (footer) {
      gsap.fromTo(
        footer,
        { opacity: 0.85 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: footer, start: 'top 92%', end: 'top 55%', scrub: true }
        }
      );
    }
  }

  /* ================= Custom cursor ================= */
  function initCustomCursor() {
    var cursor = document.getElementById('cursor');
    var cursorLabel = document.getElementById('cursorLabel');
    if (!cursor || !hasGsap) return;

    body.classList.add('has-custom-cursor');

    var xTo = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });

    var hasMoved = false;
    var lastX = 0;
    var lastY = 0;
    var currentTarget = null;

    // Hit-test at the pointer's last known position rather than relying on
    // mouseenter/mouseleave: Lenis-driven scroll can change what sits under a
    // stationary pointer without firing native hover events, which otherwise
    // leaves the cursor stuck in a stale hover state.
    function applyHoverAt(x, y) {
      var el = document.elementFromPoint(x, y);
      var target = el ? el.closest('[data-cursor-grow], [data-cursor-label]') : null;
      if (target === currentTarget) return;
      currentTarget = target;
      cursor.classList.remove('is-hovering', 'is-hovering-sm');
      if (cursorLabel) cursorLabel.textContent = '';
      if (target) {
        var isSmall = target.getAttribute('data-cursor-grow') === '' && !target.hasAttribute('data-cursor-label');
        cursor.classList.add(isSmall ? 'is-hovering-sm' : 'is-hovering');
        if (cursorLabel) cursorLabel.textContent = target.getAttribute('data-cursor-label') || '';
      }
    }

    window.addEventListener('mousemove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        gsap.set(cursor, { x: lastX, y: lastY });
        cursor.classList.add('is-active');
      }
      xTo(lastX);
      yTo(lastY);
      applyHoverAt(lastX, lastY);
    });

    function onScroll() {
      if (hasMoved) applyHoverAt(lastX, lastY);
    }

    if (lenis) {
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ================= Magnetic CTAs ================= */
  function initMagnetic() {
    if (!hasGsap) return;
    var strength = 0.4;

    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: relX * strength,
          y: relY * strength,
          duration: 0.4,
          ease: 'power3.out'
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  /* ================= Hero side-visual parallax ================= */
  function initHeroParallax() {
    if (!hasGsap || prefersReducedMotion || window.innerWidth <= 900) return;

    var hero = document.querySelector('.hero');
    var primary = document.querySelector('.hero-thumb-primary');
    var secondary = document.querySelector('.hero-thumb-secondary');
    if (!hero || !primary || !secondary) return;

    var pXTo = gsap.quickTo(primary, 'x', { duration: 0.6, ease: 'power3' });
    var pYTo = gsap.quickTo(primary, 'y', { duration: 0.6, ease: 'power3' });
    var sXTo = gsap.quickTo(secondary, 'x', { duration: 0.6, ease: 'power3' });
    var sYTo = gsap.quickTo(secondary, 'y', { duration: 0.6, ease: 'power3' });

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      pXTo(relX * 10);
      pYTo(relY * 8);
      sXTo(relX * -16);
      sYTo(relY * -12);
    });

    hero.addEventListener('mouseleave', function () {
      pXTo(0);
      pYTo(0);
      sXTo(0);
      sYTo(0);
    });
  }

  /* ================= Case-study overlay ================= */
  function initCaseStudy() {
    var overlay = document.getElementById('caseOverlay');
    if (!overlay) return;

    var navEl = document.getElementById('nav');
    var overlayInner = overlay.querySelector('.case-overlay-inner');
    var closeBtn = document.getElementById('caseClose');
    var titleEl = document.getElementById('caseTitle');
    var statementEl = document.getElementById('caseStatement');
    var descriptionEl = document.getElementById('caseDescription');
    var clientEl = document.getElementById('caseClient');
    var scopeEl = document.getElementById('caseScope');
    var locationEl = document.getElementById('caseLocation');
    var imageEl = document.getElementById('caseImage');

    var savedScroll = 0;
    var lastTrigger = null;
    var isOpen = false;

    function populate(id) {
      var data = PROJECTS[id];
      if (!data) return false;
      titleEl.innerHTML = data.name + ' <span class="case-year">(' + data.year + ')</span>';
      statementEl.textContent = data.statement;
      descriptionEl.textContent = data.description;
      clientEl.textContent = data.client;
      scopeEl.textContent = data.scope;
      locationEl.textContent = data.location;
      imageEl.src = data.image;
      imageEl.alt = data.alt;
      return true;
    }

    function openCase(id, trigger) {
      if (!populate(id)) return;
      isOpen = true;
      lastTrigger = trigger || null;
      savedScroll = lenis ? lenis.scroll : window.scrollY;

      html.classList.add('overlay-open');
      if (lenis) lenis.stop();
      if (navEl) navEl.classList.add('is-hidden');

      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');

      if (hasGsap && !prefersReducedMotion) {
        gsap.killTweensOf(overlayInner);
        gsap.fromTo(
          overlayInner,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
        );
        var items = overlay.querySelectorAll('.case-body > *');
        gsap.fromTo(
          items,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.18 }
        );
      } else {
        overlayInner.style.opacity = 1;
        overlayInner.style.transform = 'none';
        overlay.querySelectorAll('.case-body > *').forEach(function (el) {
          el.style.opacity = 1;
          el.style.transform = 'none';
        });
      }

      if (closeBtn) closeBtn.focus();
    }

    function closeCase() {
      if (!isOpen) return;

      function finish() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        html.classList.remove('overlay-open');
        if (navEl) navEl.classList.remove('is-hidden');
        isOpen = false;

        if (lenis) {
          lenis.start();
          lenis.scrollTo(savedScroll, { immediate: true });
        } else {
          window.scrollTo(0, savedScroll);
        }

        // The instant scroll jump above can leave ScrollTrigger's cached
        // trigger positions out of sync with what's now on screen (elements
        // already scrolled past can be stuck in their pre-animation hidden
        // state). Refreshing re-measures and snaps any passed triggers to
        // their completed state immediately.
        if (hasGsap) ScrollTrigger.refresh();

        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      }

      if (hasGsap && !prefersReducedMotion) {
        gsap.to(overlayInner, {
          opacity: 0,
          y: 16,
          scale: 0.98,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: finish
        });
      } else {
        finish();
      }
    }

    document.querySelectorAll('[data-project]').forEach(function (el) {
      if (el.tagName !== 'BUTTON') {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCase(el.getAttribute('data-project'), el);
          }
        });
      }
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openCase(el.getAttribute('data-project'), el);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCase);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeCase();
    });
  }

  /* Safety net: never let the preloader block the page for more than 3s */
  setTimeout(function () {
    if (html.classList.contains('is-loading')) {
      finishPreloader();
    }
  }, 3000);
})();
