(() => {
  const WA_NUMBER = "554733325868";
  const WA_TEXT = "Olá! Vim pelo site e quero conhecer a Pamp's Academia.";
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waHref;
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-curyear]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const hasGsap = typeof gsap !== "undefined";
  const body = document.body;

  /* ── smooth scroll ── */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.stop();
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (target) => (lenis ? lenis.scrollTo(target, { duration: 1.6 }) : document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }));

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      closeMenu();
      scrollTo(id === "#topo" ? 0 : id);
    });
  });

  /* ── mobile menu ── */
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".menu");
  function closeMenu() {
    body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    lenis?.start();
  }
  burger.addEventListener("click", () => {
    const open = !body.classList.contains("menu-open");
    if (!open) return closeMenu();
    body.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    lenis?.stop();
  });

  /* ── nav state ── */
  const nav = document.querySelector(".nav");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * 0.6 && !body.classList.contains("menu-open"));
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── hero video ── */
  const hero = document.querySelector(".hero");
  const video = document.querySelector(".hero__video");
  const tall = window.innerWidth / window.innerHeight < 0.85;
  video.poster = tall ? video.dataset.posterTall : video.dataset.posterWide;
  video.src = tall ? video.dataset.tall : video.dataset.wide;
  video.load();
  const endPoster = tall ? "assets/video/hero-tall-end.jpg" : "assets/video/hero-wide-end.jpg";

  let titleShown = false;
  if (hasGsap) {
    gsap.set(".hero__title .line > span, .hero__kicker span", { y: 0, yPercent: 110 });
    gsap.set(".hero__actions", { opacity: 0, y: 20 });
  }
  // replace the generic tween target with absolute values
  const revealTitle = () => {
    if (titleShown) return;
    titleShown = true;
    hero.classList.add("is-done");
    if (!hasGsap) return;
    gsap.timeline()
      .to(".hero__title .line > span", { yPercent: 0, duration: 1.4, stagger: 0.12, ease: "expo.out" })
      .to(".hero__actions", { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, "-=1")
      .set(".hero__scroll", { display: "flex" }, "-=.6");
  };

  video.addEventListener("timeupdate", () => {
    if (video.duration && video.currentTime > video.duration - 4.2) revealTitle();
  });
  video.addEventListener("ended", () => {
    revealTitle();
    if (hasGsap) gsap.to(video, { scale: 1.07, duration: 26, ease: "none" });
  });
  window.addEventListener("wheel", revealTitle, { once: true, passive: true });
  window.addEventListener("touchmove", revealTitle, { once: true, passive: true });

  function startHero() {
    if (hasGsap) {
      gsap.to(".hero__kicker span", { yPercent: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", delay: 0.4 });
      gsap.to(".hero__meta", { opacity: 1, duration: 1.2, delay: 0.9 });
    }
    const p = video.play();
    if (p && p.catch) {
      p.catch(() => {
        video.poster = endPoster;
        revealTitle();
      });
    }
    if (reduce) {
      video.pause();
      video.poster = endPoster;
      video.removeAttribute("src");
      video.load();
      revealTitle();
    }
  }

  /* ── loader ── */
  const loader = document.querySelector(".loader");
  const countEl = document.querySelector(".loader__count span");
  let progress = 0;
  let ready = false;
  const minTime = 1500;
  const t0 = performance.now();
  const markReady = () => (ready = true);
  video.addEventListener("canplay", markReady, { once: true });
  setTimeout(markReady, 3000);
  if (video.readyState >= 3) markReady();

  let finished = false;
  const loop = setInterval(() => {
    const elapsed = performance.now() - t0;
    const target = ready ? 100 : Math.min(88, (elapsed / 2200) * 88);
    progress += (target - progress) * (ready ? 0.22 : 0.35);
    const shown = Math.min(100, Math.round(progress));
    countEl.textContent = String(shown).padStart(2, "0");
    if (!finished && ready && elapsed > minTime && shown >= 99) {
      finished = true;
      clearInterval(loop);
      finishLoader();
    }
  }, 30);

  function finishLoader() {
    countEl.textContent = "100";
    const done = () => {
      loader.remove();
      body.classList.remove("is-loading");
      lenis?.start();
      document.querySelector(".wa-float").classList.add("is-in");
      setTimeout(() => {
        const f = document.querySelector(".wa-float");
        f.classList.add("tip");
        setTimeout(() => f.classList.remove("tip"), 3200);
      }, 7000);
      ScrollTrigger?.refresh?.();
    };
    if (!hasGsap) { done(); startHero(); return; }
    gsap.timeline()
      .to(".loader__mark, .loader__count, .loader__label", { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" })
      .add(startHero)
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=.05")
      .add(done);
  }

  if (!hasGsap) return;

  /* ── hero scroll-out ── */
  gsap.to(".hero__media", {
    yPercent: 18, ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__content", {
    y: -80, opacity: 0, ease: "none",
    scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: true },
  });

  /* ── word splitter ── */
  function split(el) {
    const walk = (node, wrapEm) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
            else {
              const s = document.createElement("span");
              s.className = "w";
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return el.querySelectorAll(".w");
  }

  const manifestoWords = split(document.querySelector(".manifesto__text"));
  gsap.to(manifestoWords, {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".manifesto__text", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
  });

  const qWords = split(document.querySelector(".question__q"));
  if (matchMedia("(min-width: 761px)").matches) {
    gsap.timeline({ scrollTrigger: { trigger: ".question", start: "top top", end: "bottom bottom", scrub: 0.6 } })
      .from(".question__pre", { opacity: 0, y: 20, duration: 0.3 })
      .to(qWords, { opacity: 1, stagger: 0.12, duration: 0.4 })
      .from(".question__post", { opacity: 0, y: 30, duration: 0.5 });
  } else {
    gsap.to(qWords, { opacity: 1, stagger: 0.1, scrollTrigger: { trigger: ".question__q", start: "top 85%", end: "bottom 50%", scrub: 0.6 } });
  }

  /* ── headings / generic reveal ── */
  gsap.utils.toArray(".h1, .h2, .contact__title").forEach((h) => {
    if (h.closest(".tour")) return;
    gsap.from(h, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%" } });
  });
  gsap.utils.toArray(".label").forEach((l) => {
    gsap.from(l, { opacity: 0, x: -20, duration: 1, ease: "expo.out", scrollTrigger: { trigger: l, start: "top 92%" } });
  });

  /* ── marquees with scroll velocity ── */
  gsap.utils.toArray("[data-marquee]").forEach((track) => {
    const dir = Number(track.dataset.dir || 1);
    const tween = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: 28, ease: "none", repeat: -1 });
    let boost = 1;
    ScrollTrigger.create({
      trigger: track, start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 600);
        gsap.to(tween, { timeScale: boost, duration: 0.3, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: 1, duration: 1.2 }) });
      },
    });
  });

  /* ── counters ── */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(end >= 10 ? 2 : 1, "0")) }),
    });
  });
  gsap.from(".nums__grid li", { y: 50, opacity: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".nums__grid", start: "top 85%" } });

  /* ── tour: horizontal on desktop ── */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 761px)", () => {
    const track = document.querySelector(".tour__track");
    const dist = () => track.scrollWidth - window.innerWidth;
    const h = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".tour", pin: ".tour__pin", start: "top top", end: () => "+=" + dist(), scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.utils.toArray(".panel").forEach((p) => {
      const img = p.querySelector("img");
      gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: p, containerAnimation: h, start: "left right", end: "right left", scrub: true } });
      gsap.fromTo(p.querySelector(".panel__img"), { clipPath: "inset(12% 0 12% 0)" }, { clipPath: "inset(0% 0 0% 0)", ease: "none", scrollTrigger: { trigger: p, containerAnimation: h, start: "left right", end: "left 55%", scrub: true } });
    });
    gsap.utils.toArray(".tour__floor span").forEach((s) => {
      gsap.from(s, { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: s, containerAnimation: h, start: "left 95%", end: "left 60%", scrub: true } });
    });
  });
  mm.add("(max-width: 760px)", () => {
    gsap.utils.toArray(".panel").forEach((p) => {
      gsap.from(p, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: p, start: "top 90%" } });
      gsap.fromTo(p.querySelector("img"), { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  /* ── PAMPLONA → PAMP'S ── */
  gsap.timeline({ scrollTrigger: { trigger: ".name", start: "top 65%", end: "center 45%", scrub: 0.8 } })
    .to(".name__word .g", { yPercent: 70, opacity: 0, rotate: 8, stagger: 0.06, duration: 0.5, ease: "power2.in" })
    .to(".name__word .g", { width: 0, duration: 0.5, ease: "power2.inOut" }, "-=.15")
    .fromTo(".name__word .n", { opacity: 0, xPercent: 40 }, { opacity: 1, xPercent: 0, duration: 0.4, ease: "expo.out" }, "-=.2");
  gsap.from(".name__copy p", { y: 40, opacity: 0, stagger: 0.15, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".name__copy", start: "top 85%" } });

  /* ── founders duo ── */
  gsap.utils.toArray(".person").forEach((p, i) => {
    gsap.fromTo(p.querySelector(".person__img"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut", delay: i * 0.15, scrollTrigger: { trigger: p, start: "top 85%" } });
    gsap.fromTo(p.querySelector("img"), { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(p.querySelectorAll("figcaption > *"), { y: 24, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: p.querySelector("figcaption"), start: "top 92%" } });
  });

  /* ── founder ── */
  const fv = document.querySelector(".founder__bg");
  ScrollTrigger.create({
    trigger: ".founder", start: "top bottom", end: "bottom top",
    onToggle: (self) => (self.isActive ? fv.play().catch(() => {}) : fv.pause()),
  });
  gsap.from(".titles li", { x: 60, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".titles", start: "top 80%" } });
  gsap.from(".founder__story > *", { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".founder__story", start: "top 82%" } });

  /* ── timeline ── */
  const yearBox = document.querySelector(".story__year span");
  let currentYear = yearBox.textContent;
  document.querySelectorAll(".story__list li").forEach((li) => {
    const m = document.createElement("span");
    m.className = "yr-m";
    m.textContent = li.dataset.year;
    li.prepend(m);
    ScrollTrigger.create({
      trigger: li, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => {
        li.classList.toggle("is-on", self.isActive || li.classList.contains("is-on") && self.direction > 0);
        if (self.isActive && li.dataset.year !== currentYear) {
          currentYear = li.dataset.year;
          const dirUp = self.direction > 0;
          gsap.timeline()
            .to(yearBox, { yPercent: dirUp ? -100 : 100, opacity: 0, duration: 0.25, ease: "power2.in" })
            .add(() => (yearBox.textContent = currentYear))
            .fromTo(yearBox, { yPercent: dirUp ? 100 : -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
        }
      },
    });
  });

  /* ── pillars hover image ── */
  const float = document.querySelector(".pillars__float");
  const floatImg = float.querySelector("img");
  if (canHover && window.innerWidth > 900) {
    const xTo = gsap.quickTo(float, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.6, ease: "power3" });
    gsap.set(float, { xPercent: -50, yPercent: -50 });
    document.querySelectorAll(".pillars li").forEach((li) => {
      li.addEventListener("mouseenter", () => {
        floatImg.src = li.dataset.img;
        float.classList.add("is-on");
        gsap.to(float, { scale: 1, rotate: gsap.utils.random(-5, 5), duration: 0.5, ease: "expo.out" });
      });
      li.addEventListener("mouseleave", () => {
        float.classList.remove("is-on");
        gsap.to(float, { scale: 0.8, duration: 0.4 });
      });
    });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX + 170); yTo(e.clientY); });
  }
  gsap.from(".pillars li", { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".pillars", start: "top 85%" } });

  /* ── contact ── */
  gsap.fromTo(".contact__bg img", { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".wa-big", { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".wa-big", start: "top 92%" } });
  gsap.from(".foot__word", { yPercent: 40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 95%" } });

  /* ── magnetic ── */
  if (canHover) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1,.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1,.4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
