// src/pages/admin/ClientesListPage.jsx
// Este componente gestiona la lista de clientes en el panel de administración,
// con integración de API, filtrado por nombre y email, paginación y notificaciones.
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importa useRef
import ClienteFormModal from './ClienteFormModal';
import { getAllClientes, deleteCliente } from '../../api/clientesApi';
import Table from '../../components/ui/Table'; // Asume que tienes un componente Table genérico
import LoadingSpinner from '../../components/ui/LoadingSpinner'; // Asume que tienes un componente LoadingSpinner
import { toast } from 'react-toastify'; // Importa toast para notificaciones
import useDebounce from '../../hooks/useDebounce'; // Importa el custom hook useDebounce

const ClientesListPage = () => {
    const [clientes, setClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el input de búsqueda (se actualiza en cada pulsación)
    const [searchTermInput, setSearchTermInput] = useState('');
    
    // Usa el hook useDebounce para retrasar la aplicación del filtro.
    // El valor 'searchTermInput' se actualizará en 'debouncedSearchTerm'
    // solo después de 700ms de inactividad de escritura.
    const debouncedSearchTerm = useDebounce(searchTermInput, 700); // Retraso de 700ms

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Puedes hacer esto configurable
    const [totalClients, setTotalClients] = useState(0); // Total de clientes en el backend

    // Crea una referencia para el input de búsqueda para poder enfocarlo
    const searchInputRef = useRef(null); // Inicializa la referencia a null

    // useCallback para memorizar fetchClientes y evitar recreaciones innecesarias.
    // Esto es importante para que useEffect con [fetchClientes] no cause bucles infinitos.
    const fetchClientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Pasa el término de búsqueda debounced, la página actual y el límite a la API.
            // La API de clientes ahora acepta 'search_term', 'page', 'limit'.
            const response = await getAllClientes(debouncedSearchTerm, currentPage, itemsPerPage);
            setClientes(response.data); // Asume que la API devuelve { data: [], totalItems: N, ... }
            setTotalClients(response.totalItems); // Actualiza el total de clientes para la paginación
        } catch (err) {
            setError(err.message);
            toast.error(`Error al cargar clientes: ${err.message}`);
            console.error("Error fetching clients:", err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, currentPage, itemsPerPage]); // Dependencias: término de búsqueda debounced, página y elementos por página

    // Efecto para cargar clientes cuando el componente se monta o cuando el término de búsqueda debounced cambia.
    useEffect(() => {
        // Cuando el término de búsqueda debounced cambia, resetear a la primera página.
        // Esto es importante para que la búsqueda comience desde el inicio de los resultados.
        setCurrentPage(1); // Siempre ir a la página 1 al cambiar el filtro de búsqueda
        fetchClientes();
    }, [debouncedSearchTerm]); // Dependencia: el valor debounced del término de búsqueda

    // Efecto para cargar clientes cuando la página actual cambia (ej. al usar los botones de paginación).
    useEffect(() => {
        // Solo llama a fetchClientes si currentPage cambia y no es el primer render
        // o si debouncedSearchTerm no ha cambiado (ya que el useEffect anterior lo maneja).
        fetchClientes();
    }, [currentPage, fetchClientes]); // Dependencia: currentPage y la función fetchClientes (estable por useCallback)

    // Maneja el cambio de página en la paginación.
    const handlePageChange = (newPage) => {
        // Asegura que la nueva página esté dentro de los límites válidos.
        if (newPage > 0 && newPage <= Math.ceil(totalClients / itemsPerPage)) {
            setCurrentPage(newPage);
        }
    };

    // Maneja el guardado de un cliente (creación o edición).
    const handleSaveCliente = async () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
        // Después de guardar, recarga la lista en la página actual.
        // Si es una creación, se mantendrá en la página actual.
        // Si es una edición, se mantendrá en la página actual.
        await fetchClientes();
    };

    // Maneja la edición de un cliente.
    const handleEditCliente = (clienteItem) => {
        setSelectedCliente(clienteItem);
        setIsModalOpen(true);
    };

    // Maneja la eliminación de un cliente.
    const handleDeleteCliente = async (id_cliente) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible.')) {
            try {
                await deleteCliente(id_cliente);
                toast.success('Cliente eliminado exitosamente.');
                // Después de eliminar, recarga la lista.
                // Si la página actual queda vacía (solo se eliminó el último elemento de la página),
                // intenta ir a la página anterior. De lo contrario, simplemente recarga la actual.
                if (clientes.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    await fetchClientes(); // Recarga clientes después de eliminar
                }
            } catch (err) {
                setError(err.message);
                toast.error(`Error al eliminar cliente: ${err.message}`);
                console.error("Error deleting client:", err);
            }
        }
    };

    // Función para limpiar el campo de búsqueda y poner el foco.
    const handleClearSearch = () => {
        setSearchTermInput(''); // Esto reseteará el input y, por ende, el debounced filter
        if (searchInputRef.current) {
            searchInputRef.current.focus(); // Pone el foco de nuevo en el input
        }
    };

    // Definición de las columnas para el componente Table.
    const columns = [
        { header: 'ID', accessor: 'id_cliente',cellClassName: 'font-mono text-xs text-gray-400'},
        { header: 'Nombre Completo', accessor: 'nombre_completo', cellClassName: 'text-gray-300' },
        { header: 'Email', accessor: 'email', cellClassName: 'text-gray-300' },
        { header: 'Teléfono', accessor: 'telefono', renderCell: (item) => item.telefono || 'N/A', cellClassName: 'text-gray-400' },
        { header: 'Dirección', accessor: 'direccion', renderCell: (item) => item.direccion || 'N/A', cellClassName: 'text-gray-400' },
        {
            header: 'Fecha Registro',
            accessor: 'fecha_registro',
            renderCell: (item) => new Date(item.fecha_registro).toLocaleDateString(),
            cellClassName: 'text-gray-400 text-sm'
        },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right pr-4',
            renderCell: (item) => (
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => handleEditCliente(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
                        title="Editar cliente"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteCliente(item.id_cliente)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
                        title="Eliminar cliente"
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    // Muestra un spinner de carga si los datos están siendo cargados.
    if (loading) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
                <LoadingSpinner size="lg" color="primary" />
                <p className="mt-4">Cargando clientes...</p>
            </div>
        );
    }

    // Muestra un mensaje de error si ocurre un problema al cargar los datos.
    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar clientes: {error}</p>
                <button
                    onClick={fetchClientes} // Permite reintentar la carga
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#0000004b] min-h-screen max-h-s rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 sm:mb-0">Gestión de Clientes</h2>
                <button
                    onClick={() => { setSelectedCliente(null); setIsModalOpen(true); }}
                    className="bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Cliente
                </button>
            </div>

            {/* Controles de filtrado y buscador */}
            <div className="mb-6">
                <label htmlFor="searchTermInput" className="block text-gray-300 text-sm font-semibold mb-2">Buscar por Nombre o Email:</label>
                <div className="relative">
                    <input
                        type="text"
                        id="searchTermInput"
                        value={searchTermInput}
                        onChange={(e) => setSearchTermInput(e.target.value)}
                        placeholder="Escribe un nombre o email para buscar..."
                        className="w-full px-4 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base pr-10"
                        ref={searchInputRef} // Asocia la referencia al input
                    />
                    {searchTermInput && (
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

            {/* Renderizado de la tabla de clientes (visible en MD y arriba) */}
            <div className="hidden md:block">
                <Table
                    columns={columns}
                    data={clientes}
                    keyAccessor="id_cliente"
                    emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalClients}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Vista de Tarjetas (visible en pantallas pequeñas) */}
            <div className=" md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {clientes.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 col-span-full">No se encontraron clientes que coincidan con la búsqueda.</p>
                ) : (
                    clientes.map((cliente) => (
                        <div key={cliente.id_cliente} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700">
                            <div className="flex justify-between items-center text-gray-100">
                                <span className="text-lg font-bold">ID: {cliente.id_cliente}</span>
                                <span className="text-gray-300 text-sm">
                                    {new Date(cliente.fecha_registro).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm">
                                <span className="font-semibold">Nombre:</span> {cliente.nombre_completo || 'Desconocido'}
                            </p>
                            <p className="text-gray-300 text-sm">
                                <span className="font-semibold">Email:</span> {cliente.email || 'N/A'}
                            </p>
                            <p className="text-gray-300 text-sm">
                                <span className="font-semibold">Teléfono:</span> {cliente.telefono || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm line-clamp-2">
                                <span className="font-semibold">Dirección:</span> {cliente.direccion || 'N/A'}
                            </p>
                            <div className="flex justify-end space-x-2 mt-3 flex-wrap">
                                <button
                                    onClick={() => handleEditCliente(cliente)}
                                    className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
                                    title="Editar cliente"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteCliente(cliente.id_cliente)}
                                    className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
                                    title="Eliminar cliente"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {/* Controles de Paginación para vista de tarjetas */}
                {totalClients > itemsPerPage && (
                    <div className="col-span-full flex justify-center items-center py-4 bg-gray-800 rounded-lg border-t border-gray-700 mt-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Anterior
                        </button>
                        <span className="text-gray-300 text-sm mx-2">
                            Página {currentPage} de {Math.ceil(totalClients / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil(totalClients / itemsPerPage)}
                            className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            <ClienteFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedCliente(null); }}
                onSave={handleSaveCliente}
                clienteItem={selectedCliente}
            />
        </div>
    );
};

export default ClientesListPage;
// ```
// Este documento (`src/pages/admin/ClientesListPage.jsx`) ha sido actualizado para usar el *hook* `useDebounce` con el `searchTermInput`, lo que garantiza que las llamadas a la API para la búsqueda se realicen de manera eficiente. También se ha ajustado la lógica de paginación para interactuar correctamente con la respuesta del backend, que ahora incluye el número total de element




















// // src/pages/admin/ClientesListPage.jsx
// // Este componente gestiona la lista de clientes en el panel de administración,
// // con integración de API, filtrado por nombre y email, paginación y notificaciones.
// import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importa useRef
// import ClienteFormModal from './ClienteFormModal';
// import { getAllClientes, deleteCliente } from '../../api/clientesApi';
// import Table from '../../components/ui/Table';
// import LoadingSpinner from '../../components/ui/LoadingSpinner';
// import { toast } from 'react-toastify'; // Importa toast para notificaciones
// import useDebounce from '../../hooks/useDebounce'; // Importa el custom hook useDebounce

// const ClientesListPage = () => {
//     const [clientes, setClientes] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedCliente, setSelectedCliente] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Estado para el input de búsqueda (se actualiza en cada pulsación)
//     const [searchTermInput, setSearchTermInput] = useState('');
    
//     // Usa el hook useDebounce para retrasar la aplicación del filtro
//     // El valor 'searchTermInput' se actualizará en 'debouncedSearchTerm'
//     // solo después de 700ms de inactividad de escritura.
//     const debouncedSearchTerm = useDebounce(searchTermInput, 700); // Retraso de 700ms

//     // Estados para la paginación
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage, setItemsPerPage] = useState(10); // Puedes hacer esto configurable
//     const [totalClients, setTotalClients] = useState(0); // Total de clientes en el backend

//     // Crea una referencia para el input de búsqueda
//     const searchInputRef = useRef(null); // Inicializa la referencia a null

//     // useCallback para memorizar fetchClientes y evitar recreaciones innecesarias
//     const fetchClientes = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             // Pasa el término de búsqueda debounced, la página actual y el límite a la API
//             const response = await getAllClientes(debouncedSearchTerm, currentPage, itemsPerPage);
//             setClientes(response.data); // Asume que la API devuelve { data: [], totalItems: N }
//             setTotalClients(response.totalItems);
//         } catch (err) {
//             setError(err.message);
//             toast.error(`Error al cargar clientes: ${err.message}`);
//             console.error("Error fetching clients:", err);
//         } finally {
//             setLoading(false);
//         }
//     }, [debouncedSearchTerm, currentPage, itemsPerPage]); // Dependencias: término de búsqueda debounced, página y elementos por página

//     // useEffect para cargar clientes cuando el componente se monta o cuando los filtros/paginación cambian
//     useEffect(() => {
//         // Cuando el término de búsqueda debounced cambia, resetear a la primera página
//         // Esto es importante para que la búsqueda comience desde el inicio de los resultados.
//         setCurrentPage(1);
//         fetchClientes();
//     }, [debouncedSearchTerm]); // Dependencia: el valor debounced

//     // useEffect para recargar clientes cuando la página cambia (después de un cambio de página por paginación)
//     useEffect(() => {
//         fetchClientes();
//     }, [currentPage]); // Dependencia: currentPage

//     const handlePageChange = (newPage) => {
//         if (newPage > 0 && newPage <= Math.ceil(totalClients / itemsPerPage)) {
//             setCurrentPage(newPage);
//         }
//     };

//     const handleSaveCliente = async () => {
//         setIsModalOpen(false);
//         setSelectedCliente(null);
//         // Después de guardar, recarga la lista en la página actual.
//         // Si es una creación, se mantendrá en la página actual.
//         // Si es una edición, se mantendrá en la página actual.
//         await fetchClientes();
//     };

//     const handleEditCliente = (clienteItem) => {
//         setSelectedCliente(clienteItem);
//         setIsModalOpen(true);
//     };

//     const handleDeleteCliente = async (id_cliente) => {
//         if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible.')) {
//             try {
//                 await deleteCliente(id_cliente);
//                 toast.success('Cliente eliminado exitosamente.');
//                 // Después de eliminar, recarga la lista. Si la página actual queda vacía, ve a la anterior.
//                 if (clientes.length === 1 && currentPage > 1) {
//                     setCurrentPage(prev => prev - 1);
//                 } else {
//                     await fetchClientes(); // Recarga clientes después de eliminar
//                 }
//             } catch (err) {
//                 setError(err.message);
//                 toast.error(`Error al eliminar cliente: ${err.message}`);
//                 console.error("Error deleting client:", err);
//             }
//         }
//     };

//     // Función para limpiar el campo de búsqueda y poner el foco
//     const handleClearSearch = () => {
//         setSearchTermInput(''); // Esto reseteará el input y, por ende, el debounced filter
//         if (searchInputRef.current) {
//             searchInputRef.current.focus(); // Pone el foco de nuevo en el input
//         }
//     };

//     // Definición de las columnas para el componente Table
//     const columns = [
//         { header: 'ID', accessor: 'id_cliente', cellClassName: 'font-medium text-gray-200' },
//         { header: 'Nombre Completo', accessor: 'nombre_completo', cellClassName: 'text-gray-300' },
//         { header: 'Email', accessor: 'email', cellClassName: 'text-gray-300' },
//         { header: 'Teléfono', accessor: 'telefono', renderCell: (item) => item.telefono || 'N/A', cellClassName: 'text-gray-400' },
//         { header: 'Dirección', accessor: 'direccion', renderCell: (item) => item.direccion || 'N/A', cellClassName: 'text-gray-400' },
//         {
//             header: 'Fecha Registro',
//             accessor: 'fecha_registro',
//             renderCell: (item) => new Date(item.fecha_registro).toLocaleDateString(),
//             cellClassName: 'text-gray-400 text-sm'
//         },
//         {
//             header: 'Acciones',
//             accessor: 'actions',
//             cellClassName: 'text-right pr-4',
//             renderCell: (item) => (
//                 <div className="flex justify-end space-x-2">
//                     <button
//                         onClick={() => handleEditCliente(item)}
//                         className="text-blue-400 hover:text-blue-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
//                         title="Editar cliente"
//                     >
//                         Editar
//                     </button>
//                     <button
//                         onClick={() => handleDeleteCliente(item.id_cliente)}
//                         className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
//                         title="Eliminar cliente"
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
//                 <p className="mt-4">Cargando clientes...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
//                 <p>Error al cargar clientes: {error}</p>
//                 <button
//                     onClick={fetchClientes}
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
//                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 sm:mb-0">Gestión de Clientes</h2>
//                 <button
//                     onClick={() => { setSelectedCliente(null); setIsModalOpen(true); }}
//                     className="bg-primary text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
//                 >
//                     + Añadir Cliente
//                 </button>
//             </div>

//             {/* Controles de filtrado y buscador */}
//             <div className="mb-6">
//                 <label htmlFor="searchTermInput" className="block text-gray-300 text-sm font-semibold mb-2">Buscar por Nombre o Email:</label>
//                 <div className="relative">
//                     <input
//                         type="text"
//                         id="searchTermInput"
//                         value={searchTermInput}
//                         onChange={(e) => setSearchTermInput(e.target.value)}
//                         placeholder="Escribe un nombre o email para buscar..."
//                         className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base pr-10"
//                         ref={searchInputRef} // Asocia la referencia al input
//                     />
//                     {searchTermInput && (
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

//             {/* Renderizado de la tabla de clientes (visible en MD y arriba) */}
//             <div className="hidden md:block">
//                 <Table
//                     columns={columns}
//                     data={clientes}
//                     keyAccessor="id_cliente"
//                     emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
//                     currentPage={currentPage}
//                     itemsPerPage={itemsPerPage}
//                     totalItems={totalClients}
//                     onPageChange={handlePageChange}
//                 />
//             </div>

//             {/* Vista de Tarjetas (visible en pantallas pequeñas) */}
//             <div className=" md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//                 {clientes.length === 0 ? (
//                     <p className="text-gray-400 text-center py-4 col-span-full">No se encontraron clientes que coincidan con la búsqueda.</p>
//                 ) : (
//                     clientes.map((cliente) => (
//                         <div key={cliente.id_cliente} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700">
//                             <div className="flex justify-between items-center text-gray-100">
//                                 <span className="text-lg font-bold">ID: {cliente.id_cliente}</span>
//                                 <span className="text-gray-300 text-sm">
//                                     {new Date(cliente.fecha_registro).toLocaleDateString()}
//                                 </span>
//                             </div>
//                             <p className="text-gray-300 text-sm">
//                                 <span className="font-semibold">Nombre:</span> {cliente.nombre_completo || 'Desconocido'}
//                             </p>
//                             <p className="text-gray-300 text-sm">
//                                 <span className="font-semibold">Email:</span> {cliente.email || 'N/A'}
//                             </p>
//                             <p className="text-gray-300 text-sm">
//                                 <span className="font-semibold">Teléfono:</span> {cliente.telefono || 'N/A'}
//                             </p>
//                             <p className="text-gray-400 text-sm line-clamp-2">
//                                 <span className="font-semibold">Dirección:</span> {cliente.direccion || 'N/A'}
//                             </p>
//                             <div className="flex justify-end space-x-2 mt-3 flex-wrap">
//                                 <button
//                                     onClick={() => handleEditCliente(cliente)}
//                                     className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
//                                     title="Editar cliente"
//                                 >
//                                     Editar
//                                 </button>
//                                 <button
//                                     onClick={() => handleDeleteCliente(cliente.id_cliente)}
//                                     className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 transition duration-200"
//                                     title="Eliminar cliente"
//                                 >
//                                     Eliminar
//                                 </button>
//                             </div>
//                         </div>
//                     ))
//                 )}
//                 {/* Controles de Paginación para vista de tarjetas */}
//                 {totalClients > itemsPerPage && (
//                     <div className="col-span-full flex justify-center items-center py-4 bg-gray-800 rounded-lg border-t border-gray-700 mt-4">
//                         <button
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1}
//                             className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                             Anterior
//                         </button>
//                         <span className="text-gray-300 text-sm mx-2">
//                             Página {currentPage} de {Math.ceil(totalClients / itemsPerPage)}
//                         </span>
//                         <button
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === Math.ceil(totalClients / itemsPerPage)}
//                             className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                             Siguiente
//                         </button>
//                     </div>
//                 )}
//             </div>

//             <ClienteFormModal
//                 isOpen={isModalOpen}
//                 onClose={() => { setIsModalOpen(false); setSelectedCliente(null); }}
//                 onSave={handleSaveCliente}
//                 clienteItem={selectedCliente}
//             />
//         </div>
//     );
// };

// export default ClientesListPage;
