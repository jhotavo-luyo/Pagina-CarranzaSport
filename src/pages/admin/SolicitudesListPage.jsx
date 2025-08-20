// src/pages/admin/SolicitudesListPage.jsx
// Este componente gestiona la lista de solicitudes en el panel de administración,
// con integración de API, filtrado, buscador por cliente, paginación y la capacidad de ver y gestionar detalles.
// Ahora incluye notificaciones toast y un modal de confirmación personalizado.

import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify'; // Importamos toast y ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importamos los estilos de react-toastify

import SolicitudFormModal from './SolicitudFormModal';
import SolicitudDetalleFormModal from './SolicitudDetalleFormModal';
import { getAllSolicitudes, deleteSolicitud, getSolicitudDetallesBySolicitudId } from '../../api/solicitudesApi';
import { deleteSolicitudDetalle } from '../../api/solicitudDetalleApi';
import { getAllClientes } from '../../api/clientesApi';
import { getAllServicios } from '../../api/servicesApi';
import { getAllRepuestos } from '../../api/repuestosApi';
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationModal from '../../components/ui/ConfirmationModal'; // Asumimos que este componente existe o lo crearemos
import { format } from 'date-fns'; // Importamos la función de formato

const SolicitudesListPage = ({ onNavigate }) => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los modales de CRUD (crear/editar)
    const [isSolicitudModalOpen, setIsSolicitudModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
    const [selectedDetalle, setSelectedDetalle] = useState(null);
    const [currentSolicitudIdForDetails, setCurrentSolicitudIdForDetails] = useState(null);

    // Estados para filtros y buscador
    const [filterTipoSolicitud, setFilterTipoSolicitud] = useState('');
    const [filterEstadoSolicitud, setFilterEstadoSolicitud] = useState('');
    
    // Estado para el valor del input de búsqueda (se actualiza en cada pulsación)
    const [tempSearchClienteName, setTempSearchClienteName] = useState('');
    // Estado para el valor de búsqueda que realmente dispara la API (se actualiza después del debounce)
    const [searchClienteName, setSearchClienteName] = useState('');

    // Estados para la paginación de la tabla principal de solicitudes
    const [currentPageSolicitudes, setCurrentPageSolicitudes] = useState(1);
    const [itemsPerPageSolicitudes, setItemsPerPageSolicitudes] = useState(10); // Puedes ajustar este valor
    const [totalSolicitudes, setTotalSolicitudes] = useState(0);
    const [totalPagesSolicitudes, setTotalPagesSolicitudes] = useState(0);

    // Estado para controlar las filas expandidas y sus detalles
    const [expandedRows, setExpandedRows] = useState({}); // { solicitudId: [detalle1, detalle2], ... }
    const [loadingDetails, setLoadingDetails] = useState({}); // { solicitudId: boolean, ... }

    // Estados para el modal de confirmación personalizado
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(() => () => {}); // Función a ejecutar si se confirma

    // Opciones para los select de filtros y formularios
    const tiposSolicitud = ['cotizacion', 'cita', 'consulta'];
    const estadosSolicitud = ['pendiente', 'en_proceso', 'completada', 'rechazada'];

    // Efecto para implementar el debouncing en la búsqueda por nombre de cliente
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchClienteName(tempSearchClienteName);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [tempSearchClienteName]);

    // Fetch inicial de datos
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [solicitudesData, clientesData, serviciosData, repuestosData] = await Promise.all([
                // Pasa los parámetros de paginación a getAllSolicitudes
                getAllSolicitudes(searchClienteName, '', filterTipoSolicitud, filterEstadoSolicitud, currentPageSolicitudes, itemsPerPageSolicitudes),
                getAllClientes('', 1, 1000), // Obtener hasta 1000 clientes para el selector
                getAllServicios('', null, 1, 1000), // Obtener hasta 1000 servicios para el selector
                getAllRepuestos('', null, '', '', 1, 1000), // CORREGIDO: Obtener hasta 1000 repuestos para el selector
            ]);
            
            setSolicitudes(solicitudesData.data);
            setTotalSolicitudes(solicitudesData.totalItems);
            setTotalPagesSolicitudes(solicitudesData.totalPages);

            setClientes(clientesData.data || []); // Extraemos el array de la respuesta paginada
            setServicios(serviciosData.data || []); // Extraemos el array de la respuesta paginada
            setRepuestos(repuestosData.data || []); // CORREGIDO: Extraemos el array de la respuesta paginada
        } catch (err) {
            setError(err.message);
            toast.error('Error al cargar datos: ' + err.message); // Notificación de error
            console.error("Error fetching data for solicitudes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterTipoSolicitud, filterEstadoSolicitud, searchClienteName, currentPageSolicitudes, itemsPerPageSolicitudes]); // Añadidos estados de paginación

    // Manejador para cambiar la página de la tabla principal
    const handlePageChangeSolicitudes = (newPage) => {
        if (newPage >= 1 && newPage <= totalPagesSolicitudes) {
            setCurrentPageSolicitudes(newPage);
        }
    };

    // Genera un array de números de página para mostrar en los controles de paginación
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Número máximo de botones de página a mostrar
        let startPage = Math.max(1, currentPageSolicitudes - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPagesSolicitudes, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    // Manejador para expandir/colapsar filas y cargar detalles
    const handleToggleExpand = async (solicitudId) => {
        if (expandedRows[solicitudId]) {
            setExpandedRows(prev => {
                const newState = { ...prev };
                delete newState[solicitudId];
                return newState;
            });
        } else {
            setLoadingDetails(prev => ({ ...prev, [solicitudId]: true }));
            try {
                const detalles = await getSolicitudDetallesBySolicitudId(solicitudId);
                setExpandedRows(prev => ({ ...prev, [solicitudId]: detalles }));
            } catch (err) {
                console.error(`Error loading details for solicitud ${solicitudId}:`, err);
                setError(`Error al cargar detalles para la solicitud ${solicitudId}: ${err.message}`);
                toast.error(`Error al cargar detalles: ${err.message}`); // Notificación de error
            } finally {
                setLoadingDetails(prev => {
                    const newState = { ...prev };
                    delete newState[solicitudId];
                    return newState;
                });
            }
        }
    };

    // Manejadores para Solicitudes
    const handleSaveSolicitud = async () => {
        await fetchData();
        setIsSolicitudModalOpen(false);
        setSelectedSolicitud(null);
        setExpandedRows({}); // Colapsar todos los detalles al guardar una solicitud
        toast.success('Solicitud guardada exitosamente!'); // Notificación de éxito
    };

    const handleEditSolicitud = (solicitudItem) => {
        setSelectedSolicitud(solicitudItem);
        setIsSolicitudModalOpen(true);
    };

    // Función que se ejecuta después de la confirmación para eliminar solicitud
    const actualDeleteSolicitud = async (id_solicitud) => {
        try {
            await deleteSolicitud(id_solicitud);
            await fetchData();
            setExpandedRows(prev => {
                const newState = { ...prev };
                delete newState[id_solicitud];
                return newState;
            });
            toast.success('Solicitud eliminada exitosamente!'); // Notificación de éxito
        } catch (err) {
            setError(err.message);
            toast.error('Error al eliminar la solicitud: ' + err.message); // Notificación de error
            console.error("Error deleting solicitud:", err);
        }
    };

    const handleDeleteSolicitud = (id_solicitud) => {
        setConfirmModalMessage('¿Estás seguro de que quieres eliminar esta solicitud y todos sus detalles asociados?');
        setConfirmModalAction(() => () => actualDeleteSolicitud(id_solicitud));
        setShowConfirmModal(true);
    };

    // Manejadores para Detalles de Solicitud
    const handleAddDetalleToSolicitud = (solicitudId) => {
        setCurrentSolicitudIdForDetails(solicitudId);
        setSelectedDetalle(null);
        setIsDetalleModalOpen(true);
    };

    const handleSaveDetalle = async () => {
        if (currentSolicitudIdForDetails) {
            setExpandedRows(prev => {
                const newState = { ...prev };
                delete newState[currentSolicitudIdForDetails];
                return newState;
            });
            await handleToggleExpand(currentSolicitudIdForDetails);
        }
        setIsDetalleModalOpen(false);
        setSelectedDetalle(null);
        setCurrentSolicitudIdForDetails(null);
        toast.success('Detalle de solicitud guardado exitosamente!'); // Notificación de éxito
    };

    const handleEditDetalle = (detalleItem) => {
        setSelectedDetalle(detalleItem);
        setCurrentSolicitudIdForDetails(detalleItem.id_solicitud);
        setIsDetalleModalOpen(true);
    };

    // Función que se ejecuta después de la confirmación para eliminar detalle
    const actualDeleteDetalle = async (id_solicitud_detalle, id_solicitud) => {
        try {
            await deleteSolicitudDetalle(id_solicitud_detalle);
            setExpandedRows(prev => {
                const newState = { ...prev };
                delete newState[id_solicitud];
                return newState;
            });
            await handleToggleExpand(id_solicitud);
            toast.success('Detalle de solicitud eliminado exitosamente!'); // Notificación de éxito
        } catch (err) {
            setError(err.message);
            toast.error('Error al eliminar el detalle: ' + err.message); // Notificación de error
            console.error("Error deleting detalle de solicitud:", err);
        }
    };

    const handleDeleteDetalle = (id_solicitud_detalle, id_solicitud) => {
        setConfirmModalMessage('¿Estás seguro de que quieres eliminar este detalle de la solicitud?');
        setConfirmModalAction(() => () => actualDeleteDetalle(id_solicitud_detalle, id_solicitud));
        setShowConfirmModal(true);
    };

    // Columnas para la tabla de Solicitudes
    const solicitudesColumns = [
        {
            header: '', // Columna para el botón de expandir
            accessor: 'expand',
            cellClassName: 'w-10 text-center p-none',
            renderCell: (item) => (
                <button
                    onClick={() => handleToggleExpand(item.id_solicitud)}
                    className="text-gray-500 text-[18px] hover:text-white transition-colors duration-100"
                    title={expandedRows[item.id_solicitud] ? 'Colapsar Detalles' : 'Ver Detalles'}
                >
                    {loadingDetails[item.id_solicitud] ? (
                        <LoadingSpinner size="sm" color="white" />
                    ) : (
                        expandedRows[item.id_solicitud] ? '−' : '+'
                    )}
                </button>
            ),
        },
        { header: 'ID', accessor: 'id_solicitud', cellClassName: 'font-medium  ' },
        { header: 'Cliente', accessor: 'nombre_cliente', renderCell: (item) => item.nombre_cliente || 'Cliente Desconocido' },
        {
            header: 'Tipo',
            accessor: 'tipo_solicitud',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.tipo_solicitud === 'cotizacion' ? 'bg-blue-600' :
                    item.tipo_solicitud === 'cita' ? 'bg-purple-600' :
                    'bg-yellow-600' // consulta
                } text-white`}>
                    {item.tipo_solicitud}
                </span>
            ),
        },
        { header: 'Mensaje', accessor: 'mensaje', renderCell: (item) => <p className="line-clamp-2">{item.mensaje}</p> },
        {
            header: 'Fecha',
            accessor: 'fecha_solicitud',
            renderCell: (item) => format(new Date(item.fecha_solicitud), 'dd/MM/yyyy'),
        },
        {
            header: 'Estado',
            accessor: 'estado_solicitud',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.estado_solicitud === 'pendiente' ? 'bg-orange-600' :
                    item.estado_solicitud === 'en_proceso' ? 'bg-blue-600' :
                    item.estado_solicitud === 'completada' ? 'bg-green-600' :
                    'bg-red-600' // rechazada
                } text-white`}>
                    {item.estado_solicitud}
                </span>
            ),
        },
        { header: 'Observaciones Internas', accessor: 'observaciones_internas', renderCell: (item) => item.observaciones_internas || 'N/A' },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right',
            renderCell: (item) => (
                <>
                    <button
                        onClick={() => handleAddDetalleToSolicitud(item.id_solicitud)}
                        className="text-green-400 hover:text-green-600 font-medium mr-3 transition-colors duration-200"
                        title="Añadir Detalle"
                    >
                        + Detalle
                    </button>
                    <button
                        onClick={() => handleEditSolicitud(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteSolicitud(item.id_solicitud)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200"
                    >
                        Eliminar
                    </button>
                </>
            ),
        },
    ];

    // Columnas para la sub-tabla de Detalles de Solicitud
    const detallesColumns = [
        { header: 'ID Detalle', accessor: 'id_solicitud_detalle', cellClassName: 'font-medium text-gray-300' },
        {
            header: 'Ítem',
            accessor: 'item_name',
            renderCell: (item) => (
                item.nombre_servicio || item.nombre_repuesto || 'N/A'
            ),
            cellClassName: 'font-medium text-gray-300'
        },
        {
            header: 'Tipo Ítem',
            accessor: 'item_type',
            renderCell: (item) => (
                item.id_servicio ? 'Servicio' : (item.id_repuesto ? 'Repuesto' : 'Desconocido')
            ),
            cellClassName: 'text-gray-400 text-sm'
        },
        { header: 'Cantidad', accessor: 'cantidad', cellClassName: 'text-right text-gray-300' },
        {
            header: 'Precio Unitario',
            accessor: 'precio_unitario',
            renderCell: (item) => {
                const price = item.servicio_precio_referencia || item.repuesto_precio_unitario;
                return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
            },
            cellClassName: 'text-right text-gray-300'
        },
        { header: 'Observaciones', accessor: 'observaciones', renderCell: (item) => item.observaciones || 'N/A', cellClassName: 'text-gray-400' },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right',
            renderCell: (item) => (
                <>
                    <button
                        onClick={() => handleEditDetalle(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200 text-sm"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteDetalle(item.id_solicitud_detalle, item.id_solicitud)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200 text-sm"
                    >
                        Eliminar
                    </button>
                </>
            ),
        },
    ];


    if (loading) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
                <LoadingSpinner size="lg" color="primary" />
                <p className="mt-4">Cargando solicitudes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar solicitudes: {error}</p>
                <button
                    onClick={() => fetchData()}
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#0000004b] min-h-screen max-h-s rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            
            {/* encabezado de la pagina */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center sm:text-left">
                    Gestión de Solicitudes
                </h2>
                <button
                    onClick={() => { setSelectedSolicitud(null); setIsSolicitudModalOpen(true); }}
                    className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Solicitud
                </button>
            </div>

            {/* Controles de filtrado y buscador  hecho con flex para mejor responsibidad*/}
            <div className="flex flex-wrap item gap-4 mb-6">
                <div className='flex-2 min-w-36'>
                    <label htmlFor="searchCliente" className="block  text-gray-300 text-sm font-semibold mb-1">Buscar por Cliente (Nombre/Email):</label>
                    <input
                        type="text"
                        id="searchCliente"
                        value={tempSearchClienteName}
                        onChange={(e) => setTempSearchClienteName(e.target.value)}
                        placeholder="Nombre o email del cliente..."
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className='flex-1 min-w-36'>
                    <label htmlFor="filterTipo" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Tipo:</label>
                    <select
                        id="filterTipo"
                        value={filterTipoSolicitud}
                        onChange={(e) => { setFilterTipoSolicitud(e.target.value); setCurrentPageSolicitudes(1); }}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value=""  >Todos los Tipos</option>
                        {tiposSolicitud.map(tipo => (
                            <option key={tipo} value={tipo}>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex-1 min-w-36'>
                    <label htmlFor="filterEstado" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Estado:</label>
                    <select
                        id="filterEstado"
                        value={filterEstadoSolicitud}
                        onChange={(e) => { setFilterEstadoSolicitud(e.target.value); setCurrentPageSolicitudes(1); }}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Todos los Estados</option>
                        {estadosSolicitud.map(estado => (
                            <option key={estado} value={estado}>
                                {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Renderizado de la tabla de solicitudes con detalles expandibles (visible en MD y arriba) */}
            <div className="hidden md:block bg-gray-800 rounded-lg shadow-lg overflow-x-auto max-h-[95vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 sticky top-0 z-10">
                        <tr>
                            {solicitudesColumns.map((col, index) => (
                                <th
                                    key={col.accessor || index}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${col.headerClassName || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {solicitudes.length === 0 ? (
                            <tr>
                                <td colSpan={solicitudesColumns.length} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                                    No se encontraron solicitudes.
                                </td>
                            </tr>
                        ) : (
                            solicitudes.map((solicitud) => (
                                <React.Fragment key={solicitud.id_solicitud}>
                                    <tr className="hover:bg-gray-700 transition-colors duration-200">
                                        {solicitudesColumns.map((col, colIndex) => (
                                            <td
                                                key={col.accessor || colIndex}
                                                className={`px-4 py-4 whitespace-nowrap ${col.cellClassName || ''}`}
                                            >
                                                {col.renderCell ? col.renderCell(solicitud) : solicitud[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                    {expandedRows[solicitud.id_solicitud] && (
                                        <tr className="bg-[#131835]">
                                            <td colSpan={solicitudesColumns.length} className="p-4">
                                                <h5 className="text-md font-bold text-gray-200 mb-2">Detalles de Solicitud:</h5>
                                                {expandedRows[solicitud.id_solicitud].length === 0 ? (
                                                    <p className="text-gray-400 text-sm">No hay detalles para esta solicitud.</p>
                                                ) : (
                                                    <Table
                                                        data={expandedRows[solicitud.id_solicitud]}
                                                        columns={detallesColumns}
                                                        keyAccessor="id_solicitud_detalle"
                                                        emptyMessage="No hay detalles para esta solicitud."
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginación para la tabla principal */}
            {totalPagesSolicitudes > 1 && (
                <div className="flex justify-center items-center py-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
                    <button
                        onClick={() => handlePageChangeSolicitudes(currentPageSolicitudes - 1)}
                        disabled={currentPageSolicitudes === 1}
                        className="hidden sm:block px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Anterior
                    </button>

                    {/* Botones de números de página */}
                    {getPageNumbers().map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChangeSolicitudes(pageNumber)}
                            className={`px-3 py-1 mx-1 rounded-md ${
                                pageNumber === currentPageSolicitudes
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-600 text-white hover:bg-gray-500'
                            } transition-colors duration-200`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChangeSolicitudes(currentPageSolicitudes + 1)}
                        disabled={currentPageSolicitudes === totalPagesSolicitudes}
                        className="hidden sm:block px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Vista de Tarjetas (visible en pantallas pequeñas) - Sin cambios */}
            <div className=" md:hidden grid grid-cols-1 gap-4 mt-6">
                {solicitudes.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No se encontraron solicitudes.</p>
                ) : (
                    solicitudes.map((solicitud) => (
                        <div key={solicitud.id_solicitud} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-100">ID: {solicitud.id_solicitud}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    solicitud.estado_solicitud === 'pendiente' ? 'bg-orange-600' :
                                    solicitud.estado_solicitud === 'en_proceso' ? 'bg-blue-600' :
                                    solicitud.estado_solicitud === 'completada' ? 'bg-green-600' :
                                    'bg-red-600' // rechazada
                                } text-white`}>
                                    {solicitud.estado_solicitud}
                                </span>
                            </div>
                            <p className="text-gray-300">
                                <span className="font-semibold">Cliente:</span> {solicitud.nombre_cliente || 'Desconocido'}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-semibold">Tipo:</span> {solicitud.tipo_solicitud}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-semibold">Fecha:</span> {format(new Date(solicitud.fecha_solicitud), 'dd/MM/yyyy')}
                            </p>
                            <p className="text-gray-400 text-sm line-clamp-2">
                                <span className="font-semibold">Mensaje:</span> {solicitud.mensaje}
                            </p>
                            <div className="flex justify-end space-x-2 mt-3 flex-wrap">
                                <button
                                    onClick={() => handleAddDetalleToSolicitud(solicitud.id_solicitud)}
                                    className="text-green-400 hover:text-green-600 font-medium text-sm py-1 px-2 rounded-md"
                                    title="Añadir Detalle"
                                >
                                    + Detalle
                                </button>
                                <button
                                    onClick={() => handleEditSolicitud(solicitud)}
                                    className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteSolicitud(solicitud.id_solicitud)}
                                    className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md"
                                >
                                    Eliminar
                                </button>
                                <button
                                    onClick={() => handleToggleExpand(solicitud.id_solicitud)}
                                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm py-1 px-2 rounded-md"
                                    title={expandedRows[solicitud.id_solicitud] ? 'Colapsar Detalles' : 'Ver Detalles'}
                                >
                                    {loadingDetails[solicitud.id_solicitud] ? (
                                        <LoadingSpinner size="sm" color="white" />
                                    ) : (
                                        expandedRows[solicitud.id_solicitud] ? '− Detalles' : '+ Detalles'
                                    )}
                                </button>
                            </div>
                            {expandedRows[solicitud.id_solicitud] && (
                                <div className="bg-gray-700 p-3 rounded-lg mt-3">
                                    <h5 className="text-md font-bold text-gray-200 mb-2">Detalles:</h5>
                                    {expandedRows[solicitud.id_solicitud].length === 0 ? (
                                        <p className="text-gray-400 text-sm">No hay detalles para esta solicitud.</p>
                                    ) : (
                                        <Table
                                            data={expandedRows[solicitud.id_solicitud]}
                                            columns={detallesColumns}
                                            keyAccessor="id_solicitud_detalle"
                                            emptyMessage="No hay detalles para esta solicitud."
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modales */}
            <SolicitudFormModal
                isOpen={isSolicitudModalOpen}
                onClose={() => { setIsSolicitudModalOpen(false); setSelectedSolicitud(null); }}
                onSave={handleSaveSolicitud}
                solicitudItem={selectedSolicitud}
                clientes={clientes}
            />
            <SolicitudDetalleFormModal
                isOpen={isDetalleModalOpen}
                onClose={() => { setIsDetalleModalOpen(false); setSelectedDetalle(null); setCurrentSolicitudIdForDetails(null); }}
                onSave={handleSaveDetalle}
                detalleItem={selectedDetalle}
                idSolicitud={currentSolicitudIdForDetails}
                servicios={servicios}
                repuestos={repuestos}
            />

            {/* Modal de Confirmación Personalizado */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                message={confirmModalMessage}
                onConfirm={() => { confirmModalAction(); setShowConfirmModal(false); }}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
};

export default SolicitudesListPage;






// // src/pages/admin/SolicitudesListPage.jsx
// // Este componente gestiona la lista de solicitudes en el panel de administración,
// // con integración de API, filtrado, buscador por cliente y la capacidad de ver y gestionar detalles.

// import React, { useState, useEffect } from 'react';
// import SolicitudFormModal from './SolicitudFormModal';
// import SolicitudDetalleFormModal from './SolicitudDetalleFormModal';
// import { getAllSolicitudes, deleteSolicitud, getSolicitudDetallesBySolicitudId } from '../../api/solicitudesApi';
// import { deleteSolicitudDetalle } from '../../api/solicitudDetalleApi';
// import { getAllClientes } from '../../api/clientesApi';
// import { getAllServicios } from '../../api/servicesApi';
// import { getAllRepuestos } from '../../api/repuestosApi';
// import Table from '../../components/ui/Table'; // Se sigue usando para las sub-tablas de detalles
// import LoadingSpinner from '../../components/ui/LoadingSpinner';

// const SolicitudesListPage = ({ onNavigate }) => {
//     const [solicitudes, setSolicitudes] = useState([]);
//     const [clientes, setClientes] = useState([]);
//     const [servicios, setServicios] = useState([]);
//     const [repuestos, setRepuestos] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Estados para los modales de CRUD (crear/editar)
//     const [isSolicitudModalOpen, setIsSolicitudModalOpen] = useState(false);
//     const [selectedSolicitud, setSelectedSolicitud] = useState(null);

//     const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
//     const [selectedDetalle, setSelectedDetalle] = useState(null);
//     const [currentSolicitudIdForDetails, setCurrentSolicitudIdForDetails] = useState(null);

//     // Estados para filtros y buscador
//     const [filterTipoSolicitud, setFilterTipoSolicitud] = useState('');
//     const [filterEstadoSolicitud, setFilterEstadoSolicitud] = useState('');
    
//     // Nuevo estado para el valor del input de búsqueda (se actualiza en cada pulsación)
//     const [tempSearchClienteName, setTempSearchClienteName] = useState('');
//     // Estado para el valor de búsqueda que realmente dispara la API (se actualiza después del debounce)
//     const [searchClienteName, setSearchClienteName] = useState('');

//     // Estado para controlar las filas expandidas y sus detalles
//     const [expandedRows, setExpandedRows] = useState({}); // { solicitudId: [detalle1, detalle2], ... }
//     const [loadingDetails, setLoadingDetails] = useState({}); // { solicitudId: boolean, ... }

//     // Opciones para los select de filtros y formularios
//     const tiposSolicitud = ['cotizacion', 'cita', 'consulta'];
//     const estadosSolicitud = ['pendiente', 'en_proceso', 'completada', 'rechazada'];

//     // Efecto para implementar el debouncing en la búsqueda por nombre de cliente
//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setSearchClienteName(tempSearchClienteName);
//         }, 500);
//         return () => {
//             clearTimeout(handler);
//         };
//     }, [tempSearchClienteName]);

//     // Fetch inicial de datos
//     const fetchData = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const [solicitudesData, clientesData, serviciosData, repuestosData] = await Promise.all([
//                 getAllSolicitudes(searchClienteName, '', filterTipoSolicitud, filterEstadoSolicitud), // filterClienteId eliminado
//                 getAllClientes(),
//                 getAllServicios(),
//                 getAllRepuestos(),
//             ]);
//             setSolicitudes(solicitudesData.data);
//             setClientes(clientesData.data || []); // Corregido: Asegurarse de que clientes sea un array
//             setServicios(serviciosData);
//             setRepuestos(repuestosData);
//         } catch (err) {
//             setError(err.message);
//             console.error("Error fetching data for solicitudes:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, [filterTipoSolicitud, filterEstadoSolicitud, searchClienteName]);

//     // Manejador para expandir/colapsar filas y cargar detalles
//     const handleToggleExpand = async (solicitudId) => {
//         if (expandedRows[solicitudId]) {
//             // Si ya está expandida, colapsar
//             setExpandedRows(prev => {
//                 const newState = { ...prev };
//                 delete newState[solicitudId];
//                 return newState;
//             });
//         } else {
//             // Si no está expandida, cargar detalles y expandir
//             setLoadingDetails(prev => ({ ...prev, [solicitudId]: true }));
//             try {
//                 const detalles = await getSolicitudDetallesBySolicitudId(solicitudId);
//                 setExpandedRows(prev => ({ ...prev, [solicitudId]: detalles }));
//             } catch (err) {
//                 console.error(`Error loading details for solicitud ${solicitudId}:`, err);
//                 setError(`Error al cargar detalles para la solicitud ${solicitudId}: ${err.message}`);
//             } finally {
//                 setLoadingDetails(prev => {
//                     const newState = { ...prev };
//                     delete newState[solicitudId];
//                     return newState;
//                 });
//             }
//         }
//     };

//     // Manejadores para Solicitudes
//     const handleSaveSolicitud = async () => {
//         await fetchData();
//         setIsSolicitudModalOpen(false);
//         setSelectedSolicitud(null);
//         setExpandedRows({}); // Colapsar todos los detalles al guardar una solicitud
//     };

//     const handleEditSolicitud = (solicitudItem) => {
//         setSelectedSolicitud(solicitudItem);
//         setIsSolicitudModalOpen(true);
//     };

//     const handleDeleteSolicitud = async (id_solicitud) => {
//         if (window.confirm('¿Estás seguro de que quieres eliminar esta solicitud y todos sus detalles asociados?')) {
//             try {
//                 await deleteSolicitud(id_solicitud);
//                 await fetchData();
//                 setExpandedRows(prev => {
//                     const newState = { ...prev };
//                     delete newState[id_solicitud];
//                     return newState;
//                 });
//             } catch (err) {
//                 setError(err.message);
//                 console.error("Error deleting solicitud:", err);
//             }
//         }
//     };

//     // Manejadores para Detalles de Solicitud
//     const handleAddDetalleToSolicitud = (solicitudId) => {
//         setCurrentSolicitudIdForDetails(solicitudId);
//         setSelectedDetalle(null);
//         setIsDetalleModalOpen(true);
//     };

//     const handleSaveDetalle = async () => {
//         if (currentSolicitudIdForDetails) {
//             // Forzar recarga de detalles: colapsar y luego expandir
//             setExpandedRows(prev => {
//                 const newState = { ...prev };
//                 delete newState[currentSolicitudIdForDetails];
//                 return newState;
//             });
//             await handleToggleExpand(currentSolicitudIdForDetails);
//         }
//         setIsDetalleModalOpen(false);
//         setSelectedDetalle(null);
//         setCurrentSolicitudIdForDetails(null);
//     };

//     const handleEditDetalle = (detalleItem) => {
//         setSelectedDetalle(detalleItem);
//         setCurrentSolicitudIdForDetails(detalleItem.id_solicitud);
//         setIsDetalleModalOpen(true);
//     };

//     const handleDeleteDetalle = async (id_solicitud_detalle, id_solicitud) => {
//         if (window.confirm('¿Estás seguro de que quieres eliminar este detalle de la solicitud?')) {
//             try {
//                 await deleteSolicitudDetalle(id_solicitud_detalle);
//                 // Forzar recarga de detalles: colapsar y luego expandir
//                 setExpandedRows(prev => {
//                     const newState = { ...prev };
//                     delete newState[id_solicitud];
//                     return newState;
//                 });
//                 await handleToggleExpand(id_solicitud);
//             } catch (err) {
//                 setError(err.message);
//                 console.error("Error deleting detalle de solicitud:", err);
//             }
//         }
//     };

//     // Columnas para la tabla de Solicitudes
//     const solicitudesColumns = [
//         {
//             header: '', // Columna para el botón de expandir
//             accessor: 'expand',
//             cellClassName: 'w-10 text-center',
//             renderCell: (item) => (
//                 <button
//                     onClick={() => handleToggleExpand(item.id_solicitud)}
//                     className="text-gray-400 hover:text-white transition-colors duration-200"
//                     title={expandedRows[item.id_solicitud] ? 'Colapsar Detalles' : 'Ver Detalles'}
//                 >
//                     {loadingDetails[item.id_solicitud] ? (
//                         <LoadingSpinner size="sm" color="white" />
//                     ) : (
//                         expandedRows[item.id_solicitud] ? '−' : '+'
//                     )}
//                 </button>
//             ),
//         },
//         { header: 'ID Solicitud', accessor: 'id_solicitud', cellClassName: 'font-medium' },
//         { header: 'Cliente', accessor: 'nombre_cliente', renderCell: (item) => item.nombre_cliente || 'Cliente Desconocido' },
//         {
//             header: 'Tipo',
//             accessor: 'tipo_solicitud',
//             renderCell: (item) => (
//                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                     item.tipo_solicitud === 'cotizacion' ? 'bg-blue-600' :
//                     item.tipo_solicitud === 'cita' ? 'bg-purple-600' :
//                     'bg-yellow-600' // consulta
//                 } text-white`}>
//                     {item.tipo_solicitud}
//                 </span>
//             ),
//         },
//         { header: 'Mensaje', accessor: 'mensaje', renderCell: (item) => <p className="line-clamp-2">{item.mensaje}</p> },
//         {
//             header: 'Fecha',
//             accessor: 'fecha_solicitud',
//             renderCell: (item) => new Date(item.fecha_solicitud).toLocaleDateString(),
//         },
//         {
//             header: 'Estado',
//             accessor: 'estado_solicitud',
//             renderCell: (item) => (
//                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                     item.estado_solicitud === 'pendiente' ? 'bg-orange-600' :
//                     item.estado_solicitud === 'en_proceso' ? 'bg-blue-600' :
//                     item.estado_solicitud === 'completada' ? 'bg-green-600' :
//                     'bg-red-600' // rechazada
//                 } text-white`}>
//                     {item.estado_solicitud}
//                 </span>
//             ),
//         },
//         { header: 'Observaciones Internas', accessor: 'observaciones_internas', renderCell: (item) => item.observaciones_internas || 'N/A' },
//         {
//             header: 'Acciones',
//             accessor: 'actions',
//             cellClassName: 'text-right',
//             renderCell: (item) => (
//                 <>
//                     <button
//                         onClick={() => handleAddDetalleToSolicitud(item.id_solicitud)}
//                         className="text-green-400 hover:text-green-600 font-medium mr-3 transition-colors duration-200"
//                         title="Añadir Detalle"
//                     >
//                         + Detalle
//                     </button>
//                     <button
//                         onClick={() => handleEditSolicitud(item)}
//                         className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200"
//                     >
//                         Editar
//                     </button>
//                     <button
//                         onClick={() => handleDeleteSolicitud(item.id_solicitud)}
//                         className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200"
//                     >
//                         Eliminar
//                     </button>
//                 </>
//             ),
//         },
//     ];

//     // Columnas para la sub-tabla de Detalles de Solicitud
//     const detallesColumns = [
//         { header: 'ID Detalle', accessor: 'id_solicitud_detalle', cellClassName: 'font-medium text-gray-300' },
//         {
//             header: 'Ítem',
//             accessor: 'item_name',
//             renderCell: (item) => (
//                 item.nombre_servicio || item.nombre_repuesto || 'N/A'
//             ),
//             cellClassName: 'font-medium text-gray-300'
//         },
//         {
//             header: 'Tipo Ítem',
//             accessor: 'item_type',
//             renderCell: (item) => (
//                 item.id_servicio ? 'Servicio' : (item.id_repuesto ? 'Repuesto' : 'Desconocido')
//             ),
//             cellClassName: 'text-gray-400 text-sm'
//         },
//         { header: 'Cantidad', accessor: 'cantidad', cellClassName: 'text-right text-gray-300' },
//         {
//             header: 'Precio Unitario',
//             accessor: 'precio_unitario',
//             renderCell: (item) => {
//                 const price = item.servicio_precio_referencia || item.repuesto_precio_unitario;
//                 return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
//             },
//             cellClassName: 'text-right text-gray-300'
//         },
//         { header: 'Observaciones', accessor: 'observaciones', renderCell: (item) => item.observaciones || 'N/A', cellClassName: 'text-gray-400' },
//         {
//             header: 'Acciones',
//             accessor: 'actions',
//             cellClassName: 'text-right',
//             renderCell: (item) => (
//                 <>
//                     <button
//                         onClick={() => handleEditDetalle(item)}
//                         className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200 text-sm"
//                     >
//                         Editar
//                     </button>
//                     <button
//                         onClick={() => handleDeleteDetalle(item.id_solicitud_detalle, item.id_solicitud)}
//                         className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200 text-sm"
//                     >
//                         Eliminar
//                     </button>
//                 </>
//             ),
//         },
//     ];


//     if (loading) {
//         return (
//             <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
//                 <LoadingSpinner size="lg" color="primary" />
//                 <p className="mt-4">Cargando solicitudes...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
//                 <p>Error al cargar solicitudes: {error}</p>
//                 <button
//                     onClick={() => fetchData()}
//                     className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
//                 >
//                     Reintentar
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="p-8 bg-gray-900 min-h-screen rounded-lg shadow-md animate-fadeIn text-white">
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-4xl font-bold text-gray-100">Gestión de Solicitudes</h2>
//                 <button
//                     onClick={() => { setSelectedSolicitud(null); setIsSolicitudModalOpen(true); }}
//                     className="bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105"
//                 >
//                     + Añadir Solicitud
//                 </button>
//             </div>

//             {/* Controles de filtrado y buscador */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div>
//                     <label htmlFor="searchCliente" className="block text-gray-300 text-sm font-semibold mb-1">Buscar por Cliente (Nombre/Email):</label>
//                     <input
//                         type="text"
//                         id="searchCliente"
//                         value={tempSearchClienteName}
//                         onChange={(e) => setTempSearchClienteName(e.target.value)}
//                         placeholder="Nombre o email del cliente..."
//                         className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="filterTipo" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Tipo:</label>
//                     <select
//                         id="filterTipo"
//                         value={filterTipoSolicitud}
//                         onChange={(e) => setFilterTipoSolicitud(e.target.value)}
//                         className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
//                     >
//                         <option value="">Todos los Tipos</option>
//                         {tiposSolicitud.map(tipo => (
//                             <option key={tipo} value={tipo}>
//                                 {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div>
//                     <label htmlFor="filterEstado" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Estado:</label>
//                     <select
//                         id="filterEstado"
//                         value={filterEstadoSolicitud}
//                         onChange={(e) => setFilterEstadoSolicitud(e.target.value)}
//                         className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
//                     >
//                         <option value="">Todos los Estados</option>
//                         {estadosSolicitud.map(estado => (
//                             <option key={estado} value={estado}>
//                                 {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             {/* Renderizado de la tabla de solicitudes con detalles expandibles (visible en MD y arriba) */}
//             <div className="hidden md:block bg-gray-800 rounded-lg shadow-lg overflow-x-auto max-h-[95vh] overflow-y-auto">
//                 <table className="min-w-full divide-y divide-gray-700">
//                     <thead className="bg-gray-700 sticky top-0 z-10">
//                         <tr>
//                             {solicitudesColumns.map((col, index) => (
//                                 <th
//                                     key={index} // Usar index para key en encabezados es aceptable si el orden no cambia
//                                     scope="col"
//                                     className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${col.headerClassName || ''}`}
//                                 >
//                                     {col.header}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-700">
//                         {solicitudes.length === 0 ? (
//                             <tr>
//                                 <td colSpan={solicitudesColumns.length} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
//                                     No se encontraron solicitudes.
//                                 </td>
//                             </tr>
//                         ) : (
//                             solicitudes.map((solicitud) => (
//                                 <React.Fragment key={solicitud.id_solicitud}>
//                                     <tr className="hover:bg-gray-700 transition-colors duration-200">
//                                         {solicitudesColumns.map((col, colIndex) => (
//                                             <td
//                                                 key={col.accessor || colIndex} // Usar accessor si existe, sino index
//                                                 className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ''}`}
//                                             >
//                                                 {col.renderCell ? col.renderCell(solicitud) : solicitud[col.accessor]}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                     {expandedRows[solicitud.id_solicitud] && (
//                                         <tr className="bg-gray-700">
//                                             <td colSpan={solicitudesColumns.length} className="p-4">
//                                                 <h5 className="text-md font-bold text-gray-200 mb-2">Detalles de Solicitud:</h5>
//                                                 {expandedRows[solicitud.id_solicitud].length === 0 ? (
//                                                     <p className="text-gray-400 text-sm">No hay detalles para esta solicitud.</p>
//                                                 ) : (
//                                                     <Table
//                                                         data={expandedRows[solicitud.id_solicitud]}
//                                                         columns={detallesColumns}
//                                                         keyAccessor="id_solicitud_detalle"
//                                                         emptyMessage="No hay detalles para esta solicitud."
//                                                     />
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </React.Fragment>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Vista de Tarjetas (visible en pantallas pequeñas) - Sin cambios */}
//             <div className="block md:hidden grid grid-cols-1 gap-4 mt-6">
//                 {solicitudes.length === 0 ? (
//                     <p className="text-gray-400 text-center py-4">No se encontraron solicitudes.</p>
//                 ) : (
//                     solicitudes.map((solicitud) => (
//                         <div key={solicitud.id_solicitud} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700">
//                             <div className="flex justify-between items-center">
//                                 <span className="text-lg font-bold text-gray-100">ID: {solicitud.id_solicitud}</span>
//                                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                                     solicitud.estado_solicitud === 'pendiente' ? 'bg-orange-600' :
//                                     solicitud.estado_solicitud === 'en_proceso' ? 'bg-blue-600' :
//                                     solicitud.estado_solicitud === 'completada' ? 'bg-green-600' :
//                                     'bg-red-600' // rechazada
//                                 } text-white`}>
//                                     {solicitud.estado_solicitud}
//                                 </span>
//                             </div>
//                             <p className="text-gray-300">
//                                 <span className="font-semibold">Cliente:</span> {solicitud.nombre_cliente || 'Desconocido'}
//                             </p>
//                             <p className="text-gray-300">
//                                 <span className="font-semibold">Tipo:</span> {solicitud.tipo_solicitud}
//                             </p>
//                             <p className="text-gray-300">
//                                 <span className="font-semibold">Fecha:</span> {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
//                             </p>
//                             <p className="text-gray-400 text-sm line-clamp-2">
//                                 <span className="font-semibold">Mensaje:</span> {solicitud.mensaje}
//                             </p>
//                             <div className="flex justify-end space-x-2 mt-3 flex-wrap">
//                                 <button
//                                     onClick={() => handleAddDetalleToSolicitud(solicitud.id_solicitud)}
//                                     className="text-green-400 hover:text-green-600 font-medium text-sm py-1 px-2 rounded-md"
//                                     title="Añadir Detalle"
//                                 >
//                                     + Detalle
//                                 </button>
//                                 <button
//                                     onClick={() => handleEditSolicitud(solicitud)}
//                                     className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md"
//                                 >
//                                     Editar
//                                 </button>
//                                 <button
//                                     onClick={() => handleDeleteSolicitud(solicitud.id_solicitud)}
//                                     className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md"
//                                 >
//                                     Eliminar
//                                 </button>
//                                 <button
//                                     onClick={() => handleToggleExpand(solicitud.id_solicitud)}
//                                     className="text-gray-400 hover:text-white transition-colors duration-200 text-sm py-1 px-2 rounded-md"
//                                     title={expandedRows[solicitud.id_solicitud] ? 'Colapsar Detalles' : 'Ver Detalles'}
//                                 >
//                                     {loadingDetails[solicitud.id_solicitud] ? (
//                                         <LoadingSpinner size="sm" color="white" />
//                                     ) : (
//                                         expandedRows[solicitud.id_solicitud] ? '− Detalles' : '+ Detalles'
//                                     )}
//                                 </button>
//                             </div>
//                             {expandedRows[solicitud.id_solicitud] && (
//                                 <div className="bg-gray-700 p-3 rounded-lg mt-3">
//                                     <h5 className="text-md font-bold text-gray-200 mb-2">Detalles:</h5>
//                                     {expandedRows[solicitud.id_solicitud].length === 0 ? (
//                                         <p className="text-gray-400 text-sm">No hay detalles para esta solicitud.</p>
//                                     ) : (
//                                         <Table
//                                             data={expandedRows[solicitud.id_solicitud]}
//                                             columns={detallesColumns}
//                                             keyAccessor="id_solicitud_detalle"
//                                             emptyMessage="No hay detalles para esta solicitud."
//                                         />
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     ))
//                 )}
//             </div>

//             {/* Modales */}
//             <SolicitudFormModal
//                 isOpen={isSolicitudModalOpen}
//                 onClose={() => { setIsSolicitudModalOpen(false); setSelectedSolicitud(null); }}
//                 onSave={handleSaveSolicitud}
//                 solicitudItem={selectedSolicitud}
//                 clientes={clientes}
//             />
//             <SolicitudDetalleFormModal
//                 isOpen={isDetalleModalOpen}
//                 onClose={() => { setIsDetalleModalOpen(false); setSelectedDetalle(null); setCurrentSolicitudIdForDetails(null); }}
//                 onSave={handleSaveDetalle}
//                 detalleItem={selectedDetalle}
//                 idSolicitud={currentSolicitudIdForDetails}
//                 servicios={servicios}
//                 repuestos={repuestos}
//             />
//         </div>
//     );
// };

// export default SolicitudesListPage;
