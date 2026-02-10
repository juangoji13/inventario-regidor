// --- CONFIGURACIÓN SUPABASE ---
let CONFIG = {
    url: window.SUPABASE_URL || null,
    key: window.SUPABASE_KEY || null
};

let _supabase;

async function setupSupabase() {
    // Si no hay config localmente, intentamos cargarla de la API de Vercel
    if (!CONFIG.url || !CONFIG.key) {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const apiConfig = await response.json();
                CONFIG.url = apiConfig.url || CONFIG.url;
                CONFIG.key = apiConfig.key || CONFIG.key;
                console.log("Configuración cargada desde API");
            }
        } catch (e) {
            console.warn("No se pudo cargar la config desde la API, usando respaldo.");
        }
    }

    if (!CONFIG.url || !CONFIG.key) {
        console.error("Supabase Config Missing!");
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = "Error: Configuración de Supabase no encontrada. Verifique variables de entorno en Vercel.";
            errorDiv.classList.remove('hidden');
        }
        return false;
    }

    const { createClient } = supabase;
    _supabase = createClient(CONFIG.url, CONFIG.key);
    return true;
}

// --- ESTADO GLOBAL ---
let state = {
    currentUser: null,
    materials: [],
    movements: [],
    activeMaterialId: null,
    isLoading: false
};

// --- SINCRONIZACIÓN CON LA NUBE ---
async function syncData() {
    state.isLoading = true;
    renderActiveView(state.currentView || 'home');

    // 1. Cargar Materiales
    const { data: mats, error: errMats } = await _supabase
        .from('materiales')
        .select('*')
        .order('nombre', { ascending: true });

    if (errMats) console.error("Error cargando materiales:", errMats);
    else state.materials = mats;

    // 2. Cargar Movimientos (Ordenados por fecha descendente: más nuevos arriba)
    const { data: movs, error: errMovs } = await _supabase
        .from('movimientos')
        .select('*')
        .order('fecha_operacion', { ascending: false });

    if (errMovs) console.error("Error cargando movimientos:", errMovs);
    else state.movements = movs;

    state.isLoading = false;
    renderActiveView(state.currentView || 'home');
}

// --- NAVEGACIÓN ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('app-content').classList.add('hidden');

    if (pageId === 'auth') {
        document.getElementById('auth-page').classList.remove('hidden');
    } else {
        document.getElementById('app-content').classList.remove('hidden');
        renderActiveView(pageId);
        if (state.materials.length === 0) syncData(); // Sincronizar si está vacío
    }
}

// --- AUTENTICACIÓN POR USUARIO (MODO PRODUCCIÓN) ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    const errorDiv = document.getElementById('login-error');

    // Convertimos el usuario a un formato compatible con Supabase Auth internamente
    // pero transparente para el usuario final.
    const email = `${username}@regidor.local`;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Accediendo...';
    errorDiv.classList.add('hidden');

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error("Login error details:", error);
        errorDiv.textContent = `Error: ${error.message || "Usuario o contraseña incorrectos."}`;
        errorDiv.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Acceder al Sistema <i class="fa-solid fa-chevron-right"></i>';
    }
    else {
        state.currentUser = data.user;
        showPage('home');
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await _supabase.auth.signOut();
    state.currentUser = null;
    showPage('auth');
});

// --- INICIALIZACIÓN Y SESIÓN ---
async function initApp() {
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        state.currentUser = session.user;
        showPage('home');
    } else {
        showPage('auth');
    }

    // Escuchar cambios en la sesión (Login/Logout en otras pestañas)
    _supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            state.currentUser = session.user;
            showPage('home');
        } else if (event === 'SIGNED_OUT') {
            state.currentUser = null;
            showPage('auth');
        }
    });
}

// --- RENDERIZADO DE VISTAS ---
function renderActiveView(view) {
    state.currentView = view;
    const main = document.getElementById('main-view');

    if (state.isLoading) {
        main.innerHTML = `<div style="text-align: center; padding: 50px; color: white;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p>Bienvenido al Inventario...</p>
        </div>`;
        return;
    }

    switch (view) {
        case 'home': main.innerHTML = renderDashboard(); break;
        case 'materiales': main.innerHTML = renderMaterials(); break;
        case 'nuevo-material': main.innerHTML = renderMaterialForm(); break;
        case 'entrada':
            main.innerHTML = renderMovementForm('entrada');
            initCalendar();
            break;
        case 'salida':
            main.innerHTML = renderMovementForm('salida');
            initCalendar();
            break;
        case 'historial': main.innerHTML = renderHistory(); break;
        case 'detalle-material': main.innerHTML = renderMaterialDetail(state.activeMaterialId); break;
    }
}

