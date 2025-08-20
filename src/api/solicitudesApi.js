// src/api/solicitudesApi.js
// Centraliza las llamadas a la API para la gestión de solicitudes y sus detalles.

// Lee la URL base de la API desde las variables de entorno de Vite.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api'; //! modificado para el deploy 

/**
 * Obtiene el token de autenticación JWT del almacenamiento local.
 * @returns {string|null} El token JWT o null si no se encuentra.
 */
const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
};

/**
 * Maneja la respuesta de una llamada a la API, lanzando un error si la respuesta no es exitosa.
 * Si la respuesta es 401 o 403, redirige al usuario a la página de inicio de sesión.
 * @param {Response} response - La respuesta de la API.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos JSON de la respuesta.
 * @throws {Error} Si la respuesta de la API no es exitosa.
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
            console.error("Error de autenticación/autorización. Redirigiendo al login...");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            window.location.href = '/'; // Redirigir al login
        }
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    if (response.status === 204) {
        return {}; // No Content
    }
    return response.json();
};

// NUEVO: Manejador de respuestas para rutas PÚBLICAS
const handlePublicResponse = async (response) => {
    if (!response.ok) {
        // Para rutas públicas, no redirigimos, solo mostramos el error.
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    if (response.status === 204) {
        // Si no hay contenido, devolvemos un objeto vacío.
        return {};
    }
    return response.json();
};


// =============================================================================
// Funciones para la API de Solicitudes
// =============================================================================

/**
 * Obtiene todas las solicitudes del backend con opciones de filtrado, búsqueda y paginación.
 * @param {string|null} [searchTerm=null] - Opcional. Término de búsqueda para nombre o email del cliente.
 * @param {string|null} [cliente_id=null] - Opcional. Filtra solicitudes por ID de cliente.
 * @param {string|null} [tipo_solicitud=null] - Opcional. Filtra solicitudes por tipo ('cotizacion', 'cita', 'consulta').
 * @param {string|null} [estado_solicitud=null] - Opcional. Filtra solicitudes por estado ('pendiente', 'en_proceso', 'completada', 'rechazada').
 * @param {number} [page=1] - Opcional. Número de página para la paginación.
 * @param {number} [limit=10] - Opcional. Cantidad de elementos por página para la paginación.
 * @returns {Promise<Object>} Una promesa que resuelve con un objeto que contiene la lista de solicitudes, total de elementos y total de páginas.
 */
export const getAllSolicitudes = async (searchTerm = null, cliente_id = null, tipo_solicitud = null, estado_solicitud = null, page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/solicitudes`;
    const params = new URLSearchParams();

    if (searchTerm) {
        params.append('search_term', searchTerm);
    }
    if (cliente_id) {
        params.append('cliente_id', cliente_id);
    }
    if (tipo_solicitud) {
        params.append('tipo_solicitud', tipo_solicitud);
    }
    if (estado_solicitud) {
        params.append('estado_solicitud', estado_solicitud);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        throw error;
    }
};

/**
 * Obtiene una solicitud específica por su ID.
 * @param {string} id - El ID de la solicitud.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la solicitud.
 */
export const getSolicitudById = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener solicitud con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea una nueva solicitud.
 * @param {Object} solicitudData - Los datos de la nueva solicitud (id_cliente, tipo_solicitud, mensaje, estado_solicitud, observaciones_internas).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la solicitud creada.
 */
export const createSolicitud = async (solicitudData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(solicitudData),
        });
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        throw error;
    }
};

/**
 * Actualiza una solicitud existente.
 * @param {string} id - El ID de la solicitud a actualizar.
 * @param {Object} solicitudData - Los datos a actualizar de la solicitud.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la solicitud actualizada.
 */
export const updateSolicitud = async (id, solicitudData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(solicitudData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar solicitud con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina una solicitud por su ID.
 * @param {string} id - El ID de la solicitud a eliminar.
 * @returns {Promise<Object>} Una promesa que resuelve al completar la eliminación.
 */
export const deleteSolicitud = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar solicitud con ID ${id}:`, error);
        throw error;
    }
};

// NUEVO: Obtener estadísticas mensuales de solicitudes
/**
 * Obtiene el conteo de solicitudes por mes de los últimos 12 meses.
 * @returns {Promise<Array<{mes: string, total: number}>>} Una promesa que resuelve con un array de objetos.
 */
export const getSolicitudesStatsMonthly = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/stats/monthly`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener estadísticas mensuales de solicitudes:', error);
        throw error;
    }
};

// NUEVO: Obtener estadísticas por tipo de solicitud
/**
 * Obtiene el conteo de solicitudes agrupadas por tipo.
 * @returns {Promise<Array<{tipo_solicitud: string, total: number}>>} Una promesa que resuelve con un array de objetos.
 */
export const getSolicitudesStatsByType = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/stats/by-type`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener estadísticas por tipo de solicitud:', error);
        throw error;
    }
};

