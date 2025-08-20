// src/api/usuariosApi.js
// Centraliza las llamadas a la API para la gestión de usuarios.
const API_BASE_URL = 'http://localhost:3033/api';

const getAuthToken = () => {
    // Asegura que siempre devuelva un string, incluso si es null
    return localStorage.getItem('jwt_token') || '';
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) {
            console.error("Error de autenticación/autorización. Redirigiendo al login...");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            // Redirigir al login (considerar usar `useNavigate` de react-router-dom
            // si la aplicación crece y requiere una navegación más gestionada)
            window.location.href = '/';
        }
        // Lanza un error con el mensaje del backend o un mensaje genérico
        throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
    }
    // Si la respuesta es 204 No Content, devuelve un objeto vacío en lugar de intentar parsear JSON
    if (response.status === 204) {
        return {};
    }
    return response.json();
};

// =============================================================================
// Funciones para la API de Usuarios
// =============================================================================

/**
 * Obtiene todos los usuarios del backend con opciones de filtrado y paginación.
 * @param {string} [nombre] - Opcional. Filtra usuarios por nombre_usuario (parcial).
 * @param {number} [page=1] - Opcional. El número de página a solicitar.
 * @param {number} [limit=10] - Opcional. El número de elementos por página.
 * @returns {Promise<object>} Una promesa que resuelve con un objeto { data: Array, totalItems: number }.
 * `data` es la lista de usuarios, `totalItems` es el total de usuarios en el backend.
 */
