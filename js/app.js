/* =============================================================
   ARYAN BHAPKAR · PORTFOLIO
   GSAP + ScrollTrigger + Lenis — transitions & kinetic type
   ============================================================= */

gsap.registerPlugin(ScrollTrigger);

/* =============================================================
   LENIS SMOOTH SCROLL
   ============================================================= */
const lenis = new Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
  wheelMultiplier: 1.05,
  touchMultiplier: 1.2,
});
window.lenis = lenis;
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

/* =============================================================
   CUSTOM CURSOR
   ============================================================= */
(() => {
  const cur = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!cur || !dot) return;

  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;

  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });

  function tick() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  const hoverables = 'a, button, [data-nav], .proj-card, .channel, .channel-btn, .submit-btn, .paper, .stack-col li, .chip-row li, .edu-row, .resume-card, .nav-resume, .exp-bullets li';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverables)) cur.classList.add('hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverables)) cur.classList.remove('hover');
  });
})();

/* =============================================================
   PRELOADER
   ============================================================= */
function wrapPreWord(el) {
  const txt = el.getAttribute('data-word');
  el.innerHTML = `<span class="inner">${txt}</span>`;
}
document.querySelectorAll('.pre-word').forEach(wrapPreWord);

function runPreloader() {
  return new Promise((resolve) => {
    const pre = document.getElementById('preloader');
    const fill = document.querySelector('.pre-bar-fill');
    const cEl = document.getElementById('preCount');
    const words = document.querySelectorAll('.pre-word .inner');

    lenis.stop();

    const tl = gsap.timeline({ onComplete: resolve });
    tl.to(words, { y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 }, 0.2);

    const counter = { n: 0 };
    tl.to(counter, {
      n: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => { cEl.textContent = Math.floor(counter.n); },
    }, 0.1);

    tl.to(fill, { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0.1);
    tl.to(words, { y: '-110%', duration: 0.9, ease: 'expo.inOut', stagger: 0.05 }, '+=0.15');
    tl.to('.pre-bar, .pre-counter, .pre-mono', { opacity: 0, duration: 0.4 }, '<');
    tl.to(pre, {
      yPercent: -100,
      duration: 1.0,
      ease: 'expo.inOut',
      onComplete: () => { pre.style.display = 'none'; lenis.start(); },
    }, '-=0.2');
  });
}

/* =============================================================
   UTIL · SPLIT LINES / WORDS
   ============================================================= */
function splitIntoLines(el) {
  if (el.dataset.splitDone === '1') return;
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  const words = text.split(' ');
  el.innerHTML = '';
  const tmp = document.createElement('span');
  tmp.style.cssText = 'display:block;';
  el.appendChild(tmp);

  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'word-item';
    s.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:top;';
    const inner = document.createElement('span');
    inner.className = 'word-inner';
    inner.style.cssText = 'display:inline-block; transform:translateY(110%); will-change:transform;';
    inner.textContent = w;
    s.appendChild(inner);
    tmp.appendChild(s);
    if (i < words.length - 1) tmp.appendChild(document.createTextNode(' '));
  });
  el.dataset.splitDone = '1';
}

document.querySelectorAll('[data-split-lines]').forEach(splitIntoLines);

/* =============================================================
   HERO INTRO
   ============================================================= */
function heroIntro() {
  const chars = document.querySelectorAll('.hero-title .char');
  const subs = document.querySelectorAll('.hero-sub .sub-line');
  const meta = document.querySelectorAll('.hero-meta-top .meta-line');
  const photo = document.querySelector('.hero-photo-wrap');
  const pill = document.querySelector('.hero-pill');
  const cue = document.querySelector('.scroll-cue');
  const tags = document.querySelectorAll('.photo-tag');

  // wrap sub-lines
  subs.forEach((el) => {
    const t = el.textContent;
    el.innerHTML = `<span style="display:inline-block; transform:translateY(110%);">${t}</span>`;
  });

  gsap.set(photo, { scale: 1.25, opacity: 0, y: 40 });
  gsap.set(tags, { opacity: 0, y: 10 });
  gsap.set(pill, { opacity: 0, y: 20 });
  gsap.set(cue, { opacity: 0 });
  gsap.set(meta, { opacity: 0, y: -10 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(meta, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0)
    .to(photo, { opacity: 1, scale: 1, y: 0, duration: 1.6 }, 0.1)
    .to(chars, {
      y: 0,
      rotate: 0,
      duration: 1.4,
      stagger: { each: 0.04, from: 'start' },
    }, 0.2)
    .to([...subs].map(s => s.firstElementChild), {
      y: 0,
      duration: 1,
      stagger: 0.1,
    }, 0.9)
    .to(tags, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.0)
    .to(pill, { opacity: 1, y: 0, duration: 0.8 }, 1.1)
    .to(cue, { opacity: 1, duration: 0.8 }, 1.3);
}

/* =============================================================
   SECTION TITLES · LINE REVEAL
   ============================================================= */
function animateSectionTitles() {
  document.querySelectorAll('.section-title, .contact-title').forEach((title) => {
    const lineSpans = title.querySelectorAll(':scope > span');
    lineSpans.forEach((s) => {
      if (s.querySelector('.t-inner')) return;
      const html = s.innerHTML;
      s.innerHTML = `<span class="t-inner" style="display:inline-block;transform:translateY(110%);will-change:transform;">${html}</span>`;
    });

    gsap.to(title.querySelectorAll('.t-inner'), {
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
      },
    });
  });
}

/* =============================================================
   SPLIT-LINE TEXT REVEALS
   ============================================================= */
function animateSplitLines() {
  document.querySelectorAll('[data-split-lines]').forEach((el) => {
    const inners = el.querySelectorAll('.word-inner');
    gsap.to(inners, {
      y: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.015,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });
}

/* =============================================================
   GENERIC REVEALS
   ============================================================= */
function animateReveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });
}

