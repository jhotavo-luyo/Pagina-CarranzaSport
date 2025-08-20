import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon, TagIcon, CurrencyDollarIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

import { getPublicRepuestos } from '../../api/repuestosApi';
import { getPublicRepuestoCategories } from '../../api/categoriaRepuestosApi';
import { getPublicRepuestoImagenes } from '../../api/repuestoImagenesApi';
import { getPublicRepuestoVideos } from '../../api/repuestovideosApi';
import { createPublicaSolicitud } from '../../api/solicitudesApi';
import ContactFormModal from './ContactFormModal'; // Importar el nuevo modal de contacto

// --- Helper para formatear moneda ---
const formatCurrency = (value) => {
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
        return null; // URL inválida
    }
};
// --- Componente Modal para ver detalles --- y el carrusel de imagenes
const RepuestoModal = ({ repuesto, onClose, onContact }) => {
    const [media, setMedia] = useState({ imagenes: [], videos: [] });
    const [loadingMedia, setLoadingMedia] = useState(true);
    const [errorMedia, setErrorMedia] = useState(null);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    useEffect(() => {
        if (repuesto?.id_repuesto) {
            const fetchMedia = async () => {
                setLoadingMedia(true);
                setErrorMedia(null);
                setActiveMediaIndex(0);
                try {
                    const [imagenesData, videosData] = await Promise.all([
                        getPublicRepuestoImagenes(repuesto.id_repuesto),
                        getPublicRepuestoVideos(repuesto.id_repuesto),
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
    }, [repuesto]);

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

    if (!repuesto) return null;

    const activeMedia = mediaItems[activeMediaIndex];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[#00000022] bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fadeIn" onClick={onClose}>
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
                                <img className="max-w-full max-h-full object-contain" src={activeMedia.url_imagen} alt={repuesto.nombre_repuesto} />
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src={getVideoEmbedUrl(activeMedia.url_video)}
                                    title={activeMedia.titulo || "Video del repuesto"}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )
                        ) : (
                            <img className="w-full h-full object-cover" src={repuesto.imagen_principal_url || 'https://placehold.co/600x400/1a202c/FFFFFF?text=Imagen'} alt={repuesto.nombre_repuesto} />
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
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#010828] bg-opacity-40">
                                            <PlayCircleIcon className="h-6 w-6 text-orange-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{repuesto.nombre_repuesto}</h2>
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-green-400 font-semibold text-2xl">{formatCurrency(repuesto.precio_unitario)}</span>
                        <div className="flex gap-2">
                            <span className="text-sm bg-blue-500 text-white py-1 px-3 rounded-full capitalize">{repuesto.nombre_categoria}</span>
                            <span className="text-sm bg-gray-600 text-white py-1 px-3 rounded-full capitalize">{repuesto.marca}</span>
                        </div>
                    </div>
                    <p className="text-gray-300 mb-4">{repuesto.descripcion}</p>
                    <p className="text-sm text-gray-400 mb-6">Stock disponible: {repuesto.stock_disponible} unidades.</p>
                    <button onClick={() => onContact(repuesto)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300">
                        Contactar para Comprar
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

// --- Componente de Tarjeta de Repuesto ---
const RepuestoCard = ({ repuesto, onCardClick }) => {
    const getStockClass = (estado) => {
        if (estado === 'agotado' || estado === 'descontinuado') return 'bg-red-500';
        if (repuesto.stock_disponible <= 5) return 'bg-yellow-500'; // Asumiendo que 'disponible' y stock bajo
        return 'bg-green-500'; // disponible con buen stock
    };

    const getStockLabel = (estado) => {
        if (estado === 'agotado') return 'Agotado';
        if (estado === 'descontinuado') return 'Descontinuado';
        if (repuesto.stock_disponible <= 5) return 'Pocas Unidades';
        return 'Disponible';
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg group transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-blue-500/20" onClick={() => onCardClick(repuesto)}>
            <div className="relative">
                <img className="w-full h-48 object-cover" src={repuesto.imagen_principal_url || 'https://placehold.co/400x300/1a202c/FFFFFF?text=Repuesto'} alt={repuesto.nombre_repuesto} />
                <div className={`absolute top-2 right-2 text-white text-xs font-bold py-1 px-2 rounded-full ${getStockClass(repuesto.estado)}`}>
                    {getStockLabel(repuesto.estado)}
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">{repuesto.nombre_repuesto}</h3>
                <p className="text-gray-400 text-sm mb-2">{repuesto.marca}</p>
                <p className="text-xl font-semibold text-green-400 mb-4">{formatCurrency(repuesto.precio_unitario)}</p>
                <button className="w-full bg-gray-700 text-white font-semibold py-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                    Ver Detalles
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
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
        </div>
    </div>
);

const RepuestosPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRepuesto, setSelectedRepuesto] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    // Estados para filtros y paginación, inicializados desde la URL
    const [tempSearchTerm, setTempSearchTerm] = useState(searchParams.get('nombre') || '');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('nombre') || '');
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('categoria') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('orden') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pagina') || '1', 10));
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Efecto para debouncing de la búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            if (tempSearchTerm !== debouncedSearchTerm) {
                setDebouncedSearchTerm(tempSearchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [tempSearchTerm, debouncedSearchTerm]);

    // Efecto para sincronizar el estado de los filtros con la URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.set('nombre', debouncedSearchTerm);
        if (categoryFilter) params.set('categoria', categoryFilter);
        if (sortBy) params.set('orden', sortBy);
        if (currentPage > 1) params.set('pagina', currentPage.toString());
        
        setSearchParams(params, { replace: true });
    }, [debouncedSearchTerm, categoryFilter, sortBy, currentPage, setSearchParams]);

    // Efecto para obtener los datos de la API
    useEffect(() => {
        const fetchRepuestos = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters = {
                    nombre: searchParams.get('nombre') || '',
                    id_categoria: searchParams.get('categoria') || '',
                    sortBy: searchParams.get('orden') || '',
                    page: parseInt(searchParams.get('pagina') || '1', 10),
                    limit: ITEMS_PER_PAGE
                };
                const result = await getPublicRepuestos(filters);
                setRepuestos(result.data || []);
                setTotalPages(result.totalPages || 1);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar los repuestos.');
            } finally {
                setLoading(false);
            }
        };
        fetchRepuestos();
    }, [searchParams]); // La única dependencia es la URL, que es la fuente de verdad.

    // Efecto para cargar las categorías una sola vez
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await getPublicRepuestoCategories();
                setCategories(categoriesData);
            } catch (err) {
                console.error("Error al cargar categorías:", err);
            }
        };
        fetchCategories();
    }, []); // Dependencia vacía para que se ejecute solo al montar

    // --- Lógica del Embudo de Conversión ---
    const handleOpenContactModal = (repuesto) => {
        // No es necesario cerrar el modal de detalles, el de contacto se superpondrá.
        // setSelectedRepuesto ya está seteado.
        setIsContactModalOpen(true);
    };

    const handleContactSuccess = async (formData) => {
        // 1. Enviar datos al backend
        const solicitudData = {
            ...formData,
            id_repuesto: selectedRepuesto.id_repuesto,
        };
        await createPublicaSolicitud(solicitudData);

        // 2. Construir y abrir enlace de WhatsApp
        const numeroWhatsApp = '916703204'; // ¡¡¡REEMPLAZAR CON EL NÚMERO REAL!!!
        const mensajeWhatsApp = encodeURIComponent(
            `Hola, acabo de enviar mis datos por la web. Estoy interesado en el repuesto: *${selectedRepuesto.nombre_repuesto}* (SKU: ${selectedRepuesto.codigo_sku || 'N/A'}). Mi nombre es ${formData.nombre_completo}.`
        );
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`, '_blank');

        // 3. Cerrar modales y notificar
        setIsContactModalOpen(false);
        setSelectedRepuesto(null);
        toast.success('¡Solicitud enviada! Serás redirigido a WhatsApp para continuar.');
    };

    return (
        <div className="bg-[#000000] text-white min-h-screen p-4 sm:p-8 animate-radial-move overflow-x-hidden">
            <>
                <title>Catálogo de Repuestos - Motosport Carranza</title>
                <meta name="description" content="Explora nuestro amplio catálogo de repuestos para motos. Encuentra piezas originales y de alta calidad para todas las marcas y modelos. ¡Compra con confianza!" />
            </>
            <div className="container mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Catálogo de Repuestos</h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">Encuentra la pieza perfecta para tu moto. Calidad y durabilidad garantizadas.</p>
                </header>

                {/* --- Barra de Búsqueda y Filtros --- */}
                <div className="mb-8 p-4 bg-gray-900 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-500" /></span>
                        <input type="text" name="nombre" placeholder="Buscar por nombre o marca..." value={tempSearchTerm} onChange={(e) => setTempSearchTerm(e.target.value)} className="w-full p-3 pl-10 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select name="categoria" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id_categoria_repuesto} value={cat.id_categoria_repuesto}>
                                {cat.nombre_categoria}
                            </option>
                        ))}
                    </select>
                    <select name="orden" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Ordenar por</option>
                        <option value="price_asc">Menor Precio</option>
                        <option value="price_desc">Mayor Precio</option>
                    </select>
                </div>

                {/* --- Grilla de Repuestos --- */}
                <main>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(ITEMS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16"><h2 className="text-2xl font-bold text-red-500">Error: {error}</h2></div>
                    ) : repuestos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {repuestos.map(repuesto => <RepuestoCard key={repuesto.id_repuesto} repuesto={repuesto} onCardClick={setSelectedRepuesto} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <TagIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-400">No se encontraron repuestos</h2>
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
            <RepuestoModal 
                repuesto={selectedRepuesto} 
                onClose={() => setSelectedRepuesto(null)} 
                onContact={handleOpenContactModal}
            />
            <ContactFormModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                item={selectedRepuesto}
                onSuccess={handleContactSuccess}
            />
        </div>
    );
};

export default RepuestosPage;