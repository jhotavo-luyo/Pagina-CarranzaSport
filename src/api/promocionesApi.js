// src/api/promocionesApi.js
// Centraliza las llamadas a la API para la gestión de promociones.

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
        return {};
    }
    return response.json();
};

// =============================================================================
// Funciones para la API de Promociones
// =============================================================================

/**
 * Obtiene todas las promociones del backend.
 * @param {string} [estado] - Opcional. Filtra promociones por 'activa', 'inactiva', 'finalizada'.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de promociones.
 */
export const getAllPromociones = async (estado = '', titulo = '', categoria = '', page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/promociones`;
    const params = new URLSearchParams();

    params.append('page', page);
    params.append('limit', limit);

    if (estado) {
        params.append('estado', estado);
    }
    if (titulo) { // <-- Añadido parámetro 'titulo'
        params.append('titulo', titulo);
    }
    if (categoria) {
        params.append('categoria', categoria);
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
        console.error('Error al obtener promociones:', error);
        throw error;
    }
};

/**
 * Obtiene las promociones públicas del backend. No requiere autenticación.
 * @param {string} [estado] - Opcional. Filtra por 'activa', 'inactiva'.
 * @param {string} [titulo] - Opcional. Filtra por término de búsqueda en el título.
 * @param {string} [categoria] - Opcional. Filtra por categoría.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de promociones públicas.
 */
export const getPublicPromociones = async (estado = '', titulo = '', categoria = '', page = 1, limit = 20) => {
    // Nota: Esta función no envía token de autenticación.
    let url = `${API_BASE_URL}/promociones/public`;
    const params = new URLSearchParams();

    // Añadimos paginación
    params.append('page', page);
    params.append('limit', limit);

    if (estado) {
        params.append('estado', estado);
    }
    if (titulo) {
        params.append('titulo', titulo);
    }
    if (categoria) {
        params.append('categoria', categoria);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        // No se incluye el header 'Authorization'
        const response = await fetch(url);
        return handleResponse(response); // Reutilizamos el manejador de respuesta
    } catch (error) {
        console.error('Error al obtener promociones públicas:', error);
        throw error;
    }
};
/**
 * Crea una nueva promoción en el backend.
 * @param {object} promocionData - Los datos de la nueva promoción (titulo, descripcion, fecha_inicio, fecha_fin, imagen_promocion, estado).
 * @returns {Promise<object>} Una promesa que resuelve con la promoción creada.
 */
export const createPromocion = async (promocionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/promociones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(promocionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear promoción:', error);
        throw error;
    }
};

/**
 * Actualiza una promoción existente en el backend.
 * @param {string} id_promocion - El ID de la promoción a actualizar.
 * @param {object} promocionData - Los datos actualizados de la promoción.
 * @returns {Promise<object>} Una promesa que resuelve con la promoción actualizada.
 */
export const updatePromocion = async (id_promocion, promocionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/promociones/${id_promocion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(promocionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar promoción:', error);
        throw error;
    }
};

/**
 * Elimina una promoción del backend.
 * @param {string} id_promocion - El ID de la promoción a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deletePromocion = async (id_promocion) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/promociones/${id_promocion}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar promoción:', error);
        throw error;
    }
};