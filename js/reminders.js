/* =============================================
   LuismiLife — reminders.js
   Módulo Recordatorios — CRUD completo
   Recordatorios con días, hora y área
   ============================================= */

const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

const REMINDER_AREAS = {
  spiritual: { label: 'Espiritual', icon: '✝️', color: 'var(--color-spiritual)' },
  economic:  { label: 'Económica',  icon: '💰', color: 'var(--color-economic)'  },
  academic:  { label: 'Académica',  icon: '📚', color: 'var(--color-academic)'  },
  fitness:   { label: 'Fitness',    icon: '💪', color: 'var(--color-fitness)'   },
  personal:  { label: 'Personal',   icon: '🌟', color: 'var(--color-goals)'     },
};

function renderReminders() {
  const el  = document.getElementById('page-reminders');
  const all = DB.reminders.getAll();
  const active   = all.filter(r => r.active).length;
  const inactive = all.filter(r => !r.active).length;

  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-reminders">🔔 Recordatorios</h2>
      <button class="btn btn-primary btn-sm" onclick="openReminderForm()">
        <i class="fa fa-plus"></i> Nuevo
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.2rem">
      <div class="stat-card mod-reminders-bg">
        <div class="stat-icon">🔔</div>
        <div class="stat-value mod-reminders">${all.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card" style="background:#10b98122;border-color:#10b98144">
        <div class="stat-icon">✅</div>
        <div class="stat-value" style="color:var(--neon-green)">${active}</div>
        <div class="stat-label">Activos</div>
      </div>
      <div class="stat-card" style="background:#47556922;border-color:#47556944">
        <div class="stat-icon">⏸️</div>
        <div class="stat-value" style="color:var(--text-muted)">${inactive}</div>
        <div class="stat-label">Pausados</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="chip-wrap" id="remChips">
      <span class="chip active" onclick="filterReminders('all', this)">Todos</span>
      <span class="chip" onclick="filterReminders('active', this)">✅ Activos</span>
      ${Object.entries(REMINDER_AREAS).map(([k, v]) => `
        <span class="chip" onclick="filterReminders('${k}', this)">${v.icon} ${v.label}</span>
      `).join('')}
    </div>

    <!-- Lista -->
    <div id="remindersList">${renderReminderCards(all)}</div>
  `;
}

function renderReminderCards(reminders) {
  if (!reminders.length) return `
    <div class="empty-state">
      <i class="fa fa-bell"></i>
      <p>Sin recordatorios.<br>¡Crea el primero!</p>
    </div>`;

  // Ordenar por hora
  const sorted = [...reminders].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return sorted.map(r => {
    const area = REMINDER_AREAS[r.area] || REMINDER_AREAS.personal;
    return `
      <div class="list-item" style="border-left:4px solid ${r.active ? area.color : 'var(--border)'};
        opacity:${r.active ? 1 : 0.55}">

        <!-- Icono área -->
        <div style="font-size:1.4rem;flex-shrink:0">${area.icon}</div>

        <!-- Info -->
        <div class="list-item-body">
          <div class="list-item-title">${r.title}</div>

          <!-- Hora -->
          <div style="color:${area.color};font-size:1.1rem;font-weight:800;margin:3px 0">
            ⏰ ${r.time || '--:--'}
          </div>

          <!-- Días -->
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
            ${DAYS.map(d => `
              <span style="padding:2px 7px;border-radius:6px;font-size:0.72rem;font-weight:700;
                background:${(r.days||[]).includes(d) ? area.color + '33' : 'var(--bg-hover)'};
                color:${(r.days||[]).includes(d) ? area.color : 'var(--text-muted)'}">
                ${d}
              </span>
            `).join('')}
          </div>

          <!-- Área badge -->
          <div style="margin-top:6px">
            <span class="badge" style="background:${area.color}22;color:${area.color}">
              ${area.label}
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <!-- Toggle activo -->
          <label class="toggle-wrap" onclick="toggleReminder('${r.id}')">
            <div class="toggle ${r.active ? 'on' : ''}"></div>
          </label>
          <div class="list-item-actions">
            <button class="btn-icon" onclick="openReminderForm('${r.id}')">
              <i class="fa fa-pen"></i>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteReminder('${r.id}')">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>

      </div>`;
  }).join('');
}

/* ---- FILTROS ---- */
function filterReminders(filter, el) {
  document.querySelectorAll('#remChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.reminders.getAll();
  let filtered;
  if      (filter === 'all')    filtered = all;
  else if (filter === 'active') filtered = all.filter(r => r.active);
  else                          filtered = all.filter(r => r.area === filter);
  document.getElementById('remindersList').innerHTML = renderReminderCards(filtered);
}

/* ---- TOGGLE ACTIVO ---- */
function toggleReminder(id) {
  const r = DB.getById('reminders', id);
  if (!r) return;
  DB.reminders.update(id, { active: !r.active });
  showToast(r.active ? '⏸️ Recordatorio pausado' : '✅ Recordatorio activado');
  renderReminders();
}

/* ---- CRUD ---- */
function openReminderForm(id = null) {
  const item = id ? DB.getById('reminders', id) : null;
  const selectedDays = item?.days || [];

  openModal(id ? '✏️ Editar recordatorio' : '🔔 Nuevo recordatorio', `
    <div class="input-group">
      <label>Título</label>
      <input class="input" id="rTitle" type="text"
        placeholder="Ej: Tiempo devocional"
        value="${item?.title || ''}" />
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
      <div class="input-group">
        <label>Hora</label>
        <input class="input" id="rTime" type="time"
          value="${item?.time || '07:00'}" />
      </div>
      <div class="input-group">
        <label>Área</label>
        <select class="input" id="rArea">
          ${Object.entries(REMINDER_AREAS).map(([k, v]) => `
            <option value="${k}" ${item?.area === k ? 'selected' : ''}>${v.icon} ${v.label}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- Días de la semana -->
    <div class="input-group">
      <label>Días de la semana</label>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px" id="dayPicker">
        ${DAYS.map(d => `
          <button type="button"
            onclick="toggleDay('${d}', this)"
            style="padding:6px 10px;border-radius:8px;font-size:0.8rem;font-weight:700;
              cursor:pointer;transition:all 0.2s;border:1px solid var(--border);
              background:${selectedDays.includes(d) ? 'var(--neon-purple)' : 'var(--bg-hover)'};
              color:${selectedDays.includes(d) ? '#fff' : 'var(--text-muted)'}">
            ${d}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Accesos rápidos días -->
    <div style="display:flex;gap:6px;margin-bottom:1rem">
      <button class="btn btn-ghost btn-sm" onclick="selectDays('weekdays')">L-V</button>
      <button class="btn btn-ghost btn-sm" onclick="selectDays('weekend')">Fin de semana</button>
      <button class="btn btn-ghost btn-sm" onclick="selectDays('all')">Todos</button>
      <button class="btn btn-ghost btn-sm" onclick="selectDays('none')">Ninguno</button>
    </div>

    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveReminder('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function toggleDay(day, btn) {
  const isActive = btn.style.background.includes('var(--neon-purple)') ||
                   btn.style.background === 'var(--neon-purple)';
  btn.style.background = isActive ? 'var(--bg-hover)' : 'var(--neon-purple)';
  btn.style.color      = isActive ? 'var(--text-muted)' : '#fff';
}

function selectDays(preset) {
  const btns = document.querySelectorAll('#dayPicker button');
  const weekdays = ['Lun','Mar','Mié','Jue','Vie'];
  const weekend  = ['Sáb','Dom'];
  btns.forEach(btn => {
    const d = btn.textContent.trim();
    let active = false;
    if (preset === 'all')      active = true;
    if (preset === 'none')     active = false;
    if (preset === 'weekdays') active = weekdays.includes(d);
    if (preset === 'weekend')  active = weekend.includes(d);
    btn.style.background = active ? 'var(--neon-purple)' : 'var(--bg-hover)';
    btn.style.color      = active ? '#fff' : 'var(--text-muted)';
  });
}

function getSelectedDays() {
  const btns = document.querySelectorAll('#dayPicker button');
  return Array.from(btns)
    .filter(b => b.style.background === 'var(--neon-purple)' ||
                 b.style.background.includes('var(--neon-purple)'))
    .map(b => b.textContent.trim());
}

function saveReminder(id) {
  const title = document.getElementById('rTitle').value.trim();
  const time  = document.getElementById('rTime').value;
  const area  = document.getElementById('rArea').value;
  const days  = getSelectedDays();

  if (!title) { showToast('El título es obligatorio', 'error'); return; }
  if (!days.length) { showToast('Selecciona al menos un día', 'error'); return; }

  const record = { title, time, area, days, active: true };
  if (id) { DB.reminders.update(id, record); showToast('✅ Recordatorio actualizado'); }
  else    { DB.reminders.insert(record);     showToast('🔔 Recordatorio creado'); }
  closeModal();
  renderReminders();
}

function deleteReminder(id) {
  if (!confirm('¿Eliminar este recordatorio?')) return;
  DB.reminders.delete(id);
  showToast('🗑️ Recordatorio eliminado');
  renderReminders();
}