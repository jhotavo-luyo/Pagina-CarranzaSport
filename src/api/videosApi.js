// src/api/videosApi.js
// Centraliza las llamadas a la API para la gestión de videos.

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
// Funciones para la API de Videos
// =============================================================================

/**
 * Obtiene todos los videos del backend.
 * @param {string} [estado=''] - Opcional. Filtra videos por 'activo', 'inactivo'.
 * @param {string|null} [id_galeria=null] - Opcional. Filtra videos por ID de galería.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de videos.
 */
export const getAllVideos = async (estado = '', id_galeria = null) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/videos`;
    const params = new URLSearchParams();

    if (estado) {
        params.append('estado', estado);
    }
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
        console.error('Error al obtener videos:', error);
        throw error;
    }
};

/**
 * Crea un nuevo video en el backend.
 * @param {object} videoData - Los datos del nuevo video (id_galeria, titulo, url_video, url_thumbnail, duracion_segundos, descripcion, estado).
 * @returns {Promise<object>} Una promesa que resuelve con el video creado.
 */
export const createVideo = async (videoData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(videoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear video:', error);
        throw error;
    }
};

/**
 * Actualiza un video existente en el backend.
 * @param {string} id_video - El ID del video a actualizar.
 * @param {object} videoData - Los datos actualizados del video.
 * @returns {Promise<object>} Una promesa que resuelve con el video actualizado.
 */
export const updateVideo = async (id_video, videoData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/videos/${id_video}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(videoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar video:', error);
        throw error;
    }
};

/**
 * Elimina un video del backend.
 * @param {string} id_video - El ID del video a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteVideo = async (id_video) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/videos/${id_video}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar video:', error);
        throw error;
    }
};