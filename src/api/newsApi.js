// src/api/newsApi.js
// Centraliza las llamadas a la API para la gestión de noticias.

// Lee la URL base de la API desde las variables de entorno de Vite.  
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033/api';//! modificado para el deploy

// Función para obtener el token JWT del almacenamiento local.
// Este token se guarda después de un login exitoso.
const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
};
// =============================================================================
// Función para manejar respuestas de la API y errores.
// =============================================================================
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        // Si el token es inválido/expirado (401/403), puedes forzar un logout o redirigir al login
        if (response.status === 401 || response.status === 403) {
            console.error("Error de autenticación/autorización. Redirigiendo al login...");
            // Opcional: limpiar token y redirigir al login
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            window.location.href = '/'; // Redirige a la página de inicio/login
        }
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    // Si la respuesta es 204 No Content (ej. DELETE), no intentes parsear JSON
    if (response.status === 204) {
        return {}; // Retorna un objeto vacío para indicar éxito sin contenido
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
// Funciones para la API de Noticias (NewsItem)
// =============================================================================

/**
 * Obtiene todas las noticias del backend.
 * @param {string} [estado=''] - Opcional. Filtra noticias por 'publicada', 'borrador', 'archivada'.
 * @param {string} [titulo=''] - Opcional. Filtra noticias por un término en el título.
 * @param {number} [page=1] - Opcional. El número de página a solicitar.
 * @param {number} [limit=10] - Opcional. El número de elementos por página.
 * @returns {Promise<Object>} Una promesa que resuelve con el objeto paginado de noticias { data, totalItems, ... }.
 */
export const getAllNews = async (estado = '', titulo = '', page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/noticias`;
    const params = new URLSearchParams();

    if (estado) {
        params.append('estado', estado);
    }
    if (titulo) {
        params.append('titulo', titulo);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Envía el token JWT
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        throw error;
    }
};

/**
 * Crea una nueva noticia en el backend.
 * @param {object} newsData - Los datos de la nueva noticia (titulo, contenido, imagen_noticia, autor_id, estado).
 * @returns {Promise<object>} Una promesa que resuelve con la noticia creada.
 */
export const createNews = async (newsData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/noticias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newsData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear noticia:', error);
        throw error;
    }
};

/**
 * Actualiza una noticia existente en el backend.
 * @param {string} id_noticia - El ID de la noticia a actualizar (nombre de columna en MySQL).
 * @param {object} newsData - Los datos actualizados de la noticia.
 * @returns {Promise<object>} Una promesa que resuelve con la noticia actualizada.
 */
export const updateNews = async (id_noticia, newsData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/noticias/${id_noticia}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newsData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar noticia:', error);
        throw error;
    }
};

/**
 * Elimina una noticia del backend.
 * @param {string} id_noticia - El ID de la noticia a eliminar (nombre de columna en MySQL).
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteNews = async (id_noticia) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/noticias/${id_noticia}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        throw error;
    }
};

// =============================================================================
// Funciones Públicas para Noticias (sin autenticación)
// =============================================================================

/**
 * Obtiene las últimas noticias públicas para la página de inicio.
 * @param {number} [limit=3] - El número de noticias a devolver.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de noticias.
 */
export const getPublicNoticias = async (limit = 3) => {
    const url = `${API_BASE_URL}/noticias/public?limit=${limit}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handlePublicResponse(response);
    } catch (error) {
        console.error('Error al obtener noticias públicas:', error);
        throw error;
    }
};

// =============================================================================
// Funciones para la API de Autenticación (Usuarios)
// =============================================================================

/**
 * Realiza el login de un usuario.
 * @param {string} identificador - Nombre de usuario o email.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} Una promesa que resuelve con el token y los datos del usuario.
 */
export const loginUser = async (identificador, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identificador, password }),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error en el login:', error);
        throw error;
    }
};

/**
 * Cierra la sesión del usuario.
 */
export const logoutUser = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    // Opcional: redirigir a la página de login
    window.location.href = '/';
};