/* =============================================
   LuismiLife — app.js (Parte 1)
   Sidebar, Navegación, Fecha, Versículo
   ============================================= */

/* ---- ELEMENTOS DEL DOM ---- */
const sidebar      = document.getElementById('sidebar');
const overlay      = document.getElementById('overlay');
const menuBtn      = document.getElementById('menuBtn');
const sidebarClose = document.getElementById('sidebarClose');
const pageTitle    = document.getElementById('pageTitle');
const topbarDate   = document.getElementById('topbarDate');
const navItems     = document.querySelectorAll('.nav-item[data-page]');

/* ---- SIDEBAR: ABRIR / CERRAR ---- */
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

menuBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// Cerrar sidebar con tecla ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSidebar();
    closeModal();
  }
});

/* ---- NAVEGACIÓN ENTRE PÁGINAS ---- */
const pageTitles = {
  dashboard:  '🏠 Dashboard',
  spiritual:  '✝️ Espiritual',
  economic:   '💰 Económica',
  academic:   '📚 Académica',
  fitness:    '💪 Fitness',
  notes:      '📝 Notas',
  goals:      '🎯 Metas',
  reminders:  '🔔 Recordatorios',
  settings:   '⚙️ Ajustes',
};

let currentPage = 'dashboard';

function navigateTo(page) {
  // Ocultar página actual
  const prev = document.getElementById(`page-${currentPage}`);
  if (prev) prev.classList.remove('active');

  // Mostrar nueva página
  const next = document.getElementById(`page-${page}`);
  if (next) next.classList.add('active');

  // Actualizar título
  pageTitle.textContent = pageTitles[page] || page;

  // Actualizar nav activo
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Guardar página actual
  currentPage = page;

  // Cerrar sidebar en móvil
  if (window.innerWidth < 1024) closeSidebar();

  // Guardar última página visitada
  localStorage.setItem('lastPage', page);

  // Cargar contenido del módulo
  loadPage(page);
}

// Asignar click a cada item del nav
navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// Cargar el módulo según la página
function loadPage(page) {
  switch (page) {
    case 'dashboard':  renderDashboard();  break;
    case 'spiritual':  renderSpiritual();  break;
    case 'economic':   renderEconomic();   break;
    case 'academic':   renderAcademic();   break;
    case 'fitness':    renderFitness();    break;
    case 'notes':      renderNotes();      break;
    case 'goals':      renderGoals();      break;
    case 'reminders':  renderReminders();  break;
    case 'settings':   renderSettings();   break;
  }
}

/* ---- FECHA EN TOPBAR ---- */
function setDate() {
  const now = new Date();
  const opts = { weekday: 'short', day: 'numeric', month: 'short' };
  topbarDate.textContent = now.toLocaleDateString('es-ES', opts);
}

/* ---- VERSÍCULOS DEL DÍA ---- */
const verses = [
  { text: '"Todo lo puedo en Cristo que me fortalece."', ref: '— Filipenses 4:13' },
  { text: '"Porque yo sé los planes que tengo para vosotros..."', ref: '— Jeremías 29:11' },
  { text: '"El Señor es mi pastor, nada me faltará."', ref: '— Salmos 23:1' },
  { text: '"Confía en el Señor con todo tu corazón."', ref: '— Proverbios 3:5' },
  { text: '"Buscad primero el reino de Dios..."', ref: '— Mateo 6:33' },
  { text: '"El Señor peleará por vosotros."', ref: '— Éxodo 14:14' },
  { text: '"Esfuérzate y sé valiente."', ref: '— Josué 1:9' },
  { text: '"Con Dios haremos proezas."', ref: '— Salmos 60:12' },
  { text: '"El amor de Dios ha sido derramado en nuestros corazones."', ref: '— Romanos 5:5' },
  { text: '"El que comenzó en vosotros la buena obra, la perfeccionará."', ref: '— Filipenses 1:6' },
];

