// src/pages/admin/PromocionesListPage.jsx
// Este componente gestiona la lista de promociones en el panel de administración,
// con integración de API, filtrado por estado y búsqueda por título.
import React, { useState, useEffect } from 'react';
import PromocionFormModal from './PromocionFormModal';
import { getAllPromociones, deletePromocion } from '../../api/promocionesApi'; // Importa las funciones de la API
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PromocionesListPage = ({ onNavigate }) => {
    const [promociones, setPromociones] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromocion, setSelectedPromocion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Nuevo estado para el filtro de estado de las promociones. Por defecto, mostramos 'activa'.
    const [filterStatus, setFilterStatus] = useState('');
    // Nuevo estado para el input de búsqueda de título (se actualiza en cada pulsación)
    const [tempTituloSearchInput, setTempTituloSearchInput] = useState('');
    // Nuevo estado para el filtro de título aplicado (se actualiza después del debounce)
    const [appliedTituloFilter, setAppliedTituloFilter] = useState('');
    // Nuevo estado para el filtro de categoría
    const [filterCategory, setFilterCategory] = useState('');

    // Nuevo estado para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 10;

    // Definir las categorías permitidas para el filtro
    const categoriasPermitidas = ['repuestos', 'servicios', 'otros'];

    // Efecto para implementar el debouncing en la búsqueda por título
    useEffect(() => {
        const handler = setTimeout(() => {
            setAppliedTituloFilter(tempTituloSearchInput);
            setCurrentPage(1); // Resetea a la página 1 en cada nueva búsqueda
        }, 500); // Retraso de 500ms

        return () => {
            clearTimeout(handler);
        };
    }, [tempTituloSearchInput]); // Este efecto se ejecuta cada vez que `tempTituloSearchInput` cambia

    const fetchPromociones = async () => {
        setLoading(true);
        setError(null);
        try {
            // Pasa los filtros aplicados (incluida la categoría) y la paginación a la función getAllPromociones
            const data = await getAllPromociones(filterStatus, appliedTituloFilter, filterCategory, currentPage, ITEMS_PER_PAGE);
            setPromociones(data.data || []); // El array de datos está en la propiedad 'data'
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.totalItems || 0);
            setCurrentPage(data.currentPage || 1);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching promotions:", err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar las promociones cuando el componente se monta o cuando cambia un filtro o la página.
    useEffect(() => {
        fetchPromociones();
    }, [filterStatus, appliedTituloFilter, filterCategory, currentPage]); // Dependencias: filtros y página actual

    const handleSavePromocion = async () => {
        const isNew = !selectedPromocion; // Guardamos si es una creación antes de limpiar el estado
        setIsModalOpen(false);
        setSelectedPromocion(null);

        // Si se crea una nueva promoción y no estamos en la página 1, vamos a ella.
        // El cambio de página disparará el useEffect para recargar.
        if (isNew && currentPage !== 1) {
            setCurrentPage(1);
        } else {
            // Si editamos, o creamos estando ya en la página 1, recargamos manualmente.
            await fetchPromociones();
        }
    };

    const handleEditPromocion = (promocionItem) => {
        setSelectedPromocion(promocionItem);
        setIsModalOpen(true);
    };

    const handleDeletePromocion = async (id_promocion) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
            try {
                await deletePromocion(id_promocion);
                // Si eliminamos el último elemento de una página (y no es la primera),
                // vamos a la página anterior.
                if (promociones.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    // En cualquier otro caso, solo recargamos la página actual.
                    await fetchPromociones();
                }
            } catch (err) {
                setError(err.message);
                console.error("Error deleting promotion:", err);
            }
        }
    };

    // Definición de las columnas para el componente Table
    const columns = [

        {header: 'ID',accessor: 'id_promocion',cellClassName: 'font-mono text-xs text-gray-400'},
        { header: 'Título', accessor: 'titulo', cellClassName: 'font-medium' },
        {
            header: 'Descripción',
            accessor: 'descripcion',
            renderCell: (item) => (
                <p className="line-clamp-2">{item.descripcion || 'N/A'}</p>
            ),
        },
        {
            header: 'Fecha Inicio',
            accessor: 'fecha_inicio',
            renderCell: (item) => new Date(item.fecha_inicio).toLocaleDateString(),
        },
        {
            header: 'Fecha Fin',
            accessor: 'fecha_fin',
            renderCell: (item) => item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : 'N/A',
        },
        {
            header: 'Descuento',
            accessor: 'descuento',
            renderCell: (item) => (
                <span className="font-semibold text-green-400">{item.descuento ? `${parseFloat(item.descuento).toFixed(2)}%` : 'N/A'}</span>
            ),
        },
        {
            header: 'Categoría', accessor: 'categoria', cellClassName: 'capitalize'
        },
        {
            header: 'Imagen URL',
            accessor: 'imagen_promocion',
            renderCell: (item) => item.imagen_promocion ? (
                <a href={item.imagen_promocion} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Ver Imagen</a>
            ) : 'N/A',
        },
        {
            header: 'Estado',
            accessor: 'estado',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.estado === 'activa' ? 'bg-green-600 text-white' :
                    item.estado === 'inactiva' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white' // finalizada
                }`}>
                    {item.estado}
                </span>
            ),
        },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right',
            renderCell: (item) => (
                <>
                    <button
                        onClick={() => handleEditPromocion(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeletePromocion(item.id_promocion)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200"
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
                <p className="mt-4">Cargando promociones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar promociones: {error}</p>
                <button
                    onClick={() => fetchPromociones()} // Reintentar al hacer clic
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#0000004b] min-h-screen rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            {/* Cabecera responsiva */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center sm:text-left">
                    Gestión de Promociones
                </h2>
                <button
                    onClick={() => { setSelectedPromocion(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Promoción
                </button>
            </div>

            {/* Controles de filtrado y búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Buscar por Título */}
                <div>
                    <label htmlFor="tituloSearchInput" className="block text-gray-300 text-sm font-semibold mb-1">Buscar por Título:</label>
                    <input
                        type="text"
                        id="tituloSearchInput"
                        value={tempTituloSearchInput} // Vinculado al estado temporal
                        onChange={(e) => setTempTituloSearchInput(e.target.value)} // Actualiza el estado temporal en cada pulsación
                        placeholder="Título de la promoción"
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Filtro por Estado */}
                <div>
                    <label htmlFor="filterStatus" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Estado:</label>
                    <select
                        id="filterStatus"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Todas</option>
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                        <option value="finalizada">Finalizada</option>
                    </select>
                </div>

                {/* Filtro por Categoría */}
                <div>
                    <label htmlFor="filterCategory" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Categoría:</label>
                    <select
                        id="filterCategory"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Todas</option>
                        {categoriasPermitidas.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Renderizado de la tabla de promociones (visible en MD y arriba) */}
            <div className="hidden md:block">
                <Table
                    columns={columns}
                    data={promociones}
                    keyAccessor="id_promocion"
                    emptyMessage="No se encontraron promociones."
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Vista de Tarjetas (visible en pantallas pequeñas) */}
            <div className=" md:hidden grid grid-cols-1 gap-4 mt-6">
                {promociones.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No se encontraron promociones.</p>
                ) : (
                    promociones.map((promocion) => (
                        <div key={promocion.id_promocion} className="bg-gray-800 rounded-lg shadow-md p-4 space-y-2 border border-gray-700 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-100">{promocion.titulo}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    promocion.estado === 'activa' ? 'bg-green-600 text-white' :
                                    promocion.estado === 'inactiva' ? 'bg-yellow-600 text-white' :
                                    'bg-red-600 text-white' // finalizada
                                }`}>
                                    {promocion.estado}
                                </span>
                            </div>
                            <p className="text-gray-300">
                                <span className="font-semibold">Inicio:</span> {new Date(promocion.fecha_inicio).toLocaleDateString()}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-semibold">Fin:</span> {promocion.fecha_fin ? new Date(promocion.fecha_fin).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-green-400 font-bold">
                                <span className="font-semibold text-gray-300">Descuento:</span> {promocion.descuento ? `${parseFloat(promocion.descuento).toFixed(2)}%` : 'N/A'}
                            </p>
                            <p className="text-gray-300 capitalize">
                                <span className="font-semibold">Categoría:</span> {promocion.categoria || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm line-clamp-2">
                                <span className="font-semibold">Descripción:</span> {promocion.descripcion || 'N/A'}
                            </p>
                            {promocion.imagen_promocion && (
                                <a href={promocion.imagen_promocion} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm block mt-2">Ver Imagen</a>
                            )}
                            <div className="flex justify-end space-x-2 mt-3 flex-wrap">
                                <button
                                    onClick={() => handleEditPromocion(promocion)}
                                    className="text-blue-400 hover:text-blue-600 font-medium text-sm py-1 px-2 rounded-md"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeletePromocion(promocion.id_promocion)}
                                    className="text-red-400 hover:text-red-600 font-medium text-sm py-1 px-2 rounded-md"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <PromocionFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedPromocion(null); }}
                onSave={handleSavePromocion}
                promocionItem={selectedPromocion}
            />
        </div>
    );
};

export default PromocionesListPage;
