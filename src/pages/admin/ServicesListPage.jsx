// src/pages/admin/ServicesListPage.jsx
// Este componente gestiona la lista de servicios en el panel de administración,
// con integración de API y filtrado por estado y categoría.
import React, { useState, useEffect } from 'react';
import ServiceFormModal from './ServiceFormModal'; // Crearemos este modal en el siguiente paso
import ServicesCategoriasModal from './ServicesCategoriasModal'; // Importar el nuevo modal
import { getAllServicios, deleteService } from '../../api/servicesApi'; // Importa las funciones de la API
import {getAllServiceCategories} from '../../api/categoriasServiciosApi';
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PhotoIcon } from '@heroicons/react/24/solid';
import ServiceMediaModal from './servicesMediaModal';

const ServicesListPage = ({ onNavigate }) => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]); // Estado para las categorías
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // Nuevo estado para el modal de categorías
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('activo'); // Filtro por estado por defecto
    const [filterCategory, setFilterCategory] = useState(''); // Filtro por categoría por defecto (todas)

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchServicesAndCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const [servicesResult, categoriesData] = await Promise.all([
                getAllServicios(filterStatus, filterCategory || null, currentPage, itemsPerPage),
                getAllServiceCategories()
            ]);
            setServices(servicesResult.data);
            setTotalItems(servicesResult.totalItems);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching services or categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Resetear a la página 1 cuando los filtros cambian
        setCurrentPage(1);
    }, [filterStatus, filterCategory]);

    useEffect(() => {
        fetchServicesAndCategories();
    }, [filterStatus, filterCategory, currentPage, itemsPerPage]); // Se vuelve a ejecutar cuando los filtros o la página cambian

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'manage-categories') {
            setIsCategoryModalOpen(true);
            e.target.value = filterCategory; // Resetear el select para que no se quede en "Gestionar..."
        } else {
            setFilterCategory(value);
        }
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        fetchServicesAndCategories(); // Recargar todo para que la lista de categorías se actualice en el select.
    };

    const handleSaveService = async () => {
        await fetchServicesAndCategories(); // Recarga servicios y categorías después de guardar
        setIsModalOpen(false);
        setSelectedService(null);
    };

    const handleEditService = (serviceItem) => {
        setSelectedService(serviceItem);
        setIsModalOpen(true);
    };

    const handleDeleteService = async (id_servicio) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
            try {
                await deleteService(id_servicio);
                await fetchServicesAndCategories();
            } catch (err) {
                setError(err.message);
                console.error("Error deleting service:", err);
            }
        }
    };

    const handleOpenMediaModal = (serviceItem) => {
        setSelectedService(serviceItem);
        setIsMediaModalOpen(true);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCloseMediaModal = () => {
        setIsMediaModalOpen(false);
    };

    // Definición de las columnas para el componente Table
    const columns = [
        {
            header: 'ID',
            accessor: 'id_servicio',
            cellClassName: 'font-mono text-xs text-gray-400'
        },
        {
            header: 'Nombre',
            accessor: 'nombre_servicio',
            cellClassName: 'font-medium'
        },
        {
            header: 'Descripción',
            accessor: 'descripcion',
            renderCell: (item) => (
                <p className="line-clamp-2">{item.descripcion}</p>
            ),
        },
        {
            header: 'Categoría',
            accessor: 'nombre_categoria', // Este campo viene del JOIN en el backend
            renderCell: (item) => item.nombre_categoria || 'Sin Categoría',
        },
        {
            header: 'Precio Ref.',
            accessor: 'precio_referencia',
            renderCell: (item) => `$${parseFloat(item.precio_referencia).toFixed(2)}`,
            cellClassName: 'text-right'
        },
        {
            header: 'Estado',
            accessor: 'estado',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.estado === 'activo' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {item.estado}
                </span>
            ),
        },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right whitespace-nowrap',
            renderCell: (item) => (
                <div className="flex justify-end items-center space-x-3">
                    <button
                        onClick={() => handleOpenMediaModal(item)}
                        className="text-green-400 hover:text-green-600 font-medium transition-colors duration-200 flex items-center"
                        title="Gestionar Multimedia"
                    >
                        <PhotoIcon className="w-5 h-5 mr-1" />
                        Multimedia
                    </button>
                    <button
                        onClick={() => handleEditService(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteService(item.id_servicio)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200"
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
                <p className="mt-4">Cargando servicios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar servicios: {error}</p>
                <button
                    onClick={fetchServicesAndCategories}
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        // Contenido de la página
        // cabezesera de la página(titulo y botom añadir)
        <div className="p-4 md:p-8 bg-[#0000004b] min-h-screen max-h-s rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            {/* Cabecera responsiva: apilada en móvil, en línea en pantallas más grandes */}
            <div className="flex flex-col items-center gap-4 mb-6 sm:flex-row sm:justify-between">
                <h2 className="text-3xl font-bold text-center text-gray-100 sm:text-4xl sm:text-left">
                    Gestión de Servicios
                </h2>
                <button
                    onClick={() => { setSelectedService(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Servicio
                </button>
            </div>

            {/* Controles de filtrado por estado y categoría */}
            <div className="flex flex-wrap gap-4 grow-2 mb-6 justify-start items-center">
                {/* Filtro por Estado */}
                <div className="flex flex-wrap grow-1 items-center justify-start space-x-2 gap-1.5 max-w-fit">
                    <label htmlFor="filterStatus" className=" font-semibold grow-1 max-w-fit">Estado:</label>
                    <select
                        id="filterStatus"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="py-2 px-4  rounded-lg bg-[#192539eb] grow-1  min-w-[165px] max-w-fit text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="">Todos</option> {/* Opción para ver todos los estados */}
                    </select>
                </div>

                {/* Filtro por Categoría */}
                <div className="flex flex-wrap items-center justify-start grow-5 max-w-full space-x-2 gap-1.5">
                    <label htmlFor="filterCategory" className="text-gray-300 grow-1 max-w-fit font-semibold ">Categoría:</label>
                    <select
                        id="filterCategory"
                        value={filterCategory}
                        onChange={handleCategoryChange}
                        className="py-2 px-4  grow-1 min-w-[160px] max-w-fit rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="" className=' bg-[#192539eb] '>Todas</option>
                        {categories.map(cat => (
                            <option key={cat.id_categoria_servicio} value={cat.id_categoria_servicio} className='font-thin text-blue-200' >
                                {cat.nombre_categoria}
                            </option>
                        ))}
                        <optgroup label="──────────"></optgroup>
                        <option value="manage-categories" className="font-bold text-blue-300">
                            + Gestionar Categorías...
                        </option>
                    </select>
                </div>
            </div>

            {/* Componente Table reutilizable que maneja la vista de tabla y tarjetas */}
            <Table
                columns={columns}
                data={services}
                keyAccessor="id_servicio"
                emptyMessage="No se encontraron servicios con los filtros actuales."
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
            />

            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedService(null); }}
                onSave={handleSaveService}
                serviceItem={selectedService}
                categories={categories} // Pasa las categorías al modal para el dropdown
            />

            <ServicesCategoriasModal
                isOpen={isCategoryModalOpen}
                onClose={handleCloseCategoryModal}
            />

            <ServiceMediaModal
                isOpen={isMediaModalOpen}
                onClose={handleCloseMediaModal}
                servicio={selectedService}
            />
        </div>
    );
};

export default ServicesListPage;