/* =============================================================
   STATS COUNTER
   ============================================================= */
function animateStats() {
  document.querySelectorAll('.stat-num').forEach((el) => {
    const final = +el.getAttribute('data-count');
    const obj = { n: 0 };
    gsap.to(obj, {
      n: final,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => { el.textContent = Math.floor(obj.n); },
    });
  });
}

/* =============================================================
   PROJECT CARDS · subtle parallax + stagger
   ============================================================= */
function projectsReveal() {
  const marquee = document.querySelector('.proj-marquee');
  const track = document.querySelector('.proj-track');
  if (!marquee || !track) return;

  // Clone the cards once so the strip can wrap seamlessly in both directions
  const originals = Array.from(track.children);
  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('is-clone');
    track.appendChild(clone);
  });

  // ---- state ----
  let x = 0;                   // current translateX in px (negative as we move left)
  let halfWidth = 0;           // width of the original (un-cloned) set
  const SPEED = 60;            // px per second (auto-scroll)
  let lastT = 0;
  let hovered = false;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let dragVel = 0;             // velocity carried from drag release (momentum)
  let resumeAt = 0;            // timestamp when auto-scroll should resume after drag

  const measure = () => {
    // originals + their margin-right make up exactly half the total track width
    halfWidth = track.scrollWidth / 2;
  };

  // wrap x into (-halfWidth, 0] so the motion loops both ways invisibly
  const wrap = () => {
    if (halfWidth <= 0) return;
    while (x <= -halfWidth) x += halfWidth;
    while (x > 0) x -= halfWidth;
  };

  const apply = () => { track.style.transform = `translate3d(${x}px, 0, 0)`; };

  const tick = (t) => {
    if (!lastT) lastT = t;
    const dt = (t - lastT) / 1000; // seconds
    lastT = t;

    if (!dragging) {
      // momentum after drag release, decays quickly
      if (Math.abs(dragVel) > 1) {
        x += dragVel * dt;
        dragVel *= Math.pow(0.02, dt); // exponential decay
      } else {
        dragVel = 0;
        // auto-scroll only if not hovered and we're past the resume deadline
        if (!hovered && t >= resumeAt) {
          x -= SPEED * dt;
        }
      }
      wrap();
      apply();
    }
    requestAnimationFrame(tick);
  };

  // ---- interaction ----
  marquee.addEventListener('pointerenter', () => { hovered = true; });
  marquee.addEventListener('pointerleave', () => {
    hovered = false;
    if (dragging) endDrag();
  });

  const startDrag = (e) => {
    dragging = true;
    dragStartX = e.clientX;
    dragStartOffset = x;
    dragVel = 0;
    marquee.classList.add('is-dragging');
    marquee.setPointerCapture?.(e.pointerId);
  };

  const moveDrag = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const prev = x;
    x = dragStartOffset + dx;
    wrap();
    apply();
    // rough instantaneous velocity (px/sec) for release momentum
    dragVel = (x - prev) * 60;
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    marquee.classList.remove('is-dragging');
    // give the user 1.2s to read before auto-scroll resumes
    resumeAt = performance.now() + 1200;
  };

  marquee.addEventListener('pointerdown', (e) => {
    // primary button only
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    startDrag(e);
  });
  window.addEventListener('pointermove', moveDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // horizontal trackpad swipes also scrub; vertical wheel is ignored → page scrolls
  marquee.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      x -= e.deltaX;
      wrap();
      apply();
      resumeAt = performance.now() + 800;
    }
  }, { passive: false });

  // ---- boot ----
  const boot = () => {
    measure();
    apply();
    requestAnimationFrame(tick);
  };
  // wait for images/fonts so widths are correct
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);

  window.addEventListener('resize', () => {
    measure();
    wrap();
    apply();
  });

  // first-view fade-in
  track.style.opacity = '0';
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 800, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
      );
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  io.observe(track);
}

