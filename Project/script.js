// Helpers
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

document.addEventListener('DOMContentLoaded', () => {
  // Header interactions
  $('#year').textContent = new Date().getFullYear();
  $('#printBtn').addEventListener('click', () => window.print());
  $('#hireMeBtn').addEventListener('click', () => {
    alert('Thanks! Please use the contact form or email lamausa17@gmail.com.');
    $('#contact').scrollIntoView({ behavior: 'smooth' });
  });

  // Back to top + progress
  const back = $('#backToTop');
  window.addEventListener('scroll', () => {
    back.style.display = window.scrollY > 600 ? 'inline-block' : 'none';
    const doc = document.documentElement;
    const scrolled = (doc.scrollTop) / (doc.scrollHeight - doc.clientHeight) * 100;
    $('#scrollProgress').value = scrolled;
  });
  back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile nav
  const menuBtn = $('#menuToggle'), nav = $('#navLinks');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', open);
  });

  // Theme toggle
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') root.classList.add('dark');
  themeBtn.setAttribute('aria-pressed', root.classList.contains('dark'));
  themeBtn.addEventListener('click', () => {
    root.classList.toggle('dark');
    const dark = root.classList.contains('dark');
    themeBtn.setAttribute('aria-pressed', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  // Projects
  const projects = [
    { name: 'Personal Portfolio', year: 2025, tech: ['HTML','CSS','JavaScript'], img: 'projects/personal-portfolio.svg', link: '#', details: 'Responsive single-page site with filtering, theme toggle, and accessible components.' },
    { name: 'CRUD App (Java + JS)', year: 2024, tech: ['Java','JavaScript','SQL'], img: 'projects/crud-app-java-js.svg', link: '#', details: 'Simple CRUD app concept using Java backend and vanilla JS front-end.' },
    { name: 'Robotics Lab (Python)', year: 2023, tech: ['Python','SQL'], img: 'projects/robotics-lab-python.svg', link: '#', details: 'Data processing snippets and basic robotics simulations.' },
  ];

  const grid = $('#projectGrid');
  const search = $('#search');
  const techFilter = $('#techFilter');
  const sortBy = $('#sortBy');
  const dlg = $('#projectDialog');
  const dlgTitle = $('#dlgTitle');
  const dlgImg = $('#dlgImg');
  const dlgBody = $('#dlgBody');
  const dlgLink = $('#dlgLink');

  function card(p) {
    const li = document.createElement('li');
    li.className = 'pcard';
    li.innerHTML = `
      <img src="${p.img}" alt="${p.name} preview">
      <div class="body">
        <h3>${p.name}</h3>
        <div class="meta">Year: ${p.year}</div>
        <div class="tags">${p.tech.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="actions"><button class="btn" data-open="${p.name}">Details</button></div>
      </div>`;
    return li;
  }

  function render(list) {
    grid.innerHTML = '';
    list.forEach(p => grid.appendChild(card(p)));
    $$('[data-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-open');
        const proj = projects.find(x => x.name === name);
        dlgTitle.textContent = proj.name;
        dlgImg.src = proj.img;
        dlgImg.alt = proj.name + ' screenshot';
        dlgBody.textContent = proj.details;
        dlgLink.href = proj.link;
        dlg.showModal();
      });
    });
  }

  function applyFilters() {
    const q = search.value.toLowerCase();
    const tech = techFilter.value;
    let list = projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tech.join(' ').toLowerCase().includes(q)
    );
    if (tech) list = list.filter(p => p.tech.includes(tech));
    const s = sortBy.value;
    list.sort((a,b) => {
      if (s === 'year-desc') return b.year - a.year;
      if (s === 'year-asc') return a.year - b.year;
      if (s === 'name-asc') return a.name.localeCompare(b.name);
      if (s === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
    render(list);
  }

  [search, techFilter, sortBy].forEach(el => el.addEventListener('input', applyFilters));
  render(projects);

  // Contact form validation + autosave
  const form = $('#contactForm');
  const nameEl = $('#name'), emailEl = $('#email'), dobEl = $('#dob'), msgEl = $('#message');
  const err = { name: $('#err-name'), email: $('#err-email'), dob: $('#err-dob'), message: $('#err-message') };

  // restore draft
  try {
    const draft = JSON.parse(localStorage.getItem('contact_draft') || '{}');
    if (draft.name) nameEl.value = draft.name;
    if (draft.email) emailEl.value = draft.email;
    if (draft.dob) dobEl.value = draft.dob;
    if (draft.message) msgEl.value = draft.message;
    $('#charCount').textContent = `(${msgEl.value.length}/500)`;
  } catch {}

  ['input','change'].forEach(ev => {
    form.addEventListener(ev, () => {
      $('#charCount').textContent = `(${msgEl.value.length}/500)`;
      localStorage.setItem('contact_draft', JSON.stringify({
        name: nameEl.value, email: emailEl.value, dob: dobEl.value, message: msgEl.value
      }));
    });
  });

  function validate() {
    let ok = true;
    err.name.textContent = err.email.textContent = err.dob.textContent = err.message.textContent = '';
    if (!nameEl.value.trim()) { err.name.textContent = 'Please enter your name.'; ok = false; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value);
    if (!emailOk) { err.email.textContent = 'Enter a valid email like name@example.com'; ok = false; }
    if (!dobEl.value) { err.dob.textContent = 'Pick a date.'; ok = false; }
    if (msgEl.value.trim().length < 10) { err.message.textContent = 'Message must be at least 10 characters.'; ok = false; }
    return ok;
  }

  form.addEventListener('submit', (e) => {
    if (!validate()) { e.preventDefault(); return; }
    alert('Thanks! Your message has been (pretend) sent.');
    localStorage.removeItem('contact_draft');
    form.reset();
    $('#charCount').textContent = '(0/500)';
  });
});
