/* =============================================
   LuismiLife — spiritual.js
   Módulo Espiritual — CRUD completo
   Tipos: Versículo, Oración, Devocional, Sermón, Reflexión
   ============================================= */

function renderSpiritual() {
  const el = document.getElementById('page-spiritual');
  const cats = DB.getCategories('spiritual');
  const all  = DB.spiritual.getAll();

  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-spiritual">✝️ Vida Espiritual</h2>
      <button class="btn btn-primary btn-sm" onclick="openSpiritualForm()">
        <i class="fa fa-plus"></i> Agregar
      </button>
    </div>

    <!-- Chips de categorías -->
    <div class="chip-wrap" id="spiritualChips">
      <span class="chip active" onclick="filterSpiritual('all', this)">Todos</span>
      ${cats.map(c => `
        <span class="chip" onclick="filterSpiritual('${c}', this)">${c}</span>
      `).join('')}
      <span class="chip" style="border-style:dashed" onclick="openCatManager('spiritual', renderSpiritual)">
        <i class="fa fa-plus"></i> Categoría
      </span>
    </div>

    <!-- Lista -->
    <div id="spiritualList">
      ${renderSpiritualList(all)}
    </div>
  `;
}

function renderSpiritualList(items) {
  if (!items.length) return `
    <div class="empty-state">
      <i class="fa fa-cross"></i>
      <p>Aún no hay entradas.<br>¡Agrega tu primer versículo o reflexión!</p>
    </div>`;

  const icons = {
    'Versículo':  '📖', 'Oración': '🙏', 'Devocional': '☀️',
    'Sermón':     '⛪', 'Reflexión': '💭',
  };

  return items.map(item => `
    <div class="list-item">
      <div class="list-item-icon">${icons[item.type] || '✝️'}</div>
      <div class="list-item-body">
        <div class="list-item-title">${item.title}</div>
        <div style="font-size:0.82rem;color:var(--text-secondary);margin:4px 0;line-height:1.5">
          ${item.content || ''}
        </div>
        <div class="list-item-sub">
          <span class="badge mod-spiritual-bg mod-spiritual">${item.type}</span>
          ${item.reference ? `<span style="margin-left:6px;color:var(--neon-purple);font-size:0.78rem">📖 ${item.reference}</span>` : ''}
          <span style="margin-left:6px">${formatDate(item.created_at)}</span>
        </div>
      </div>
      <div class="list-item-actions">
        <button class="btn-icon" onclick="openSpiritualForm('${item.id}')">
          <i class="fa fa-pen"></i>
        </button>
        <button class="btn-icon btn-danger" onclick="deleteSpiritual('${item.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function filterSpiritual(type, el) {
  document.querySelectorAll('#spiritualChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.spiritual.getAll();
  const filtered = type === 'all' ? all : all.filter(i => i.type === type);
  document.getElementById('spiritualList').innerHTML = renderSpiritualList(filtered);
}

function openSpiritualForm(id = null) {
  const item = id ? DB.spiritual.getById ? DB.getById('spiritual', id) : null : null;
  const cats = DB.getCategories('spiritual');

  openModal(id ? '✏️ Editar entrada' : '✝️ Nueva entrada', `
    <div class="input-group">
      <label>Tipo</label>
      <select class="input" id="sType">
        ${cats.map(c => `<option value="${c}" ${item?.type === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="input-group">
      <label>Título</label>
      <input class="input" id="sTitle" type="text" placeholder="Ej: Promesa del día"
        value="${item?.title || ''}" />
    </div>
    <div class="input-group">
      <label>Referencia bíblica (opcional)</label>
      <input class="input" id="sRef" type="text" placeholder="Ej: Juan 3:16"
        value="${item?.reference || ''}" />
    </div>
    <div class="input-group">
      <label>Contenido / Notas</label>
      <textarea class="input" id="sContent" placeholder="Escribe aquí...">${item?.content || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSpiritual('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveSpiritual(id) {
  const title   = document.getElementById('sTitle').value.trim();
  const type    = document.getElementById('sType').value;
  const ref     = document.getElementById('sRef').value.trim();
  const content = document.getElementById('sContent').value.trim();

  if (!title) { showToast('El título es obligatorio', 'error'); return; }

  const record = { title, type, reference: ref, content };

  if (id) {
    DB.spiritual.update(id, record);
    showToast('✅ Entrada actualizada');
  } else {
    DB.spiritual.insert(record);
    showToast('✅ Entrada guardada');
  }
  closeModal();
  renderSpiritual();
}

function deleteSpiritual(id) {
  if (!confirm('¿Eliminar esta entrada?')) return;
  DB.spiritual.delete(id);
  showToast('🗑️ Entrada eliminada');
  renderSpiritual();
}

/* ---- GESTOR DE CATEGORÍAS (global, reutilizable) ---- */
function openCatManager(module, refreshFn) {
  const cats = DB.getCategories(module);
  openModal('🏷️ Gestionar categorías', `
    <div class="input-group" style="flex-direction:row;gap:8px">
      <input class="input" id="newCatInput" type="text" placeholder="Nueva categoría..." style="flex:1" />
      <button class="btn btn-primary" onclick="addCat('${module}', refreshFn)">
        <i class="fa fa-plus"></i>
      </button>
    </div>
    <div id="catList" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:0.5rem">
      ${cats.map(c => `
        <span style="display:inline-flex;align-items:center;gap:6px;background:var(--bg-hover);
          border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:0.82rem">
          ${c}
          <button onclick="deleteCat('${module}', '${c}')"
            style="background:none;color:#f87171;font-size:0.8rem;cursor:pointer">✕</button>
        </span>
      `).join('')}
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary w-full" onclick="closeModal();(${refreshFn.toString()})()">
        Listo
      </button>
    </div>
  `);
}

function addCat(module) {
  const input = document.getElementById('newCatInput');
  const name  = input.value.trim();
  if (!name) return;
  const cats = DB.addCategory(module, name);
  input.value = '';
  const list = document.getElementById('catList');
  list.innerHTML = cats.map(c => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:var(--bg-hover);
      border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:0.82rem">
      ${c}
      <button onclick="deleteCat('${module}', '${c}')"
        style="background:none;color:#f87171;font-size:0.8rem;cursor:pointer">✕</button>
    </span>
  `).join('');
  showToast(`✅ Categoría "${name}" agregada`);
}

function deleteCat(module, name) {
  DB.deleteCategory(module, name);
  const cats = DB.getCategories(module);
  const list = document.getElementById('catList');
  if (list) list.innerHTML = cats.map(c => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:var(--bg-hover);
      border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:0.82rem">
      ${c}
      <button onclick="deleteCat('${module}', '${c}')"
        style="background:none;color:#f87171;font-size:0.8rem;cursor:pointer">✕</button>
    </span>
  `).join('');
  showToast(`🗑️ Categoría eliminada`);
}

/* ---- UTILIDAD FECHA ---- */
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
}