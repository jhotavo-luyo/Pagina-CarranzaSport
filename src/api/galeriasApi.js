// src/api/galeriasApi.js
// Centraliza las llamadas a la API para la gestión de galerías.

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
// Funciones para la API de Galerías
// =============================================================================

/**
 * Obtiene todas las galerías del backend.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de galerías.
 */
export const getAllGalerias = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/galerias`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener galerías:', error);
        throw error;
    }
};

/**
 * Crea una nueva galería en el backend.
 * @param {object} galeriaData - Los datos de la nueva galería (nombre_galeria, descripcion).
 * @returns {Promise<object>} Una promesa que resuelve con la galería creada.
 */
export const createGaleria = async (galeriaData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/galerias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(galeriaData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear galería:', error);
        throw error;
    }
};

/**
 * Actualiza una galería existente en el backend.
 * @param {string} id_galeria - El ID de la galería a actualizar.
 * @param {object} galeriaData - Los datos actualizados de la galería.
 * @returns {Promise<object>} Una promesa que resuelve con la galería actualizada.
 */
export const updateGaleria = async (id_galeria, galeriaData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/galerias/${id_galeria}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(galeriaData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar galería:', error);
        throw error;
    }
};

/**
 * Elimina una galería del backend.
 * @param {string} id_galeria - El ID de la galería a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteGaleria = async (id_galeria) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/galerias/${id_galeria}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar galería:', error);
        throw error;
    }
};