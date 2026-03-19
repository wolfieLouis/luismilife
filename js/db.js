/* =============================================
   LuismiLife — db.js
   Base de datos local (localStorage)
   Cuando conectes Supabase, solo cambias este archivo.
   ============================================= */

const DB = {

  /* ---- UTILIDADES BASE ---- */

  // Obtener colección completa
  getAll(table) {
    const data = localStorage.getItem(`ll_${table}`);
    return data ? JSON.parse(data) : [];
  },

  // Guardar colección completa
  saveAll(table, data) {
    localStorage.setItem(`ll_${table}`, JSON.stringify(data));
  },

  // Obtener un registro por ID
  getById(table, id) {
    return this.getAll(table).find(r => r.id === id) || null;
  },

  // Insertar nuevo registro
  insert(table, record) {
    const data = this.getAll(table);
    const newRecord = {
      ...record,
      id:         crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    data.unshift(newRecord); // más reciente primero
    this.saveAll(table, data);
    return newRecord;
  },

  // Actualizar registro por ID
  update(table, id, changes) {
    const data = this.getAll(table);
    const idx  = data.findIndex(r => r.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...changes, updated_at: new Date().toISOString() };
    this.saveAll(table, data);
    return data[idx];
  },

  // Eliminar registro por ID
  delete(table, id) {
    const data = this.getAll(table).filter(r => r.id !== id);
    this.saveAll(table, data);
  },

  // Filtrar por campo
  where(table, field, value) {
    return this.getAll(table).filter(r => r[field] === value);
  },

  /* ---- CATEGORÍAS ---- */

  // Categorías por módulo (con defaults)
  defaultCategories: {
    spiritual:  ['Versículo', 'Oración', 'Devocional', 'Sermón', 'Reflexión'],
    economic:   ['Salario', 'Hogar', 'Alimentación', 'Transporte', 'Diezmo', 'Ahorro', 'Extra'],
    academic:   ['Universidad', 'Curso online', 'Lectura', 'Proyecto', 'Examen'],
    fitness:    ['Pecho', 'Espalda', 'Piernas', 'Cardio', 'Hombros', 'Full body'],
    notes:      ['Personal', 'Espiritual', 'Ideas', 'Académico', 'Trabajo'],
    goals:      ['Espiritual', 'Económica', 'Académica', 'Fitness', 'Personal'],
    reminders:  ['Espiritual', 'Económica', 'Académica', 'Fitness', 'Personal'],
  },

  getCategories(module) {
    const saved = localStorage.getItem(`ll_cat_${module}`);
    return saved ? JSON.parse(saved) : [...this.defaultCategories[module] || []];
  },

  saveCategories(module, cats) {
    localStorage.setItem(`ll_cat_${module}`, JSON.stringify(cats));
  },

  addCategory(module, name) {
    const cats = this.getCategories(module);
    if (!cats.includes(name)) {
      cats.push(name);
      this.saveCategories(module, cats);
    }
    return cats;
  },

  deleteCategory(module, name) {
    const cats = this.getCategories(module).filter(c => c !== name);
    this.saveCategories(module, cats);
    return cats;
  },

  /* ---- TABLAS POR MÓDULO ---- */

  // ESPIRITUAL
  spiritual: {
    getAll:    ()      => DB.getAll('spiritual'),
    insert:    (r)     => DB.insert('spiritual', r),
    update:    (id, r) => DB.update('spiritual', id, r),
    delete:    (id)    => DB.delete('spiritual', id),
    byType:    (type)  => DB.where('spiritual', 'type', type),
  },

  // ECONÓMICO
  economic: {
    getAll:       ()      => DB.getAll('transactions'),
    insert:       (r)     => DB.insert('transactions', r),
    update:       (id, r) => DB.update('transactions', id, r),
    delete:       (id)    => DB.delete('transactions', id),
    getSavings:   ()      => DB.getAll('savings'),
    insertSaving: (r)     => DB.insert('savings', r),
    updateSaving: (id, r) => DB.update('savings', id, r),
    deleteSaving: (id)    => DB.delete('savings', id),
    totalIncome: () => DB.getAll('transactions')
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0),
    totalExpense: () => DB.getAll('transactions')
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0),
  },

  // ACADÉMICO
  academic: {
    getCourses:   ()      => DB.getAll('courses'),
    insertCourse: (r)     => DB.insert('courses', r),
    updateCourse: (id, r) => DB.update('courses', id, r),
    deleteCourse: (id)    => DB.delete('courses', id),
    getTasks:     ()      => DB.getAll('academic_tasks'),
    insertTask:   (r)     => DB.insert('academic_tasks', r),
    updateTask:   (id, r) => DB.update('academic_tasks', id, r),
    deleteTask:   (id)    => DB.delete('academic_tasks', id),
    getNotes:     ()      => DB.getAll('academic_notes'),
    insertNote:   (r)     => DB.insert('academic_notes', r),
    updateNote:   (id, r) => DB.update('academic_notes', id, r),
    deleteNote:   (id)    => DB.delete('academic_notes', id),
  },

  // FITNESS
  fitness: {
    getWorkouts:      ()      => DB.getAll('workouts'),
    insertWorkout:    (r)     => DB.insert('workouts', r),
    updateWorkout:    (id, r) => DB.update('workouts', id, r),
    deleteWorkout:    (id)    => DB.delete('workouts', id),
    getHabits:        ()      => DB.getAll('habits'),
    insertHabit:      (r)     => DB.insert('habits', r),
    updateHabit:      (id, r) => DB.update('habits', id, r),
    deleteHabit:      (id)    => DB.delete('habits', id),
    getMeasurements:  ()      => DB.getAll('measurements'),
    insertMeasure:    (r)     => DB.insert('measurements', r),
    deleteMeasure:    (id)    => DB.delete('measurements', id),
  },

  // NOTAS
  notes: {
    getAll:  ()      => DB.getAll('notes'),
    insert:  (r)     => DB.insert('notes', r),
    update:  (id, r) => DB.update('notes', id, r),
    delete:  (id)    => DB.delete('notes', id),
    pinned:  ()      => DB.where('notes', 'pinned', true),
  },

  // METAS
  goals: {
    getAll:  ()      => DB.getAll('goals'),
    insert:  (r)     => DB.insert('goals', r),
    update:  (id, r) => DB.update('goals', id, r),
    delete:  (id)    => DB.delete('goals', id),
  },

  // RECORDATORIOS
  reminders: {
    getAll:  ()      => DB.getAll('reminders'),
    insert:  (r)     => DB.insert('reminders', r),
    update:  (id, r) => DB.update('reminders', id, r),
    delete:  (id)    => DB.delete('reminders', id),
  },

  /* ---- EXPORTAR / IMPORTAR ---- */
  exportAll() {
    const tables = [
      'spiritual','transactions','savings','courses',
      'academic_tasks','academic_notes','workouts',
      'habits','measurements','notes','goals','reminders'
    ];
    const backup = {};
    tables.forEach(t => backup[t] = this.getAll(t));
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `luismilife-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Backup descargado');
  },

  importAll(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      Object.entries(data).forEach(([table, records]) => {
        this.saveAll(table, records);
      });
      showToast('✅ Datos importados correctamente');
      setTimeout(() => location.reload(), 1200);
    } catch {
      showToast('❌ Archivo inválido', 'error');
    }
  },
};