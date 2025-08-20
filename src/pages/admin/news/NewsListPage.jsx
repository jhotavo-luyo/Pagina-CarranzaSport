// src/pages/admin/news/NewsListPage.jsx

// --- IMPORTS ---
// Importaciones de React y librerías externas.
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Importaciones de la API para interactuar con el backend.
import { getAllNews, deleteNews } from '../../../api/newsApi';

// Importaciones de componentes de UI reutilizables.
import Table from '../../../components/ui/Table'; // Componente para renderizar tablas.
import NewsFormModal from './NewsFormModal'; // Modal para crear/editar noticias.
import ConfirmationModal from '../../../components/ui/ConfirmationModal'; // Modal para confirmar acciones.
import { PlusIcon } from '@heroicons/react/24/outline'; // Icono para el botón de añadir.

// Helper para decodificar el JWT y obtener el ID del usuario.
// NOTA: Esto es una decodificación simple y no verifica la firma del token.
// En un entorno de producción, la validación del token debe ocurrir en el backend.
const getUserIdFromToken = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
 
    try {
        // El token JWT se compone de tres partes separadas por puntos: header, payload, signature.
        const payloadBase64 = token.split('.')[1];
        // Se usa atob para decodificar Base64. Se reemplazan caracteres para compatibilidad con URL-safe Base64.
        const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        // Se extrae el ID del usuario del payload decodificado.
        // El nombre del campo ('id_usuario') debe coincidir con el que se define en el backend al crear el token.
        return decodedPayload.id_usuario;
    } catch (error) {
        console.error("Error al decodificar el token JWT:", error);
        return null;
    }
};

