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

  /* ---- Sticky CTA on detail page ---- */
  const sticky = document.getElementById("stickyCta");
  if (sticky) {
    const onScroll = () => { sticky.classList.toggle("show", window.scrollY > 700); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
