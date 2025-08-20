// src/pages/admin/TestimoniosListPage.jsx
// Este componente gestiona la lista de testimonios en el panel de administración,
// con integración de API, filtrado por estado de aprobación y búsqueda por nombre de cliente.
import React, { useState, useEffect } from 'react';
import TestimonioFormModal from './TestimonioFormModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal'; // Importamos el modal de confirmación
import { getAllTestimonios, deleteTestimonio } from '../../api/testimoniosApi';
import { toast } from 'react-toastify'; // Importamos toast para notificaciones
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const TestimoniosListPage = ({ onNavigate }) => {
    const [testimonios, setTestimonios] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [testimonioToDelete, setTestimonioToDelete] = useState(null);
    const [selectedTestimonio, setSelectedTestimonio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Nuevo estado para el filtro de aprobación. null para todos, true para aprobados, false para no aprobados.
    const [filterAprobado, setFilterAprobado] = useState(null);

    // Nuevo estado para el input de búsqueda de nombre de cliente (se actualiza en cada pulsación)
    const [tempNombreClienteSearchInput, setTempNombreClienteSearchInput] = useState('');
    // Nuevo estado para el filtro de nombre de cliente aplicado (se actualiza después del debounce)
    const [appliedNombreClienteFilter, setAppliedNombreClienteFilter] = useState('');

    // --- NUEVO: Estados para la paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 10;

    // Efecto para implementar el debouncing en la búsqueda por nombre de cliente
    useEffect(() => {
        const handler = setTimeout(() => {
            setAppliedNombreClienteFilter(tempNombreClienteSearchInput);
        }, 500); // Retraso de 500ms

        return () => {
            clearTimeout(handler);
        };
    }, [tempNombreClienteSearchInput]); // Este efecto se ejecuta cada vez que `tempNombreClienteSearchInput` cambia

    // --- NUEVO: Efecto para resetear la página al cambiar filtros ---
    useEffect(() => {
        setCurrentPage(1);
    }, [filterAprobado, appliedNombreClienteFilter]);


    const fetchTestimonios = async () => {
        setLoading(true);
        setError(null);
        try {
            // --- MODIFICADO: Pasamos los parámetros de paginación ---
            const data = await getAllTestimonios(filterAprobado, appliedNombreClienteFilter, currentPage, ITEMS_PER_PAGE);
            setTestimonios(data.data || []);
            setTotalItems(data.totalItems || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            toast.error('Error al cargar los testimonios.');
            setError(err.message);
            console.error("Error fetching testimonios:", err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar los testimonios cuando el componente se monta o cuando cambia un filtro o la página.
    useEffect(() => {
        fetchTestimonios();
    }, [filterAprobado, appliedNombreClienteFilter, currentPage]); // --- MODIFICADO: Añadimos currentPage ---

    const handleSaveTestimonio = async () => {
        setIsModalOpen(false);
        setSelectedTestimonio(null);
        // Si se crea un nuevo testimonio, es bueno ir a la primera página para verlo.
        if (!selectedTestimonio && currentPage !== 1) {
            setCurrentPage(1);
        } else {
            await fetchTestimonios(); // Recarga los testimonios con el filtro actual
        }
        toast.success('Testimonio guardado exitosamente.');
    };

    const handleEditTestimonio = (testimonioItem) => {
        setSelectedTestimonio(testimonioItem);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id_testimonio) => {
        setTestimonioToDelete(id_testimonio);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!testimonioToDelete) return;
        try {
            await deleteTestimonio(testimonioToDelete);
            toast.success('Testimonio eliminado exitosamente.');
            // Si eliminamos el último elemento de una página, retrocedemos.
            if (testimonios.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                await fetchTestimonios(); // Recarga los testimonios
            }
        } catch (err) {
            toast.error(`Error al eliminar: ${err.message}`);
            setError(err.message);
            console.error("Error deleting testimonio:", err);
        }
        setIsConfirmModalOpen(false);
        setTestimonioToDelete(null);
    };

    // --- NUEVO: Manejador para el cambio de página ---
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Definición de las columnas para el componente Table
    const columns = [
        { header: 'ID', accessor: 'id_testimonio', cellClassName: 'font-mono text-xs text-gray-400'},
        { header: 'Cliente', accessor: 'nombre_cliente' },
        {
            header: 'Comentario',
            accessor: 'comentario',
            renderCell: (item) => (
                <p className="line-clamp-2">{item.comentario}</p>
            ),
        },
        {
            header: 'Calificación',
            accessor: 'calificacion',
            renderCell: (item) => (
                <span className="flex items-center">
                    {/* Renderiza estrellas basadas en la calificación */}
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl ${i < item.calificacion ? 'text-yellow-400' : 'text-gray-400'}`}>
                            ★
                        </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-300">({item.calificacion || 'N/A'})</span>
                </span>
            ),
        },
        {
            header: 'Fecha Publicación',
            accessor: 'fecha_publicacion',
            renderCell: (item) => new Date(item.fecha_publicacion).toLocaleDateString(),
        },
        {
            header: 'Aprobado',
            accessor: 'aprobado',
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.aprobado ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {item.aprobado ? 'Sí' : 'No'}
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
                        onClick={() => handleEditTestimonio(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteClick(item.id_testimonio)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200"
                    >
                        Eliminar
                    </button>
                </>
            ),
        },
    ];

    if (loading && testimonios.length === 0) { // Show full-page loader only on initial load
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
                <LoadingSpinner size="lg" color="primary" />
                <p className="mt-4">Cargando testimonios...</p>
            </div>
        );
    }

    if (error && testimonios.length === 0) { // Show full-page error only if there's no data to display
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar testimonios: {error}</p>
                <button
                    onClick={() => fetchTestimonios()} // Reintentar al hacer clic
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#0000004b] min-h-screen max-h-s rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            {/* Cabecera responsiva */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center sm:text-left">
                    Gestión de Testimonios
                </h2>
                <button
                    onClick={() => { setSelectedTestimonio(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105"
                >
                    + Añadir Testimonio
                </button>
            </div>

            {/* Controles de filtrado y búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Buscar por Nombre de Cliente */}
                <div>
                    <label htmlFor="nombreClienteSearchInput" className="block text-gray-300 text-sm font-semibold mb-1">Buscar por Nombre de Cliente:</label>
                    <input
                        type="text"
                        id="nombreClienteSearchInput"
                        value={tempNombreClienteSearchInput} // Vinculado al estado temporal
                        onChange={(e) => setTempNombreClienteSearchInput(e.target.value)} // Actualiza el estado temporal en cada pulsación
                        placeholder="Nombre del cliente"
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Filtro por Estado de Aprobación */}
                <div>
                    <label htmlFor="filterAprobado" className="block text-gray-300 text-sm font-semibold mb-1">Filtrar por Aprobación:</label>
                    <select
                        id="filterAprobado"
                        value={filterAprobado === null ? '' : filterAprobado.toString()} // Convertir booleano a string para el select
                        onChange={(e) => setFilterAprobado(e.target.value === '' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 rounded-lg bg-[#192539eb] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Todos</option>
                        <option value="true">Aprobados</option>
                        <option value="false">No Aprobados</option>
                    </select>
                </div>
            </div>

            {/* --- MODIFICADO: Usamos el componente Table --- */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-20 rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}
                <Table
                    columns={columns}
                    data={testimonios}
                    keyAccessor="id_testimonio"
                    emptyMessage="No se encontraron testimonios con los filtros actuales."
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                />
            </div>

            <TestimonioFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTestimonio(null); }}
                onSave={handleSaveTestimonio}
                testimonioItem={selectedTestimonio}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                message="¿Estás seguro de que quieres eliminar este testimonio? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default TestimoniosListPage;