export const getAllUsuarios = async (nombre = '', page = 1, limit = 10) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/usuarios`;
    const params = new URLSearchParams();

    if (nombre) {
        params.append('BuscarUsuario', nombre); // Usa el parámetro de búsqueda de tu backend
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
        // Asumimos que la API devuelve un objeto con 'data' (array de usuarios) y 'totalItems' (número total)
        return handleResponse(response);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error; // Propaga el error para que el componente pueda manejarlo
    }
};

/**
 * Crea un nuevo usuario en el backend.
 * @param {object} userData - Los datos del nuevo usuario (nombre_usuario, email, password, rol).
 * @returns {Promise<object>} Una promesa que resuelve con el usuario creado.
 */
export const createUser = async (userData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};

/**
 * Actualiza un usuario existente en el backend.
 * @param {string} id_usuario - El ID del usuario a actualizar.
 * @param {object} userData - Los datos actualizados del usuario (nombre_usuario, email, rol).
 * @returns {Promise<object>} Una promesa que resuelve con el usuario actualizado.
 */
export const updateUser = async (id_usuario, userData) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

/**
 * Elimina un usuario del backend.
 * @param {string} id_usuario - El ID del usuario a eliminar.
 * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
 */
export const deleteUser = async (id_usuario) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};

/**
 * Actualiza la contraseña de un usuario.
 * @param {string} id_usuario - El ID del usuario.
 * @param {string} newPassword - La nueva contraseña.
 * @returns {Promise<object>} Una promesa que resuelve con el mensaje de éxito.
 */
export const updatePassword = async (id_usuario, newPassword) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ newPassword }),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw error;
    }
};

// Este documento centraliza las funciones para interactuar con la API de usuarios (`/api/usuarios`). Incluye operaciones CRUD (crear, leer, actualizar, eliminar) y una función para actualizar la contraseña. Se ha mejorado la función `getAllUsuarios` para soportar paginación (`page` y `limit`) y filtrado por nombre de usuario. Todas las funciones utilizan un token de autenticación del `localStorage` y un manejador de respuestas centralizado para errores HTTP, incluyendo la redirección en caso de errores de autenticación/autorizaci









// // src/api/usuariosApi.js
// // Centraliza las llamadas a la API para la gestión de usuarios.
// const API_BASE_URL = 'http://localhost:3033/api';

// const getAuthToken = () => {
//     // Asegura que siempre devuelva un string, incluso si es null
//     return localStorage.getItem('jwt_token') || '';
// };

// const handleResponse = async (response) => {
//     if (!response.ok) {
//         const errorData = await response.json();
//         // Manejo de errores de autenticación/autorización
//         if (response.status === 401 || response.status === 403) {
//             console.error("Error de autenticación/autorización. Redirigiendo al login...");
//             localStorage.removeItem('jwt_token');
//             localStorage.removeItem('user_data');
//             // Redirigir al login (considerar usar `useNavigate` de react-router-dom
//             // si la aplicación crece y requiere una navegación más gestionada)
//             window.location.href = '/'; 
//         }
//         // Lanza un error con el mensaje del backend o un mensaje genérico
//         throw new Error(errorData.message || `Error ${response.status}: Algo salió mal en la API.`);
//     }
//     // Si la respuesta es 204 No Content, devuelve un objeto vacío en lugar de intentar parsear JSON
//     if (response.status === 204) {
//         return {};
//     }
//     return response.json();
// };

// // =============================================================================
// // Funciones para la API de Usuarios
// // =============================================================================

// /**
//  * Obtiene todos los usuarios del backend.
//  * @param {string} [nombre] - Opcional. Filtra usuarios por nombre_usuario (parcial).
//  * @returns {Promise<Array>} Una promesa que resuelve con la lista de usuarios.
//  */
// export const getAllUsuarios = async (nombre = '') => {
//     const token = getAuthToken();
//     let url = `${API_BASE_URL}/usuarios`;
//     const params = new URLSearchParams();
//     if (nombre) {
//         params.append('BuscarUsuario', nombre); // Usa el parámetro de búsqueda de tu backend
//     }
//     if (params.toString()) {
//         url += `?${params.toString()}`;
//     }

//     try {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//         });
//         return handleResponse(response);
//     } catch (error) {
//         console.error('Error al obtener usuarios:', error);
//         throw error; // Propaga el error para que el componente pueda manejarlo
//     }
// };

// /**
//  * Crea un nuevo usuario en el backend.
//  * @param {object} userData - Los datos del nuevo usuario (nombre_usuario, email, password, rol).
//  * @returns {Promise<object>} Una promesa que resuelve con el usuario creado.
//  */
// export const createUser = async (userData) => {
//     const token = getAuthToken();
//     try {
//         const response = await fetch(`${API_BASE_URL}/usuarios`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify(userData),
//         });
//         return handleResponse(response);
//     } catch (error) {
//         console.error('Error al crear usuario:', error);
//         throw error;
//     }
// };

// /**
//  * Actualiza un usuario existente en el backend.
//  * @param {string} id_usuario - El ID del usuario a actualizar.
//  * @param {object} userData - Los datos actualizados del usuario (nombre_usuario, email, rol).
//  * @returns {Promise<object>} Una promesa que resuelve con el usuario actualizado.
//  */
// export const updateUser = async (id_usuario, userData) => {
//     const token = getAuthToken();
//     try {
//         const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify(userData),
//         });
//         return handleResponse(response);
//     } catch (error) {
//         console.error('Error al actualizar usuario:', error);
//         throw error;
//     }
// };

// /**
//  * Elimina un usuario del backend.
//  * @param {string} id_usuario - El ID del usuario a eliminar.
//  * @returns {Promise<object>} Una promesa que resuelve con la confirmación de la eliminación.
//  */
// export const deleteUser = async (id_usuario) => {
//     const token = getAuthToken();
//     try {
//         const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//         });
//         return handleResponse(response);
//     } catch (error) {
//         console.error('Error al eliminar usuario:', error);
//         throw error;
//     }
// };

// /**
//  * Actualiza la contraseña de un usuario.
//  * @param {string} id_usuario - El ID del usuario.
//  * @param {string} newPassword - La nueva contraseña.
//  * @returns {Promise<object>} Una promesa que resuelve con el mensaje de éxito.
//  */
// export const updatePassword = async (id_usuario, newPassword) => {
//     const token = getAuthToken();
//     try {
//         const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}/password`, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({ newPassword }),
//         });
//         return handleResponse(response);
//     } catch (error) {
//         console.error('Error al actualizar contraseña:', error);
//         throw error;
//     }
// };
