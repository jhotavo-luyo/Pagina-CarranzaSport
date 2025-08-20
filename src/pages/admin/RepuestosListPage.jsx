// src/pages/admin/RepuestosListPage.jsx
// Este componente gestiona la lista de repuestos en el panel de administración,
// con integración de API, filtrado y ahora con botones explícitos de búsqueda.

// --- Importaciones de React y Librerías ---
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// --- Importaciones de Componentes y APIs ---
import RepuestoFormModal from './RepuestoFormModal';
import RepuestosCategoriasModal from './RepuestosCategoriasModal'; // Importar el nuevo modal para edicion de categorias
import RepuestoMediaModal from './RepuestoMediaModal'; // Importar el modal de multimedia
import { getAllRepuestos, deleteRepuesto } from '../../api/repuestosApi';
import { getAllRepuestoCategories } from '../../api/categoriaRepuestosApi';
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useDebounce from '../../hooks/useDebounce';
import { PhotoIcon } from '@heroicons/react/24/solid'; // Importar ícono para el botón de multimedia

// --- Componente Principal ---
const RepuestosListPage = ({ onNavigate }) => {
    // --- Estados para los Datos ---
    const [repuestos, setRepuestos] = useState([]);
    const [categories, setCategories] = useState([]);

    // --- Estados para los Modales ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [selectedRepuesto, setSelectedRepuesto] = useState(null);

    // --- Estados para la UI (Carga y Errores) ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para los Filtros ---
    // Estados para los valores actuales de los inputs de texto (se actualizan en cada tecla)
    const [nombreSearchInput, setNombreSearchInput] = useState('');
    const [marcaSearchInput, setMarcaSearchInput] = useState('');

    // Estados para los filtros que se aplican a la API
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    
    // Usamos el hook useDebounce para los filtros de texto. Esto retrasa la llamada a la API
    // hasta que el usuario deja de escribir por 500ms, mejorando el rendimiento.
    const debouncedNombre = useDebounce(nombreSearchInput, 500);
    const debouncedMarca = useDebounce(marcaSearchInput, 500);

    // --- Estados para la Paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // --- Función para Cargar Datos ---
    const fetchRepuestosAndCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const [repuestosResult, categoriesData] = await Promise.all([
                getAllRepuestos(filterStatus, filterCategory || null, debouncedMarca, debouncedNombre, currentPage, itemsPerPage),
                getAllRepuestoCategories()
            ]);
            // Actualizamos los estados con los datos paginados recibidos de la API
            setRepuestos(repuestosResult.data);
            setTotalItems(repuestosResult.totalItems);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message);
            if (repuestos.length > 0) { // Si ya hay datos, muestra un toast en lugar de romper la vista
                toast.error(`Error al actualizar la lista: ${err.message}`);
            }
            console.error("Error fetching repuestos or categories:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Efectos (useEffect) ---
    // Este efecto resetea la paginación a la primera página cada vez que un filtro cambia.
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterCategory, debouncedNombre, debouncedMarca]);

    // Este efecto vuelve a cargar los datos cada vez que un filtro o la página actual cambian.
    useEffect(() => {
        fetchRepuestosAndCategories();
    }, [filterStatus, filterCategory, debouncedNombre, debouncedMarca, currentPage, itemsPerPage]);

    // --- Manejadores de Eventos (Handlers) ---
    // Maneja el cambio en el selector de categorías.
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'manage-categories') {
            setIsCategoryModalOpen(true);
            e.target.value = filterCategory; // Resetear el select para que no se quede en "Gestionar..."
        } else {
            setFilterCategory(value);
        }
    };

    // Cierra el modal de categorías y recarga los datos.
    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        fetchRepuestosAndCategories(); // Recargar todo para que la lista de categorías se actualice en el select.
    };

    // Abre el modal para gestionar la multimedia de un repuesto.
    const handleOpenMediaModal = (repuestoItem) => {
        setSelectedRepuesto(repuestoItem);
        setIsMediaModalOpen(true);
    };

    // Cierra el modal de multimedia.
    const handleCloseMediaModal = () => {
        setIsMediaModalOpen(false);
    };

    // Limpia todos los filtros y los resetea a sus valores por defecto.
    const handleClearFilters = () => {
        setNombreSearchInput('');
        setMarcaSearchInput('');
        setFilterStatus('');
        setFilterCategory('');
    };
    
    // Se ejecuta al guardar un repuesto (nuevo o editado).
    const handleSaveRepuesto = async () => {
        await fetchRepuestosAndCategories();
        setIsModalOpen(false);
        setSelectedRepuesto(null);
    };

    // Abre el modal de edición con los datos del repuesto seleccionado.
    const handleEditRepuesto = (repuestoItem) => {
        setSelectedRepuesto(repuestoItem);
        setIsModalOpen(true);
    };

    // Elimina un repuesto tras la confirmación del usuario.
    const handleDeleteRepuesto = async (id_repuesto) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este repuesto?')) {
            try {
                await deleteRepuesto(id_repuesto);
                await fetchRepuestosAndCategories();
            } catch (err) {
                setError(err.message);
                console.error("Error deleting repuesto:", err);
            }
        }
    };

    // Maneja el cambio de página en la paginación.
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // --- Definición de las Columnas para la Tabla ---
    const columns = [
        { header: 'ID', accessor: 'id_repuesto', cellClassName: 'font-mono text-xs text-gray-400' },
        { header: 'Nombre', accessor: 'nombre_repuesto', cellClassName: 'font-medium' },
        {
            header: 'Categoría',
            accessor: 'nombre_categoria',
            renderCell: (item) => item.nombre_categoria || 'Sin Categoría',
        },
        { header: 'Marca', accessor: 'marca', renderCell: (item) => item.marca || 'N/A' },
        { header: 'Modelo Comp.', accessor: 'modelo_vehiculo_compatible', renderCell: (item) => item.modelo_vehiculo_compatible || 'N/A' },
        { header: 'SKU', accessor: 'codigo_sku', renderCell: (item) => item.codigo_sku || 'N/A' },
        {
            header: 'Precio Unit.',
            accessor: 'precio_unitario',
            renderCell: (item) => `$${parseFloat(item.precio_unitario).toFixed(2)}`,
            cellClassName: 'text-right'
        },
        {
            header: 'Stock',
            accessor: 'stock_disponible',
            cellClassName: 'text-right'
        },
        {
            header: 'Estado',
            accessor: 'estado',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.estado === 'disponible' ? 'bg-green-600 text-white' :
                    item.estado === 'agotado' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                }`}>
                    {item.estado}
                </span>
            ),
        },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right whitespace-nowrap',
            // `renderCell` permite renderizar JSX personalizado en lugar de solo mostrar el dato.
            renderCell: (item) => (
                <div className="flex justify-end items-center space-x-3">
                    <button
                        onClick={() => handleOpenMediaModal(item)}
                        className="text-green-400 hover:text-green-600 font-medium transition-colors duration-200 flex items-center"
                        title="Gestionar Multimedia"
                    >
                        <PhotoIcon className="w-5 h-5 mr-1" />
                        Multi<span className='hidden sm:block' >media</span> 
                    </button>
                    <button
                        onClick={() => handleEditRepuesto(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteRepuesto(item.id_repuesto)}
                        className="text-red-400 hover:text-red-600 font-medium"
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    // --- Lógica de Renderizado ---
    if (loading && repuestos.length === 0) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
                <LoadingSpinner size="lg" color="primary" />
                <p className="mt-4">Cargando repuestos...</p>
            </div>
        );
    }

    if (error && repuestos.length === 0) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar repuestos: {error}</p>
                <button
                    onClick={fetchRepuestosAndCategories} // Corregido: Llama a la función de carga directamente
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        // Contenedor principal de la página
        <div className="p-8 bg-[#0000004b] min-h-screen rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold text-gray-100">Gestión de Repuestos</h2>
                <button
                    onClick={() => { setSelectedRepuesto(null); setIsModalOpen(true); }}
                    className="bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Repuesto
                </button>
            </div>

            {/* Sección de Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end">
                {/* Buscar por Nombre */}
                <div>
                    <label htmlFor="nombreSearchInput" className="block text-gray-300 text-sm font-semibold mb-1">Buscar por Nombre:</label>
                        <input
                            type="text"
                            id="nombreSearchInput"
                            value={nombreSearchInput}
                            onChange={(e) => setNombreSearchInput(e.target.value)}
                            placeholder="Nombre del repuesto"
                            className="flex-1 px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                </div>
                {/* Filtrar por Marca */}
                <div>
                    <label htmlFor="marcaSearchInput" className="block  text-gray-300 text-sm font-semibold mb-1">Filtrar por Marca:</label>
                        <input
                            type="text"
                            id="marcaSearchInput"
                            value={marcaSearchInput}
                            onChange={(e) => setMarcaSearchInput(e.target.value)}
                            placeholder="Marca"
                            className="flex-1 px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                </div>
                {/* Filtrar por Categoría (select, no necesita botón de búsqueda) */}
                <div>
                    <label htmlFor="filterCategory" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Categoría:</label>
                    <select
                        id="filterCategory"
                        value={filterCategory}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Todas</option>
                        {categories.map(cat => (
                            <option key={cat.id_categoria_repuesto} value={cat.id_categoria_repuesto}>
                                {cat.nombre_categoria}
                            </option> 
                        ))}
                        <optgroup label="──────────"></optgroup>
                        <option value="manage-categories" className="font-bold text-blue-400">
                            + Gestionar Categorías...
                        </option>
                    </select>
                </div>
                {/* Filtrar por Estado (select, no necesita botón de búsqueda) */}
                <div>
                    <label htmlFor="filterStatus" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Estado:</label>
                    <select
                        id="filterStatus"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Todos</option>
                        <option value="disponible">Disponible</option>
                        <option value="agotado">Agotado</option>
                        <option value="descontinuado">Descontinuado</option>
                    </select>
                </div>
                {/* Botón para limpiar filtros */}
                <div>
                    <button
                        onClick={handleClearFilters}
                        className="w-full bg-[#192539eb] text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Contenedor para la tabla y el indicador de carga superpuesto */}
            <div className="relative">
                {/* Indicador de carga sutil para cuando se aplican filtros */}
                {loading && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-20 rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}
                {/* Componente de Tabla Genérico */}
                <Table
                    columns={columns}
                    data={repuestos}
                    keyAccessor="id_repuesto"
                    emptyMessage="No se encontraron repuestos con los filtros actuales."
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Modales */}
            <RepuestoFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedRepuesto(null); }}
                onSave={handleSaveRepuesto}
                repuestoItem={selectedRepuesto}
                categories={categories}
            />

            <RepuestosCategoriasModal
                isOpen={isCategoryModalOpen}
                onClose={handleCloseCategoryModal}
            />

            <RepuestoMediaModal
                isOpen={isMediaModalOpen}
                onClose={handleCloseMediaModal}
                repuesto={selectedRepuesto}
            />
        </div>
    );
};

export default RepuestosListPage;