// src/api/servicioVideosApi.js
// Centraliza las llamadas a la API para la gestión de las relaciones entre servicios y videos.

// Lee la URL base de la API desde las variables de entorno de Vite.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api'; //! modificado para el deploy 

// Función para obtener el token JWT del almacenamiento local.
const getAuthToken = () => {
    return localStorage.getItem('jwt_token') || '';
};

// Función para manejar respuestas de la API y errores.
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) {
            console.error("Error de autenticación/autorización. Redirigiendo al login...");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            window.location.href = '/'; // Redirige al login
        }
        // Lanza un error con el mensaje del backend o un mensaje genérico
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    // Si la respuesta es 204 No Content, devuelve un objeto vacío en lugar de intentar parsear JSON
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
        // Si no hay contenido, devolvemos un array vacío, que es lo que espera la galería.
        return [];
    }
    return response.json();
};

// =============================================================================
// Funciones para la API de Servicio_Videos
// =============================================================================

/**
 * Obtiene todas las asociaciones entre servicios y videos (ruta protegida).
 * @param {string|null} [id_servicio=null] - Opcional. Filtra por ID de servicio.
 * @param {string|null} [id_video=null] - Opcional. Filtra por ID de video.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de asociaciones.
 */
export const getAllServicioVideos = async (id_servicio = null, id_video = null) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/servicio-videos`;
    const params = new URLSearchParams();

    if (id_servicio) params.append('id_servicio', id_servicio);
    if (id_video) params.append('id_video', id_video);

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
        console.error('Error al obtener las asociaciones servicio-video:', error);
        throw error;
    }
};

/**
 * Obtiene todas las asociaciones entre servicios y videos (ruta pública).
 * @param {string} id_servicio - El ID del servicio.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de asociaciones.
 */
export const getPublicServicioVideos = async (id_servicio) => {
    // La ruta ahora incluye el ID del servicio
    const url = `${API_BASE_URL}/servicio-videos/public/servicio/${id_servicio}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        // Usamos un manejador de respuestas público para consistencia
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al obtener las asociaciones públicas servicio-video:', error);
        throw error;
    }
};

/**
 * Obtiene una asociación servicio-video específica por su ID.
 * @param {string} id - El ID de la asociación (id_servicio_video).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la asociación.
 */
export const getServicioVideoById = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-videos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener la asociación servicio-video con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea una nueva asociación entre un servicio y un video.
 * @param {object} asociacionData - Los datos de la nueva asociación.
 * @returns {Promise<object>} Una promesa que resuelve con la asociación creada.
 */
export const createServicioVideo = async (asociacionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(asociacionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear la asociación servicio-video:', error);
        throw error;
    }
};

/**
 * Actualiza una asociación servicio-video existente.
 * @param {string} id - El ID de la asociación a actualizar (id_servicio_video).
 * @param {object} asociacionData - Los datos a actualizar.
 * @returns {Promise<object>} Una promesa que resuelve con la asociación actualizada.
 */
export const updateServicioVideo = async (id, asociacionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-videos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(asociacionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar la asociación servicio-video con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina una asociación servicio-video.
 * @param {string} id - El ID de la asociación a eliminar (id_servicio_video).
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteServicioVideo = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-videos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar la asociación servicio-video con ID ${id}:`, error);
        throw error;
    }
};
