/* =============================================
   LuismiLife — fitness.js
   Módulo Fitness — CRUD completo
   Entrenamientos, Hábitos, Medidas
   ============================================= */

function renderFitness() {
  const el = document.getElementById('page-fitness');
  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-fitness">💪 Vida Fitness</h2>
      <button class="btn btn-primary btn-sm" onclick="openFitnessForm()">
        <i class="fa fa-plus"></i> Agregar
      </button>
    </div>

    <!-- Stats rápidos -->
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.2rem">
      <div class="stat-card mod-fitness-bg">
        <div class="stat-icon">🏋️</div>
        <div class="stat-value mod-fitness">${DB.fitness.getWorkouts().length}</div>
        <div class="stat-label">Entrenamientos</div>
      </div>
      <div class="stat-card" style="background:#10b98122;border-color:#10b98144">
        <div class="stat-icon">🔥</div>
        <div class="stat-value" style="color:var(--neon-green)">
          ${DB.fitness.getHabits().filter(h => h.done).length}/${DB.fitness.getHabits().length}
        </div>
        <div class="stat-label">Hábitos hoy</div>
      </div>
      <div class="stat-card mod-academic-bg">
        <div class="stat-icon">📏</div>
        <div class="stat-value mod-academic">
          ${DB.fitness.getMeasurements().length ? DB.fitness.getMeasurements()[0].weight + 'kg' : '--'}
        </div>
        <div class="stat-label">Último peso</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="fitTabs">
      <span class="tab active" onclick="switchFitTab('workouts', this)">🏋️ Entrenos</span>
      <span class="tab" onclick="switchFitTab('habits', this)">🔥 Hábitos</span>
      <span class="tab" onclick="switchFitTab('measures', this)">📏 Medidas</span>
    </div>

    <div id="fit-workouts">${renderWorkoutsList()}</div>
    <div id="fit-habits"   style="display:none">${renderHabitsList()}</div>
    <div id="fit-measures" style="display:none">${renderMeasuresList()}</div>
  `;
}

let fitCurrentTab = 'workouts';

function switchFitTab(tab, el) {
  fitCurrentTab = tab;
  document.querySelectorAll('#fitTabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('fit-workouts').style.display = tab === 'workouts' ? 'block' : 'none';
  document.getElementById('fit-habits').style.display   = tab === 'habits'   ? 'block' : 'none';
  document.getElementById('fit-measures').style.display = tab === 'measures' ? 'block' : 'none';
}

function openFitnessForm() {
  if (fitCurrentTab === 'workouts') openWorkoutForm();
  else if (fitCurrentTab === 'habits') openHabitForm();
  else openMeasureForm();
}

/* ---- ENTRENAMIENTOS ---- */
function renderWorkoutsList() {
  const workouts = DB.fitness.getWorkouts();
  const cats     = DB.getCategories('fitness');

  const chips = `
    <div class="chip-wrap">
      <span class="chip active" onclick="filterWorkouts('all', this)">Todos</span>
      ${cats.map(c => `<span class="chip" onclick="filterWorkouts('${c}', this)">${c}</span>`).join('')}
      <span class="chip" style="border-style:dashed" onclick="openCatManager('fitness', renderFitness)">
        <i class="fa fa-plus"></i>
      </span>
    </div>`;

  if (!workouts.length) return chips + `
    <div class="empty-state"><i class="fa fa-dumbbell"></i>
    <p>Sin entrenamientos.<br>¡Registra tu primer entreno!</p></div>`;

  return chips + `<div id="workoutCards">${renderWorkoutCards(workouts)}</div>`;
}

function renderWorkoutCards(workouts) {
  return workouts.map(w => `
    <div class="list-item">
      <div class="list-item-icon">🏋️</div>
      <div class="list-item-body">
        <div class="list-item-title">${w.type}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:4px 0">
          ${w.duration ? `<span class="badge mod-fitness-bg mod-fitness">⏱ ${w.duration} min</span>` : ''}
          ${w.calories ? `<span class="badge" style="background:#f8717122;color:#f87171">🔥 ${w.calories} kcal</span>` : ''}
          ${w.sets     ? `<span class="badge mod-academic-bg mod-academic">📊 ${w.sets} series</span>` : ''}
        </div>
        ${w.notes ? `<div style="font-size:0.8rem;color:var(--text-muted)">💬 ${w.notes}</div>` : ''}
        <div class="list-item-sub">${formatDate(w.created_at)}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-icon" onclick="openWorkoutForm('${w.id}')"><i class="fa fa-pen"></i></button>
        <button class="btn-icon btn-danger" onclick="deleteWorkout('${w.id}')"><i class="fa fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function filterWorkouts(cat, el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.fitness.getWorkouts();
  const filtered = cat === 'all' ? all : all.filter(w => w.type === cat);
  const container = document.getElementById('workoutCards');
  if (container) container.innerHTML = renderWorkoutCards(filtered);
}

