// src/pages/admin/UsuarioFormModal.jsx
// Este componente es un modal para crear o editar usuarios.
// Permite modificar nombre, email, rol y, opcionalmente, la contraseña.

import React, { useState, useEffect } from 'react';
import { createUser, updateUser, updatePassword } from '../../api/usuariosApi';
import { toast } from 'react-toastify'; // Importa toast para notificaciones

const UsuarioFormModal = ({ isOpen, onClose, onSave, usuarioItem = null }) => {
    const [nombre_usuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Solo para creación o cambio de contraseña
    const [rol, setRol] = useState('observador'); // Rol por defecto
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false); // Para mostrar/ocultar campos de contraseña

    // Roles permitidos en tu backend
    const rolesPermitidos = ['administrador', 'editor', 'observador'];

    // Regex para validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        if (usuarioItem) {
            // Modo edición: Pre-llenar campos con datos del usuario existente
            setNombreUsuario(usuarioItem.nombre_usuario || '');
            setEmail(usuarioItem.email || '');
            setRol(usuarioItem.rol || 'observador');
            setPassword(''); // Siempre limpiar la contraseña al editar, no se muestra la existente
            setShowPasswordFields(false); // Ocultar campos de contraseña por defecto al editar
        } else {
            // Modo creación: Limpiar campos
            setNombreUsuario('');
            setEmail('');
            setPassword('');
            setRol('observador');
            setShowPasswordFields(true); // Mostrar campos de contraseña por defecto al crear
        }
        setFormError(null);
        setIsSubmitting(false);
    }, [usuarioItem, isOpen]); // Se ejecuta cuando usuarioItem o isOpen cambian

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        // Validaciones frontend
        if (!nombre_usuario.trim() || !email.trim()) {
            setFormError('Nombre de usuario y email son campos requeridos.');
            setIsSubmitting(false);
            return;
        }
        if (!emailRegex.test(email)) {
            setFormError('Por favor, ingresa un formato de email válido.');
            setIsSubmitting(false);
            return;
        }
        if (!rolesPermitidos.includes(rol)) {
            setFormError('Rol no válido. Por favor, selecciona un rol de la lista.');
            setIsSubmitting(false);
            return;
        }

        const userData = {
            nombre_usuario: nombre_usuario.trim(), // Eliminar espacios en blanco
            email: email.trim(),
            rol,
        };

        try {
            if (usuarioItem) {
                // Modo edición: Actualizar datos de usuario
                await updateUser(usuarioItem.id_usuario, userData);

                // Si se ha marcado la casilla para cambiar contraseña y se ha introducido una
                if (showPasswordFields && password) {
                    if (password.length < 6) {
                        setFormError('La nueva contraseña debe tener al menos 6 caracteres.');
                        setIsSubmitting(false);
                        return;
                    }
                    await updatePassword(usuarioItem.id_usuario, password);
                }
                toast.success('Usuario actualizado exitosamente.');
            } else {
                // Modo creación: Crear nuevo usuario
                if (!password || password.length < 6) {
                    setFormError('La contraseña es requerida y debe tener al menos 6 caracteres para un nuevo usuario.');
                    setIsSubmitting(false);
                    return;
                }
                await createUser({ ...userData, password });
                toast.success('Usuario creado exitosamente.');
            }
            onSave(); // Llama a la función onSave (que recarga la lista de usuarios en el padre y cierra el modal)
        } catch (err) {
            setFormError(err.message || 'Error al guardar el usuario. Intenta de nuevo.');
            toast.error(err.message || 'Error al guardar el usuario.');
            console.error("Error saving user:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn p-4 ">
            <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700
                            rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transform transition-transform duration-300 hover:scale-105">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    {usuarioItem ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h2>
                {formError && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center text-sm">
                        {formError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                        <label htmlFor="nombre_usuario" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Nombre de Usuario</label>
                        <input
                            type="text"
                            id="nombre_usuario"
                            value={nombre_usuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="rol" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Rol</label>
                        <select
                            id="rol"
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                            disabled={isSubmitting}
                        >
                            {rolesPermitidos.map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {usuarioItem && ( // Mostrar opción de cambiar contraseña solo en modo edición
                        <div className="flex items-center mt-4">
                            <input
                                type="checkbox"
                                id="changePassword"
                                checked={showPasswordFields}
                                onChange={(e) => setShowPasswordFields(e.target.checked)}
                                className="h-4 w-4 text-primary rounded border-gray-600 focus:ring-primary accent-primary" // Added accent-primary for better checkbox styling
                                disabled={isSubmitting}
                            />
                            <label htmlFor="changePassword" className="ml-2 text-gray-300 text-base">Cambiar Contraseña</label>
                        </div>
                    )}

                    {(showPasswordFields || !usuarioItem) && ( // Mostrar campos de contraseña si se activa o si es nuevo usuario
                        <div>
                            <label htmlFor="password" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">
                                {usuarioItem ? 'Nueva Contraseña' : 'Contraseña'}
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                                required={showPasswordFields || !usuarioItem} // Requerido si se muestra o si es nuevo usuario
                                disabled={isSubmitting}
                            />
                            {usuarioItem && showPasswordFields && (
                                <p className="text-gray-400 text-xs mt-1">Deja vacío para no cambiar la contraseña.</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 sm:space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (usuarioItem ? 'Guardar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsuarioFormModal;











// // src/pages/admin/UsuarioFormModal.jsx
// // Este componente es un modal para crear o editar usuarios.
// // Permite modificar nombre, email, rol y, opcionalmente, la contraseña.
// import React, { useState, useEffect } from 'react';
// import { createUser, updateUser, updatePassword } from '../../api/usuariosApi';
// const UsuarioFormModal = ({ isOpen, onClose, onSave, usuarioItem = null }) => {
//     const [nombre_usuario, setNombreUsuario] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState(''); // Solo para creación o cambio de contraseña
//     const [rol, setRol] = useState('observador'); // Rol por defecto
//     const [formError, setFormError] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showPasswordFields, setShowPasswordFields] = useState(false); // Para mostrar/ocultar campos de contraseña
//     // Roles permitidos en tu backend
//     const rolesPermitidos = ['administrador', 'editor', 'observador'];

//     useEffect(() => {
//         if (usuarioItem) {
//             setNombreUsuario(usuarioItem.nombre_usuario || '');
//             setEmail(usuarioItem.email || '');
//             setRol(usuarioItem.rol || 'observador');
//             setPassword(''); // Siempre limpiar la contraseña al editar
//             setShowPasswordFields(false); // Ocultar campos de contraseña por defecto al editar
//         } else {
//             setNombreUsuario('');
//             setEmail('');
//             setPassword('');
//             setRol('observador');
//             setShowPasswordFields(true); // Mostrar campos de contraseña por defecto al crear
//         }
//         setFormError(null);
//         setIsSubmitting(false);
//     }, [usuarioItem, isOpen]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError(null);
//         setIsSubmitting(true);

//         // Validaciones básicas de frontend
//         if (!nombre_usuario || !email) {
//             setFormError('Nombre de usuario y email son campos requeridos.');
//             setIsSubmitting(false);
//             return;
//         }
//         if (!rolesPermitidos.includes(rol)) {
//             setFormError('Rol no válido.');
//             setIsSubmitting(false);
//             return;
//         }
//         const userData = {
//             nombre_usuario,
//             email,
//             rol,
//         };

//         try {
//             if (usuarioItem) {
//                 // Modo edición
//                 await updateUser(usuarioItem.id_usuario, userData);
//                 if (showPasswordFields && password) {
//                     if (password.length < 6) {
//                         setFormError('La nueva contraseña debe tener al menos 6 caracteres.');
//                         setIsSubmitting(false);
//                         return;
//                     }
//                     await updatePassword(usuarioItem.id_usuario, password);
//                 }
//             } else {
//                 // Modo creación
//                 if (!password || password.length < 6) {
//                     setFormError('La contraseña es requerida y debe tener al menos 6 caracteres para un nuevo usuario.');
//                     setIsSubmitting(false);
//                     return;
//                 }
//                 await createUser({ ...userData, password });
//             }
//             onSave(); // Llama a la función onSave (que recarga la lista de usuarios en el padre)
//         } catch (err) {
//             setFormError(err.message || 'Error al guardar el usuario.');
//             console.error("Error saving user:", err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
//             <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700
//                         rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-transform duration-300 hover:scale-105">
//                 <h2 className="text-3xl font-bold text-white mb-6 text-center">
//                     {usuarioItem ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
//                 </h2>
//                 {formError && (
//                     <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
//                         {formError}
//                     </div>
//                 )}
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     <div>
//                         <label htmlFor="nombre_usuario" className="block text-gray-300 text-lg font-semibold mb-2">Nombre de Usuario</label>
//                         <input
//                             type="text"
//                             id="nombre_usuario"
//                             value={nombre_usuario}
//                             onChange={(e) => setNombreUsuario(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="email" className="block text-gray-300 text-lg font-semibold mb-2">Email</label>
//                         <input
//                             type="email"
//                             id="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="rol" className="block text-gray-300 text-lg font-semibold mb-2">Rol</label>
//                         <select
//                             id="rol"
//                             value={rol}
//                             onChange={(e) => setRol(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             disabled={isSubmitting}
//                         >
//                             {rolesPermitidos.map(r => (
//                                 <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
//                             ))}
//                         </select>
//                     </div>
//                     {usuarioItem && ( // Mostrar opción de cambiar contraseña solo en modo edición
//                         <div className="flex items-center mt-4">
//                             <input
//                                 type="checkbox"
//                                 id="changePassword"
//                                 checked={showPasswordFields}
//                                 onChange={(e) => setShowPasswordFields(e.target.checked)}
//                                 className="h-4 w-4 text-primary rounded border-gray-600 focus:ring-primary"
//                                 disabled={isSubmitting}
//                             />
//                             <label htmlFor="changePassword" className="ml-2 text-gray-300">Cambiar Contraseña</label>
//                         </div>
//                     )}
//                     {(showPasswordFields || !usuarioItem) && ( // Mostrar campos de contraseña si se activa o si es nuevo usuario
//                         <div>
//                             <label htmlFor="password" className="block text-gray-300 text-lg font-semibold mb-2">
//                                 {usuarioItem ? 'Nueva Contraseña' : 'Contraseña'}
//                             </label>
//                             <input
//                                 type="password"
//                                 id="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                 required={!usuarioItem} // Requerido solo para nuevos usuarios
//                                 disabled={isSubmitting}
//                             />
//                         </div>
//                     )}
//                     <div className="flex justify-end space-x-4 mt-6">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
//                             disabled={isSubmitting}
//                         >
//                             Cancelar
//                         </button>
//                         <button
//                             type="submit"
//                             className="bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105"
//                             disabled={isSubmitting}
//                         >
//                             {isSubmitting ? 'Guardando...' : (usuarioItem ? 'Guardar Cambios' : 'Crear Usuario')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default UsuarioFormModal;