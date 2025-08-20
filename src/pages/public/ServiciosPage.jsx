import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon, WrenchScrewdriverIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

// --- API Imports ---
import { getPublicServicios } from '../../api/servicesApi';
import { getPublicServiceCategories } from '../../api/categoriasServiciosApi';
import { getPublicServicioImagenes } from '../../api/serviciosImagenesApi';
import { getPublicServicioVideos } from '../../api/serviciosVideosApi';
import { createPublicaSolicitud } from '../../api/solicitudesApi';
import ContactFormModal from './ContactFormModal';

// --- Helper para formatear moneda ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(value);
};

// --- Helper para obtener la URL de incrustación del video ---
const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // YouTube
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
        // Aquí se podrían añadir más proveedores como Vimeo
        return url; // Devuelve la URL original si no es de un proveedor conocido
    } catch (e) {
        // No es necesario un console.error aquí, ya que puede ser una URL de otro tipo.
        return null; // URL inválida o no reconocida
    }
};

// --- Componente Modal para ver detalles ---
const ServiceModal = ({ servicio, onClose, onContact }) => {
    const [media, setMedia] = useState({ imagenes: [], videos: [] });
    const [loadingMedia, setLoadingMedia] = useState(true);
    const [errorMedia, setErrorMedia] = useState(null);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    useEffect(() => {
        if (servicio?.id_servicio) {
            const fetchMedia = async () => {
                setLoadingMedia(true);
                setErrorMedia(null);
                setActiveMediaIndex(0);
                try {
                    const [imagenesData, videosData] = await Promise.all([
                        getPublicServicioImagenes(servicio.id_servicio),
                        getPublicServicioVideos(servicio.id_servicio),
                    ]);
                    setMedia({ imagenes: imagenesData, videos: videosData });
                } catch (err) {
                    setErrorMedia('No se pudo cargar la galería.');
                    console.error("Error fetching media:", err);
                } finally {
                    setLoadingMedia(false);
                }
            };
            fetchMedia();
        }
    }, [servicio]);

    const mediaItems = useMemo(() => {
        const principalImage = media.imagenes.find(img => img.es_principal);
        const otherImages = media.imagenes.filter(img => !img.es_principal);
        const sortedImages = principalImage ? [principalImage, ...otherImages] : otherImages;

        const images = sortedImages.map(item => ({ ...item, type: 'image' }));
        const videos = media.videos.map(item => ({ ...item, type: 'video' }));
        return [...images, ...videos];
    }, [media]);

    const handleNextMedia = () => {
        setActiveMediaIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
    };

    const handlePrevMedia = () => {
        setActiveMediaIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length);
    };

    if (!servicio) return null;

    const activeMedia = mediaItems[activeMediaIndex];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[#00000044] bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    {/* Visor Principal */}
                    <div className="w-full h-80 bg-black flex items-center justify-center">
                        {loadingMedia ? (
                            <div className="text-white">Cargando galería...</div>
                        ) : errorMedia ? (
                            <div className="text-red-400">{errorMedia}</div>
                        ) : activeMedia ? (
                            activeMedia.type === 'image' ? (
                                <img className="max-w-full max-h-full object-contain" src={activeMedia.url_imagen} alt={servicio.nombre_servicio} />
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src={getVideoEmbedUrl(activeMedia.url_video)}
                                    title={activeMedia.titulo || "Video del servicio"}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )
                        ) : (
                            <img className="w-full h-full object-cover" src={servicio.imagen_principal_url || 'https://placehold.co/600x400/1a202c/FFFFFF?text=Servicio'} alt={servicio.nombre_servicio} />
                        )}
                    </div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition">
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    {/* Controles de Navegación */}
                    {mediaItems.length > 1 && (
                        <>
                            <button onClick={handlePrevMedia} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition">
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                            <button onClick={handleNextMedia} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition">
                                <ChevronRightIcon className="h-6 w-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* Tira de Miniaturas */}
                {mediaItems.length > 1 && (
                    <div className="p-2 bg-black overflow-x-auto">
                        <div className="flex gap-2">
                            {mediaItems.map((item, index) => (
                                <div key={item.id_imagen || item.id_video} className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${index === activeMediaIndex ? 'border-blue-500' : 'border-transparent'}`} onClick={() => setActiveMediaIndex(index)}>
                                    <img
                                        className="w-full h-full object-cover"
                                        src={item.type === 'image' ? item.url_imagen : item.url_thumbnail || 'https://placehold.co/100x100/1a202c/FFFFFF?text=Video'}
                                        alt={item.nombre_archivo || item.titulo}
                                    />
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                            <PlayCircleIcon className="h-6 w-6 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{servicio.nombre_servicio}</h2>
                    <p className="text-gray-400 text-sm mb-2">Categoría: {servicio.nombre_categoria}</p>
                    <p className="text-gray-300 mb-4">{servicio.descripcion}</p>
                    <p className="text-lg font-semibold text-green-400 mb-6">Precio de referencia: {formatCurrency(servicio.precio_referencia)}</p>
                    <button
                        onClick={() => onContact(servicio)}
                        className="w-full block text-center bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300"
                    >
                        Agendar Cita
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

// --- Componente de Tarjeta de Servicio ---
const ServiceCard = ({ servicio, onCardClick }) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg group transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-blue-500/20 cursor-pointer" onClick={() => onCardClick(servicio)}>
            <div className="relative">
                <img className="w-full h-48 object-cover" src={servicio.imagen_principal_url || 'https://placehold.co/400x300/1a202c/FFFFFF?text=Servicio'} alt={servicio.nombre_servicio} />
                <div className="absolute top-2 right-2 text-white text-xs font-bold py-1 px-2 rounded-full bg-blue-500 capitalize">
                    {servicio.nombre_categoria}
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 h-14 group-hover:text-blue-400 transition-colors">{servicio.nombre_servicio}</h3>
                <p className="text-gray-400 text-sm mb-3 h-20 overflow-hidden line-clamp-4">{servicio.descripcion}</p>
                <p className="text-lg font-semibold text-green-400 mb-4">Desde {formatCurrency(servicio.precio_referencia)}</p>
                <button className="w-full bg-gray-700 text-white font-semibold py-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                    Ver Más Información
                </button>
            </div>
        </div>
    );
};

// --- Componente Skeleton para el estado de carga ---
const SkeletonCard = () => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg animate-pulse">
        <div className="w-full h-48 bg-gray-700"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
        </div>
    </div>
);

const ServiciosPage = () =>{
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    // Estados para filtros y paginación
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // Efecto para debouncing de la búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(tempSearchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [tempSearchTerm]);

    // Efecto para obtener los datos de la API
    useEffect(() => {
        const fetchServicios = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getPublicServicios({
                    searchTerm: debouncedSearchTerm,
                    category: categoryFilter,
                    page: currentPage,
                    limit: ITEMS_PER_PAGE
                });
                setServicios(result.data || []);
                setTotalPages(result.totalPages || 1);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar los servicios.');
            } finally {
                setLoading(false);
            }
        };
        fetchServicios();
    }, [debouncedSearchTerm, categoryFilter, currentPage]);

    // Efecto para cargar las categorías una sola vez
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await getPublicServiceCategories();
                setCategories(categoriesData);
            } catch (err) {
                console.error("Error al cargar categorías de servicios:", err);
            }
        };
        fetchCategories();
    }, []);

    // --- Lógica del Embudo de Conversión ---
    const handleOpenContactModal = (servicio) => {
        // No es necesario cerrar el modal de detalles, el de contacto se superpondrá.
        // setSelectedServicio ya está seteado.
        setIsContactModalOpen(true);
    };

    const handleAgendaSuccess = async (formData) => {
        // 1. Enviar datos al backend
        const solicitudData = {
            ...formData,
            id_servicio: selectedServicio.id_servicio,
        };
        await createPublicaSolicitud(solicitudData);

        // 2. Construir y abrir enlace de WhatsApp
        const numeroWhatsApp = '916703204'; // ¡¡¡REEMPLAZAR CON EL NÚMERO REAL!!!
        const mensajeWhatsApp = encodeURIComponent(
            `Hola, acabo de enviar mis datos por la web para agendar una cita para el servicio: *${selectedServicio.nombre_servicio}*. Mi nombre es ${formData.nombre_completo}.`
        );
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`, '_blank');

        // 3. Cerrar modales y notificar
        setIsContactModalOpen(false);
        setSelectedServicio(null);
        toast.success('¡Solicitud enviada! Serás redirigido a WhatsApp para finalizar el agendamiento.');
    };

    return(
        <div className="bg-black text-white min-h-screen p-4 sm:p-8 animate-radial-move overflow-x-hidden">
            <>
                <title>Nuestros Servicios de Taller - Motosport Carranza</title>
                <meta name="description" content="Descubre nuestros servicios de taller para motos: mantenimiento preventivo, correctivo, diagnóstico y más. ¡Agenda tu cita con nuestros expertos!" />
            </>
            <div className="container mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Nuestros Servicios</h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">Desde mantenimiento de rutina hasta reparaciones complejas, nuestro equipo de expertos está listo para ayudarte.</p>
                </header>

                {/* --- Barra de Búsqueda y Filtros --- */}
                <div className="mb-8 p-4 bg-gray-900 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-500" /></span>
                        <input type="text" placeholder="Buscar servicio..." value={tempSearchTerm} onChange={(e) => setTempSearchTerm(e.target.value)} className="w-full p-3 pl-10 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id_categoria_servicio} value={cat.id_categoria_servicio}>
                                {cat.nombre_categoria}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Grilla de Servicios --- */}
                <main>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(ITEMS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16"><h2 className="text-2xl font-bold text-red-500">Error: {error}</h2></div>
                    ) : servicios.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {servicios.map(servicio => <ServiceCard key={servicio.id_servicio} servicio={servicio} onCardClick={setSelectedServicio} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <WrenchScrewdriverIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-400">No se encontraron servicios</h2>
                            <p className="text-gray-500 mt-2">Prueba a cambiar los filtros o el término de búsqueda.</p>
                        </div>
                    )}
                </main>

                {/* --- Paginación --- */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-700 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">Anterior</button>
                        <span className="text-lg font-semibold text-gray-300">Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-700 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">Siguiente</button>
                    </div>
                )}
            </div>
            {/* --- Modales --- */}
            <ServiceModal
                servicio={selectedServicio}
                onClose={() => setSelectedServicio(null)}
                onContact={handleOpenContactModal}
            />
            <ContactFormModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                item={selectedServicio} // Usamos la prop genérica 'item'
                onSuccess={handleAgendaSuccess}
            />
        </div>
    );
};

export default ServiciosPage;