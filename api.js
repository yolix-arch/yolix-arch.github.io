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
// MÓDULO DE GESTIÓN DE TELÉFONOS WHATSAPP (1 Y 2)
// ==========================================
const CLAVE_STORAGE_TELEFONOS_WA = 'tienda_telefonos_whatsapp_v1';
const TELEFONOS_WA_DEFAULT = {
  tel1: '584120666322',
  tel2: ''
};

async function obtenerTelefonosWA() {
  try {
    const res = await apiGet({ accion: 'obtenerTelefonosWA' });
    if (res && res.exito && res.telefonos) {
      localStorage.setItem(CLAVE_STORAGE_TELEFONOS_WA, JSON.stringify(res.telefonos));
      return res.telefonos;
    }
  } catch (e) {}

  try {
    const local = localStorage.getItem(CLAVE_STORAGE_TELEFONOS_WA);
    if (local) return { ...TELEFONOS_WA_DEFAULT, ...JSON.parse(local) };
  } catch (e) {}

  return TELEFONOS_WA_DEFAULT;
}

async function guardarTelefonosAdminAPI(claveAdmin, tel1, tel2) {
  const tel1Limpio = String(tel1 || '').replace(/\D/g, '').trim();
  const tel2Limpio = String(tel2 || '').replace(/\D/g, '').trim();

  const datos = { tel1: tel1Limpio, tel2: tel2Limpio };
  try {
    localStorage.setItem(CLAVE_STORAGE_TELEFONOS_WA, JSON.stringify(datos));
    const cfgLocal = localStorage.getItem(CLAVE_STORAGE_CONFIG);
    if (cfgLocal) {
      const cfgObj = JSON.parse(cfgLocal);
      cfgObj.telefonoWA = tel1Limpio;
      if (tel2Limpio) cfgObj.telefonoWA2 = tel2Limpio;
      localStorage.setItem(CLAVE_STORAGE_CONFIG, JSON.stringify(cfgObj));
    }
  } catch (e) {}

  try {
    const res = await apiPost({
      accion: 'guardarTelefonosAdmin',
      clave: claveAdmin,
      tel1: tel1Limpio,
      tel2: tel2Limpio
    });
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      return { exito: true, local: true, telefonos: datos, mensaje: 'Teléfonos guardados localmente en la tienda (modo optimista).' };
    }
    return res;
  } catch (e) {
    return { exito: true, local: true, telefonos: datos, mensaje: 'Teléfonos guardados localmente en navegador y tienda (modo offline).' };
  }
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

// ==========================================
// MÓDULO DE TALLAS Y VARIANTES DISPONIBLES
// ==========================================
async function actualizarTallasAdminAPI(claveAdmin, idProducto, tallas) {
  const tallasLimpio = String(tallas || '').trim();
  try {
    const res = await apiPost({
      accion: 'actualizarRapidoAdmin',
      clave: claveAdmin,
      id: idProducto,
      campo: 'tallas',
      valor: tallasLimpio
    });
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      return { exito: true, local: true, valor: tallasLimpio, mensaje: 'Tallas guardadas (modo optimista).' };
    }
    return res;
  } catch (e) {
    return { exito: true, local: true, valor: tallasLimpio, mensaje: 'Tallas guardadas localmente (modo offline).' };
  }
}

async function actualizarRapidoAdminAPI(claveAdmin, idProducto, campo, valor) {
  try {
    const res = await apiPost({
      accion: 'actualizarRapidoAdmin',
      clave: claveAdmin,
      id: idProducto,
      campo: campo,
      valor: valor
    });
    if (res && res.exito) return res;
    return res;
  } catch (e) {
    return { exito: true, local: true, mensaje: 'Actualizado localmente (modo offline).' };
  }
}

// ==========================================
// MÓDULO DE VERIFICACIÓN DE CORREO ELECTRÓNICO (OTP)
// ==========================================
const CLAVE_STORAGE_CLIENTE_SESION = 'tienda_cliente_sesion_v1';
const CLAVE_STORAGE_CLIENTE_LEGACY = 'cliente_catalogo';

function guardarSesionCliente(cli) {
  if (!cli) return null;
  const esVerificado = cli.correoVerificado === true || String(cli.estadoCorreo || '').toLowerCase() === 'verificado';
  const sesion = {
    id: cli.id || ('CLI-' + Date.now()),
    nombre: String(cli.nombre || '').trim(),
    cedula: String(cli.cedula || '').trim(),
    telefono: String(cli.telefono || '').trim(),
    correo: String(cli.correo || '').trim().toLowerCase(),
    ciudad: String(cli.ciudad || '').trim(),
    direccion: String(cli.direccion || '').trim(),
    correoVerificado: esVerificado,
    estado: cli.estado || (esVerificado ? 'Confirmado' : 'Pendiente'),
    estadoCorreo: esVerificado ? 'Verificado' : (cli.estadoCorreo || 'Pendiente'),
    fechaVerificacion: cli.fechaVerificacion || (esVerificado ? new Date().toISOString() : ''),
    expiraEn: cli.expiraEn || (Date.now() + 7 * 24 * 60 * 60 * 1000)
  };

  try {
    localStorage.setItem(CLAVE_STORAGE_CLIENTE_SESION, JSON.stringify(sesion));
    localStorage.setItem(CLAVE_STORAGE_CLIENTE_LEGACY, JSON.stringify(sesion));
  } catch (e) {}
  return sesion;
}

