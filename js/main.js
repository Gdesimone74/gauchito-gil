/**
 * main.js — Gauchito Gil
 * Animaciones e interacciones del sitio.
 * Usa GSAP + ScrollTrigger (cargados globalmente).
 */

// ══════════════════════════════════════════════
// Cursor personalizado (círculo rojo con lerp)
// ══════════════════════════════════════════════
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  Object.assign(cursor.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '14px',
    height:        '14px',
    borderRadius:  '50%',
    background:    '#CC0000',
    pointerEvents: 'none',
    zIndex:        '99999',
    transform:     'translate(-50%, -50%)',
    transition:    'transform 0.15s, opacity 0.2s',
    mixBlendMode:  'difference',
  });
  document.body.appendChild(cursor);

  let mx = -100, my = -100, cx = -100, cy = -100;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(2.5)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
  });

  const LERP = 0.12;
  (function tick() {
    cx += (mx - cx) * LERP;
    cy += (my - cy) * LERP;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();
}

// ══════════════════════════════════════════════
// Animación de entrada del hero
// ══════════════════════════════════════════════
function initHero() {
  const titulo = document.getElementById('heroTitulo');
  if (!titulo || !window.gsap) return;

  // Dividir en PALABRAS (no letras) para que nunca corte a mitad de una palabra
  const palabrasTexto = titulo.textContent.trim().split(/\s+/);
  titulo.innerHTML = palabrasTexto
    .map(p => `<span class="palabra" style="display:inline-block; white-space:nowrap">${p}</span>`)
    .join(' ');

  const palabras  = titulo.querySelectorAll('.palabra');
  const subtitulo = document.querySelector('.hero-subtitulo');
  const desc      = document.querySelector('.hero-descripcion');
  const boton     = document.querySelector('.btn-hero');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Palabras aparecen desde abajo con stagger
  tl.from(palabras, { y: 80, opacity: 0, duration: 0.8, stagger: 0.18 });
  if (subtitulo) tl.from(subtitulo, { opacity: 0, y: 20, duration: 0.8 }, '-=0.3');
  if (desc)      tl.from(desc,      { opacity: 0, y: 15, duration: 0.7 }, '-=0.5');
  if (boton)     tl.from(boton,     { opacity: 0, scale: 0.6, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.4');
}

// ══════════════════════════════════════════════
// Navbar inteligente
// ══════════════════════════════════════════════
function initNavbar() {
  const nav       = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!nav) return;

  // Opacidad al hacer scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav-opaca', window.scrollY > 80);
  });

  // Hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Link activo por IntersectionObserver
  const secciones = document.querySelectorAll('section[id]');
  const links     = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.35 });
  secciones.forEach(s => obs.observe(s));
}

// ══════════════════════════════════════════════
// Smooth scroll
// ══════════════════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const destino = document.querySelector(link.getAttribute('href'));
      if (!destino) return;
      e.preventDefault();
      destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ══════════════════════════════════════════════
// Animaciones ScrollTrigger por sección
// ══════════════════════════════════════════════
function initScrollAnim() {
  if (!window.ScrollTrigger || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Historia — título desde la izquierda
  const hTitulo = document.querySelector('#historia .section-titulo');
  if (hTitulo) {
    gsap.from(hTitulo, {
      x: -80, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: hTitulo, start: 'top 85%' },
    });
  }

  // Historia — columnas con stagger
  const cols = document.querySelectorAll('.historia-col');
  if (cols.length) {
    gsap.from(cols, {
      y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: cols[0], start: 'top 80%' },
    });
  }

  // Timeline — puntos con pop
  const puntos = document.querySelectorAll('.timeline-punto');
  if (puntos.length) {
    gsap.from(puntos, {
      scale: 0, opacity: 0, duration: 0.5, stagger: 0.2, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.timeline', start: 'top 80%' },
    });
  }

  // Galería — cards desde abajo
  const cards = document.querySelectorAll('.galeria-card');
  if (cards.length) {
    gsap.from(cards, {
      y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '#galeria', start: 'top 75%' },
    });
  }

  // Testimonios — slide lateral
  const tCards = document.querySelectorAll('.testimonio-card');
  if (tCards.length) {
    gsap.from(tCards, {
      x: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: '#testimonios', start: 'top 80%' },
    });
  }

  // Altar header
  const altarH = document.querySelector('#altar .altar-header');
  if (altarH) {
    gsap.from(altarH, {
      y: 40, opacity: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: altarH, start: 'top 85%' },
    });
  }
}

// ══════════════════════════════════════════════
// Parallax en imagen de historia
// ══════════════════════════════════════════════
function initParallax() {
  const img = document.querySelector('.parallax-image');
  if (!img || !window.ScrollTrigger) return;
  gsap.to(img, {
    backgroundPositionY: '30%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#historia',
      start: 'top bottom',
      end:   'bottom top',
      scrub: true,
    },
  });
}

// ══════════════════════════════════════════════
// Contadores animados
// ══════════════════════════════════════════════
function initContadores() {
  const items = document.querySelectorAll('.stat-numero[data-target]');
  if (!items.length || !window.ScrollTrigger) return;

  items.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start:   'top 85%',
      once:    true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: 'power1.out',
          onUpdate() {
            el.textContent = Math.floor(obj.val).toLocaleString('es-AR');
          },
        });
      },
    });
  });
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initHero();
  initNavbar();
  initSmoothScroll();
  initScrollAnim();
  initParallax();
  initContadores();
});
