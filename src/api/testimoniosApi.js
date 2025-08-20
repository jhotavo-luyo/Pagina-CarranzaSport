// src/api/testimoniosApi.js
// Centraliza las llamadas a la API para la gestión de testimonios.

// Lee la URL base de la API desde las variables de entorno de Vite.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api'; //! modificado para el deploy 

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

// NUEVO: Manejador de respuestas para rutas PÚBLICAS
const handlePublicResponse = async (response) => {
    if (!response.ok) {
        // Para rutas públicas, no redirigimos, solo mostramos el error.
        // Si no hay contenido (204), devolvemos un array vacío, que es lo que espera el frontend.
        if (response.status === 204) {
            return [];
        }
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
// Funciones para la API de Testimonios
// =============================================================================

/**
 * Obtiene todos los testimonios del backend.
 * @param {boolean|null} [aprobado=null] - Opcional. Filtra testimonios por estado de aprobación.
 * `true` para aprobados, `false` para no aprobados, `null` para todos.
 * @param {string} [nombre_cliente=''] - Opcional. Filtra por nombre de cliente.
 * @param {number} [page=1] - Opcional. Número de página.
 * @param {number} [limit=10] - Opcional. Elementos por página.
 * @returns {Promise<Object>} Una promesa que resuelve con el objeto paginado de testimonios.
 */
export const getAllTestimonios = async (aprobado = null, nombre_cliente = '', page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/testimonios`;
    const params = new URLSearchParams();

    // Añade el parámetro 'aprobado' si no es null
    if (aprobado !== null) {
        params.append('aprobado', aprobado.toString()); // Convertir booleano a string 'true' o 'false'
    }
    if (nombre_cliente) {
        params.append('nombre_cliente', nombre_cliente);
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
        console.error('Error al obtener testimonios:', error);
        throw error;
    }
};

// =============================================================================
// Funciones Públicas para Testimonios
// =============================================================================

/**
 * Obtiene los últimos testimonios públicos aprobados.
 * @param {number} [limit=5] - El número de testimonios a devolver.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de testimonios.
 */
export const getPublicTestimonios = async (limit = 7) => {
    const url = `${API_BASE_URL}/testimonios/public?limit=${limit}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al obtener testimonios públicos:', error);
        throw error;
    }
};

/**
 * Obtiene un testimonio específico por su ID.
 * @param {string} id - El ID del testimonio.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del testimonio.
 */
export const getTestimonioById = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/testimonios/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al obtener testimonio con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea un nuevo testimonio.
 * @param {Object} testimonioData - Los datos del nuevo testimonio (nombre_cliente, comentario, calificacion, aprobado).
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del testimonio creado.
 */
export const createTestimonio = async (testimonioData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/testimonios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(testimonioData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear testimonio:', error);
        throw error;
    }
};

/**
 * Actualiza un testimonio existente.
 * @param {string} id - El ID del testimonio a actualizar.
 * @param {Object} testimonioData - Los datos a actualizar del testimonio.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos del testimonio actualizado.
 */
export const updateTestimonio = async (id, testimonioData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/testimonios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(testimonioData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al actualizar testimonio con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina un testimonio por su ID.
 * @param {string} id - El ID del testimonio a eliminar.
 * @returns {Promise<Object>} Una promesa que resuelve al completar la eliminación.
 */
export const deleteTestimonio = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/testimonios/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error al eliminar testimonio con ID ${id}:`, error);
        throw error;
    }
};