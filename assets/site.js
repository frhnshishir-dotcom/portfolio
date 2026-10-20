// Small progressive enhancements: mobile menu, contact form checks, case-study viewer.
(function () {
  function show(el, on) { if (el) el.style.display = on ? 'contents' : 'none'; }

  // Mobile menu
  var menuBtn = document.querySelector('[data-action="toggleMenu"]');
  var menu = document.querySelector('[data-if="menuOpen"]');
  function setMenu(open) {
    if (!menuBtn) return;
    show(menu, open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.firstChild.nodeValue = open ? 'Close' : 'Menu';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.querySelectorAll('[data-action="closeMenu"]').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
  }

  // Contact form: validation only. No email service is connected yet,
  // so a valid submission says plainly that nothing was sent.
  var form = document.querySelector('form[data-action="submit"]');
  if (form) {
    var fields = [
      { key: 'name', input: form.querySelector('[name="name"]'), check: function (v) { return v ? '' : 'Please enter your name.'; } },
      { key: 'email', input: form.querySelector('[name="email"]'), check: function (v) {
        if (!v) return 'Please enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'That email address doesn’t look complete.';
      } },
      { key: 'msg', input: form.querySelector('[name="message"]'), check: function (v) { return v ? '' : 'Please write a short message.'; } }
    ];
    var notSent = form.querySelector('[data-if="notSent"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) {
        var msg = f.check(f.input.value.trim());
        var wrap = form.querySelector('[data-if="' + f.key + 'Err"]');
        var p = wrap && wrap.querySelector('.err');
        if (p) p.textContent = msg;
        show(wrap, !!msg);
        f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        f.input.style.borderColor = msg ? '#FF9AA6' : '#1A3BB0';
        if (msg && !firstBad) firstBad = f.input;
      });
      show(notSent, !firstBad);
      if (firstBad) firstBad.focus();
    });
    fields.forEach(function (f) { f.input.addEventListener('input', function () { show(notSent, false); }); });
  }

  // Case-study viewer tabs
  var tabs = { showSplit: 'split', showPreview: 'preview', showCode: 'code' };
  var preview = document.querySelector('[data-if="showPreviewPane"]');
  var code = document.querySelector('[data-if="showCodePane"]');
  var buttons = Object.keys(tabs).map(function (k) { return document.querySelector('[data-action="' + k + '"]'); });
  function setView(view) {
    buttons.forEach(function (b) {
      if (!b) return;
      var on = tabs[b.getAttribute('data-action')] === view;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.background = on ? '#1A3BB0' : 'transparent';
      b.style.color = on ? '#E6EDFD' : '#AFC5F8';
      b.style.borderColor = on ? '#2E5DE6' : 'transparent';
    });
    show(preview, view !== 'code');
    show(code, view !== 'preview');
  }
  buttons.forEach(function (b) {
    if (b) b.addEventListener('click', function () { setView(tabs[b.getAttribute('data-action')]); });
  });
})();