// NUEVO: Obtener estadísticas mensuales de solicitudes por tipo
/**
 * Obtiene el conteo de solicitudes por mes y tipo de los últimos 12 meses.
 * @returns {Promise<Array<{mes: string, tipo_solicitud: string, total: number}>>} Una promesa que resuelve con un array de objetos.
 */
export const getSolicitudesStatsMonthlyByType = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/stats/monthly-by-type`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener estadísticas mensuales por tipo:', error);
        throw error;
    }
};

// NUEVO: Obtener estadísticas por estado para un mes y año específicos
/**
 * Obtiene el conteo de solicitudes por estado para un mes y año dados.
 * @param {number} year - El año a consultar.
 * @param {number} month - El mes a consultar (1-12).
 * @returns {Promise<Array<{estado_solicitud: string, total: number}>>} Una promesa que resuelve con un array de objetos.
 */
export const getSolicitudesStatsByStatus = async (year, month) => {
    const token = getAuthToken();
    const params = new URLSearchParams({ year, month });
    const url = `${API_BASE_URL}/solicitudes/stats/by-status?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener estadísticas por estado:', error);
        throw error;
    }
};

// =============================================================================
// Funciones para la API de SolicitudDetalle (gestionadas dentro de solicitudesApi)
// =============================================================================

/**
 * Obtiene los detalles de una solicitud específica por su ID de solicitud.
 * @param {string} id_solicitud - El ID de la solicitud para la cual obtener los detalles.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de detalles de solicitud.
 */
export const getSolicitudDetallesBySolicitudId = async (id_solicitud) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle?id_solicitud=${id_solicitud}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener detalles para la solicitud con ID ${id_solicitud}:`, error);
        throw error;
    }
};

/**
 * Crea un nuevo detalle de solicitud.
 * @param {string} id_solicitud - El ID de la solicitud principal a la que pertenece el detalle.
 * @param {Object} detalleData - Los datos del nuevo detalle (id_servicio, id_repuesto, cantidad, observaciones).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del detalle creado.
 */
export const createSolicitudDetalle = async (id_solicitud, detalleData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ...detalleData, id_solicitud: parseInt(id_solicitud) }), // Asegura que id_solicitud se envíe y sea un número
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear detalle de solicitud:', error);
        throw error;
    }
};

/**
 * Actualiza un detalle de solicitud existente.
 * @param {string} id_solicitud_detalle - El ID del detalle de solicitud a actualizar.
 * @param {Object} detalleData - Los datos a actualizar del detalle de solicitud.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del detalle actualizado.
 */
export const updateSolicitudDetalle = async (id_solicitud_detalle, detalleData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle/${id_solicitud_detalle}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(detalleData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar detalle de solicitud con ID ${id_solicitud_detalle}:`, error);
        throw error;
    }
};

/**
 * Elimina un detalle de solicitud por su ID.
 * @param {string} id_solicitud_detalle - El ID del detalle de solicitud a eliminar.
 * @returns {Promise<Object>} Una promesa que resuelve al completar la eliminación.
 */
export const deleteSolicitudDetalle = async (id_solicitud_detalle) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle/${id_solicitud_detalle}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar detalle de solicitud con ID ${id_solicitud_detalle}:`, error);
        throw error;
    }
};


// =============================================================================
// Funciones Públicas (sin autenticación)
// ======================================================================= ======
/**
 * Crea una nueva solicitud desde un formulario público (ej. contacto de repuesto).
 * No requiere token de autenticación.
 * @param {Object} solicitudData - Los datos de la nueva solicitud (nombre_completo, email, telefono, mensaje_usuario, id_repuesto, etc.).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la solicitud creada.
 */
export const createPublicaSolicitud = async (solicitudData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/publica`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // No se incluye 'Authorization' porque es una ruta pública
            },
            body: JSON.stringify(solicitudData),
        });
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al crear solicitud pública:', error);
        throw error;
    }
};

/**
 * Crea una nueva solicitud desde el formulario de contacto general.
 * No requiere token de autenticación.
 * @param {Object} contactData - Los datos del formulario (nombre_completo, email, telefono, mensaje_usuario).
 * @returns {Promise<Object>} Una promesa que resuelve con la confirmación.
 */
export const createGeneralContactRequest = async (contactData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/solicitudes/contacto-general`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData),
        });
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al crear solicitud de contacto general:', error);
        throw error;
    }
};