function setDailyVerse() {
  const idx = new Date().getDate() % verses.length;
  const v = verses[idx];
  const el = document.getElementById('verseText');
  const ref = document.getElementById('verseRef');
  if (el)  el.textContent  = v.text;
  if (ref) ref.textContent = v.ref;
}

/* ---- SETTINGS básico ---- */
function renderSettings() {
  const el = document.getElementById('page-settings');
  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">⚙️ Ajustes</h2>
    </div>
    <div class="card mb-2">
      <h3 class="mb-1" style="color:var(--color-spiritual)">✝️ LuismiLife</h3>
      <p class="text-muted" style="font-size:0.85rem">
        Tu gestor de vida personal — Espiritual, Económica, Académica y Fitness.
      </p>
    </div>
    <div class="card mb-2">
      <h4 class="mb-1">🗄️ Supabase</h4>
      <div class="input-group">
        <label>URL del proyecto</label>
        <input class="input" id="sbUrl" type="text" placeholder="https://xxxx.supabase.co"
          value="${localStorage.getItem('sb_url') || ''}" />
      </div>
      <div class="input-group">
        <label>Anon Key</label>
        <input class="input" id="sbKey" type="password" placeholder="eyJ..."
          value="${localStorage.getItem('sb_key') || ''}" />
      </div>
      <button class="btn btn-primary" onclick="saveSupabaseConfig()">
        <i class="fa fa-save"></i> Guardar configuración
      </button>
    </div>
    <div class="card">
      <h4 class="mb-1">ℹ️ Versión</h4>
      <p class="text-muted" style="font-size:0.85rem">LuismiLife v1.0 — Hecho con 💜 y fe.</p>
    </div>
  `;
}

function saveSupabaseConfig() {
  const url = document.getElementById('sbUrl').value.trim();
  const key = document.getElementById('sbKey').value.trim();
  if (!url || !key) { showToast('Completa ambos campos', 'error'); return; }
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_key', key);
  showToast('✅ Configuración guardada. Recarga la app.');
  setTimeout(() => location.reload(), 1500);
}
/* =============================================
   LuismiLife — app.js (Parte 2)
   Modal global, Toast, Dashboard, Init
   ============================================= */

/* ---- MODAL GLOBAL ---- */
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle   = document.getElementById('modalTitle');
const modalBody    = document.getElementById('modalBody');
const modalClose   = document.getElementById('modalClose');

function openModal(title, bodyHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  modalBody.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

/* ---- TOAST ---- */
const toastEl  = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer = null;

function showToast(msg, type = 'success') {
  toastMsg.textContent = msg;
  toastEl.style.borderColor = type === 'error' ? '#f87171' : 'var(--neon-green)';
  toastEl.style.color       = type === 'error' ? '#f87171' : 'var(--neon-green)';
  toastEl.style.boxShadow   = type === 'error'
    ? '0 0 20px #f8717144' : '0 0 20px var(--neon-green-glow)';
  toastEl.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

/* ---- DASHBOARD ---- */
async function renderDashboard() {
  const el = document.getElementById('page-dashboard');
  el.innerHTML = `<p class="loading-text"><i class="fa fa-spinner fa-spin"></i> Cargando...</p>`;

  // Traer conteos desde Supabase (o mostrar 0 si no hay conexión)
  let spiritual = 0, transactions = 0, tasks = 0, workouts = 0;

  try {
    if (window._sb) {
      const [s, t, a, f] = await Promise.all([
        window._sb.from('spiritual_entries').select('id', { count: 'exact', head: true }),
        window._sb.from('transactions').select('id', { count: 'exact', head: true }),
        window._sb.from('academic_tasks').select('id', { count: 'exact', head: true }),
        window._sb.from('workouts').select('id', { count: 'exact', head: true }),
      ]);
      spiritual    = s.count || 0;
      transactions = t.count || 0;
      tasks        = a.count || 0;
      workouts     = f.count || 0;
    }
  } catch (_) {}

  const now  = new Date();
  const hora = now.getHours();
  const greeting = hora < 12 ? '¡Buenos días' : hora < 18 ? '¡Buenas tardes' : '¡Buenas noches';

  el.innerHTML = `
    <div class="mb-2">
      <h2 style="font-size:1.5rem;font-weight:800">${greeting}, Luismi! 🙏</h2>
      <p class="text-muted" style="font-size:0.85rem;margin-top:4px">
        ${now.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
      </p>
    </div>

    <!-- Versículo destacado -->
    <div class="card mb-2" style="border-left:3px solid var(--neon-purple);background:var(--bg-hover)">
      <p style="font-style:italic;color:var(--text-secondary);font-size:0.9rem" id="dashVerse"></p>
      <span style="color:var(--neon-purple);font-size:0.8rem;font-weight:700" id="dashRef"></span>
    </div>

    <!-- Stats -->
    <div class="stats-grid mb-2">
      <div class="stat-card mod-spiritual-bg">
        <div class="stat-icon">✝️</div>
        <div class="stat-value mod-spiritual">${spiritual}</div>
        <div class="stat-label">Entradas espirituales</div>
      </div>
      <div class="stat-card mod-economic-bg">
        <div class="stat-icon">💰</div>
        <div class="stat-value mod-economic">${transactions}</div>
        <div class="stat-label">Transacciones</div>
      </div>
      <div class="stat-card mod-academic-bg">
        <div class="stat-icon">📚</div>
        <div class="stat-value mod-academic">${tasks}</div>
        <div class="stat-label">Tareas académicas</div>
      </div>
      <div class="stat-card mod-fitness-bg">
        <div class="stat-icon">💪</div>
        <div class="stat-value mod-fitness">${workouts}</div>
        <div class="stat-label">Entrenamientos</div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <h3 class="mb-1" style="color:var(--text-secondary);font-size:0.85rem;text-transform:uppercase;letter-spacing:1px">
      Acceso rápido
    </h3>
    <div class="card-grid">
      ${quickLinks()}
    </div>
  `;

  // Poner versículo en dashboard
  const idx = now.getDate() % verses.length;
  const v = verses[idx];
  document.getElementById('dashVerse').textContent = v.text;
  document.getElementById('dashRef').textContent   = v.ref;
}

function quickLinks() {
  const links = [
    { page: 'spiritual', icon: '✝️', label: 'Espiritual',    color: 'var(--color-spiritual)', desc: 'Versículos, oraciones, devocionales' },
    { page: 'economic',  icon: '💰', label: 'Económica',     color: 'var(--color-economic)',  desc: 'Ingresos, gastos, ahorro' },
    { page: 'academic',  icon: '📚', label: 'Académica',     color: 'var(--color-academic)',  desc: 'Cursos, tareas, apuntes' },
    { page: 'fitness',   icon: '💪', label: 'Fitness',       color: 'var(--color-fitness)',   desc: 'Entrenos, hábitos, nutrición' },
    { page: 'notes',     icon: '📝', label: 'Notas',         color: 'var(--color-notes)',     desc: 'Apuntes y reflexiones' },
    { page: 'goals',     icon: '🎯', label: 'Metas',         color: 'var(--color-goals)',     desc: 'Tus objetivos de vida' },
    { page: 'reminders', icon: '🔔', label: 'Recordatorios', color: 'var(--color-reminders)', desc: 'Alarmas y hábitos diarios' },
    { page: 'settings',  icon: '⚙️', label: 'Ajustes',       color: 'var(--text-muted)',      desc: 'Configurar Supabase' },
  ];

  return links.map(l => `
    <div class="card" style="cursor:pointer;border-top:3px solid ${l.color}"
         onclick="navigateTo('${l.page}')">
      <div style="font-size:1.6rem;margin-bottom:6px">${l.icon}</div>
      <div style="font-weight:700;color:${l.color};margin-bottom:4px">${l.label}</div>
      <div style="font-size:0.78rem;color:var(--text-muted)">${l.desc}</div>
    </div>
  `).join('');
}

/* ---- INIT ---- */
function init() {
  setDate();
  setDailyVerse();

  // Restaurar última página visitada
  const last = localStorage.getItem('lastPage') || 'dashboard';
  navigateTo(last);
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);