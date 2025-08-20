// src/api/repuestoImagenesApi.js
// Centraliza las llamadas a la API para la gestión de las relaciones entre repuestos e imágenes.

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
// Funciones para la API de Repuesto_Imagenes
// =============================================================================

/**
 * Obtiene todas las asociaciones entre repuestos e imágenes.
 * @param {string|null} [id_repuesto=null] - Opcional. Filtra por ID de repuesto.
 * @param {string|null} [id_imagen=null] - Opcional. Filtra por ID de imagen.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de asociaciones.
 */
export const getAllRepuestoImagenes = async (id_repuesto = null, id_imagen = null) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/repuesto-imagenes`;
    const params = new URLSearchParams();

    if (id_repuesto) {
        params.append('id_repuesto', id_repuesto);
    }
    if (id_imagen) {
        params.append('id_imagen', id_imagen);
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
        console.error('Error al obtener las asociaciones repuesto-imagen:', error);
        throw error;
    }
};

/**
 * Obtiene una asociación repuesto-imagen específica por su ID.
 * @param {string} id - El ID de la asociación (id_repuesto_imagen).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la asociación.
 */
export const getRepuestoImagenById = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuesto-imagenes/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener la asociación repuesto-imagen con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea una nueva asociación entre un repuesto y una imagen.
 * @param {object} asociacionData - Los datos de la nueva asociación.
 * @param {string} asociacionData.id_repuesto - El ID del repuesto.
 * @param {string} asociacionData.id_imagen - El ID de la imagen.
 * @param {boolean} [asociacionData.es_principal=false] - Si la imagen es la principal para el repuesto.
 * @param {number} [asociacionData.orden=0] - El orden de la imagen.
 * @returns {Promise<object>} Una promesa que resuelve con la asociación creada.
 */
export const createRepuestoImagen = async (asociacionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuesto-imagenes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(asociacionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear la asociación repuesto-imagen:', error);
        throw error;
    }
};

/**
 * Actualiza una asociación repuesto-imagen existente.
 * @param {string} id - El ID de la asociación a actualizar (id_repuesto_imagen).
 * @param {object} asociacionData - Los datos a actualizar.
 * @param {boolean} [asociacionData.es_principal] - El nuevo estado de principal.
 * @param {number} [asociacionData.orden] - El nuevo orden.
 * @returns {Promise<object>} Una promesa que resuelve con la asociación actualizada.
 */
export const updateRepuestoImagen = async (id, asociacionData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuesto-imagenes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(asociacionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar la asociación repuesto-imagen con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina una asociación repuesto-imagen.
 * @param {string} id - El ID de la asociación a eliminar (id_repuesto_imagen).
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteRepuestoImagen = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuesto-imagenes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar la asociación repuesto-imagen con ID ${id}:`, error);
        throw error;
    }
};

// =============================================================================
// Funciones Públicas (sin autenticación)
// =============================================================================

/**
 * Obtiene todas las imágenes asociadas a un repuesto de forma pública.
 * @param {string} id_repuesto - El ID del repuesto.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de asociaciones de imágenes.
 */
export const getPublicRepuestoImagenes = async (id_repuesto) => {
    // No se necesita token para esta ruta pública
    const url = `${API_BASE_URL}/repuesto-imagenes/public/repuesto/${id_repuesto}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return handlePublicResponse(response);
    } catch (error) {
        console.error(`Error al obtener las imágenes públicas para el repuesto con ID ${id_repuesto}:`, error);
        throw error;
    }
};