function openWorkoutForm(id = null) {
  const item = id ? DB.getById('workouts', id) : null;
  const cats = DB.getCategories('fitness');
  openModal(id ? '✏️ Editar entreno' : '🏋️ Nuevo entrenamiento', `
    <div class="input-group">
      <label>Tipo de entrenamiento</label>
      <select class="input" id="wType">
        ${cats.map(c => `<option value="${c}" ${item?.type===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
      <div class="input-group">
        <label>Duración (min)</label>
        <input class="input" id="wDuration" type="number" min="0"
          placeholder="45" value="${item?.duration || ''}" />
      </div>
      <div class="input-group">
        <label>Calorías quemadas</label>
        <input class="input" id="wCalories" type="number" min="0"
          placeholder="300" value="${item?.calories || ''}" />
      </div>
    </div>
    <div class="input-group">
      <label>Series / Reps (opcional)</label>
      <input class="input" id="wSets" type="text" placeholder="Ej: 4x12 press banca"
        value="${item?.sets || ''}" />
    </div>
    <div class="input-group">
      <label>Notas / PR del día</label>
      <textarea class="input" id="wNotes" placeholder="Ej: Nuevo récord en sentadilla...">${item?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveWorkout('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveWorkout(id) {
  const type     = document.getElementById('wType').value;
  const duration = parseInt(document.getElementById('wDuration').value) || 0;
  const calories = parseInt(document.getElementById('wCalories').value) || 0;
  const sets     = document.getElementById('wSets').value.trim();
  const notes    = document.getElementById('wNotes').value.trim();
  const record   = { type, duration, calories, sets, notes };
  if (id) { DB.fitness.updateWorkout(id, record); showToast('✅ Entreno actualizado'); }
  else    { DB.fitness.insertWorkout(record);      showToast('✅ Entreno registrado'); }
  closeModal();
  renderFitness();
}

function deleteWorkout(id) {
  if (!confirm('¿Eliminar este entrenamiento?')) return;
  DB.fitness.deleteWorkout(id);
  showToast('🗑️ Entrenamiento eliminado');
  renderFitness();
}

/* ---- HÁBITOS ---- */
function renderHabitsList() {
  const habits = DB.fitness.getHabits();
  if (!habits.length) return `
    <div class="section-header" style="margin-bottom:1rem">
      <span></span>
      <button class="btn btn-primary btn-sm" onclick="openHabitForm()">
        <i class="fa fa-plus"></i> Nuevo hábito
      </button>
    </div>
    <div class="empty-state"><i class="fa fa-fire"></i>
    <p>Sin hábitos aún.<br>¡Crea tu primer hábito!</p></div>`;

  const today = new Date().toDateString();

  return `
    <div class="section-header" style="margin-bottom:1rem">
      <span style="color:var(--text-muted);font-size:0.85rem">${habits.length} hábitos activos</span>
      <button class="btn btn-primary btn-sm" onclick="openHabitForm()">
        <i class="fa fa-plus"></i> Nuevo
      </button>
    </div>
    ${habits.map(h => {
      const doneToday = h.lastDone === today;
      return `
        <div class="list-item" style="border-left:3px solid ${doneToday ? 'var(--neon-green)' : 'var(--border)'}">
          <div style="cursor:pointer;font-size:1.4rem" onclick="toggleHabit('${h.id}')">
            ${doneToday ? '✅' : '⬜'}
          </div>
          <div class="list-item-body">
            <div class="list-item-title">${h.name}</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
              <span class="streak">🔥 ${h.streak || 0} días</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">Meta: ${h.target || 7} días/sem</span>
            </div>
          </div>
          <div class="list-item-actions">
            <button class="btn-icon" onclick="openHabitForm('${h.id}')"><i class="fa fa-pen"></i></button>
            <button class="btn-icon btn-danger" onclick="deleteHabit('${h.id}')"><i class="fa fa-trash"></i></button>
          </div>
        </div>`;
    }).join('')}`;
}

function toggleHabit(id) {
  const habit   = DB.getById('habits', id);
  if (!habit) return;
  const today   = new Date().toDateString();
  const doneToday = habit.lastDone === today;
  const streak  = doneToday ? Math.max(0, (habit.streak || 1) - 1) : (habit.streak || 0) + 1;
  DB.fitness.updateHabit(id, { lastDone: doneToday ? null : today, streak });
  document.getElementById('fit-habits').innerHTML = renderHabitsList();
}

function openHabitForm(id = null) {
  const item = id ? DB.getById('habits', id) : null;
  openModal(id ? '✏️ Editar hábito' : '🔥 Nuevo hábito', `
    <div class="input-group">
      <label>Nombre del hábito</label>
      <input class="input" id="hName" type="text" placeholder="Ej: Tomar 2L de agua"
        value="${item?.name || ''}" />
    </div>
    <div class="input-group">
      <label>Meta semanal (días)</label>
      <input class="input" id="hTarget" type="number" min="1" max="7"
        placeholder="7" value="${item?.target || 7}" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveHabit('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveHabit(id) {
  const name   = document.getElementById('hName').value.trim();
  const target = parseInt(document.getElementById('hTarget').value) || 7;
  if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
  const record = { name, target, streak: 0, lastDone: null };
  if (id) { DB.fitness.updateHabit(id, { name, target }); showToast('✅ Hábito actualizado'); }
  else    { DB.fitness.insertHabit(record);                showToast('✅ Hábito creado'); }
  closeModal();
  renderFitness();
}

function deleteHabit(id) {
  if (!confirm('¿Eliminar este hábito?')) return;
  DB.fitness.deleteHabit(id);
  showToast('🗑️ Hábito eliminado');
  renderFitness();
}

/* ---- MEDIDAS CORPORALES ---- */
function renderMeasuresList() {
  const measures = DB.fitness.getMeasurements();
  return `
    <div class="section-header" style="margin-bottom:1rem">
      <span style="color:var(--text-muted);font-size:0.85rem">${measures.length} registros</span>
      <button class="btn btn-primary btn-sm" onclick="openMeasureForm()">
        <i class="fa fa-plus"></i> Registrar
      </button>
    </div>
    ${!measures.length ? `<div class="empty-state"><i class="fa fa-weight"></i>
      <p>Sin medidas aún.</p></div>` :
    measures.map(m => `
      <div class="list-item">
        <div class="list-item-icon">📏</div>
        <div class="list-item-body">
          <div style="display:flex;gap:1rem;flex-wrap:wrap">
            ${m.weight  ? `<span><span class="text-muted" style="font-size:0.78rem">Peso</span><br><strong style="color:var(--color-fitness)">${m.weight} kg</strong></span>` : ''}
            ${m.fat     ? `<span><span class="text-muted" style="font-size:0.78rem">% Grasa</span><br><strong style="color:var(--color-academic)">${m.fat}%</strong></span>` : ''}
            ${m.muscle  ? `<span><span class="text-muted" style="font-size:0.78rem">% Músculo</span><br><strong style="color:var(--neon-green)">${m.muscle}%</strong></span>` : ''}
            ${m.waist   ? `<span><span class="text-muted" style="font-size:0.78rem">Cintura</span><br><strong>${m.waist} cm</strong></span>` : ''}
          </div>
          <div class="list-item-sub">${formatDate(m.created_at)}</div>
        </div>
        <button class="btn-icon btn-danger" onclick="deleteMeasure('${m.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </div>`).join('')}`;
}

function openMeasureForm() {
  openModal('📏 Nueva medida corporal', `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
      <div class="input-group">
        <label>Peso (kg)</label>
        <input class="input" id="mWeight" type="number" step="0.1" placeholder="75.5" />
      </div>
      <div class="input-group">
        <label>% Grasa</label>
        <input class="input" id="mFat" type="number" step="0.1" placeholder="18.0" />
      </div>
      <div class="input-group">
        <label>% Músculo</label>
        <input class="input" id="mMuscle" type="number" step="0.1" placeholder="42.0" />
      </div>
      <div class="input-group">
        <label>Cintura (cm)</label>
        <input class="input" id="mWaist" type="number" step="0.1" placeholder="82" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveMeasure()">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveMeasure() {
  const weight = parseFloat(document.getElementById('mWeight').value) || null;
  const fat    = parseFloat(document.getElementById('mFat').value)    || null;
  const muscle = parseFloat(document.getElementById('mMuscle').value) || null;
  const waist  = parseFloat(document.getElementById('mWaist').value)  || null;
  if (!weight && !fat) { showToast('Ingresa al menos peso o % grasa', 'error'); return; }
  DB.fitness.insertMeasure({ weight, fat, muscle, waist });
  showToast('✅ Medida registrada');
  closeModal();
  renderFitness();
}

function deleteMeasure(id) {
  if (!confirm('¿Eliminar este registro?')) return;
  DB.fitness.deleteMeasure(id);
  showToast('🗑️ Registro eliminado');
  renderFitness();
}