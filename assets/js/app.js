/* ProfiCar1 – Prototyp-Interaktionen. Kein Framework, keine Abhängigkeiten. */
(function () {
  'use strict';

  var body = document.body;
  var WA = body.dataset.wa;

  /* ── Header: Zustand beim Scrollen ──────────────────────────────────── */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Farbschema umschalten ──────────────────────────────────────────── */
  var root = document.documentElement;
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll('.theme-toggle'));
  if (themeButtons.length) {
    // Standard ist das dunkle Schema; hell nur, wenn ausdrücklich gewählt.
    themeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('pc1-theme', next); } catch (e) {}
      });
    });
  }

  /* ── Sprachwahl merken ─────────────────────────────────────────────── */
  // Wer den Umschalter benutzt, hat sich entschieden: ab dann greift die
  // automatische Sprachweiche im <head> nicht mehr gegen diese Wahl.
  Array.prototype.slice.call(document.querySelectorAll('.lang-switch'))
    .forEach(function (link) {
      link.addEventListener('click', function () {
        try { localStorage.setItem('pc1-lang', link.getAttribute('hreflang')); } catch (e) {}
      });
    });

  /* ── Mobile-Navigation ──────────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobileNav.classList.toggle('is-open', !open);
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        mobileNav.hidden = true;
      }
    });
  }

  /* ── Produktfilter (Suche + Kategorie) ──────────────────────────────── */
  var grid = document.getElementById('productGrid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    var search = document.getElementById('productSearch');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var countEl = document.getElementById('resultCount');
    var emptyEl = document.getElementById('emptyState');
    var activeCat = 'all';
    var labels = {
      one: countEl ? countEl.dataset.one : '',
      many: countEl ? countEl.dataset.many : ''
    };

    function apply() {
      var q = (search ? search.value : '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var okCat = activeCat === 'all' || card.dataset.cat === activeCat;
        var okQ = !q || card.dataset.search.indexOf(q) !== -1;
        var show = okCat && okQ;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (countEl) {
        countEl.textContent = visible + ' ' + (visible === 1 ? labels.one : labels.many);
      }
      if (emptyEl) emptyEl.hidden = visible !== 0;
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCat = chip.dataset.cat;
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-selected', String(on));
        });
        apply();
        history.replaceState(null, '', activeCat === 'all' ? location.pathname : '#' + activeCat);
      });
    });

    // Kategorie aus dem Hash übernehmen (Links aus Footer/Kacheln)
    var hash = location.hash.replace('#', '');
    if (hash) {
      var chipMatch = chips.filter(function (c) { return c.dataset.cat === hash; })[0];
      if (chipMatch) chipMatch.click();
    }

    apply();

    /* ── Produkt-Detail als Dialog ────────────────────────────────────── */
    var modal = document.getElementById('productModal');
    var modalImg = document.getElementById('modalImg');
    var modalText = document.getElementById('modalText');
    var modalClose = document.getElementById('modalClose');

    function openCard(card) {
      var detail = card.querySelector('.card-detail');
      var img = card.querySelector('.card-media img');
      if (!detail || !modal) return;
      modalText.innerHTML = detail.innerHTML;
      modalImg.src = img.getAttribute('src');
      modalImg.alt = img.getAttribute('alt');
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
    }

    grid.addEventListener('click', function (e) {
      var opener = e.target.closest('.card-open');
      if (!opener) return;
      openCard(opener.closest('.card'));
    });

    if (modalClose) modalClose.addEventListener('click', function () { modal.close(); });
    if (modal) {
      modal.addEventListener('click', function (e) {
        // Klick auf den Backdrop schließt den Dialog
        if (e.target === modal) modal.close();
      });
    }

    // Direktlink auf ein Produkt (#t1163) hervorheben und Detail öffnen
    var pid = location.hash.replace('#', '');
    if (pid) {
      var target = cards.filter(function (c) { return c.dataset.id === pid; })[0];
      if (target) {
        target.classList.add('is-target');
        requestAnimationFrame(function () {
          target.scrollIntoView({ block: 'center', behavior: 'auto' });
        });
      }
    }
  }

  /* ── Kontaktformular ────────────────────────────────────────────────── */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    var waBtn = document.getElementById('waSend');

    function collect() {
      var get = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      return {
        name: get('f-name'),
        company: get('f-company'),
        email: get('f-email'),
        phone: get('f-phone'),
        topic: get('f-topic'),
        message: get('f-message')
      };
    }

    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var d = collect();
        var lines = [];
        if (d.topic) lines.push(d.topic);
        if (d.message) lines.push('', d.message);
        lines.push('', '—');
        if (d.name) lines.push(d.name);
        if (d.company) lines.push(d.company);
        if (d.email) lines.push(d.email);
        if (d.phone) lines.push(d.phone);
        var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
        window.open(url, '_blank', 'noopener');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var action = form.getAttribute('action') || '';
      if (action.indexOf('DEINE-FORM-ID') !== -1) {
        // Prototyp: noch kein Postfach verbunden – direkt auf WhatsApp umleiten.
        if (waBtn) waBtn.click();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        status.textContent = status.dataset.success;
        status.className = 'form-status is-ok';
        form.reset();
      }).catch(function () {
        status.textContent = status.dataset.error;
        status.className = 'form-status is-err';
      }).finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  }

  /* ── Scroll-Reveal ──────────────────────────────────────────────────── */
  var revealTargets = document.querySelectorAll(
    '.section-head, .cat-card, .usp-list li, .contact-card, .contact-form-wrap, .hero-stats'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
