// src/api/servicesApi.js
// Centraliza las llamadas a la API para la gestión de servicios y categorías de servicios.

// Lee la URL base de la API desde las variables de entorno de Vite.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api'; //! modificado para el deploy 

// Función para obtener el token JWT del almacenamiento local.
const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
};

// Función para manejar respuestas de la API y errores.
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
        // Si no hay contenido, devolvemos un objeto con una estructura de datos vacía esperada.
        return { data: [], totalPages: 0, currentPage: 1 };
    }
    return response.json();
};

// =============================================================================
// Funciones para la API de Servicios
// =============================================================================

/**
 * Obtiene todos los servicios del backend.
 * @param {string} [estado] - Opcional. Filtra servicios por 'activo' o 'inactivo'.
 * @param {number} [id_categoria] - Opcional. Filtra servicios por ID de categoría.
 * @param {number} [page=1] - Opcional. El número de página a solicitar.
 * @param {number} [limit=10] - Opcional. El número de elementos por página.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de servicios.
 */
export const getAllServicios = async (estado = '', id_categoria = null, page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/servicios`;
    const params = new URLSearchParams();

    if (estado) {
        params.append('estado', estado);
    }
    if (id_categoria) {
        params.append('id_categoria', id_categoria);
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
        console.error('Error al obtener servicios:', error);
        throw error;
    }
};

// =============================================================================
// Funciones Públicas (sin autenticación)
// =============================================================================

/**
 * Obtiene todos los servicios de forma pública (sin autenticación).
 * @param {object} [filters={}] - Opcional. Objeto con filtros.
 * @param {string} [filters.searchTerm] - Filtra por nombre de servicio.
 * @param {number} [filters.category] - Filtra por ID de categoría.
 * @param {number} [filters.page] - Número de página para paginación.
 * @param {number} [filters.limit] - Número de items por página.
 * @returns {Promise<object>} Una promesa que resuelve con un objeto { data, totalPages, currentPage }.
 */
export const getPublicServicios = async (filters = {}) => {
    const { searchTerm = '', category = '', page = 1, limit = 6 } = filters;
    let url = `${API_BASE_URL}/servicios/public`;
    const params = new URLSearchParams();

    if (searchTerm) params.append('searchTerm', searchTerm);
    if (category) params.append('category', category);
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
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al obtener servicios públicos:', error);
        throw error;
    }
};

/**
 * Crea un nuevo servicio en el backend.
 * @param {object} serviceData - Los datos del nuevo servicio.
 * @returns {Promise<object>} Una promesa que resuelve con el servicio creado.
 */
export const createService = async (serviceData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(serviceData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear servicio:', error);
        throw error;
    }
};

/**
 * Actualiza un servicio existente en el backend.
 * @param {string} id_servicio - El ID del servicio a actualizar.
 * @param {object} serviceData - Los datos actualizados del servicio.
 * @returns {Promise<object>} Una promesa que resuelve con el servicio actualizado.
 */
export const updateService = async (id_servicio, serviceData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicios/${id_servicio}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(serviceData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        throw error;
    }
};

/**
 * Elimina un servicio del backend.
 * @param {string} id_servicio - El ID del servicio a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteService = async (id_servicio) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/servicios/${id_servicio}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        throw error;
    }
};