function initCalendar() {
    setTimeout(() => {
        flatpickr("#mov-date", {
            locale: "es",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y", // Formato estándar solicitado: DD/MM/AAAA
            defaultDate: "today",
            disableMobile: "true"
        });
    }, 10);
}

function renderDashboard() {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');

    // Filtramos movimientos que ocurrieron HOY (basado en la fecha de operación YYYY-MM-DD)
    const todayMovements = state.movements.filter(m => {
        const mDate = new Date(m.fecha_operacion);
        const mDateStr = mDate.getFullYear() + '-' + (mDate.getMonth() + 1).toString().padStart(2, '0') + '-' + mDate.getDate().toString().padStart(2, '0');
        return mDateStr === todayStr;
    });

    const totalEntradas = todayMovements.filter(m => m.tipo === 'entrada').length;
    const totalSalidas = todayMovements.filter(m => m.tipo === 'salida').length;

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span>Entradas Hoy</span>
                <h4>${totalEntradas}</h4>
            </div>
            <div class="stat-card">
                <span>Salidas Hoy</span>
                <h4>${totalSalidas}</h4>
            </div>
        </div>

        <div class="section-title">
            <span>Actividad del Día</span>
            <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600; cursor: pointer;" onclick="renderActiveView('historial')">Historial</span>
        </div>

        <div class="history-card">
            ${todayMovements.length === 0
            ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 25px; font-style: italic;">Sin movimientos hoy.</p>'
            : todayMovements.sort((a, b) => new Date(b.fecha_operacion) - new Date(a.fecha_operacion)).map(m => {
                const material = state.materials.find(mat => mat.id === m.material_id);
                return `
                    <div class="movement-row">
                        <div class="mov-info">
                            <h5>${material ? material.nombre : 'Material'}</h5>
                            <p>${new Date(m.fecha_operacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div class="mov-val ${m.tipo === 'entrada' ? 'val-in' : 'val-out'}">
                            ${m.tipo === 'entrada' ? '+' : '-'}${m.cantidad} ${m.unidad}
                        </div>
                    </div>`;
            }).join('')
        }
        </div>

        <div class="section-title"><span>Acciones Rápidas</span></div>
        <div class="action-grid">
            <div class="action-btn" onclick="renderActiveView('entrada')">
                <i class="fa-solid fa-truck-ramp-box" style="color: #10b981;"></i>
                <span>Cargar Entrada</span>
            </div>
            <div class="action-btn" onclick="renderActiveView('salida')">
                <i class="fa-solid fa-dolly" style="color: #f43f5e;"></i>
                <span>Registrar Salida</span>
            </div>
            <div class="action-btn" onclick="renderActiveView('materiales')">
                <i class="fa-solid fa-list-check" style="color: #6366f1;"></i>
                <span>Ver Inventario</span>
            </div>
            <div class="action-btn" onclick="exportToExcel()">
                <i class="fa-solid fa-file-export" style="color: #19833cff;"></i>
                <span>Generar Reporte</span>
            </div>
        </div>
        
        <button class="btn btn-outline" style="margin-top: 1.5rem;" onclick="syncData()">
            <i class="fa-solid fa-sync"></i> Sincronizar Nube
        </button>
    `;
}

function renderMaterials() {
    return `
        <div class="section-title">
            <span>Catálogo de Obra</span>
            <button class="btn btn-primary" style="width: auto; padding: 8px 16px; font-size: 0.8rem; margin: 0;" onclick="renderActiveView('nuevo-material')">
                <i class="fa-solid fa-plus"></i> Nuevo
            </button>
        </div>

        <div class="history-card">
            ${state.materials.length === 0
            ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 30px;">Sin materiales registrados.</p>'
            : state.materials.map(m => `
                    <div class="movement-row" style="cursor: pointer;" onclick="state.activeMaterialId = '${m.id}'; renderActiveView('detalle-material');">
                        <div class="mov-info">
                            <h5>${m.nombre}</h5>
                            <p>Unidades: ${m.unidad_principal}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="mov-val" style="color: var(--primary);">
                                ${m.stock_actual} ${m.unidad_principal}
                            </div>
                            <i class="fa-solid fa-chevron-right" style="color: #cbd5e1; font-size: 0.8rem;"></i>
                        </div>
                    </div>
                `).join('')
        }
        </div>

        <button class="btn btn-outline" style="margin-top: 1.5rem;" onclick="renderActiveView('home')">
            <i class="fa-solid fa-arrow-left"></i> Volver al Dashboard
        </button>
    `;
}

function renderMaterialDetail(matId) {
    const material = state.materials.find(m => m.id === matId);
    if (!material) return renderMaterials();

    const movements = state.movements.filter(m => m.material_id === matId);

    return `
        <div class="section-title"><span>Detalle: ${material.nombre}</span></div>
        <div class="stat-card" style="margin-bottom: 2rem; border-left: 5px solid var(--primary);">
            <span>Saldo en Obra</span>
            <h4 style="color: var(--primary);">${material.stock_actual} ${material.unidad_principal}</h4>
        </div>

        <div class="section-title"><span>Historial Específico</span></div>
        <div class="history-card">
            ${movements.length === 0
            ? '<p style="text-align: center; padding: 25px;">No hay movimientos todavía.</p>'
            : movements.sort((a, b) => new Date(b.fecha_operacion) - new Date(a.fecha_operacion)).map(m => `
                    <div class="movement-row">
                        <div class="mov-info">
                            <h5>${m.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'}</h5>
                            <p>${new Date(m.fecha_operacion).toLocaleDateString()} - ${new Date(m.fecha_operacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            ${m.nota ? `<p style="font-size: 0.75rem; color: var(--text-muted); padding-top: 4px;">Nota: ${m.nota}</p>` : ''}
                        </div>
                        <div class="mov-val ${m.tipo === 'entrada' ? 'val-in' : 'val-out'}">
                            ${m.tipo === 'entrada' ? '+' : '-'}${m.cantidad} ${m.unidad}
                        </div>
                    </div>
                `).join('')
        }
        </div>

        <div style="margin-top: 2rem; display: flex; gap: 10px;">
            <button class="btn btn-outline" onclick="renderActiveView('materiales')">
                <i class="fa-solid fa-arrow-left"></i> Volver
            </button>
            <button class="btn btn-primary" onclick="renderActiveView('entrada')">Entrada</button>
        </div>
    `;
}

function renderMaterialForm() {
    return `
        <div class="section-title"><span>Nuevo Material</span></div>
        <div class="auth-card" style="margin-bottom: 2rem; animation: none;">
            <form id="material-form" onsubmit="handleMaterialSubmit(event)">
                <div class="form-group">
                    <label>Nombre del Material</label>
                    <input type="text" id="mat-name" placeholder="Ej: Varilla 1/2" required>
                </div>
                <div class="form-group">
                    <label>Unidad (bultos, kg, m3...)</label>
                    <input type="text" id="mat-unit" placeholder="Ej: unidades" required>
                </div>
                <div class="form-group">
                    <label>Stock Inicial</label>
                    <input type="number" id="mat-qty" value="0" min="0" step="any">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 1rem;">
                    <button type="button" class="btn btn-outline" onclick="renderActiveView('materiales')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Crear Material</button>
                </div>
            </form>
        </div>
    `;
}

function renderMovementForm(type) {
    const isEntry = type === 'entrada';
    if (state.materials.length === 0) return renderMaterials();

    return `
        <div class="section-title"><span>${isEntry ? 'Cargar Entrada' : 'Registrar Salida'}</span></div>
        <div class="auth-card" style="margin-bottom: 2rem; animation: none;">
            <form id="movement-form" onsubmit="handleMovementSubmit(event, '${type}')">
                <div class="form-group">
                    <label>Material</label>
                    <select id="mov-mat-id" required style="width: 100%; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; font-family: inherit;">
                        ${state.materials.map(m => `<option value="${m.id}">${m.nombre} (${m.unidad_principal})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" id="mov-qty" placeholder="0" min="1" step="any" required>
                </div>
                <div class="form-group">
                    <label>Fecha de Operación</label>
                    <input type="text" id="mov-date" placeholder="Seleccione fecha" required>
                </div>
                <div class="form-group">
                    <label>Observación</label>
                    <input type="text" id="mov-note" placeholder="Nota opcional">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 1rem;">
                    <button type="button" class="btn btn-outline" onclick="renderActiveView('home')">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="background: ${isEntry ? '#10b981' : '#f43f5e'}">
                        Confirmar ${isEntry ? 'Entrada' : 'Salida'}
                    </button>
                </div>
            </form>
        </div>
    `;
}

function renderHistory() {
    return `
        <div class="section-title">
            <span>Archivo Operativo</span>
            <button class="btn btn-primary" style="width: auto; padding: 8px 16px; font-size: 0.8rem; margin: 0; background-color: #f59e0b;" onclick="exportToExcel()">
                <i class="fa-solid fa-file-excel"></i> Exportar
            </button>
        </div>
        <div class="history-card" style="padding: 0;">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                    <thead><tr style="background: rgba(0,0,0,0.05); text-align: left;"><th style="padding: 12px;">Fecha</th><th style="padding: 12px;">Material</th><th style="padding: 12px;">Tipo</th><th style="padding: 12px;">Cant.</th></tr></thead>
                    <tbody>
                         ${state.movements.slice().sort((a, b) => new Date(b.fecha_operacion) - new Date(a.fecha_operacion)).map(m => {
        const material = state.materials.find(mat => mat.id === m.material_id);
        return `
                            <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                                <td style="padding: 12px; color: var(--text-main); font-weight: 500;">${new Date(m.fecha_operacion).toLocaleDateString()}</td>
                                <td style="padding: 12px; color: var(--text-head); font-weight: 700;">${material ? material.nombre : 'Desconocido'}</td>
                                <td style="padding: 12px; color: ${m.tipo === 'entrada' ? '#059669' : '#e11d48'}; font-weight: 800;">${m.tipo.toUpperCase()}</td>
                                <td style="padding: 12px; font-weight: 800; color: var(--text-head);">${m.cantidad} ${m.unidad}</td>
                            </tr>`;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-outline" onclick="renderActiveView('home')">
                <i class="fa-solid fa-arrow-left"></i> Volver al Dashboard
            </button>
            <button class="btn" style="background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); font-size: 0.8rem;" onclick="handleResetInventory()">
                <i class="fa-solid fa-broom"></i> Cierre de Período (Limpiar Todo)
            </button>
        </div>
    `;
}

// --- LÓGICA DE ENVÍO A LA NUBE ---
async function handleMaterialSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('mat-name').value;
    const unidad = document.getElementById('mat-unit').value;
    const qty = Number(document.getElementById('mat-qty').value);

    state.isLoading = true;
    renderActiveView('materiales');

    const { data, error } = await _supabase
        .from('materiales')
        .insert([{ nombre, unidad_principal: unidad, stock_actual: 0 }])
        .select();

    if (error) {
        showModal({
            title: "Error",
            message: "Error creando material: " + error.message,
            icon: "fa-solid fa-xmark-circle",
            iconColor: "#f43f5e"
        });
    } else if (qty > 0) {
        // Registrar stock inicial como entrada
        await _supabase.from('movimientos').insert([{
            material_id: data[0].id,
            tipo: 'entrada',
            cantidad: qty,
            unidad: unidad,
            fecha_operacion: new Date().toISOString(),
            nota: 'Inventario Inicial'
        }]);
    }

    await syncData();
}

async function handleMovementSubmit(e, tipo) {
    e.preventDefault();
    const material_id = document.getElementById('mov-mat-id').value;
    const cantidad = Number(document.getElementById('mov-qty').value);
    const fecha = document.getElementById('mov-date').value;
    const nota = document.getElementById('mov-note').value;

    const material = state.materials.find(m => m.id === material_id);

    // Si la fecha seleccionada es HOY, usamos la hora actual exacta para que el orden sea perfecto.
    // Si es otra fecha, usamos mediodía (12:00) para evitar problemas de zona horaria.
    const now = new Date();
    const isToday = new Date(fecha).toLocaleDateString() === now.toLocaleDateString();
    const fecha_operacion = isToday ? now.toISOString() : new Date(fecha + 'T12:00:00').toISOString();

    state.isLoading = true;
    renderActiveView('home');

    const { error } = await _supabase
        .from('movimientos')
        .insert([{ material_id, tipo, cantidad, unidad: material.unidad_principal, nota, fecha_operacion }]);

    if (error) {
        showModal({
            title: "Error",
            message: "Error al registrar movimiento: " + error.message,
            icon: "fa-solid fa-circle-xmark",
            iconColor: "#f43f5e"
        });
    }
    await syncData();
}

function exportToExcel() {
    if (state.movements.length === 0) {
        showModal({
            title: "Sin Datos",
            message: "No hay movimientos registrados para exportar.",
            icon: "fa-solid fa-circle-info",
            iconColor: "#f59e0b"
        });
        return;
    }
    let csv = "\uFEFFFecha;Hora;Material;Tipo;Cantidad;Unidad;Nota\n";
    state.movements.forEach(m => {
        const material = state.materials.find(mat => mat.id === m.material_id);
        const d = new Date(m.fecha_operacion);
        csv += `${d.toLocaleDateString()};${d.toLocaleTimeString()};"${material ? material.nombre : ''}";${m.tipo.toUpperCase()};${m.cantidad};${m.unidad};"${m.nota || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Inventario_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function handleResetInventory() {
    const confirm1 = await showModal({
        title: "Cierre de Período",
        message: "⚠️ ATENCIÓN: Se descargará el reporte y se BORRARÁ todo el historial de movimientos. Los stocks volverán a 0.",
        icon: "fa-solid fa-triangle-exclamation",
        type: "confirm",
        confirmText: "Continuar",
        danger: true
    });
    if (!confirm1) return;

    const confirm2 = await showModal({
        title: "¿Realmente Seguro?",
        message: "🚨 Esta acción es definitiva y no se puede deshacer.",
        icon: "fa-solid fa-circle-exclamation",
        type: "confirm",
        confirmText: "BORRAR TODO",
        danger: true
    });
    if (!confirm2) return;

    state.isLoading = true;
    renderActiveView('historial');

    try {
        // 1. Exportar reporte automáticamente antes de borrar
        exportToExcel();

        // 2. Borrar todos los movimientos
        const { error: errMov } = await _supabase
            .from('movimientos')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // hack para borrar todo

        if (errMov) throw errMov;

        // 3. Resetear todos los stocks a 0
        const { error: errMat } = await _supabase
            .from('materiales')
            .update({ stock_actual: 0 })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (errMat) throw errMat;

        showModal({
            title: "¡Éxito!",
            message: "Inventario reseteado con éxito. Se ha descargado el reporte final.",
            icon: "fa-solid fa-check-circle",
            iconColor: "#10b981"
        });
    } catch (error) {
        console.error(error);
        showModal({
            title: "Error",
            message: error.message,
            icon: "fa-solid fa-xmark-circle",
            iconColor: "#f43f5e"
        });
    } finally {
        await syncData();
    }
}

// --- SISTEMA DE MODALES PREMIUM ---
function showModal({ title, message, icon, iconColor, type = 'alert', confirmText = 'Aceptar', cancelText = 'Cancelar', danger = false }) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        const iconDiv = document.getElementById('modal-icon');
        const titleH3 = document.getElementById('modal-title');
        const messageP = document.getElementById('modal-message');
        const buttonsDiv = document.getElementById('modal-buttons');

        iconDiv.innerHTML = `<i class="${icon}" style="color: ${iconColor || (danger ? '#f43f5e' : 'var(--primary)')}"></i>`;
        titleH3.innerText = title;
        messageP.innerText = message;

        buttonsDiv.innerHTML = '';

        if (type === 'confirm') {
            const btnCancel = document.createElement('button');
            btnCancel.className = 'btn modal-cancel-btn';
            btnCancel.innerText = cancelText;
            btnCancel.onclick = () => { overlay.classList.add('hidden'); resolve(false); };
            buttonsDiv.appendChild(btnCancel);
        }

        const btnConfirm = document.createElement('button');
        btnConfirm.className = `btn ${danger ? 'modal-danger-btn' : 'modal-confirm-btn'}`;
        btnConfirm.innerText = confirmText;
        btnConfirm.onclick = () => { overlay.classList.add('hidden'); resolve(true); };
        buttonsDiv.appendChild(btnConfirm);

        overlay.classList.remove('hidden');
    });
}

// --- INICIALIZACIÓN ---
async function start() {
    const success = await setupSupabase();
    if (success) {
        initApp();
    }
}

start();
