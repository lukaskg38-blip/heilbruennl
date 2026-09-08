/* Heilbrünnl — interaction & scroll system */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP) { gsap.registerPlugin(ScrollTrigger); }

  ready(function(){
    initPreloader();
    initTheme();
    initHeader();
    initMobileNav();
    initCursor();
    initMagnetic();
    initProgressBar();
    initHeroTitles();
    initReveals();
    initCounters();
    initLegendScroll();
    initHeroParallax();
    initContactForm();
    initYear();
  });

  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---------------- Preloader ---------------- */
  function initPreloader(){
    var el = document.querySelector('.preloader');
    if (!el) return;
    var done = function(){
      el.classList.add('is-done');
      document.documentElement.classList.add('hero-loaded');
      window.removeEventListener('load', done);
    };
    var maxWait = setTimeout(done, 1800);
    window.addEventListener('load', function(){ clearTimeout(maxWait); setTimeout(done, 550); });
  }

  /* ---------------- Theme (Tag / Nacht) ---------------- */
  function initTheme(){
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('heilbruennl-theme'); } catch(e){}
    if (saved === 'night') root.setAttribute('data-theme', 'night');

    var toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function(btn){
      btn.addEventListener('click', function(){
        var isNight = root.getAttribute('data-theme') === 'night';
        if (isNight) { root.removeAttribute('data-theme'); }
        else { root.setAttribute('data-theme', 'night'); }
        try { localStorage.setItem('heilbruennl-theme', isNight ? 'day' : 'night'); } catch(e){}
        if (hasGSAP) ScrollTrigger.refresh();
      });
    });
  }

  /* ---------------- Header on scroll ---------------- */
  function initHeader(){
    var header = document.querySelector('.site-header');
    if (!header) return;
    var toggle = function(){
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileNav(){
    var burger = document.querySelector('.burger');
    var nav = document.querySelector('.mobile-nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor(){
    if (isCoarse) return;
    var dot = document.querySelector('.cursor');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    var rx = 0, ry = 0, dx = 0, dy = 0;
    window.addEventListener('mousemove', function(e){
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      rx = e.clientX; ry = e.clientY;
    });
    (function loop(){
      dx += (rx - dx) * 0.18;
      dy += (ry - dy) * 0.18;
      ring.style.left = dx + 'px';
      ring.style.top = dy + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .magnetic, input, textarea, select').forEach(function(el){
      el.addEventListener('mouseenter', function(){ dot.classList.add('is-active'); ring.classList.add('is-active'); });
      el.addEventListener('mouseleave', function(){ dot.classList.remove('is-active'); ring.classList.remove('is-active'); });
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic(){
    if (isCoarse || reduceMotion) return;
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width/2;
        var y = e.clientY - r.top - r.height/2;
        el.style.transform = 'translate(' + (x*0.25) + 'px,' + (y*0.35) + 'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }

  /* ---------------- Scroll progress bar ---------------- */
  function initProgressBar(){
    var bar = document.querySelector('.progress-bar');
    if (!bar) return;
    var update = function(){
      var h = document.documentElement;
      var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = (scrolled || 0) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------------- Hero title line reveal ---------------- */
  function initHeroTitles(){
    document.querySelectorAll('.hero-title .line span').forEach(function(span, i){
      span.style.setProperty('--i', i);
    });
  }

  /* ---------------- Generic reveal-on-scroll ---------------- */
  function initReveals(){
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function(el){ el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute('data-delay');
          if (delay) el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function(el){ io.observe(el); });
  }

  /* ---------------- Animated counters ---------------- */
  function initCounters(){
    var items = document.querySelectorAll('[data-count]');
    if (!items.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion) { el.textContent = target + suffix; io.unobserve(el); return; }
        var start = null, duration = 1400;
        function step(ts){
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    items.forEach(function(el){ io.observe(el); });
  }

  /* ---------------- Hero parallax ---------------- */
  function initHeroParallax(){
    if (!hasGSAP || reduceMotion) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    gsap.utils.toArray('.hero-media[data-depth]').forEach(function(layer){
      var depth = parseFloat(layer.getAttribute('data-depth')) || 1;
      gsap.to(layer, {
        yPercent: depth * 9,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    });
  }

  /* ---------------- Legend pinned scrollytelling ---------------- */
  function initLegendScroll(){
    var pin = document.querySelector('.legend-pin');
    if (!pin) return;
    var beats = pin.querySelectorAll('.legend-beat');
    var dots = pin.querySelectorAll('.legend-progress i');

    if (!hasGSAP || reduceMotion) {
      pin.classList.add('legend-fallback');
      beats.forEach(function(b){ b.classList.add('is-active'); });
      return;
    }

    var setActive = function(idx){
      beats.forEach(function(b, i){ b.classList.toggle('is-active', i === idx); });
      dots.forEach(function(d, i){ d.classList.toggle('is-active', i === idx); });
    };
    setActive(0);

    ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function(self){
        var idx = Math.min(beats.length - 1, Math.floor(self.progress * beats.length));
        setActive(idx);
      }
    });
  }

  /* ---------------- Contact form: Netlify Forms with mailto fallback ---------------- */
  function initContactForm(){
    var form = document.querySelector('#contact-form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');

    function mailtoFallback(name, phone, subject, message){
      var body = 'Name: ' + name + '\nTelefon: ' + (phone || '-') + '\n\n' + message;
      var mailto = 'mailto:info@heilbruennl.de'
        + '?subject=' + encodeURIComponent('[Website] ' + subject)
        + '&body=' + encodeURIComponent(body + '\n\n— gesendet über das Kontaktformular von heilbruennl.de');
      window.location.href = mailto;
      if (status) { status.textContent = 'Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Nachricht.'; status.className = 'form-status ok'; }
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var phone = (data.get('phone') || '').toString();
      var subject = (data.get('subject') || 'Anfrage').toString();
      var message = (data.get('message') || '').toString();

      if (!name || !email || !message) {
        if (status) { status.textContent = 'Bitte füllen Sie Name, E-Mail und Nachricht aus.'; status.className = 'form-status'; }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (status) { status.textContent = 'Wird gesendet …'; status.className = 'form-status'; }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      }).then(function(res){
        if (submitBtn) submitBtn.disabled = false;
        if (res.ok) {
          form.reset();
          if (status) { status.textContent = 'Danke! Ihre Nachricht ist bei uns eingegangen.'; status.className = 'form-status ok'; }
        } else {
          mailtoFallback(name, phone, subject, message);
        }
      }).catch(function(){
        if (submitBtn) submitBtn.disabled = false;
        mailtoFallback(name, phone, subject, message);
      });
    });
  }

  function initYear(){
    var el = document.querySelector('#year');
    if (el) el.textContent = new Date().getFullYear();
  }

})();
