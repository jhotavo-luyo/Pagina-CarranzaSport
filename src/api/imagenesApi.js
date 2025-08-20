// src/api/imagenesApi.js
// Centraliza las llamadas a la API para la gestión de imágenes.

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
// Funciones para la API de Imágenes
// =============================================================================

/**
 * Obtiene todas las imágenes del backend.
 * @param {string|null} [id_galeria=null] - Opcional. Filtra imágenes por ID de galería.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de imágenes.
 */
export const getAllImagenes = async (id_galeria = null) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/imagenes`;
    const params = new URLSearchParams();

    if (id_galeria) {
        params.append('id_galeria', id_galeria);
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
        console.error('Error al obtener imágenes:', error);
        throw error;
    }
};

/**
 * Crea una nueva imagen en el backend.
 * @param {object} imagenData - Los datos de la nueva imagen (id_galeria, nombre_archivo, url_imagen, descripcion).
 * @returns {Promise<object>} Una promesa que resuelve con la imagen creada.
 */
export const createImagen = async (imagenData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/imagenes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(imagenData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear imagen:', error);
        throw error;
    }
};

/**
 * Actualiza una imagen existente en el backend.
 * @param {string} id_imagen - El ID de la imagen a actualizar.
 * @param {object} imagenData - Los datos actualizados de la imagen.
 * @returns {Promise<object>} Una promesa que resuelve con la imagen actualizada.
 */
export const updateImagen = async (id_imagen, imagenData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/imagenes/${id_imagen}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(imagenData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar imagen:', error);
        throw error;
    }
};

/**
 * Elimina una imagen del backend.
 * @param {string} id_imagen - El ID de la imagen a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteImagen = async (id_imagen) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/imagenes/${id_imagen}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        throw error;
    }
};