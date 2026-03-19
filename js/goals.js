/* =============================================
   LuismiLife — goals.js
   Módulo Metas — CRUD completo
   Metas por área con progreso, estado y fecha límite
   ============================================= */

const GOAL_AREAS = {
  spiritual: { label: 'Espiritual', icon: '✝️', color: 'var(--color-spiritual)' },
  economic:  { label: 'Económica',  icon: '💰', color: 'var(--color-economic)'  },
  academic:  { label: 'Académica',  icon: '📚', color: 'var(--color-academic)'  },
  fitness:   { label: 'Fitness',    icon: '💪', color: 'var(--color-fitness)'   },
  personal:  { label: 'Personal',   icon: '🌟', color: 'var(--color-goals)'     },
};

const GOAL_STATUS = {
  active:    { label: 'En progreso', color: 'var(--color-academic)'  },
  completed: { label: 'Completada',  color: 'var(--neon-green)'      },
  paused:    { label: 'Pausada',     color: 'var(--text-muted)'      },
};

function renderGoals() {
  const el   = document.getElementById('page-goals');
  const all  = DB.goals.getAll();

  const completed = all.filter(g => g.status === 'completed').length;
  const active    = all.filter(g => g.status !== 'completed').length;

  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-goals">🎯 Mis Metas</h2>
      <button class="btn btn-primary btn-sm" onclick="openGoalForm()">
        <i class="fa fa-plus"></i> Nueva meta
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.2rem">
      <div class="stat-card mod-goals-bg">
        <div class="stat-icon">🎯</div>
        <div class="stat-value mod-goals">${all.length}</div>
        <div class="stat-label">Total metas</div>
      </div>
      <div class="stat-card" style="background:#60a5fa22;border-color:#60a5fa44">
        <div class="stat-icon">🔥</div>
        <div class="stat-value mod-academic">${active}</div>
        <div class="stat-label">En progreso</div>
      </div>
      <div class="stat-card" style="background:#10b98122;border-color:#10b98144">
        <div class="stat-icon">✅</div>
        <div class="stat-value" style="color:var(--neon-green)">${completed}</div>
        <div class="stat-label">Completadas</div>
      </div>
    </div>

    <!-- Filtros por área -->
    <div class="chip-wrap" id="goalChips">
      <span class="chip active" onclick="filterGoals('all', this)">Todas</span>
      ${Object.entries(GOAL_AREAS).map(([k, v]) => `
        <span class="chip" onclick="filterGoals('${k}', this)">${v.icon} ${v.label}</span>
      `).join('')}
      <span class="chip" onclick="filterGoals('completed', this)">✅ Completadas</span>
    </div>

    <!-- Lista de metas -->
    <div id="goalsList">${renderGoalCards(all)}</div>
  `;
}

function renderGoalCards(goals) {
  if (!goals.length) return `
    <div class="empty-state">
      <i class="fa fa-bullseye"></i>
      <p>Sin metas aquí.<br>¡Define tu próximo objetivo!</p>
    </div>`;

  return goals.map(g => {
    const area   = GOAL_AREAS[g.area]   || GOAL_AREAS.personal;
    const status = GOAL_STATUS[g.status] || GOAL_STATUS.active;
    const pct    = Math.min(100, g.progress || 0);
    const daysLeft = g.deadline ? getDaysLeft(g.deadline) : null;

    return `
      <div class="card" style="margin-bottom:0.8rem;border-left:4px solid ${area.color};
        opacity:${g.status === 'paused' ? 0.65 : 1}">

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:1.1rem">${area.icon}</span>
              <span style="font-weight:700;color:var(--text-primary);font-size:0.95rem">${g.title}</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
              <span class="badge" style="background:${area.color}22;color:${area.color}">${area.label}</span>
              <span class="badge" style="background:${status.color}22;color:${status.color}">${status.label}</span>
              ${daysLeft !== null ? `
                <span class="badge" style="background:${daysLeft < 7 ? '#f8717122' : '#ffffff11'};
                  color:${daysLeft < 7 ? '#f87171' : 'var(--text-muted)'}">
                  ${daysLeft < 0 ? '⚠️ Vencida' : daysLeft === 0 ? '🔴 Hoy vence' : `📅 ${daysLeft}d`}
                </span>` : ''}
            </div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px">
            <button class="btn-icon" onclick="openGoalForm('${g.id}')"><i class="fa fa-pen"></i></button>
            <button class="btn-icon btn-danger" onclick="deleteGoal('${g.id}')"><i class="fa fa-trash"></i></button>
          </div>
        </div>

        <!-- Descripción -->
        ${g.description ? `
          <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:10px;line-height:1.5">
            ${g.description}
          </p>` : ''}

        <!-- Progreso -->
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:6px">
          <span class="text-muted">Progreso</span>
          <span style="color:${area.color};font-weight:700">${pct}%</span>
        </div>
        <div class="progress-wrap" style="margin-bottom:10px">
          <div class="progress-bar" style="width:${pct}%;background:${area.color}"></div>
        </div>

        <!-- Actualizar progreso rápido -->
        <div style="display:flex;gap:6px;align-items:center">
          <input type="range" min="0" max="100" value="${pct}"
            style="flex:1;accent-color:${area.color}"
            oninput="quickUpdateProgress('${g.id}', this.value, '${area.color}')" />
          <button class="btn btn-ghost btn-sm"
            onclick="markGoalComplete('${g.id}', '${g.status}')">
            ${g.status === 'completed' ? '↩️ Reabrir' : '✅ Completar'}
          </button>
        </div>

      </div>`;
  }).join('');
}

/* ---- FILTROS ---- */
function filterGoals(filter, el) {
  document.querySelectorAll('#goalChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.goals.getAll();
  let filtered;
  if (filter === 'all')       filtered = all;
  else if (filter === 'completed') filtered = all.filter(g => g.status === 'completed');
  else                        filtered = all.filter(g => g.area === filter);
  document.getElementById('goalsList').innerHTML = renderGoalCards(filtered);
}

/* ---- PROGRESO RÁPIDO ---- */
function quickUpdateProgress(id, value, color) {
  DB.goals.update(id, { progress: parseInt(value) });
}

/* ---- MARCAR COMPLETADA ---- */
function markGoalComplete(id, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
  const newPct    = newStatus === 'completed' ? 100 : undefined;
  DB.goals.update(id, { status: newStatus, ...(newPct ? { progress: newPct } : {}) });
  showToast(newStatus === 'completed' ? '🎉 ¡Meta completada!' : '↩️ Meta reabierta');
  renderGoals();
}

/* ---- CRUD ---- */
function openGoalForm(id = null) {
  const item = id ? DB.getById('goals', id) : null;

  openModal(id ? '✏️ Editar meta' : '🎯 Nueva meta', `
    <div class="input-group">
      <label>Título de la meta</label>
      <input class="input" id="gTitle" type="text"
        placeholder="Ej: Leer la Biblia completa"
        value="${item?.title || ''}" />
    </div>
    <div class="input-group">
      <label>Área de vida</label>
      <select class="input" id="gArea">
        ${Object.entries(GOAL_AREAS).map(([k, v]) => `
          <option value="${k}" ${item?.area === k ? 'selected' : ''}>${v.icon} ${v.label}</option>
        `).join('')}
      </select>
    </div>
    <div class="input-group">
      <label>Descripción (opcional)</label>
      <textarea class="input" id="gDesc"
        placeholder="¿Cómo vas a lograrlo?">${item?.description || ''}</textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
      <div class="input-group">
        <label>Progreso inicial (%)</label>
        <input class="input" id="gProgress" type="number" min="0" max="100"
          placeholder="0" value="${item?.progress || 0}" />
      </div>
      <div class="input-group">
        <label>Fecha límite</label>
        <input class="input" id="gDeadline" type="date"
          value="${item?.deadline || ''}" />
      </div>
    </div>
    <div class="input-group">
      <label>Estado</label>
      <select class="input" id="gStatus">
        ${Object.entries(GOAL_STATUS).map(([k, v]) => `
          <option value="${k}" ${item?.status === k ? 'selected' : ''}>${v.label}</option>
        `).join('')}
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveGoal('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveGoal(id) {
  const title       = document.getElementById('gTitle').value.trim();
  const area        = document.getElementById('gArea').value;
  const description = document.getElementById('gDesc').value.trim();
  const progress    = parseInt(document.getElementById('gProgress').value) || 0;
  const deadline    = document.getElementById('gDeadline').value;
  const status      = document.getElementById('gStatus').value;

  if (!title) { showToast('El título es obligatorio', 'error'); return; }

  const record = { title, area, description, progress, deadline, status };
  if (id) { DB.goals.update(id, record); showToast('✅ Meta actualizada'); }
  else    { DB.goals.insert(record);     showToast('🎯 Meta creada'); }
  closeModal();
  renderGoals();
}

function deleteGoal(id) {
  if (!confirm('¿Eliminar esta meta?')) return;
  DB.goals.delete(id);
  showToast('🗑️ Meta eliminada');
  renderGoals();
}

/* ---- UTILIDAD DÍAS RESTANTES ---- */
function getDaysLeft(dateStr) {
  const today    = new Date(); today.setHours(0,0,0,0);
  const deadline = new Date(dateStr); deadline.setHours(0,0,0,0);
  return Math.round((deadline - today) / (1000 * 60 * 60 * 24));
}