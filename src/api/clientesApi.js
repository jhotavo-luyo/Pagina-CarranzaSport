// src/api/clientesApi.js
// Centraliza las llamadas a la API para la gestión de clientes.

// Lee la URL base de la API desde las variables de entorno de Vite.  //! modificado para el deploy 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api';

// Función para obtener el token JWT del almacenamiento local.
const getAuthToken = () => {
    // Asegura que siempre devuelva un string, incluso si es null
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

// =============================================================================
// Funciones para la API de Clientes
// =============================================================================

/**
 * Obtiene todos los clientes del backend con opciones de filtrado y paginación.
 *
 * @param {string} [search_term=''] - Opcional. Término de búsqueda que el backend usará para filtrar por nombre completo o email.
 * Este parámetro se mapea al `search` query parameter en el backend.
 * @param {number} [page=1] - Opcional. El número de página a solicitar.
 * @param {number} [limit=10] - Opcional. El número de elementos por página.
 * @returns {Promise<object>} Una promesa que resuelve con un objeto que contiene:
 * - `data`: Array de clientes.
 * - `totalItems`: Número total de clientes que coinciden con la búsqueda.
 * - `currentPage`: La página actual.
 * - `itemsPerPage`: Elementos por página.
 * - `totalPages`: Número total de páginas.
 */
export const getAllClientes = async (search_term = '', page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/clientes`;
    const params = new URLSearchParams();

    // El backend espera un único parámetro 'search' para filtrar por nombre O email.
    if (search_term) {
        params.append('search', search_term);
    }
    // Añade parámetros de paginación
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
        // El backend ahora devuelve un objeto con 'data', 'totalItems', 'currentPage', etc.
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error; // Propaga el error para que el componente pueda manejarlo
    }
};

/**
 * Crea un nuevo cliente en el backend.
 * @param {object} clienteData - Los datos del nuevo cliente.
 * @returns {Promise<object>} Una promesa que resuelve con el cliente creado.
 */
export const createCliente = async (clienteData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(clienteData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error;
    }
};

/**
 * Actualiza un cliente existente en el backend.
 * @param {string} id_cliente - El ID del cliente a actualizar.
 * @param {object} clienteData - Los datos actualizados del cliente.
 * @returns {Promise<object>} Una promesa que resuelve con el cliente actualizado.
 */
export const updateCliente = async (id_cliente, clienteData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id_cliente}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(clienteData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw error;
    }
};

/**
 * Elimina un cliente del backend.
 * @param {string} id_cliente - El ID del cliente a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteCliente = async (id_cliente) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id_cliente}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
};
// ```
// Este documento (`src/api/clientesApi.js`) ha sido revisado para confirmar que la función `getAllClientes` envía el parámetro de búsqueda `search` y los parámetros de paginación (`page`, `limit`) como se espera en el backend. La función también está preparada para recibir la respuesta estructurada del backend que incluye los datos de los clientes y la información de paginaci