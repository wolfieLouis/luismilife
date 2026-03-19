/* =============================================
   LuismiLife — academic.js
   Módulo Académico — CRUD completo
   Cursos, Tareas, Apuntes
   ============================================= */

function renderAcademic() {
  const el = document.getElementById('page-academic');
  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-academic">📚 Vida Académica</h2>
      <button class="btn btn-primary btn-sm" onclick="openAcademicForm()">
        <i class="fa fa-plus"></i> Agregar
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="acadTabs">
      <span class="tab active" onclick="switchAcadTab('courses', this)">🎓 Cursos</span>
      <span class="tab" onclick="switchAcadTab('tasks', this)">✅ Tareas</span>
      <span class="tab" onclick="switchAcadTab('notes', this)">📝 Apuntes</span>
    </div>

    <!-- Cursos -->
    <div id="acad-courses">${renderCoursesList()}</div>

    <!-- Tareas -->
    <div id="acad-tasks" style="display:none">${renderTasksList()}</div>

    <!-- Apuntes -->
    <div id="acad-notes" style="display:none">${renderAcadNotesList()}</div>
  `;
}

let acadCurrentTab = 'courses';

function switchAcadTab(tab, el) {
  acadCurrentTab = tab;
  document.querySelectorAll('#acadTabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('acad-courses').style.display = tab === 'courses' ? 'block' : 'none';
  document.getElementById('acad-tasks').style.display   = tab === 'tasks'   ? 'block' : 'none';
  document.getElementById('acad-notes').style.display   = tab === 'notes'   ? 'block' : 'none';
}

function openAcademicForm() {
  const labels = { courses: 'curso', tasks: 'tarea', notes: 'apunte' };
  const label  = labels[acadCurrentTab] || 'elemento';
  if (acadCurrentTab === 'courses') openCourseForm();
  else if (acadCurrentTab === 'tasks') openTaskForm();
  else openAcadNoteForm();
}

/* ---- CURSOS ---- */
function renderCoursesList() {
  const courses = DB.academic.getCourses();
  if (!courses.length) return `
    <div class="empty-state">
      <i class="fa fa-graduation-cap"></i>
      <p>Sin cursos aún.<br>¡Agrega tu primer curso!</p>
    </div>`;

  return courses.map(c => {
    const pct = Math.min(100, c.progress || 0);
    return `
      <div class="card" style="margin-bottom:0.8rem">
        <div class="section-header" style="margin-bottom:8px">
          <div>
            <div style="font-weight:700;color:var(--text-primary);font-size:0.95rem">🎓 ${c.name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted)">${c.institution || ''}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${c.grade ? `<span class="badge mod-academic-bg mod-academic">${c.grade}/10</span>` : ''}
            <button class="btn-icon" onclick="openCourseForm('${c.id}')"><i class="fa fa-pen"></i></button>
            <button class="btn-icon btn-danger" onclick="deleteCourse('${c.id}')"><i class="fa fa-trash"></i></button>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:6px">
          <span class="text-muted">Progreso del curso</span>
          <span class="mod-academic font-bold">${pct}%</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:${pct}%;background:var(--color-academic)"></div>
        </div>
        ${c.notes ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px">${c.notes}</p>` : ''}
      </div>`;
  }).join('');
}

function openCourseForm(id = null) {
  const item = id ? DB.getById('courses', id) : null;
  openModal(id ? '✏️ Editar curso' : '🎓 Nuevo curso', `
    <div class="input-group">
      <label>Nombre del curso</label>
      <input class="input" id="cName" type="text" placeholder="Ej: Ingeniería de Software"
        value="${item?.name || ''}" />
    </div>
    <div class="input-group">
      <label>Institución</label>
      <input class="input" id="cInst" type="text" placeholder="Ej: Universidad / Udemy"
        value="${item?.institution || ''}" />
    </div>
    <div class="input-group">
      <label>Progreso (0-100%)</label>
      <input class="input" id="cProgress" type="number" min="0" max="100"
        placeholder="0" value="${item?.progress || 0}" />
    </div>
    <div class="input-group">
      <label>Calificación actual (opcional)</label>
      <input class="input" id="cGrade" type="number" min="0" max="10" step="0.1"
        placeholder="0.0" value="${item?.grade || ''}" />
    </div>
    <div class="input-group">
      <label>Notas</label>
      <textarea class="input" id="cNotes" placeholder="Observaciones...">${item?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveCourse('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveCourse(id) {
  const name        = document.getElementById('cName').value.trim();
  const institution = document.getElementById('cInst').value.trim();
  const progress    = parseInt(document.getElementById('cProgress').value) || 0;
  const grade       = parseFloat(document.getElementById('cGrade').value) || null;
  const notes       = document.getElementById('cNotes').value.trim();

  if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
  const record = { name, institution, progress, grade, notes };
  if (id) { DB.academic.updateCourse(id, record); showToast('✅ Curso actualizado'); }
  else    { DB.academic.insertCourse(record);      showToast('✅ Curso guardado'); }
  closeModal();
  renderAcademic();
}

function deleteCourse(id) {
  if (!confirm('¿Eliminar este curso?')) return;
  DB.academic.deleteCourse(id);
  showToast('🗑️ Curso eliminado');
  renderAcademic();
}

/* ---- TAREAS ---- */
function renderTasksList(filter = 'all') {
  const tasks = DB.academic.getTasks();
  const filtered = filter === 'done'    ? tasks.filter(t => t.done)
                 : filter === 'pending' ? tasks.filter(t => !t.done)
                 : tasks;

  const prioColor = { alta: '#f87171', media: '#fbbf24', baja: '#34d399' };

  const chips = `
    <div class="chip-wrap" id="taskChips">
      <span class="chip ${filter==='all'?'active':''}"     onclick="reloadTasks('all', this)">Todas</span>
      <span class="chip ${filter==='pending'?'active':''}" onclick="reloadTasks('pending', this)">Pendientes</span>
      <span class="chip ${filter==='done'?'active':''}"    onclick="reloadTasks('done', this)">Completadas</span>
    </div>`;

  if (!filtered.length) return chips + `
    <div class="empty-state"><i class="fa fa-check-circle"></i>
    <p>Sin tareas aquí.</p></div>`;

  return chips + filtered.map(t => `
    <div class="list-item" style="border-left:3px solid ${prioColor[t.priority] || '#475569'};
      opacity:${t.done ? 0.6 : 1}">
      <div class="list-item-icon" style="cursor:pointer" onclick="toggleTask('${t.id}')">
        ${t.done ? '✅' : '⬜'}
      </div>
      <div class="list-item-body">
        <div class="list-item-title" style="${t.done ? 'text-decoration:line-through' : ''}">
          ${t.title}
        </div>
        <div class="list-item-sub">
          ${t.course ? `<span style="color:var(--color-academic);font-size:0.78rem">📚 ${t.course}</span>` : ''}
          ${t.due ? `<span style="margin-left:6px">🗓 ${t.due}</span>` : ''}
          <span class="badge priority-${t.priority}" style="margin-left:6px">${t.priority}</span>
        </div>
      </div>
      <div class="list-item-actions">
        <button class="btn-icon" onclick="openTaskForm('${t.id}')"><i class="fa fa-pen"></i></button>
        <button class="btn-icon btn-danger" onclick="deleteTask('${t.id}')"><i class="fa fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function reloadTasks(filter, el) {
  document.querySelectorAll('#taskChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('acad-tasks').innerHTML = renderTasksList(filter);
}

function toggleTask(id) {
  const task = DB.getById('academic_tasks', id);
  if (!task) return;
  DB.academic.updateTask(id, { done: !task.done });
  document.getElementById('acad-tasks').innerHTML = renderTasksList();
}

function openTaskForm(id = null) {
  const item    = id ? DB.getById('academic_tasks', id) : null;
  const courses = DB.academic.getCourses();
  openModal(id ? '✏️ Editar tarea' : '✅ Nueva tarea', `
    <div class="input-group">
      <label>Título de la tarea</label>
      <input class="input" id="tTitle" type="text" placeholder="Ej: Proyecto final"
        value="${item?.title || ''}" />
    </div>
    <div class="input-group">
      <label>Curso relacionado</label>
      <select class="input" id="tCourse">
        <option value="">Sin curso</option>
        ${courses.map(c => `<option value="${c.name}" ${item?.course===c.name?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="input-group">
      <label>Fecha límite</label>
      <input class="input" id="tDue" type="date" value="${item?.due || ''}" />
    </div>
    <div class="input-group">
      <label>Prioridad</label>
      <select class="input" id="tPrio">
        <option value="alta"  ${item?.priority==='alta' ?'selected':''}>🔴 Alta</option>
        <option value="media" ${item?.priority==='media'?'selected':''}>🟡 Media</option>
        <option value="baja"  ${item?.priority==='baja' ?'selected':''}>🟢 Baja</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveTask('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveTask(id) {
  const title    = document.getElementById('tTitle').value.trim();
  const course   = document.getElementById('tCourse').value;
  const due      = document.getElementById('tDue').value;
  const priority = document.getElementById('tPrio').value;
  if (!title) { showToast('El título es obligatorio', 'error'); return; }
  const record = { title, course, due, priority, done: false };
  if (id) { DB.academic.updateTask(id, record); showToast('✅ Tarea actualizada'); }
  else    { DB.academic.insertTask(record);      showToast('✅ Tarea guardada'); }
  closeModal();
  renderAcademic();
}

function deleteTask(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  DB.academic.deleteTask(id);
  showToast('🗑️ Tarea eliminada');
  renderAcademic();
}

/* ---- APUNTES ---- */
function renderAcadNotesList() {
  const notes   = DB.academic.getNotes();
  const courses = DB.academic.getCourses();

  const filter = `
    <div class="chip-wrap">
      <span class="chip active" onclick="filterAcadNotes('all', this)">Todos</span>
      ${courses.map(c => `
        <span class="chip" onclick="filterAcadNotes('${c.name}', this)">${c.name}</span>
      `).join('')}
    </div>`;

  if (!notes.length) return filter + `
    <div class="empty-state"><i class="fa fa-sticky-note"></i>
    <p>Sin apuntes aún.</p></div>`;

  return filter + `<div id="acadNoteCards" class="card-grid">${renderAcadNoteCards(notes)}</div>`;
}

function renderAcadNoteCards(notes) {
  return notes.map(n => `
    <div class="card">
      <div class="section-header" style="margin-bottom:6px">
        <span style="font-weight:700;color:var(--color-academic)">📝 ${n.title}</span>
        <div style="display:flex;gap:4px">
          <button class="btn-icon" onclick="openAcadNoteForm('${n.id}')"><i class="fa fa-pen"></i></button>
          <button class="btn-icon btn-danger" onclick="deleteAcadNote('${n.id}')"><i class="fa fa-trash"></i></button>
        </div>
      </div>
      ${n.course ? `<span class="badge mod-academic-bg mod-academic" style="margin-bottom:6px;display:inline-block">${n.course}</span>` : ''}
      <p style="font-size:0.83rem;color:var(--text-secondary);line-height:1.6;white-space:pre-line">${n.content}</p>
      <p style="font-size:0.75rem;color:var(--text-muted);margin-top:8px">${formatDate(n.created_at)}</p>
    </div>`).join('');
}

function filterAcadNotes(course, el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.academic.getNotes();
  const filtered = course === 'all' ? all : all.filter(n => n.course === course);
  const container = document.getElementById('acadNoteCards');
  if (container) container.innerHTML = renderAcadNoteCards(filtered);
}

function openAcadNoteForm(id = null) {
  const item    = id ? DB.getById('academic_notes', id) : null;
  const courses = DB.academic.getCourses();
  openModal(id ? '✏️ Editar apunte' : '📝 Nuevo apunte', `
    <div class="input-group">
      <label>Título</label>
      <input class="input" id="anTitle" type="text" placeholder="Ej: Patrones de diseño"
        value="${item?.title || ''}" />
    </div>
    <div class="input-group">
      <label>Curso</label>
      <select class="input" id="anCourse">
        <option value="">Sin curso</option>
        ${courses.map(c => `<option value="${c.name}" ${item?.course===c.name?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="input-group">
      <label>Contenido</label>
      <textarea class="input" id="anContent" style="min-height:140px"
        placeholder="Escribe tus apuntes aquí...">${item?.content || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveAcadNote('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveAcadNote(id) {
  const title   = document.getElementById('anTitle').value.trim();
  const course  = document.getElementById('anCourse').value;
  const content = document.getElementById('anContent').value.trim();
  if (!title) { showToast('El título es obligatorio', 'error'); return; }
  const record = { title, course, content };
  if (id) { DB.academic.updateNote(id, record); showToast('✅ Apunte actualizado'); }
  else    { DB.academic.insertNote(record);      showToast('✅ Apunte guardado'); }
  closeModal();
  renderAcademic();
}

function deleteAcadNote(id) {
  if (!confirm('¿Eliminar este apunte?')) return;
  DB.academic.deleteNote(id);
  showToast('🗑️ Apunte eliminado');
  renderAcademic();
}
