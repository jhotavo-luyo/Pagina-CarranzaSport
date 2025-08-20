// src/api/solicitudDetalleApi.js
// Centraliza las llamadas a la API para la gestión de detalles de solicitud.

const API_BASE_URL = 'http://localhost:3033/api';

const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
            console.error("Error de autenticación/autorización. Redirigiendo al login...");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            window.location.href = '/';
        }
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    if (response.status === 204) {
        return {}; // No Content
    }
    return response.json();
};

// =============================================================================
// Funciones para la API de Solicitud_Detalle
// =============================================================================

/**
 * Obtiene todos los detalles de solicitud del backend.
 * @param {string|null} [id_solicitud=null] - Opcional. Filtra detalles por ID de la solicitud principal.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de detalles de solicitud.
 */
export const getAllSolicitudDetalle = async (id_solicitud = null) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/solicitud-detalle`; // Asegúrate de que esta ruta coincida con tu backend
    const params = new URLSearchParams();

    if (id_solicitud) {
        params.append('id_solicitud', id_solicitud);
    }

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
        console.error('Error al obtener detalles de solicitud:', error);
        throw error;
    }
};

/**
 * Obtiene un detalle de solicitud específico por su ID.
 * @param {string} id - El ID del detalle de solicitud.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del detalle de solicitud.
 */
export const getSolicitudDetalleById = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle/${id}`, { // Asegúrate de que esta ruta coincida con tu backend
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener detalle de solicitud con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea un nuevo detalle de solicitud.
 * @param {Object} detalleData - Los datos del nuevo detalle (id_solicitud, id_servicio, id_repuesto, cantidad, observaciones).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del detalle creado.
 */
export const createSolicitudDetalle = async (detalleData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle`, { // Asegúrate de que esta ruta coincida con tu backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(detalleData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear detalle de solicitud:', error);
        throw error;
    }
};

/**
 * Actualiza un detalle de solicitud existente.
 * @param {string} id - El ID del detalle de solicitud a actualizar.
 * @param {Object} detalleData - Los datos a actualizar del detalle.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del detalle actualizado.
 */
export const updateSolicitudDetalle = async (id, detalleData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle/${id}`, { // Asegúrate de que esta ruta coincida con tu backend
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(detalleData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar detalle de solicitud con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina un detalle de solicitud por su ID.
 * @param {string} id - El ID del detalle de solicitud a eliminar.
 * @returns {Promise<Object>} Una promesa que resuelve al completar la eliminación.
 */
export const deleteSolicitudDetalle = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/solicitud-detalle/${id}`, { // Asegúrate de que esta ruta coincida con tu backend
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar detalle de solicitud con ID ${id}:`, error);
        throw error;
    }
};