function experienceReveal() {
  document.querySelectorAll('.exp-row').forEach((row) => {
    gsap.fromTo(row,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 85%' },
      }
    );
  });
}

/* =============================================================
   PAPER ROW PARALLAX-ISH REVEAL
   ============================================================= */
function papersReveal() {
  document.querySelectorAll('[data-paper]').forEach((p) => {
    gsap.fromTo(p,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: p, start: 'top 85%' },
      }
    );
  });
}

/* =============================================================
   HERO PHOTO PARALLAX
   ============================================================= */
function heroParallax() {
  const photo = document.querySelector('.hero-photo-wrap');
  if (!photo) return;
  gsap.to(photo, {
    y: 180,
    scale: 0.92,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
  gsap.to('.hero-title', {
    y: -120,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* =============================================================
   NAV SCROLL STATE
   ============================================================= */
function navState() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top -80',
    end: 'bottom top',
    onUpdate: (self) => {
      if (self.scroll() > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    },
  });

  // nav anchor smooth scroll via lenis
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) lenis.scrollTo(target, { offset: -40, duration: 1.4 });
      document.getElementById('drawer')?.classList.remove('open');
      document.getElementById('navBurger')?.classList.remove('open');
    });
  });

  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('drawer');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    drawer.classList.toggle('open');
  });
}

/* =============================================================
   LIVE CLOCK (San Francisco / Pacific time)
   ============================================================= */
function clock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const pad = (n) => String(n).padStart(2, '0');
  const tzFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const abbrFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  });
  const tick = () => {
    const now = new Date();
    const time = tzFmt.format(now);
    // "9/14/2026, PDT" → grab PDT/PST from the end
    const abbr = abbrFmt.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'PT';
    el.textContent = `${time} ${abbr}`;
  };
  tick(); setInterval(tick, 1000);
}

/* =============================================================
   CONTACT FORM — native POST to FormSubmit.co
     The <form> submits naturally (browser navigates to FormSubmit,
     which relays the email and redirects to _next). We only add:
       - a subtle "TRANSMITTING..." state on click
       - a thank-you banner when the user returns with ?sent=1
   ============================================================= */
const CONTACT_EMAIL = 'abhapkar@asu.edu';

function contactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  // Dynamic _next — redirect back to the top of the portfolio after submit.
  // Works on localhost during dev and on your real domain after deploy.
  const nextField = document.getElementById('formNext');
  if (nextField) {
    const origin = window.location.origin;
    const path = window.location.pathname;
    nextField.value = `${origin}${path}?sent=1#hero`;
  }

  // Pre-submit UX: show transmitting state (form still posts natively)
  form.addEventListener('submit', () => {
    const btn = form.querySelector('.submit-btn');
    const label = btn.querySelector('.sb-label');
    btn.disabled = true;
    label.textContent = 'TRANSMITTING...';
    status.className = 'form-status';
    status.textContent = '> ROUTING MESSAGE VIA FORMSUBMIT...';
  });

  // Return flow: show a floating toast + scroll to top when ?sent=1 is in the URL
  const url = new URL(window.location.href);
  if (url.searchParams.get('sent') === '1') {
    // keep the mirrored status inside the form too (in case user scrolls down)
    status.className = 'form-status ok';
    status.innerHTML = '&gt; MESSAGE_TRANSMITTED — thanks, I\'ll reply from '
      + `<a style="color:var(--accent);text-decoration:underline" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> soon.`;

    // clean URL so the banner doesn't stick on reload
    url.searchParams.delete('sent');
    history.replaceState(null, '', url.pathname + url.search + (url.hash || ''));

    // jump to the very top of the portfolio (hero) then smooth-scroll there
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    });

    // floating confirmation toast at the top
    showSentToast();
  }
}

function showSentToast() {
  if (document.querySelector('.sent-toast')) return;
  const toast = document.createElement('div');
  toast.className = 'sent-toast';
  toast.innerHTML = `
    <span class="st-dot"></span>
    <div class="st-body">
      <strong>MESSAGE_TRANSMITTED</strong>
      <span>Thanks — I'll reply from ${CONTACT_EMAIL} soon.</span>
    </div>
    <button class="st-close" aria-label="Dismiss">×</button>
  `;
  document.body.appendChild(toast);

  const close = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  };
  toast.querySelector('.st-close').addEventListener('click', close);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(close, 7000);
}

/* =============================================================
   INIT
   ============================================================= */
window.addEventListener('load', async () => {
  await runPreloader();

  heroIntro();
  animateSectionTitles();
  animateSplitLines();
  animateReveals();
  animateStats();
  experienceReveal();
  projectsReveal();
  papersReveal();
  heroParallax();
  navState();
  contactForm();
  clock();

  ScrollTrigger.refresh();

  // refresh on font load
  if (document.fonts) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
});

window.addEventListener('resize', () => ScrollTrigger.refresh());
