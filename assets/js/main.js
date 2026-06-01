/* Favotrip voucher site, progressive enhancement only. */
(function () {
  "use strict";

  /* ---- Mobile menu ---- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    const open = () => { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("open")); toggle.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; };
    const close = () => { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; setTimeout(() => { menu.hidden = true; }, 280); };
    toggle.addEventListener("click", () => (menu.classList.contains("open") ? close() : open()));
    menu.querySelectorAll("[data-close], a").forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) close(); });
  }

  /* ---- Theme filter (belevingen) ---- */
  const grid = document.getElementById("belevingenGrid");
  if (grid) {
    const chips = document.querySelectorAll("[data-filter]");
    const cards = Array.from(grid.querySelectorAll(".exp-card"));
    const empty = document.getElementById("emptyState");
    const apply = (key) => {
      let shown = 0;
      cards.forEach((c) => {
        const match = key === "all" || c.dataset.theme === key;
        c.style.display = match ? "" : "none";
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    };
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      apply(chip.dataset.filter);
    }));
    // deep-link via hash (#wellness)
    const hash = (location.hash || "").replace("#", "");
    if (hash) {
      const chip = document.querySelector('[data-filter="' + hash + '"]');
      if (chip) chip.click();
    }
  }

  /* ---- Voucher code: format + lightweight validation demo ---- */
  const redeemForm = document.querySelector("[data-redeem]");
  if (redeemForm) {
    const input = redeemForm.querySelector(".code-input");
    const msg = redeemForm.querySelector(".code-msg");
    const clean = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const groups = [8, 8, 8, 5];
    const format = (raw) => {
      const c = clean(raw).slice(0, 29);
      const out = []; let i = 0;
      for (const g of groups) { if (i >= c.length) break; out.push(c.slice(i, i + g)); i += g; }
      return out.join("-");
    };
    input.addEventListener("input", () => {
      const pos = input.selectionStart;
      const before = input.value.length;
      input.value = format(input.value);
      const after = input.value.length;
      input.classList.remove("is-invalid");
      if (msg) { msg.textContent = ""; msg.className = "code-msg"; }
      // keep caret roughly in place when a dash is auto-inserted
      if (after > before && pos === before) { /* appended at end */ }
    });
    redeemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = clean(input.value);
      if (!raw) { fail("Voer een vouchercode in"); return; }
      if (raw.length < 6) { fail("De vouchercode moet minimaal 6 tekens bevatten"); return; }
      // Demo only: a real check calls the backend. Full 8-8-8-5 = 29 chars -> "valid".
      if (raw.length >= 29) {
        input.classList.remove("is-invalid");
        msg.textContent = "Voucher geldig. Je wordt doorgestuurd naar de kalender...";
        msg.className = "code-msg ok";
      } else {
        fail("Controleer de code. Een volledige vouchercode heeft het formaat XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXX.");
      }
    });
    function fail(text) {
      input.classList.add("is-invalid");
      msg.textContent = text;
      msg.className = "code-msg error";
      input.focus();
    }
  }

  /* ---- Newsletter stub ---- */
  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      if (input && input.value) {
        form.innerHTML = '<p style="color:#fff;font-weight:700;margin:0">Bedankt voor je aanmelding!</p>';
      }
    });
  });

  /* ---- Hero tabs (book vs gift) ---- */
  const heroTabs = document.querySelectorAll(".hero-tab");
  if (heroTabs.length) {
    heroTabs.forEach((tab) => tab.addEventListener("click", () => {
      heroTabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      document.querySelectorAll(".hero-panel").forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    }));
  }

  /* ---- Date picker (deal detail demo) ---- */
  document.querySelectorAll(".daterow").forEach((row) => {
    const btns = row.querySelectorAll("button");
    btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); }));
  });

  /* ---- Nav dropdowns: only one open at a time (hover + click + keyboard) ---- */
  const navItems = document.querySelectorAll(".nav__item");
  if (navItems.length) {
    const closeAll = (except) => navItems.forEach((i) => { if (i !== except) i.classList.remove("open"); });
    navItems.forEach((item) => {
      const trigger = item.querySelector(".nav__trigger");
      if (!trigger) return;
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains("open");
        closeAll();
        if (!isOpen) item.classList.add("open");
      });
      item.addEventListener("mouseenter", () => closeAll(item));
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".nav__item")) closeAll(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  }

  /* ---- Language / country switcher ---- */
  const langWrap = document.getElementById("langWrap");
  if (langWrap) {
    const btn = document.getElementById("langBtn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = langWrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    langWrap.querySelectorAll("[data-lang]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("langFlag").textContent = a.dataset.flag;
      document.getElementById("langLabel").textContent = a.dataset.lang;
      langWrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }));
    document.addEventListener("click", (e) => {
      if (!langWrap.contains(e.target)) { langWrap.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Hero search: default arrival date + travelers summary ---- */
  const hsDate = document.getElementById("hs-date");
  if (hsDate) {
    const today = new Date();
    const plus14 = new Date(today.getTime() + 14 * 86400000);
    hsDate.min = today.toISOString().slice(0, 10);
    if (!hsDate.value) hsDate.value = plus14.toISOString().slice(0, 10);
  }
  const travSummary = document.getElementById("travSummary");
  if (travSummary) {
    const adults = document.getElementById("hs-adults");
    const kids = document.getElementById("hs-children");
    const upd = () => {
      const a = Number(adults.value), c = Number(kids.value);
      travSummary.textContent = a + " volwassene" + (a === 1 ? "" : "n") + (c > 0 ? ", " + c + (c === 1 ? " kind" : " kinderen") : "");
    };
    adults.addEventListener("change", upd);
    kids.addEventListener("change", upd);
  }

  /* ---- Choice chip groups (checkout: voor wie / betaalmethode) ---- */
  document.querySelectorAll("[data-choice]").forEach((group) => {
    group.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
      group.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
    }));
  });

  /* ---- Voucher calendar: month scroller, opens on the cheapest month ---- */
  const vcalScroll = document.getElementById("vcalScroll");
  if (vcalScroll) {
    const wrap = vcalScroll.closest(".vcal-scroll-wrap");
    const prev = wrap && wrap.querySelector("[data-vcal-prev]");
    const next = wrap && wrap.querySelector("[data-vcal-next]");
    const months = Array.from(vcalScroll.querySelectorAll(".vcal-month"));
    const step = () => {
      if (months.length < 2) return vcalScroll.clientWidth;
      return Math.round(months[1].getBoundingClientRect().left - months[0].getBoundingClientRect().left);
    };
    const syncArrows = () => {
      const max = vcalScroll.scrollWidth - vcalScroll.clientWidth - 1;
      if (prev) prev.disabled = vcalScroll.scrollLeft <= 1;
      if (next) next.disabled = vcalScroll.scrollLeft >= max;
    };
    if (prev) prev.addEventListener("click", () => vcalScroll.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => vcalScroll.scrollBy({ left: step(), behavior: "smooth" }));
    vcalScroll.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows, { passive: true });
    // Open on the cheapest month, instantly (no animated scroll on load).
    // offsetLeft is a stable layout value (unaffected by current scroll), so this
    // lands the same on first paint and after fonts load. Clamped to the max scroll,
    // so when the cheapest month can't reach the far left it's simply brought into view.
    const cheapest = vcalScroll.querySelector(".vcal-month[data-cheapest]");
    const openOnCheapest = () => {
      if (cheapest) {
        const max = vcalScroll.scrollWidth - vcalScroll.clientWidth;
        const target = Math.max(0, Math.min(cheapest.offsetLeft - vcalScroll.offsetLeft - 4, max));
        const behavior = vcalScroll.style.scrollBehavior;
        vcalScroll.style.scrollBehavior = "auto";
        vcalScroll.scrollLeft = target;
        vcalScroll.style.scrollBehavior = behavior;
      }
      syncArrows();
    };
    requestAnimationFrame(openOnCheapest);
    window.addEventListener("load", openOnCheapest);
  }

  /* ---- Accordion (voucher upsell: "Eén voucher, meerdere mogelijkheden") ---- */
  document.querySelectorAll("[data-acc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc__item");
      if (!item) return;
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Sticky CTA on detail page: show once the hero CTA has scrolled above the viewport ---- */
  const sticky = document.getElementById("stickyCta");
  if (sticky) {
    const mainCta = document.querySelector("[data-main-cta]");
    const update = () => {
      const show = mainCta ? mainCta.getBoundingClientRect().bottom < 8 : window.scrollY > 600;
      sticky.classList.toggle("show", show);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }
})();
