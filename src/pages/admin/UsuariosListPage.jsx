// src/pages/admin/UsuariosListPage.jsx
// Este componente gestiona la lista de usuarios en el panel de administración,
// con integración de API, filtrado por nombre de usuario, paginación y notificaciones.

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importa useRef
import UsuarioFormModal from './UsuarioFormModal';
import { getAllUsuarios, deleteUser } from '../../api/usuariosApi';
import Table from '../../components/ui/Table'; // Importa el nuevo componente Table
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify'; // Importa toast para notificaciones
import useDebounce from '../../hooks/useDebounce'; // ¡IMPORTA EL NUEVO HOOK!
import { format } from 'date-fns'; // Importamos la función de formato de date-fns

const UsuariosListPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el input de búsqueda (se actualiza en cada pulsación)
    const [nombreSearchInput, setNombreSearchInput] = useState('');
    
    // Usa el hook useDebounce para retrasar la aplicación del filtro
    // El valor 'nombreSearchInput' se actualizará en 'debouncedNombreFilter'
    // solo después de 700ms de inactividad de escritura.
    const debouncedNombreFilter = useDebounce(nombreSearchInput, 900); // Retraso de 700ms

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Puedes hacer esto configurable
    const [totalUsers, setTotalUsers] = useState(0); // Total de usuarios en el backend

    // Crea una referencia para el input de búsqueda
    const searchInputRef = useRef(null); // Inicializa la referencia a null

    // Efecto para implementar el debouncing en la búsqueda por nombre de usuario
    // Este useEffect ahora solo se encarga de llamar a fetchUsuarios cuando el filtro debounced cambia.
    // La lógica de debouncing en sí está encapsulada en useDebounce.
    useEffect(() => {
        // Cuando el filtro debounced cambia, resetear a la primera página
        // Esto es importante para que la búsqueda comience desde el inicio de los resultados.
        setCurrentPage(1);
        // Llama a fetchUsuarios para obtener los datos con el nuevo filtro y página.
        // Se llama directamente aquí porque debouncedNombreFilter ya tiene el retardo.
        // No necesitamos un setTimeout aquí.
        fetchUsuarios();
    }, [debouncedNombreFilter]); // Dependencia: el valor debounced

    // useCallback para memorizar fetchUsuarios y evitar recreaciones innecesarias
    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Pasa el valor debounced como filtro de búsqueda, la página actual y el límite a la API
            const response = await getAllUsuarios(debouncedNombreFilter, currentPage, itemsPerPage);
            setUsuarios(response.data); // Asume que la API devuelve { data: [], totalItems: N }
            setTotalUsers(response.totalItems);
        } catch (err) {
            setError(err.message);
            toast.error(`Error al cargar usuarios: ${err.message}`);
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    }, [debouncedNombreFilter, currentPage, itemsPerPage]); // Dependencias: filtro debounced, página y elementos por página

    // useEffect para cargar usuarios cuando el componente se monta o cuando la página cambia
    // (el debouncedNombreFilter ya tiene su propio useEffect que llama a fetchUsuarios)
    useEffect(() => {
        // Este useEffect se encargará de recargar los usuarios solo cuando la página cambie,
        // ya que el cambio de filtro ya lo maneja el useEffect de debouncedNombreFilter.
        fetchUsuarios();
    }, [currentPage, fetchUsuarios]); // Dependencia: currentPage y la función fetchUsuarios (memorizada)


    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(totalUsers / itemsPerPage)) {
            setCurrentPage(newPage);
        }
    };

    const handleSaveUsuario = async () => {
        setIsModalOpen(false);
        setSelectedUsuario(null);
        // Después de guardar, recarga la lista en la página actual.
        // Si es una creación, se mantendrá en la página actual.
        // Si es una edición, se mantendrá en la página actual.
        await fetchUsuarios();
    };

    const handleEditUsuario = (usuarioItem) => {
        setSelectedUsuario(usuarioItem);
        setIsModalOpen(true);
    };

    const handleDeleteUsuario = async (id_usuario) => {
        // Confirmación más visual o con un modal personalizado sería ideal,
        // pero window.confirm es funcional por ahora.
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
            try {
                await deleteUser(id_usuario);
                toast.success('Usuario eliminado exitosamente.');
                // Después de eliminar, recarga la lista. Si la página actual queda vacía, ve a la anterior.
                // Esto es una lógica básica, se puede mejorar.
                if (usuarios.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    await fetchUsuarios(); // Recarga usuarios después de eliminar
                }
            } catch (err) {
                setError(err.message);
                toast.error(`Error al eliminar usuario: ${err.message}`);
                console.error("Error deleting user:", err);
            }
        }
    };

    // Función para limpiar el campo de búsqueda y poner el foco
    const handleClearSearch = () => {
        setNombreSearchInput(''); // Esto reseteará el input y, por ende, el debounced filter
        if (searchInputRef.current) {
            searchInputRef.current.focus(); // Pone el foco de nuevo en el input
        }
    };

    // Definición de las columnas para el componente Table
    const columns = [
        { header: 'ID', accessor: 'id_usuario',cellClassName: 'font-mono text-xs text-gray-400'},
        { header: 'Nombre de Usuario', accessor: 'nombre_usuario', cellClassName: 'text-gray-300' },
        { header: 'Email', accessor: 'email', cellClassName: 'text-gray-300' },
        {
            header: 'Rol',
            accessor: 'rol',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.rol === 'administrador' ? 'bg-purple-600 text-white' :
                    item.rol === 'editor' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white' // Observador u otros
                }`}>
                    {item.rol}
                </span>
            ),
            cellClassName: 'text-center' // Centra el contenido de la celda del rol
        },
        {
            header: 'Fecha Registro',
            accessor: 'fecha_registro',
            // Usamos format para un control preciso y evitar problemas de zona horaria.
            // 'dd/MM/yyyy' asegura un formato consistente para todos.
            renderCell: (item) => format(new Date(item.fecha_registro), 'dd/MM/yyyy'),
            cellClassName: 'text-gray-400 text-sm'
        },
        {
            header: 'Último Login',
            accessor: 'ultimo_login',
            // Mostramos fecha y hora para más detalle.
            // 'dd/MM/yyyy HH:mm' es un formato claro y conciso.
            renderCell: (item) => item.ultimo_login ? format(new Date(item.ultimo_login), 'dd/MM/yyyy HH:mm') : 'N/A',
            cellClassName: 'text-gray-400 text-sm'
        },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right pr-4', // Alinea a la derecha las acciones y agrega padding
            renderCell: (item) => (
                <div className="flex justify-end space-x-2"> {/* Contenedor flex para los botones */}
                    <button
                        onClick={() => handleEditUsuario(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
                        title="Editar usuario"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteUsuario(item.id_usuario)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
                        title="Eliminar usuario"
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
                <LoadingSpinner size="lg" color="primary" />
                <p className="mt-4">Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p className="text-center">Error al cargar usuarios: {error}</p>
                <button
                    onClick={fetchUsuarios} // Llama a fetchUsuarios directamente para reintentar
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#0000004b] min-h-screen rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 sm:mb-0">Gestión de Usuarios</h2>
                <button
                    onClick={() => { setSelectedUsuario(null); setIsModalOpen(true); }}
                    className="bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-black-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Usuario
                </button>
            </div>

            {/* Controles de filtrado y buscador */}
            <div className="mb-6">
                <label htmlFor="nombreSearchInput" className="block text-gray-300 text-sm font-semibold mb-2">Buscar por Nombre de Usuario o Email:</label>
                <div className="relative"> {/* Contenedor para el input y el botón de limpiar */}
                    <input
                        type="text"
                        id="nombreSearchInput"
                        value={nombreSearchInput} // Vinculado al estado directo del input
                        onChange={(e) => setNombreSearchInput(e.target.value)} // Actualiza el estado directo en cada pulsación
                        placeholder="Escribe un nombre o email para buscar..."
                        className="w-full px-4 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base pr-10" // Añade padding a la derecha para el botón
                        ref={searchInputRef} // Asocia la referencia al input
                    />
                    {nombreSearchInput && ( // Muestra el botón solo si hay texto en el input
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                            title="Limpiar búsqueda"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Renderizado de la tabla de usuarios (visible en MD y arriba) */}
            {/* Se ha eliminado el max-h-[95vh] y overflow-y-auto de aquí, ahora lo maneja el componente Table */}
            <div className="hidden md:block">
                <Table
                    columns={columns}
                    data={usuarios}
                    keyAccessor="id_usuario"
                    emptyMessage="No se encontraron usuarios que coincidan con la búsqueda."
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalUsers}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Vista de Tarjetas (visible en pantallas pequeñas) */}
            <div className=" md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {usuarios.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 col-span-full">No se encontraron usuarios que coincidan con la búsqueda.</p>
                ) : (
                    usuarios.map((usuario) => (
                        <div key={usuario.id_usuario} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700 overflow-hidden">
                            <div className="flex justify-between items-center text-gray-100">
                                <span className="text-lg font-bold">ID: {usuario.id_usuario}</span>
                                {columns.find(col => col.accessor === 'rol')?.renderCell(usuario)}
                            </div>
                            <p className="text-gray-300 text-sm">
                                <span className="font-semibold">Usuario:</span> {usuario.nombre_usuario || 'Desconocido'}
                            </p>
                            <p className="text-gray-300 text-sm">
                                <span className="font-semibold">Email:</span> {usuario.email || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-xs">
                                <span className="font-semibold">Registro:</span> {new Date(usuario.fecha_registro).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-xs">
                                <span className="font-semibold">Último Login:</span> {usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleDateString() : 'N/A'}
                            </p>
                            <div className="flex justify-end space-x-2 mt-3 flex-wrap">
                                <button
                                    onClick={() => handleEditUsuario(usuario)}
                                    className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
                                    title="Editar usuario"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteUsuario(usuario.id_usuario)}
                                    className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
                                    title="Eliminar usuario"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {/* Controles de Paginación para vista de tarjetas */}
                {totalUsers > itemsPerPage && (
                    <div className="col-span-full flex justify-center items-center py-4 bg-gray-800 rounded-lg border-t border-gray-700 mt-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Anterior
                        </button>
                        <span className="text-gray-300 text-sm mx-2">
                            Página {currentPage} de {Math.ceil(totalUsers / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil(totalUsers / itemsPerPage)}
                            className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            <UsuarioFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUsuario(null); }}
                onSave={handleSaveUsuario}
                usuarioItem={selectedUsuario}
            />
        </div>
    );
};

export default UsuariosListPage;











// // src/pages/admin/UsuariosListPage.jsx
// // Este componente gestiona la lista de usuarios en el panel de administración,
// // con integración de API, filtrado por nombre de usuario, paginación y notificaciones.

// import React, { useState, useEffect, useCallback } from 'react';
// import UsuarioFormModal from './UsuarioFormModal';
// import { getAllUsuarios, deleteUser } from '../../api/usuariosApi';
// import Table from '../../components/ui/Table'; // Importa el nuevo componente Table
// import LoadingSpinner from '../../components/ui/LoadingSpinner';
// import { toast } from 'react-toastify'; // Importa toast para notificaciones

// const UsuariosListPage = () => {
//     const [usuarios, setUsuarios] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedUsuario, setSelectedUsuario] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Estado para el input de búsqueda de nombre de usuario (se actualiza en cada pulsación)
//     const [tempNombreSearchInput, setTempNombreSearchInput] = useState('');
//     // Estado para el filtro de nombre de usuario aplicado (se actualiza después del debounce)
//     const [appliedNombreFilter, setAppliedNombreFilter] = useState('');

//     // Estados para la paginación
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage, setItemsPerPage] = useState(10); // Puedes hacer esto configurable
//     const [totalUsers, setTotalUsers] = useState(0); // Total de usuarios en el backend

//     // Efecto para implementar el debouncing en la búsqueda por nombre de usuario
//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setAppliedNombreFilter(tempNombreSearchInput);
//             setCurrentPage(1); // Resetear a la primera página cuando se aplica un nuevo filtro de búsqueda
//         }, 500); // Retraso de 500ms

//         return () => {
//             clearTimeout(handler);
//         };
//     }, [tempNombreSearchInput]); // Este efecto se ejecuta cada vez que `tempNombreSearchInput` cambia

//     // useCallback para memorizar fetchUsuarios y evitar recreaciones innecesarias
//     const fetchUsuarios = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             // Pasa el filtro aplicado (debounced), la página actual y el límite a la API
//             const response = await getAllUsuarios(appliedNombreFilter, currentPage, itemsPerPage);
//             setUsuarios(response.data); // Asume que la API devuelve { data: [], totalItems: N }
//             setTotalUsers(response.totalItems);
//         } catch (err) {
//             setError(err.message);
//             toast.error(`Error al cargar usuarios: ${err.message}`);
//             console.error("Error fetching users:", err);
//         } finally {
//             setLoading(false);
//         }
//     }, [appliedNombreFilter, currentPage, itemsPerPage]); // Dependencias: filtro, página y elementos por página

//     // useEffect para cargar usuarios cuando el componente se monta o cuando los filtros/paginación cambian
//     useEffect(() => {
//         fetchUsuarios();
//     }, [fetchUsuarios]); // Dependencia: la función fetchUsuarios (memorizada con useCallback)

//     const handlePageChange = (newPage) => {
//         if (newPage > 0 && newPage <= Math.ceil(totalUsers / itemsPerPage)) {
//             setCurrentPage(newPage);
//         }
//     };

//     const handleSaveUsuario = async () => {
//         setIsModalOpen(false);
//         setSelectedUsuario(null);
//         // Después de guardar, recarga la lista. Si es una creación, ve a la primera página.
//         // Si es una edición, mantente en la página actual.
//         // Una forma simple es recargar la página actual, o forzar la página 1 si es una creación.
//         // Para este caso, simplemente recargamos la página actual.
//         await fetchUsuarios();
//     };

//     const handleEditUsuario = (usuarioItem) => {
//         setSelectedUsuario(usuarioItem);
//         setIsModalOpen(true);
//     };

//     const handleDeleteUsuario = async (id_usuario) => {
//         // Confirmación más visual o con un modal personalizado sería ideal,
//         // pero window.confirm es funcional por ahora.
//         if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
//             try {
//                 await deleteUser(id_usuario);
//                 toast.success('Usuario eliminado exitosamente.');
//                 // Después de eliminar, recarga la lista. Si la página actual queda vacía, ve a la anterior.
//                 // Esto es una lógica básica, se puede mejorar.
//                 if (usuarios.length === 1 && currentPage > 1) {
//                     setCurrentPage(prev => prev - 1);
//                 } else {
//                     await fetchUsuarios(); // Recarga usuarios después de eliminar
//                 }
//             } catch (err) {
//                 setError(err.message);
//                 toast.error(`Error al eliminar usuario: ${err.message}`);
//                 console.error("Error deleting user:", err);
//             }
//         }
//     };

//     // Función para limpiar el campo de búsqueda
//     const handleClearSearch = () => {
//         setTempNombreSearchInput('');
//         // El useEffect de debouncing se encargará de setAppliedNombreFilter('') y setCurrentPage(1)
//     };

//     // Definición de las columnas para el componente Table
//     const columns = [
//         { header: 'ID', accessor: 'id_usuario', cellClassName: 'font-medium text-gray-200' },
//         { header: 'Nombre de Usuario', accessor: 'nombre_usuario', cellClassName: 'text-gray-300' },
//         { header: 'Email', accessor: 'email', cellClassName: 'text-gray-300' },
//         {
//             header: 'Rol',
//             accessor: 'rol',
//             renderCell: (item) => (
//                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                     item.rol === 'administrador' ? 'bg-purple-600 text-white' :
//                     item.rol === 'editor' ? 'bg-blue-600 text-white' :
//                     'bg-gray-600 text-white' // Observador u otros
//                 }`}>
//                     {item.rol}
//                 </span>
//             ),
//             cellClassName: 'text-center' // Centra el contenido de la celda del rol
//         },
//         {
//             header: 'Fecha Registro',
//             accessor: 'fecha_registro',
//             renderCell: (item) => new Date(item.fecha_registro).toLocaleDateString(),
//             cellClassName: 'text-gray-400 text-sm'
//         },
//         {
//             header: 'Último Login',
//             accessor: 'ultimo_login',
//             renderCell: (item) => item.ultimo_login ? new Date(item.ultimo_login).toLocaleDateString() : 'N/A',
//             cellClassName: 'text-gray-400 text-sm'
//         },
//         {
//             header: 'Acciones',
//             accessor: 'actions',
//             cellClassName: 'text-right pr-4', // Alinea a la derecha las acciones y agrega padding
//             renderCell: (item) => (
//                 <div className="flex justify-end space-x-2"> {/* Contenedor flex para los botones */}
//                     <button
//                         onClick={() => handleEditUsuario(item)}
//                         className="text-blue-400 hover:text-blue-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
//                         title="Editar usuario"
//                     >
//                         Editar
//                     </button>
//                     <button
//                         onClick={() => handleDeleteUsuario(item.id_usuario)}
//                         className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
//                         title="Eliminar usuario"
//                     >
//                         Eliminar
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     if (loading) {
//         return (
//             <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
//                 <LoadingSpinner size="lg" color="primary" />
//                 <p className="mt-4">Cargando usuarios...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
//                 <p className="text-center">Error al cargar usuarios: {error}</p>
//                 <button
//                     onClick={fetchUsuarios} // Llama a fetchUsuarios directamente para reintentar
//                     className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
//                 >
//                     Reintentar
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 min-h-screen rounded-lg shadow-md animate-fadeIn text-white">
//             <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 sm:mb-0">Gestión de Usuarios</h2>
//                 <button
//                     onClick={() => { setSelectedUsuario(null); setIsModalOpen(true); }}
//                     className="bg-primary text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
//                 >
//                     + Añadir Usuario
//                 </button>
//             </div>

//             {/* Controles de filtrado y buscador */}
//             <div className="mb-6">
//                 <label htmlFor="nombreSearchInput" className="block text-gray-300 text-sm font-semibold mb-2">Buscar por Nombre de Usuario o Email:</label>
//                 <div className="relative"> {/* Contenedor para el input y el botón de limpiar */}
//                     <input
//                         type="text"
//                         id="nombreSearchInput"
//                         value={tempNombreSearchInput} // Vinculado al estado temporal
//                         onChange={(e) => setTempNombreSearchInput(e.target.value)} // Actualiza el estado temporal en cada pulsación
//                         placeholder="Escribe un nombre o email para buscar..."
//                         className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base pr-10" // Añade padding a la derecha para el botón
//                     />
//                     {tempNombreSearchInput && ( // Muestra el botón solo si hay texto en el input
//                         <button
//                             onClick={handleClearSearch}
//                             className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
//                             title="Limpiar búsqueda"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                             </svg>
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Renderizado de la tabla de usuarios (visible en MD y arriba) */}
//             {/* Se ha eliminado el max-h-[95vh] y overflow-y-auto de aquí, ahora lo maneja el componente Table */}
//             <div className="hidden md:block">
//                 <Table
//                     columns={columns}
//                     data={usuarios}
//                     keyAccessor="id_usuario"
//                     emptyMessage="No se encontraron usuarios que coincidan con la búsqueda."
//                     currentPage={currentPage}
//                     itemsPerPage={itemsPerPage}
//                     totalItems={totalUsers}
//                     onPageChange={handlePageChange}
//                 />
//             </div>

