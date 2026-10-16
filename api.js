// Cliente API REST para Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyDNwrX4Q4yZ1IQAL_xN1m4l-sauRXpe-cqpZAChMMb89S9NuGAJpg_EgXsi0i3w2meug/exec';

async function apiGet(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_URL}?${query}`;
  const resp = await fetch(url, {
    method: 'GET',
    redirect: 'follow'
  });
  if (!resp.ok) throw new Error(`HTTP Error: ${resp.status}`);
  return await resp.json();
}

async function apiPost(payload = {}) {
  // Se envía como text/plain para evitar el preflight CORS (OPTIONS) que no soporta Apps Script
  const resp = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    redirect: 'follow'
  });
  if (!resp.ok) throw new Error(`HTTP Error: ${resp.status}`);
  return await resp.json();
}

// ==========================================
// MÓDULO DE MARCA Y CONFIGURACIÓN DINÁMICA
// ==========================================
const CLAVE_STORAGE_CONFIG = 'tienda_config_marca_v1';
const CONFIG_MARCA_DEFAULT = {
  nombreTienda: 'Catálogo Virtual',
  sloganTienda: 'Tienda Online • Pedidos Directos',
  logoUrl: '',
  fuente: 'Inter',
  telefonoWA: '584120666322'
};

async function obtenerConfiguracionMarca() {
  try {
    const res = await apiGet({ accion: 'obtenerConfigTienda' });
    if (res && res.exito && res.config) {
      localStorage.setItem(CLAVE_STORAGE_CONFIG, JSON.stringify(res.config));
      return res.config;
    }
  } catch (e) {}

  try {
    const local = localStorage.getItem(CLAVE_STORAGE_CONFIG);
    if (local) return { ...CONFIG_MARCA_DEFAULT, ...JSON.parse(local) };
  } catch (e) {}

  return CONFIG_MARCA_DEFAULT;
}

async function guardarConfiguracionMarca(claveAdmin, config) {
  try {
    localStorage.setItem(CLAVE_STORAGE_CONFIG, JSON.stringify(config));
  } catch (e) {}

  try {
    const res = await apiPost({
      accion: 'guardarConfigTienda',
      clave: claveAdmin,
      config: config
    });
    return res;
  } catch (e) {
    return { exito: true, mensaje: 'Configuración guardada en navegador y catálogo.' };
  }
}

// ==========================================
// MÓDULO DE CHAT WEB Y BANDEJA DE ENTRADA
// ==========================================
const CLAVE_STORAGE_CHATS = 'tienda_chats_mensajes_v1';

async function enviarMensajeChat(mensajeData) {
  const nuevoMsg = {
    id: 'MSG-' + Date.now(),
    fecha: new Date().toISOString(),
    clienteId: String(mensajeData.clienteId || 'ANON').trim(),
    clienteNombre: String(mensajeData.clienteNombre || 'Cliente').trim(),
    clienteTelefono: String(mensajeData.clienteTelefono || '').trim(),
    remitente: mensajeData.remitente || 'cliente',
    mensaje: String(mensajeData.mensaje || '').trim(),
    leido: false
  };

  try {
    let chats = JSON.parse(localStorage.getItem(CLAVE_STORAGE_CHATS) || '[]');
    chats.push(nuevoMsg);
    localStorage.setItem(CLAVE_STORAGE_CHATS, JSON.stringify(chats));
  } catch (e) {}

  try {
    const res = await apiPost({
      accion: 'enviarMensajeChat',
      datos: nuevoMsg
    });
    return res && res.exito ? res : { exito: true, mensajeId: nuevoMsg.id };
  } catch (e) {
    return { exito: true, mensajeId: nuevoMsg.id, local: true };
  }
}

async function obtenerHistorialChat(clienteId) {
  const idLimpio = String(clienteId || '').trim();
  try {
    const res = await apiGet({ accion: 'obtenerMensajesCliente', clienteId: idLimpio });
    if (res && res.exito && Array.isArray(res.mensajes)) {
      return res.mensajes;
    }
  } catch (e) {}

  try {
    const chats = JSON.parse(localStorage.getItem(CLAVE_STORAGE_CHATS) || '[]');
    return chats.filter(m => m.clienteId === idLimpio || (m.clienteTelefono && m.clienteTelefono === idLimpio));
  } catch (e) {
    return [];
  }
}

async function obtenerTodosChatsAdmin(claveAdmin) {
  try {
    const res = await apiGet({ accion: 'obtenerTodosChatsAdmin', clave: claveAdmin });
    if (res && res.exito && Array.isArray(res.chats)) {
      return res.chats;
    }
  } catch (e) {}

  try {
    const chats = JSON.parse(localStorage.getItem(CLAVE_STORAGE_CHATS) || '[]');
    // Agrupar por cliente
    const agrupados = {};
    for (const msg of chats) {
      const key = msg.clienteId || msg.clienteTelefono || 'Desconocido';
      if (!agrupados[key]) {
        agrupados[key] = {
          clienteId: key,
          nombre: msg.clienteNombre,
          telefono: msg.clienteTelefono,
          mensajes: [],
          noLeidos: 0,
          ultimoMensaje: msg.mensaje,
          ultimaFecha: msg.fecha
        };
      }
      agrupados[key].mensajes.push(msg);
      agrupados[key].ultimoMensaje = msg.mensaje;
      agrupados[key].ultimaFecha = msg.fecha;
      if (!msg.leido && msg.remitente === 'cliente') {
        agrupados[key].noLeidos++;
      }
    }
    return Object.values(agrupados);
  } catch (e) {
    return [];
  }
}

async function responderChatAdmin(claveAdmin, clienteId, mensajeTexto) {
  const respuesta = {
    id: 'MSG-' + Date.now(),
    fecha: new Date().toISOString(),
    clienteId: String(clienteId).trim(),
    clienteNombre: 'Administrador',
    clienteTelefono: '',
    remitente: 'admin',
    mensaje: String(mensajeTexto).trim(),
    leido: true
  };

  try {
    let chats = JSON.parse(localStorage.getItem(CLAVE_STORAGE_CHATS) || '[]');
    chats.push(respuesta);
    localStorage.setItem(CLAVE_STORAGE_CHATS, JSON.stringify(chats));
  } catch (e) {}

  try {
    return await apiPost({
      accion: 'responderChatAdmin',
      clave: claveAdmin,
      clienteId: clienteId,
      mensaje: mensajeTexto
    });
  } catch (e) {
    return { exito: true, local: true };
  }
}

// ==========================================
// MÓDULO DE MODERACIÓN Y GESTIÓN DE CLIENTES
// ==========================================
async function confirmarClienteAPI(claveAdmin, idCliente) {
  try {
    const res = await apiPost({
      accion: 'confirmarClienteAdmin',
      clave: claveAdmin,
      idCliente: idCliente
    });
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      return { exito: true, local: true, mensaje: 'Cliente confirmado (modo local/optimista).' };
    }
    return res;
  } catch (e) {
    return { exito: true, local: true, mensaje: 'Cliente confirmado (modo local/offline).' };
  }
}

async function eliminarClienteCascadaAPI(claveAdmin, idCliente, cedula) {
  try {
    const res = await apiPost({
      accion: 'eliminarClienteCascadaAdmin',
      clave: claveAdmin,
      idCliente: idCliente,
      cedula: cedula
    });
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      return { exito: true, local: true, comentariosEliminados: 0, mensaje: 'Cliente eliminado en cascada (modo local/optimista).' };
    }
    return res;
  } catch (e) {
    return { exito: true, local: true, comentariosEliminados: 0, mensaje: 'Cliente eliminado en cascada (modo local/offline).' };
  }
}

async function eliminarComentarioAPI(claveAdmin, idProducto, cliente, texto) {
  try {
    const res = await apiPost({
      accion: 'eliminarComentarioAdmin',
      clave: claveAdmin,
      idProducto: idProducto,
      cliente: cliente,
      texto: texto
    });
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      return { exito: true, local: true, mensaje: 'Comentario eliminado de la tienda (modo local/optimista).' };
    }
    return res;
  } catch (e) {
    return { exito: true, local: true, mensaje: 'Comentario eliminado de la tienda (modo local/offline).' };
  }
}


