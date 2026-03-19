/* =============================================
   LuismiLife — notes.js
   Módulo Notas — CRUD completo
   Notas con categorías, pin y búsqueda
   ============================================= */

function renderNotes() {
  const el   = document.getElementById('page-notes');
  const all  = DB.notes.getAll();
  const cats = DB.getCategories('notes');

  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-notes">📝 Notas & Apuntes</h2>
      <button class="btn btn-primary btn-sm" onclick="openNoteForm()">
        <i class="fa fa-plus"></i> Nueva nota
      </button>
    </div>

    <!-- Buscador -->
    <div style="position:relative;margin-bottom:1rem">
      <i class="fa fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
        color:var(--text-muted);font-size:0.85rem"></i>
      <input class="input" id="noteSearch" type="text"
        placeholder="Buscar notas..."
        style="padding-left:36px"
        oninput="searchNotes(this.value)" />
    </div>

    <!-- Chips categorías -->
    <div class="chip-wrap" id="noteChips">
      <span class="chip active" onclick="filterNotes('all', this)">Todas</span>
      <span class="chip" onclick="filterNotes('__pinned__', this)">📌 Fijadas</span>
      ${cats.map(c => `
        <span class="chip" onclick="filterNotes('${c}', this)">${c}</span>
      `).join('')}
      <span class="chip" style="border-style:dashed"
        onclick="openCatManager('notes', renderNotes)">
        <i class="fa fa-plus"></i>
      </span>
    </div>

    <!-- Grid de notas -->
    <div class="card-grid" id="notesGrid">
      ${renderNoteCards(all)}
    </div>
  `;
}

function renderNoteCards(notes) {
  if (!notes.length) return `
    <div class="empty-state" style="grid-column:1/-1">
      <i class="fa fa-sticky-note"></i>
      <p>Sin notas aquí.<br>¡Escribe tu primera nota!</p>
    </div>`;

  // Fijadas primero
  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return sorted.map(n => `
    <div class="card" style="border-top:3px solid ${n.pinned ? 'var(--color-notes)' : 'var(--border)'}">

      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">
          ${n.pinned ? '<div class="pinned-dot"></div>' : ''}
          <span style="font-weight:700;color:var(--text-primary);font-size:0.95rem;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.title}</span>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;margin-left:6px">
          <button class="btn-icon" title="${n.pinned ? 'Desfijar' : 'Fijar'}"
            onclick="togglePin('${n.id}')">
            <i class="fa fa-thumbtack" style="color:${n.pinned ? 'var(--color-notes)' : ''}"></i>
          </button>
          <button class="btn-icon" onclick="openNoteForm('${n.id}')">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteNote('${n.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Categoría -->
      ${n.category ? `
        <span class="badge mod-notes-bg mod-notes" style="margin-bottom:8px;display:inline-block">
          ${n.category}
        </span>` : ''}

      <!-- Contenido -->
      <p style="font-size:0.83rem;color:var(--text-secondary);line-height:1.65;
        white-space:pre-line;max-height:120px;overflow:hidden;position:relative">
        ${n.content}
        <span style="position:absolute;bottom:0;left:0;right:0;height:30px;
          background:linear-gradient(transparent,var(--bg-card))"></span>
      </p>

      <!-- Footer -->
      <div style="display:flex;justify-content:space-between;align-items:center;
        margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
        <span style="font-size:0.72rem;color:var(--text-muted)">${formatDate(n.created_at)}</span>
        <button onclick="openNoteView('${n.id}')"
          style="background:none;color:var(--neon-purple);font-size:0.78rem;font-weight:600;cursor:pointer">
          Ver completa →
        </button>
      </div>

    </div>
  `).join('');
}

/* ---- FILTROS ---- */
function filterNotes(filter, el) {
  document.querySelectorAll('#noteChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.notes.getAll();
  let filtered;
  if (filter === 'all')        filtered = all;
  else if (filter === '__pinned__') filtered = all.filter(n => n.pinned);
  else                         filtered = all.filter(n => n.category === filter);
  document.getElementById('notesGrid').innerHTML = renderNoteCards(filtered);
}

function searchNotes(query) {
  const q = query.toLowerCase().trim();
  const all = DB.notes.getAll();
  const filtered = !q ? all : all.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    (n.category || '').toLowerCase().includes(q)
  );
  document.querySelectorAll('#noteChips .chip').forEach(c => c.classList.remove('active'));
  document.getElementById('notesGrid').innerHTML = renderNoteCards(filtered);
}

/* ---- PIN ---- */
function togglePin(id) {
  const note = DB.getById('notes', id);
  if (!note) return;
  DB.notes.update(id, { pinned: !note.pinned });
  showToast(note.pinned ? '📌 Nota desfijada' : '📌 Nota fijada');
  renderNotes();
}

/* ---- VER NOTA COMPLETA ---- */
function openNoteView(id) {
  const n = DB.getById('notes', id);
  if (!n) return;
  openModal(`📝 ${n.title}`, `
    ${n.category ? `<span class="badge mod-notes-bg mod-notes" style="margin-bottom:12px;display:inline-block">${n.category}</span>` : ''}
    <p style="white-space:pre-line;line-height:1.8;color:var(--text-secondary);font-size:0.9rem">
      ${n.content}
    </p>
    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:1rem;padding-top:0.8rem;
      border-top:1px solid var(--border)">${formatDate(n.created_at)}</p>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary" onclick="closeModal();openNoteForm('${n.id}')">
        <i class="fa fa-pen"></i> Editar
      </button>
    </div>
  `);
}

/* ---- CRUD ---- */
function openNoteForm(id = null) {
  const item = id ? DB.getById('notes', id) : null;
  const cats = DB.getCategories('notes');

  openModal(id ? '✏️ Editar nota' : '📝 Nueva nota', `
    <div class="input-group">
      <label>Título</label>
      <input class="input" id="nTitle" type="text"
        placeholder="Título de la nota..."
        value="${item?.title || ''}" />
    </div>
    <div class="input-group">
      <label>Categoría</label>
      <select class="input" id="nCat">
        <option value="">Sin categoría</option>
        ${cats.map(c => `
          <option value="${c}" ${item?.category === c ? 'selected' : ''}>${c}</option>
        `).join('')}
      </select>
    </div>
    <div class="input-group">
      <label>Contenido</label>
      <textarea class="input" id="nContent"
        style="min-height:160px"
        placeholder="Escribe tu nota aquí...">${item?.content || ''}</textarea>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem">
      <label class="toggle-wrap" onclick="toggleNotePin()">
        <div class="toggle ${item?.pinned ? 'on' : ''}" id="notePinToggle"></div>
        <span style="font-size:0.85rem;color:var(--text-secondary)">📌 Fijar esta nota</span>
      </label>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveNote('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function toggleNotePin() {
  const t = document.getElementById('notePinToggle');
  if (t) t.classList.toggle('on');
}

function saveNote(id) {
  const title   = document.getElementById('nTitle').value.trim();
  const cat     = document.getElementById('nCat').value;
  const content = document.getElementById('nContent').value.trim();
  const pinned  = document.getElementById('notePinToggle')?.classList.contains('on') || false;

  if (!title)   { showToast('El título es obligatorio', 'error'); return; }
  if (!content) { showToast('El contenido no puede estar vacío', 'error'); return; }

  const record = { title, category: cat, content, pinned };

  if (id) {
    DB.notes.update(id, record);
    showToast('✅ Nota actualizada');
  } else {
    DB.notes.insert(record);
    showToast('✅ Nota guardada');
  }
  closeModal();
  renderNotes();
}

function deleteNote(id) {
  if (!confirm('¿Eliminar esta nota?')) return;
  DB.notes.delete(id);
  showToast('🗑️ Nota eliminada');
  renderNotes();
}