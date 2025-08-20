// src/api/servicioImagenesApi.js
// Centraliza las llamadas a la API para la gestión de las relaciones entre servicios e imágenes.

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
// Funciones para la API de Servicio_Imagenes
// =============================================================================

/**
 * Obtiene todas las asociaciones entre servicios e imágenes (ruta protegida).
 * @param {string|null} [id_servicio=null] - Opcional. Filtra por ID de servicio.
 * @param {string|null} [id_imagen=null] - Opcional. Filtra por ID de imagen.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de asociaciones.
 */
export const getAllServicioImagenes = async (id_servicio = null, id_imagen = null) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/servicio-imagenes`;
    const params = new URLSearchParams();

    if (id_servicio) params.append('id_servicio', id_servicio);
    if (id_imagen) params.append('id_imagen', id_imagen);

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
        console.error('Error al obtener las asociaciones servicio-imagen:', error);
        throw error;
    }
};

/**
 * Obtiene todas las asociaciones entre servicios e imágenes (ruta pública).
 * @param {string} id_servicio - El ID del servicio.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de asociaciones.
 */
export const getPublicServicioImagenes = async (id_servicio) => {
    // La ruta ahora incluye el ID del servicio
    const url = `${API_BASE_URL}/servicio-imagenes/public/servicio/${id_servicio}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        // Usamos un manejador de respuestas público para consistencia
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al obtener las asociaciones públicas servicio-imagen:', error);
        throw error;
    }
};

/**
 * Obtiene una asociación servicio-imagen específica por su ID.
 * @param {string} id - El ID de la asociación (id_servicio_imagen).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la asociación.
 */
export const getServicioImagenById = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-imagenes/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener la asociación servicio-imagen con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea una nueva asociación entre un servicio y una imagen.
 * @param {object} asociacionData - Los datos de la nueva asociación.
 * @returns {Promise<object>} Una promesa que resuelve con la asociación creada.
 */
export const createServicioImagen = async (asociacionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-imagenes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(asociacionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear la asociación servicio-imagen:', error);
        throw error;
    }
};

/**
 * Actualiza una asociación servicio-imagen existente.
 * @param {string} id - El ID de la asociación a actualizar (id_servicio_imagen).
 * @param {object} asociacionData - Los datos a actualizar.
 * @returns {Promise<object>} Una promesa que resuelve con la asociación actualizada.
 */
export const updateServicioImagen = async (id, asociacionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-imagenes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(asociacionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar la asociación servicio-imagen con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina una asociación servicio-imagen.
 * @param {string} id - El ID de la asociación a eliminar (id_servicio_imagen).
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteServicioImagen = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicio-imagenes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar la asociación servicio-imagen con ID ${id}:`, error);
        throw error;
    }
};