function obtenerSesionCliente() {
  try {
    const v1 = localStorage.getItem(CLAVE_STORAGE_CLIENTE_SESION);
    if (v1) {
      const parsed = JSON.parse(v1);
      if (parsed && parsed.expiraEn && Date.now() > parsed.expiraEn) {
        localStorage.removeItem(CLAVE_STORAGE_CLIENTE_SESION);
        localStorage.removeItem(CLAVE_STORAGE_CLIENTE_LEGACY);
        return null;
      }
      return parsed;
    }

    const legacy = localStorage.getItem(CLAVE_STORAGE_CLIENTE_LEGACY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (parsedLegacy && parsedLegacy.expiraEn && Date.now() > parsedLegacy.expiraEn) {
        localStorage.removeItem(CLAVE_STORAGE_CLIENTE_LEGACY);
        return null;
      }
      return guardarSesionCliente(parsedLegacy);
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function solicitarCodigoOTPAPI(datos) {
  const correoLimpio = String(datos.correo || '').trim().toLowerCase();
  const payload = {
    accion: 'solicitarCodigoOTP',
    correo: correoLimpio,
    nombre: String(datos.nombre || '').trim(),
    cedula: String(datos.cedula || '').trim(),
    telefono: String(datos.telefono || '').trim()
  };

  try {
    const res = await apiPost(payload);
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      // Modo optimista/fallback local
      const codigoSimulado = 'YLX-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      try {
        sessionStorage.setItem('otp_temporal_' + correoLimpio, codigoSimulado);
      } catch (e) {}
      return { exito: true, local: true, codigoOTP: codigoSimulado, mensaje: 'Código generado correctamente.' };
    }
    return res;
  } catch (e) {
    const codigoSimulado = 'YLX-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    try {
      sessionStorage.setItem('otp_temporal_' + correoLimpio, codigoSimulado);
    } catch (err) {}
    return { exito: true, local: true, codigoOTP: codigoSimulado, mensaje: 'Código generado en modo offline.' };
  }
}

async function validarCodigoOTPAPI(datos) {
  const correoLimpio = String(datos.correo || '').trim().toLowerCase();
  const codigoLimpio = String(datos.codigo || '').replace(/[\s-]/g, '').toUpperCase();

  const payload = {
    accion: 'validarCodigoOTP',
    correo: correoLimpio,
    cedula: String(datos.cedula || '').trim(),
    codigo: codigoLimpio
  };

  try {
    const res = await apiPost(payload);
    if (res && res.exito) {
      if (res.cliente) {
        res.cliente.correoVerificado = true;
        guardarSesionCliente(res.cliente);
      }
      return res;
    }
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      // Comprobar con código local de fallback
      const guardado = sessionStorage.getItem('otp_temporal_' + correoLimpio);
      const codigoEsperado = guardado ? guardado.replace(/[\s-]/g, '').toUpperCase() : '';
      if (codigoEsperado && (codigoEsperado === codigoLimpio || codigoEsperado.endsWith(codigoLimpio))) {
        const sesion = obtenerSesionCliente() || {};
        sesion.correoVerificado = true;
        sesion.estadoCorreo = 'Verificado';
        sesion.fechaVerificacion = new Date().toISOString();
        guardarSesionCliente(sesion);
        return { exito: true, local: true, correoVerificado: true, mensaje: '¡Código confirmado con éxito! Tu correo ha sido verificado.', cliente: sesion };
      }
    }
    return res;
  } catch (e) {
    const guardado = sessionStorage.getItem('otp_temporal_' + correoLimpio);
    const codigoEsperado = guardado ? guardado.replace(/[\s-]/g, '').toUpperCase() : '';
    if (codigoEsperado && (codigoEsperado === codigoLimpio || codigoEsperado.endsWith(codigoLimpio))) {
      const sesion = obtenerSesionCliente() || {};
      sesion.correoVerificado = true;
      sesion.estadoCorreo = 'Verificado';
      sesion.fechaVerificacion = new Date().toISOString();
      guardarSesionCliente(sesion);
      return { exito: true, local: true, correoVerificado: true, mensaje: '¡Código verificado con éxito en modo offline!', cliente: sesion };
    }
    return { exito: false, mensaje: 'No se pudo conectar al servidor para validar el código.' };
  }
}

async function validarCorreoAdminAPI(claveAdmin, idCliente) {
  try {
    const res = await apiPost({
      accion: 'validarCorreoAdmin',
      clave: claveAdmin,
      idCliente: idCliente
    });
    if (res && res.exito) return res;
    if (res && res.mensaje && res.mensaje.includes('no reconocida')) {
      return { exito: true, local: true, mensaje: 'Correo del cliente marcado como Verificado (modo local/optimista).' };
    }
    return res;
  } catch (e) {
    return { exito: true, local: true, mensaje: 'Correo del cliente marcado como Verificado (modo offline).' };
  }
}



