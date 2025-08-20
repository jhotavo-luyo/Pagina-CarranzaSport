// src/api/categoriasServiciosApi.js
// Centraliza las llamadas a la API para la gestión de categorías de servicios.

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

// NUEVO: Manejador de respuestas para rutas PÚBLICAS
const handlePublicResponse = async (response) => {
    if (!response.ok) {
        // Para rutas públicas, no redirigimos, solo mostramos el error.
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    if (response.status === 204) {
        // Si no hay contenido, devolvemos un array vacío.
        return [];
    }
    return response.json();
};


// =============================================================================
// Funciones para la API de Categorías de Servicios
// =============================================================================

/**
 * Obtiene todas las categorías de servicios del backend.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de categorías.
 */
export const getAllServiceCategories = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-servicios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener categorías de servicios:', error);
        throw error;
    }
};

/**
 * Obtiene todas las categorías de servicios de forma pública.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de categorías.
 */
export const getPublicServiceCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-servicios/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return handlePublicResponse(response); // Usamos el manejador público
    } catch (error) {
        console.error('Error al obtener categorías de servicios públicas:', error);
        throw error;
    }
};


/**
 * Crea una nueva categoría de servicio en el backend.
 * @param {object} categoryData - Los datos de la nueva categoría (nombre_categoria, descripcion).
 * @returns {Promise<object>} Una promesa que resuelve con la categoría creada.
 */
export const createServiceCategory = async (categoryData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-servicios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear categoría de servicio:', error);
        throw error;
    }
};

/**
 * Actualiza una categoría de servicio existente en el backend.
 * @param {string} id_categoria_servicio - El ID de la categoría a actualizar.
 * @param {object} categoryData - Los datos actualizados de la categoría.
 * @returns {Promise<object>} Una promesa que resuelve con la categoría actualizada.
 */
export const updateServiceCategory = async (id_categoria_servicio, categoryData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-servicios/${id_categoria_servicio}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar categoría de servicio:', error);
        throw error;
    }
};

/**
 * Elimina una categoría de servicio del backend.
 * @param {string} id_categoria_servicio - El ID de la categoría a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteServiceCategory = async (id_categoria_servicio) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-servicios/${id_categoria_servicio}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar categoría de servicio:', error);
        throw error;
    }
};
