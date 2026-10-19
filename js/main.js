/* Hawan — skrip ringan. Tanpa framework, tanpa library tambahan. */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* 1. Garis header muncul setelah halaman di-scroll */
  const header = document.querySelector('.site-header');
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* 2. Tautan navigasi aktif sesuai bagian yang terlihat */
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const linkById = new Map(
    navLinks.map((a) => [a.getAttribute('href').slice(1), a])
  );

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-active'));
        const active = linkById.get(entry.target.id);
        if (active) active.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  linkById.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) navObserver.observe(section);
  });

  /* 2b. Animasi masuk untuk elemen utama saat discroll */
  const animatedParts = document.querySelectorAll(
    '.brand, .site-header nav, .hero-copy > *, #heroFigure, .section-title, ' +
    '.about-stamp, .about-intro > *, .about-facts > div, .about-disciplines li, ' +
    '.section-head > *, .project, .project-body > *, .tags li, .project-links a, ' +
    '.contact-grid > *, .contact-actions > *, .socials li, .site-footer p, .site-footer a'
  );

  animatedParts.forEach((part, index) => {
    part.classList.add('scroll-reveal');
    part.style.setProperty('--reveal-delay', `${(index % 5) * 75}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    animatedParts.forEach((part) => part.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    animatedParts.forEach((part) => revealObserver.observe(part));
  }

  /* 3. Kemiringan halus pada foto hero */
  const figure = document.getElementById('heroFigure');

  if (figure && finePointer && !reduceMotion) {
    figure.classList.add('is-interactive');

    const MAX_DEG = 4;
    const EASE = 0.08;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;

    const render = () => {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;

      figure.style.setProperty('--ry', (currentX * MAX_DEG).toFixed(2) + 'deg');
      figure.style.setProperty('--rx', (-currentY * MAX_DEG).toFixed(2) + 'deg');

      const settled =
        Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
      frame = settled ? null : requestAnimationFrame(render);
    };

    window.addEventListener(
      'pointermove',
      (e) => {
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = (e.clientY / window.innerHeight) * 2 - 1;
        if (!frame) frame = requestAnimationFrame(render);
      },
      { passive: true }
    );
  }

  /* 4. Salin email dengan satu klik */
  const copyBtn = document.getElementById('copyEmail');
  const copyStatus = document.getElementById('copyStatus');
  const emailText = document.querySelector('.email');
  let resetTimer = null;

  const showStatus = (message) => {
    copyStatus.textContent = message;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyStatus.textContent = '';
      copyBtn.textContent = 'Salin';
    }, 2400);
  };

  if (copyBtn && copyStatus && emailText) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;

      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = 'Tersalin';
        showStatus('Alamat email sudah disalin.');
      } catch (err) {
        // Fallback: blok teks email agar pengguna bisa menyalin manual
        const range = document.createRange();
        range.selectNodeContents(emailText);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        showStatus('Salin manual dengan Ctrl+C atau Cmd+C.');
      }
    });
  }
})();
