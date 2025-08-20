// src/api/repuestosApi.js
// Centraliza las llamadas a la API para la gestión de repuestos y categorías de repuestos.

// Lee la URL base de la API desde las variables de entorno de Vite.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api'; //! modificado para el deploy 

const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
};

// Manejador de respuestas para rutas PROTEGIDAS
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
        return {}; // Para DELETE, etc.
    }
    return response.json();
};

// NUEVO: Manejador de respuestas para rutas PÚBLICAS
const handlePublicResponse = async (response) => {
    if (!response.ok) {
        // Para rutas públicas, no redirigimos, solo mostramos el error.
        // Usamos .catch() por si la respuesta de error no es un JSON válido (ej. un 404 de HTML).
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    if (response.status === 204) {
        // Si no hay contenido, devolvemos un objeto con una estructura de datos vacía esperada.
        return { data: [], totalPages: 0, currentPage: 1 };
    }
    return response.json();
};


// =============================================================================
// Funciones para la API de Repuestos
// =============================================================================

/**
 * Obtiene todos los repuestos del backend.
 * @param {string} [estado] - Opcional. Filtra repuestos por 'disponible', 'agotado', 'descontinuado'.
 * @param {number} [id_categoria] - Opcional. Filtra repuestos por ID de categoría.
 * @param {string} [marca] - Opcional. Filtra repuestos por marca.
 * @param {string} [nombre] - Opcional. Filtra repuestos por nombre (parcial).
 * @param {number} [page=1] - Opcional. El número de página a solicitar.
 * @param {number} [limit=10] - Opcional. El número de elementos por página.
 * @returns {Promise<Object>} Una promesa que resuelve con el objeto paginado de repuestos.
 */
export const getAllRepuestos = async (estado = '', id_categoria = null, marca = '', nombre = '', page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/repuestos`;
    const params = new URLSearchParams();

    if (estado) {
        params.append('estado', estado);
    }
    if (id_categoria) {
        params.append('id_categoria', id_categoria);
    }
    if (marca) {
        params.append('marca', marca);
    }
    if (nombre) {
        params.append('nombre', nombre);
    }
    params.append('page', page);
    params.append('limit', limit);

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
        console.error('Error al obtener repuestos:', error);
        throw error;
    }
};

/**
 * Crea un nuevo repuesto en el backend.
 * @param {object} repuestoData - Los datos del nuevo repuesto.
 * @returns {Promise<object>} Una promesa que resuelve con el repuesto creado.
 */
export const createRepuesto = async (repuestoData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuestos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(repuestoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear repuesto:', error);
        throw error;
    }
};

/**
 * Actualiza un repuesto existente en el backend.
 * @param {string} id_repuesto - El ID del repuesto a actualizar.
 * @param {object} repuestoData - Los datos actualizados del repuesto.
 * @returns {Promise<object>} Una promesa que resuelve con el repuesto actualizado.
 */
export const updateRepuesto = async (id_repuesto, repuestoData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuestos/${id_repuesto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(repuestoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar repuesto:', error);
        throw error;
    }
};

/**
 * Elimina un repuesto del backend.
 * @param {string} id_repuesto - El ID del repuesto a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteRepuesto = async (id_repuesto) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/repuestos/${id_repuesto}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar repuesto:', error);
        throw error;
    }
};

// =============================================================================
// Funciones Públicas (sin autenticación)
// =============================================================================

/**
 * Obtiene todos los repuestos de forma pública (sin autenticación).
 * @param {string} [nombre] - Opcional. Filtra repuestos por nombre (parcial).
 * @param {number} [id_categoria] - Opcional. Filtra repuestos por ID de categoría.
 * @param {string} [sortBy] - Opcional. Criterio de ordenamiento ('price_asc', 'price_desc').
 * @param {number} [page] - Opcional. Número de página para paginación.
 * @param {number} [limit] - Opcional. Número de items por página.
 * @returns {Promise<object>} Una promesa que resuelve con un objeto { data, totalPages, currentPage }.
 */
export const getPublicRepuestos = async (filters = {}) => {
    // Asumimos que la ruta pública es /api/repuestos/public
    const { nombre = '', id_categoria = null, sortBy = '', page = 1, limit = 12 } = filters;
    let url = `${API_BASE_URL}/repuestos/public`;
    const params = new URLSearchParams();

    if (nombre) params.append('nombre', nombre);
    if (id_categoria) params.append('id_categoria', id_categoria);
    if (sortBy) params.append('sortBy', sortBy);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handlePublicResponse(response); // Usamos el nuevo manejador público
    } catch (error) {
        console.error('Error al obtener repuestos públicos:', error);
        throw error;
    }
};
