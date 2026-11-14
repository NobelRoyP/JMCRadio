/* JMC Radio: shared helpers, sidebar, scroll effects, hidden staff access */
(() => {
  const J = window.JMC = {};
  J.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  J.fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  J.day = d => { const t = new Date(d); return isNaN(t) ? String(d) : t.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
  J.fill = el => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
  J.cov = t => { let h = 0; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) % 360; return '<div class="cov" style="--h:' + h + '"><span>' + J.esc(String(t).trim().charAt(0).toUpperCase()) + '</span></div>'; };
  J.json = async (url, opt) => { const r = await fetch(url, opt); if (r.status === 401 || r.status === 403) { location.href = '/login'; throw new Error('auth'); } return r; };

  // Scroll reveal
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' }) : null;
  J.reveal = (root = document, now) => root.querySelectorAll('.rv:not(.in)').forEach((el, i) => {
    el.style.setProperty('--i', Math.min(i % 8, 7));
    if (io && !now) io.observe(el); else el.classList.add('in');
  });

  // Scroll-linked header and hero parallax
  let tick = false;
  addEventListener('scroll', () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--sy', scrollY);
      document.body.classList.toggle('scrolled', scrollY > 40);
      tick = false;
    });
  }, { passive: true });

  // Sidebar + footer
  const side = document.getElementById('side'), main = document.querySelector('.main');
  if (side) {
    const page = document.body.dataset.page;
    const ic = {
      home: '<path d="M12 3 3 10.2V21h6.5v-6.5h5V21H21V10.2z"/>',
      listen: '<path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2v-8H5v-1a7 7 0 0 1 14 0v1h-2v8h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>',
      admin: '<path d="M5 20h14v-2H5zM12 2l-6 6h4v6h4V8h4z"/>'
    };
    const links = [['home', '/', 'Home'], ['listen', '/player', 'Listen']];
    if (page === 'admin') links.push(['admin', '/admin', 'Upload']);
    side.innerHTML =
      '<div class="panel"><a class="brand" href="/"><svg viewBox="0 0 24 24" fill="none" stroke="#258bff" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="2.2" fill="#1ed760"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/></svg>JMC Radio</a><nav aria-label="Main">' +
      links.map(l => '<a href="' + l[1] + '"' + (l[0] === page ? ' class="on" aria-current="page"' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + ic[l[0]] + '</svg>' + l[2] + '</a>').join('') +
      '</nav></div><div class="panel tag">Voices of our college, free for every student. No sign-in needed.</div>';
    if (main) main.insertAdjacentHTML('beforeend', '<footer class="pgfoot"><span id="secret">JMC Radio</span> &copy; ' + new Date().getFullYear() + '</footer>');
  }

  // Hidden staff access: 5 quick taps on the footer name, or type "admin" anywhere.
  // The link is not in the page source until revealed. Real protection must be server-side.
  let hideT, taps = 0, tapT, buf = '';
  const reveal = () => {
    let a = document.getElementById('staff');
    if (!a) { a = document.createElement('a'); a.id = 'staff'; a.href = '/login'; a.rel = 'nofollow'; a.textContent = 'Staff sign-in'; document.body.append(a); void a.offsetWidth; }
    a.classList.add('show');
    clearTimeout(hideT); hideT = setTimeout(() => a.classList.remove('show'), 8000);
  };
  document.addEventListener('click', e => {
    if (!e.target.closest('#secret')) return;
    taps++; clearTimeout(tapT); tapT = setTimeout(() => { taps = 0; }, 1500);
    if (taps >= 5) { taps = 0; reveal(); }
  });
  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-5);
    if (buf === 'admin') reveal();
  });
})();