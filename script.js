// Mobile nav toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var scrim = document.querySelector('.nav-scrim');
  if (!toggle || !links) return;

  function close() {
    links.classList.remove('nav-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (scrim) scrim.classList.remove('nav-open');
    document.body.style.overflow = '';
  }
  function open() {
    links.classList.add('nav-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (scrim) scrim.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
  }
  toggle.addEventListener('click', function () {
    if (links.classList.contains('nav-open')) close(); else open();
  });
  if (scrim) scrim.addEventListener('click', close);
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1120) close(); });
})();

// Gallery lightbox (click a flash-card image to enlarge)
(function () {
  var triggers = document.querySelectorAll('[data-lightbox]');
  if (!triggers.length) return;
  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">&times;</button><img alt="">';
  document.body.appendChild(lightbox);
  var img = lightbox.querySelector('img');

  function openLightbox(src, alt) {
    img.src = src; img.alt = alt || '';
    lightbox.classList.add('is-open');
  }
  function closeLightbox() { lightbox.classList.remove('is-open'); img.src = ''; }

  triggers.forEach(function (el) {
    el.addEventListener('click', function () {
      var src = el.getAttribute('data-lightbox') || el.querySelector('img').src;
      openLightbox(src, el.querySelector('img') ? el.querySelector('img').alt : '');
    });
  });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
})();

// Instagram highlight embeds, paced with IntersectionObserver so every
// artist's 3 posts don't all fire at once (Instagram's widget silently
// renders blank past the first burst when everything loads together).
(function () {
  var targets = document.querySelectorAll('.artist-highlights');
  if (!targets.length) return;
  var embedScriptLoading = false;
  var embedScriptReady = false;
  var onReadyQueue = [];
  function ensureEmbedScript(cb) {
    if (embedScriptReady) { cb(); return; }
    onReadyQueue.push(cb);
    if (embedScriptLoading) return;
    embedScriptLoading = true;
    var s = document.createElement('script');
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true;
    s.onload = function () {
      embedScriptReady = true;
      onReadyQueue.forEach(function (fn) { fn(); });
      onReadyQueue = [];
    };
    document.body.appendChild(s);
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      observer.unobserve(el);
      var urls = (el.getAttribute('data-ig-posts') || '').split('|').filter(Boolean);
      urls.forEach(function (url) {
        var bq = document.createElement('blockquote');
        bq.className = 'instagram-media';
        bq.setAttribute('data-instgrm-permalink', url);
        bq.setAttribute('data-instgrm-version', '14');
        var fallback = document.createElement('a');
        fallback.href = url; fallback.target = '_blank'; fallback.rel = 'noopener';
        fallback.textContent = 'View on Instagram ↗';
        bq.appendChild(fallback);
        el.appendChild(bq);
      });
      ensureEmbedScript(function () { window.instgrm.Embeds.process(); });
    });
  }, { rootMargin: '150px 0px' });
  targets.forEach(function (el) { observer.observe(el); });
})();