//             {/* Vista de Tarjetas (visible en pantallas pequeñas) */}
//             <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//                 {usuarios.length === 0 ? (
//                     <p className="text-gray-400 text-center py-4 col-span-full">No se encontraron usuarios que coincidan con la búsqueda.</p>
//                 ) : (
//                     usuarios.map((usuario) => (
//                         <div key={usuario.id_usuario} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700">
//                             <div className="flex justify-between items-center text-gray-100">
//                                 <span className="text-lg font-bold">ID: {usuario.id_usuario}</span>
//                                 {columns.find(col => col.accessor === 'rol')?.renderCell(usuario)}
//                             </div>
//                             <p className="text-gray-300 text-sm">
//                                 <span className="font-semibold">Usuario:</span> {usuario.nombre_usuario || 'Desconocido'}
//                             </p>
//                             <p className="text-gray-300 text-sm">
//                                 <span className="font-semibold">Email:</span> {usuario.email || 'N/A'}
//                             </p>
//                             <p className="text-gray-400 text-xs">
//                                 <span className="font-semibold">Registro:</span> {new Date(usuario.fecha_registro).toLocaleDateString()}
//                             </p>
//                             <p className="text-gray-400 text-xs">
//                                 <span className="font-semibold">Último Login:</span> {usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleDateString() : 'N/A'}
//                             </p>
//                             <div className="flex justify-end space-x-2 mt-3 flex-wrap">
//                                 <button
//                                     onClick={() => handleEditUsuario(usuario)}
//                                     className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
//                                     title="Editar usuario"
//                                 >
//                                     Editar
//                                 </button>
//                                 <button
//                                     onClick={() => handleDeleteUsuario(usuario.id_usuario)}
//                                     className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
//                                     title="Eliminar usuario"
//                                 >
//                                     Eliminar
//                                 </button>
//                             </div>
//                         </div>
//                     ))
//                 )}
//                 {/* Controles de Paginación para vista de tarjetas */}
//                 {totalUsers > itemsPerPage && (
//                     <div className="col-span-full flex justify-center items-center py-4 bg-gray-800 rounded-lg border-t border-gray-700 mt-4">
//                         <button
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1}
//                             className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                             Anterior
//                         </button>
//                         <span className="text-gray-300 text-sm mx-2">
//                             Página {currentPage} de {Math.ceil(totalUsers / itemsPerPage)}
//                         </span>
//                         <button
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === Math.ceil(totalUsers / itemsPerPage)}
//                             className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                             Siguiente
//                         </button>
//                     </div>
//                 )}
//             </div>

//             <UsuarioFormModal
//                 isOpen={isModalOpen}
//                 onClose={() => { setIsModalOpen(false); setSelectedUsuario(null); }}
//                 onSave={handleSaveUsuario}
//                 usuarioItem={selectedUsuario}
//             />
//         </div>
//     );
// };

// export default UsuariosListPage;
