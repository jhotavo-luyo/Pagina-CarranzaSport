// src/api/categoriaRepuestosApi.js
// Centraliza las llamadas a la API para la gestión de categorías de repuestos.

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

// =============================================================================
// Funciones para la API de Categorías de Repuestos
// =============================================================================

/**
 * Obtiene todas las categorías de repuestos del backend.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de categorías.
 */
export const getAllRepuestoCategories = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-repuestos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener categorías de repuestos:', error);
        throw error;
    }
};

/**
 * Crea una nueva categoría de repuesto en el backend.
 * @param {object} categoryData - Los datos de la nueva categoría (nombre_categoria, descripcion).
 * @returns {Promise<object>} Una promesa que resuelve con la categoría creada.
 */
export const createRepuestoCategory = async (categoryData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-repuestos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear categoría de repuesto:', error);
        throw error;
    }
};

/**
 * Actualiza una categoría de repuesto existente en el backend.
 * @param {string} id_categoria_repuesto - El ID de la categoría a actualizar.
 * @param {object} categoryData - Los datos actualizados de la categoría.
 * @returns {Promise<object>} Una promesa que resuelve con la categoría actualizada.
 */
export const updateRepuestoCategory = async (id_categoria_repuesto, categoryData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-repuestos/${id_categoria_repuesto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar categoría de repuesto:', error);
        throw error;
    }
};

/**
 * Elimina una categoría de repuesto del backend.
 * @param {string} id_categoria_repuesto - El ID de la categoría a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteRepuestoCategory = async (id_categoria_repuesto) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-repuestos/${id_categoria_repuesto}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar categoría de repuesto:', error);
        throw error;
    }
};

// =============================================================================
// Funciones Públicas (sin autenticación)
// =============================================================================

/**
 * Obtiene todas las categorías de repuestos de forma pública (sin autenticación).
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de categorías.
 */
export const getPublicRepuestoCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias-repuestos/public`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener categorías de repuestos públicas:', error);
        throw error;
    }
};
