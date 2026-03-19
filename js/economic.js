/* =============================================
   LuismiLife — economic.js
   Módulo Económico — CRUD completo
   Transacciones, Ahorro, Balance
   ============================================= */

function renderEconomic() {
  const el   = document.getElementById('page-economic');
  const all  = DB.economic.getAll();
  const income  = DB.economic.totalIncome();
  const expense = DB.economic.totalExpense();
  const balance = income - expense;
  const savings = DB.economic.getSavings();

  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title mod-economic">💰 Vida Económica</h2>
      <button class="btn btn-primary btn-sm" onclick="openTransactionForm()">
        <i class="fa fa-plus"></i> Agregar
      </button>
    </div>

    <!-- Stats económicos -->
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.2rem">
      <div class="stat-card mod-economic-bg">
        <div class="stat-icon">⬆️</div>
        <div class="stat-value mod-economic">$${income.toLocaleString()}</div>
        <div class="stat-label">Ingresos</div>
      </div>
      <div class="stat-card" style="background:#f8717122;border-color:#f8717144">
        <div class="stat-icon">⬇️</div>
        <div class="stat-value" style="color:#f87171">$${expense.toLocaleString()}</div>
        <div class="stat-label">Gastos</div>
      </div>
      <div class="stat-card mod-academic-bg">
        <div class="stat-icon">${balance >= 0 ? '✅' : '⚠️'}</div>
        <div class="stat-value mod-academic">$${balance.toLocaleString()}</div>
        <div class="stat-label">Balance</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="econTabs">
      <span class="tab active" onclick="switchEconTab('transactions', this)">💳 Movimientos</span>
      <span class="tab" onclick="switchEconTab('savings', this)">🏦 Ahorro</span>
    </div>

    <!-- Movimientos -->
    <div id="econ-transactions">
      <!-- Filtros -->
      <div class="chip-wrap" id="econChips">
        <span class="chip active" onclick="filterTransactions('all', this)">Todos</span>
        <span class="chip" onclick="filterTransactions('income', this)">⬆️ Ingresos</span>
        <span class="chip" onclick="filterTransactions('expense', this)">⬇️ Gastos</span>
        ${DB.getCategories('economic').map(c => `
          <span class="chip" onclick="filterTransactionsCat('${c}', this)">${c}</span>
        `).join('')}
        <span class="chip" style="border-style:dashed" onclick="openCatManager('economic', renderEconomic)">
          <i class="fa fa-plus"></i>
        </span>
      </div>
      <div id="transactionList">${renderTransactionList(all)}</div>
    </div>

    <!-- Ahorro (oculto por defecto) -->
    <div id="econ-savings" style="display:none">
      <div class="section-header" style="margin-bottom:1rem">
        <span style="color:var(--text-secondary);font-size:0.9rem">${savings.length} fondos activos</span>
        <button class="btn btn-primary btn-sm" onclick="openSavingForm()">
          <i class="fa fa-plus"></i> Nuevo fondo
        </button>
      </div>
      ${renderSavingsList(savings)}
    </div>
  `;
}

function switchEconTab(tab, el) {
  document.querySelectorAll('#econTabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('econ-transactions').style.display = tab === 'transactions' ? 'block' : 'none';
  document.getElementById('econ-savings').style.display      = tab === 'savings'      ? 'block' : 'none';
}

/* ---- TRANSACCIONES ---- */
function renderTransactionList(items) {
  if (!items.length) return `
    <div class="empty-state">
      <i class="fa fa-dollar-sign"></i>
      <p>Sin movimientos aún.<br>¡Registra tu primer ingreso o gasto!</p>
    </div>`;

  return items.map(t => `
    <div class="list-item">
      <div class="list-item-icon" style="font-size:1.4rem">
        ${t.type === 'income' ? '⬆️' : '⬇️'}
      </div>
      <div class="list-item-body">
        <div class="list-item-title">${t.description}</div>
        <div class="list-item-sub">
          <span class="badge ${t.type === 'income' ? 'mod-economic-bg mod-economic' : ''}"
            style="${t.type === 'expense' ? 'background:#f8717122;color:#f87171' : ''}">
            ${t.category || 'Sin categoría'}
          </span>
          <span style="margin-left:6px">${formatDate(t.created_at)}</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <span class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}" style="font-size:1rem">
          ${t.type === 'income' ? '+' : '-'}$${Number(t.amount).toLocaleString()}
        </span>
        <div class="list-item-actions">
          <button class="btn-icon" onclick="openTransactionForm('${t.id}')">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteTransaction('${t.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterTransactions(type, el) {
  document.querySelectorAll('#econChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const all = DB.economic.getAll();
  const filtered = type === 'all' ? all : all.filter(t => t.type === type);
  document.getElementById('transactionList').innerHTML = renderTransactionList(filtered);
}

function filterTransactionsCat(cat, el) {
  document.querySelectorAll('#econChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const filtered = DB.economic.getAll().filter(t => t.category === cat);
  document.getElementById('transactionList').innerHTML = renderTransactionList(filtered);
}

function openTransactionForm(id = null) {
  const item = id ? DB.getById('transactions', id) : null;
  const cats = DB.getCategories('economic');

  openModal(id ? '✏️ Editar movimiento' : '💳 Nuevo movimiento', `
    <div class="input-group">
      <label>Tipo</label>
      <select class="input" id="tType">
        <option value="income"  ${item?.type === 'income'  ? 'selected' : ''}>⬆️ Ingreso</option>
        <option value="expense" ${item?.type === 'expense' ? 'selected' : ''}>⬇️ Gasto</option>
      </select>
    </div>
    <div class="input-group">
      <label>Descripción</label>
      <input class="input" id="tDesc" type="text" placeholder="Ej: Salario mensual"
        value="${item?.description || ''}" />
    </div>
    <div class="input-group">
      <label>Monto ($)</label>
      <input class="input" id="tAmount" type="number" min="0" placeholder="0.00"
        value="${item?.amount || ''}" />
    </div>
    <div class="input-group">
      <label>Categoría</label>
      <select class="input" id="tCat">
        ${cats.map(c => `<option value="${c}" ${item?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveTransaction('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveTransaction(id) {
  const type        = document.getElementById('tType').value;
  const description = document.getElementById('tDesc').value.trim();
  const amount      = parseFloat(document.getElementById('tAmount').value);
  const category    = document.getElementById('tCat').value;

  if (!description)  { showToast('La descripción es obligatoria', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }

  const record = { type, description, amount, category };
  if (id) {
    DB.economic.update(id, record);
    showToast('✅ Movimiento actualizado');
  } else {
    DB.economic.insert(record);
    showToast('✅ Movimiento guardado');
  }
  closeModal();
  renderEconomic();
}

function deleteTransaction(id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  DB.economic.delete(id);
  showToast('🗑️ Movimiento eliminado');
  renderEconomic();
}

/* ---- FONDOS DE AHORRO ---- */
function renderSavingsList(savings) {
  if (!savings.length) return `
    <div class="empty-state">
      <i class="fa fa-piggy-bank"></i>
      <p>Sin fondos de ahorro.<br>¡Crea tu primer objetivo!</p>
    </div>`;

  return savings.map(s => {
    const pct = Math.min(100, Math.round((s.current / s.goal) * 100));
    return `
      <div class="card" style="margin-bottom:0.8rem">
        <div class="section-header" style="margin-bottom:8px">
          <div>
            <div style="font-weight:700;color:var(--text-primary)">🏦 ${s.name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted)">${s.description || ''}</div>
          </div>
          <div style="display:flex;gap:4px">
            <button class="btn-icon" onclick="openSavingForm('${s.id}')">
              <i class="fa fa-pen"></i>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteSaving('${s.id}')">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.85rem">
          <span class="text-muted">$${Number(s.current).toLocaleString()} ahorrados</span>
          <span class="mod-economic font-bold">${pct}% — Meta: $${Number(s.goal).toLocaleString()}</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:${pct}%;background:var(--color-economic)"></div>
        </div>
      </div>`;
  }).join('');
}

function openSavingForm(id = null) {
  const item = id ? DB.getById('savings', id) : null;
  openModal(id ? '✏️ Editar fondo' : '🏦 Nuevo fondo de ahorro', `
    <div class="input-group">
      <label>Nombre del fondo</label>
      <input class="input" id="svName" type="text" placeholder="Ej: Fondo de emergencias"
        value="${item?.name || ''}" />
    </div>
    <div class="input-group">
      <label>Meta ($)</label>
      <input class="input" id="svGoal" type="number" min="0" placeholder="5000"
        value="${item?.goal || ''}" />
    </div>
    <div class="input-group">
      <label>Ahorrado hasta ahora ($)</label>
      <input class="input" id="svCurrent" type="number" min="0" placeholder="0"
        value="${item?.current || 0}" />
    </div>
    <div class="input-group">
      <label>Descripción (opcional)</label>
      <input class="input" id="svDesc" type="text" placeholder="Para qué es este fondo..."
        value="${item?.description || ''}" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSaving('${id || ''}')">
        <i class="fa fa-save"></i> Guardar
      </button>
    </div>
  `);
}

function saveSaving(id) {
  const name    = document.getElementById('svName').value.trim();
  const goal    = parseFloat(document.getElementById('svGoal').value);
  const current = parseFloat(document.getElementById('svCurrent').value) || 0;
  const desc    = document.getElementById('svDesc').value.trim();

  if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
  if (!goal || goal <= 0) { showToast('Ingresa una meta válida', 'error'); return; }

  const record = { name, goal, current, description: desc };
  if (id) {
    DB.economic.updateSaving(id, record);
    showToast('✅ Fondo actualizado');
  } else {
    DB.economic.insertSaving(record);
    showToast('✅ Fondo creado');
  }
  closeModal();
  renderEconomic();
}

function deleteSaving(id) {
  if (!confirm('¿Eliminar este fondo?')) return;
  DB.economic.deleteSaving(id);
  showToast('🗑️ Fondo eliminado');
  renderEconomic();
}