const NewsListPage = () => {
    // --- ESTADOS DEL COMPONENTE ---

    // Estados para los datos y la UI
    const [news, setNews] = useState([]); // Almacena la lista de noticias.
    const [loading, setLoading] = useState(true); // Indica si se están cargando datos.
    const [error, setError] = useState(null); // Almacena mensajes de error.

    // Estados para los modales
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Controla el modal de confirmación de borrado.
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Controla el modal de formulario (crear/editar).
    const [selectedNews, setSelectedNews] = useState(null); // Guarda la noticia seleccionada para editar. Si es null, el modal es para crear.
    const [newsToDelete, setNewsToDelete] = useState(null); // Guarda el ID de la noticia que se va a eliminar.

    // Estado para la autenticación
    const [loggedInUserId, setLoggedInUserId] = useState(null); // Almacena el ID del usuario logueado.

    // Estados para los filtros de búsqueda
    const [filterStatus, setFilterStatus] = useState(''); // Filtro por estado (publicada, borrador, etc.).
    const [tempTituloSearchInput, setTempTituloSearchInput] = useState(''); // Valor temporal del input de búsqueda por título.
    const [appliedTituloSearchFilter, setAppliedTituloSearchFilter] = useState(''); // Valor del filtro de título que se aplica a la API (después del debounce).

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1); // Página actual.
    const [totalPages, setTotalPages] = useState(0); // Total de páginas disponibles.
    const [totalItems, setTotalItems] = useState(0); // Total de noticias encontradas.
    const ITEMS_PER_PAGE = 10; // Constante para definir cuántos elementos se muestran por página.

    // Efecto para obtener el ID del usuario logueado desde el token al montar el componente
    useEffect(() => {
        const userId = getUserIdFromToken();
        setLoggedInUserId(userId);
    }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez, cuando el componente se monta.

    // Efecto para implementar el debouncing en la búsqueda por título
    useEffect(() => {
        // Se crea un temporizador que se activará 500ms después de que el usuario deje de escribir.
        const timerId = setTimeout(() => {
            setAppliedTituloSearchFilter(tempTituloSearchInput);
        }, 500);

        // La función de limpieza se ejecuta cada vez que el `tempTituloSearchInput` cambia,
        // o cuando el componente se desmonta. Esto cancela el temporizador anterior,
        // evitando que la API se llame con cada pulsación de tecla.
        return () => {
            clearTimeout(timerId);
        };
    }, [tempTituloSearchInput]); // Este efecto se vuelve a ejecutar cada vez que el usuario escribe en el input.

    // --- FUNCIONES AUXILIARES ---

    // Función para determinar el estilo CSS de la etiqueta de estado.
    const getStatusStyle = (status) => {
        switch (status) {
            case 'publicada':
                return 'bg-green-600 text-white';
            case 'borrador':
                return 'bg-yellow-600 text-white';
            case 'archivada':
                return 'bg-red-600 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    // Función para obtener las noticias desde la API.
    // Se usa `useCallback` para memorizar la función y evitar que se recree en cada render,
    // optimizando el rendimiento y evitando bucles infinitos en `useEffect`.
    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Pasa todos los filtros y parámetros de paginación a la API
            const response = await getAllNews(filterStatus, appliedTituloSearchFilter, currentPage, ITEMS_PER_PAGE);
            setNews(response.data || []); // Actualiza el estado con los datos recibidos. Si no hay datos, se usa un array vacío.
            setTotalPages(response.totalPages || 0); // Actualiza el total de páginas.
            setTotalItems(response.totalItems || 0); // Actualiza el total de elementos.
        } catch (err) {
            toast.error('Error al cargar las noticias.');
            setError(err.message);
            console.error("Error fetching news:", err);
            // En caso de error, se resetean los estados para evitar mostrar datos incorrectos.
            setNews([]);
            setTotalPages(0);
            setTotalItems(0);
        } finally {
            // Se ejecuta siempre, tanto si hay éxito como si hay error.
            setLoading(false);
        }
    }, [filterStatus, appliedTituloSearchFilter, currentPage]); // Dependencias: la función se recreará si alguno de estos valores cambia.

    // --- EFECTOS DE DATOS ---

    // Efecto para cargar las noticias cuando la función `fetchNews` (y sus dependencias) cambian.
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Efecto para resetear a la página 1 cuando cambian los filtros
    useEffect(() => {
        // Evita el reseteo en la carga inicial si currentPage ya es 1
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [filterStatus, appliedTituloSearchFilter]); // Se ejecuta cuando los filtros cambian.

    // --- MANEJADORES DE EVENTOS ---

    // Abre el modal del formulario. Si se pasa `newsItem`, es para editar; si no, para crear.
    const handleOpenFormModal = (newsItem = null) => {
        // Si newsItem es null, es para crear. Si tiene datos, es para editar.
        setSelectedNews(newsItem);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        // Cierra el modal y limpia la noticia seleccionada.
        setIsFormModalOpen(false);
        setSelectedNews(null); // Limpiamos la noticia seleccionada al cerrar
    };

    // Se ejecuta cuando el formulario se guarda con éxito.
    const handleSaveSuccess = () => {
        handleCloseFormModal(); // Cierra el modal
        fetchNews(); // Recarga la lista de noticias para ver los cambios
    };

    // Prepara el estado para la eliminación de una noticia.
    const handleDeleteClick = (id_noticia) => {
        setNewsToDelete(id_noticia);
        setIsConfirmModalOpen(true);
    };

    // Confirma y ejecuta la eliminación de la noticia.
    const confirmDelete = async () => {
        if (!newsToDelete) return;

        try {
            await deleteNews(newsToDelete);
            toast.success('Noticia eliminada exitosamente.');
            // Si era el último elemento de la página, retrocedemos una página
            if (news.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                await fetchNews(); // Recarga la página actual
            }
        } catch (err) {
            toast.error(`Error al eliminar: ${err.message}`);
            setError(err.message);
            console.error("Error deleting news:", err);
        }
        setIsConfirmModalOpen(false);
        setNewsToDelete(null);
    };

    // Maneja el cambio de página en la paginación.
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // --- DEFINICIÓN DE COLUMNAS PARA LA TABLA ---
    // Este array de objetos define la estructura y el renderizado de la tabla.
    const columns = [
        {
            header: 'ID',
            accessor: 'id_noticia',
            cellClassName: 'font-mono text-xs text-gray-400'
        },
        {
            header: 'Título',
            accessor: 'titulo',
            cellClassName: 'font-medium'
        },
        {
            header: 'Contenido',
            accessor: 'contenido',
            renderCell: (item) => (
                // Se usa `line-clamp` para truncar el texto a 2 líneas y mostrar "..." si es más largo.
                <div className="max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md" title={item.contenido}>
                    <p className="line-clamp-2">
                        {item.contenido}
                    </p>
                </div>
            ),
        },
        {
            header: 'Fecha Publicación',
            accessor: 'fecha_publicacion',
            renderCell: (item) => new Date(item.fecha_publicacion).toLocaleDateString(),
        },
        {
            header: 'Autor ID',
            // En una aplicación real, aquí se haría un JOIN en el backend para mostrar el nombre del autor.
            accessor: 'autor_id',
            cellClassName: 'text-center'
        },
        {
            header: 'Estado',
            accessor: 'estado',
            // `renderCell` permite personalizar cómo se muestra el contenido de una celda.
            renderCell: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.estado)}`}>
                    {item.estado}
                </span>
            ),
        },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right',
            // Renderiza los botones de acción para cada fila.
            renderCell: (item) => (
                <>
                    <button
                        onClick={() => handleOpenFormModal(item)} // Llama al manejador para abrir el modal en modo edición
                        className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteClick(item.id_noticia)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors duration-200"
                    >
                        Eliminar
                    </button>
                </>
            ),
        },
    ];

    // --- RENDERIZADO DEL COMPONENTE ---
    // Aquí se construye la interfaz de usuario.
    
    return (
        <div className="p-4 md:p-8 bg-[#0000004b] min-h-screen max-h-s rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            {/* Cabecera responsiva */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
                <div className="text-center sm:text-left">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">Gestión de Noticias</h2>
                <p className=' text-gray-500/80' >Los 10 ultimas noticias activas se mostraran</p>
                </div>
                <button
                    onClick={() => handleOpenFormModal(null)} // Llama al manejador para abrir el modal en modo creación
                    className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Añadir Noticia
                </button>
            </div>

            {/* Controles de filtrado y búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Buscar por Título */}
                <div>
                    <label htmlFor="tituloSearchInput" className="block text-gray-300 text-sm font-semibold mb-1">Buscar por Título:</label>
                    <input
                        type="text"
                        id="tituloSearchInput"
                        value={tempTituloSearchInput} // Vinculado al estado temporal
                        onChange={(e) => setTempTituloSearchInput(e.target.value)} // Actualiza el estado temporal en cada pulsación
                        placeholder="Título de la noticia"
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
                        <option value="publicada">Publicadas</option>
                        <option value="borrador">Borradores</option>
                        <option value="archivada">Archivadas</option>
                    </select>
                </div>
            </div>

            <Table
                columns={columns}
                data={news}
                loading={loading}
                error={error}
                onRetry={fetchNews}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                keyAccessor="id_noticia"
                entityName="noticias"
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                message="¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer."
            />

            {/* --- Renderizado del Modal del Formulario --- */}
            <NewsFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSave={handleSaveSuccess} // Al guardar exitosamente, se cierra y recarga la lista
                newsItem={selectedNews}
                loggedInUserId={loggedInUserId} // Se pasa el ID del autor al modal para que sepa quién está creando/editando.
            />
        </div>
    );
};

export default NewsListPage;
