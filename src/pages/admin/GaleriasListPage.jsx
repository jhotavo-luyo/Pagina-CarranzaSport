// src/pages/admin/GaleriasListPage.jsx
// Este componente gestiona la lista de galerías con un diseño de acordeón,
// permitiendo expandir cada galería para ver y gestionar su contenido (imágenes y videos)
// de forma unificada y eficiente.

import React, { useState, useEffect } from 'react';
import GaleriaFormModal from './GaleriaFormModal';
import ImagenFormModal from './ImagenFormModal';
import VideoFormModal from './VideoFormModal';
import ImageDisplayModal from '../../components/ui/ImageDisplayModal';
import VideoDisplayModal from '../../components/ui/VideoDisplayModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { toast } from 'react-toastify';
import { getAllGalerias, deleteGaleria } from '../../api/galeriasApi';
import { getAllImagenes, deleteImagen } from '../../api/imagenesApi';
import { getAllVideos, deleteVideo } from '../../api/videosApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CameraIcon, VideoCameraIcon, EyeIcon, PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const GaleriasListPage = ({ onNavigate }) => {
    const [galerias, setGalerias] = useState([]);
    const [loading, setLoading] = useState(true); // Solo para la carga inicial de galerías
    const [error, setError] = useState(null);

    // Estados para los modales de CRUD (crear/editar)
    const [isGaleriaModalOpen, setIsGaleriaModalOpen] = useState(false);
    const [selectedGaleria, setSelectedGaleria] = useState(null);
    const [isImagenModalOpen, setIsImagenModalOpen] = useState(false);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Estados para los modales de visualización
    const [isImageDisplayModalOpen, setIsImageDisplayModalOpen] = useState(false);
    const [imageToDisplay, setImageToDisplay] = useState(null);
    const [isVideoDisplayModalOpen, setIsVideoDisplayModalOpen] = useState(false);
    const [videoToDisplay, setVideoToDisplay] = useState(null);

    // Estados para el modal de confirmación
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // Estado para saber a qué galería se le añade contenido
    const [editingGaleriaId, setEditingGaleriaId] = useState(null);

    // Estados para el acordeón de contenido
    const [expandedContent, setExpandedContent] = useState({}); // { galeriaId: [ ...contenido ] }
    const [loadingContent, setLoadingContent] = useState({});   // { galeriaId: boolean }

// parte2
    // Fetch inicial de galerías
    const fetchGalerias = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllGalerias();
            
            // Enriquecer cada galería con el conteo de su contenido
            const galeriasConContenido = await Promise.all(
                data.map(async (galeria) => {
                    try {
                        const [imagenesData, videosData] = await Promise.all([
                            getAllImagenes(galeria.id_galeria),
                            getAllVideos('', galeria.id_galeria)
                        ]);
                        return { ...galeria, image_count: imagenesData.length, video_count: videosData.length };
                    } catch (countError) {
                        console.error(`Error al contar contenido para la galería ${galeria.id_galeria}:`, countError);
                        // Si falla el conteo, devolvemos la galería con contadores en 0 para no romper la UI.
                        return { ...galeria, image_count: 0, video_count: 0 };
                    }
                })
            );
            setGalerias(galeriasConContenido);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching galerias:", err);
        } finally {
            setLoading(false);
        }
    };

    // Carga el contenido de una galería específica bajo demanda
    const handleToggleExpand = async (galeriaId) => {
        // Si ya está expandida, la colapsamos
        if (expandedContent[galeriaId]) {
            setExpandedContent(prev => {
                const newState = { ...prev };
                delete newState[galeriaId];
                return newState;
            });
            return;
        }

        // Si no, cargamos su contenido
        setLoadingContent(prev => ({ ...prev, [galeriaId]: true }));
        try {
            const [imagenesData, videosData] = await Promise.all([
                getAllImagenes(galeriaId),
                getAllVideos('', galeriaId)
            ]);

            // Combinamos y añadimos un tipo para renderizar en la cuadrícula
            const combinedContent = [
                ...imagenesData.map(img => ({ ...img, type: 'image' })),
                ...videosData.map(vid => ({ ...vid, type: 'video' }))
            ];

            setExpandedContent(prev => ({ ...prev, [galeriaId]: combinedContent }));
        } catch (err) {
            toast.error(`Error al cargar contenido: ${err.message}`);
        } finally {
            setLoadingContent(prev => {
                const newState = { ...prev };
                delete newState[galeriaId];
                return newState;
            });
        }
    };

    // Recarga el contenido de una galería específica. Útil después de añadir/editar/eliminar contenido.
    const reloadGalleryContent = async (galeriaId) => {
        // No hacer nada si la galería no está expandida
        if (!expandedContent[galeriaId]) {
            return;
        }

        setLoadingContent(prev => ({ ...prev, [galeriaId]: true }));
        try {
            const [imagenesData, videosData] = await Promise.all([
                getAllImagenes(galeriaId),
                getAllVideos('', galeriaId)
            ]);

            const combinedContent = [
                ...imagenesData.map(img => ({ ...img, type: 'image' })),
                ...videosData.map(vid => ({ ...vid, type: 'video' }))
            ];

            setExpandedContent(prev => ({ ...prev, [galeriaId]: combinedContent }));
        } catch (err) {
            toast.error(`Error al recargar contenido: ${err.message}`);
        } finally {
            // Quita el estado de carga para la galería específica
            setLoadingContent(prev => { const newState = { ...prev }; delete newState[galeriaId]; return newState; });
        }
    };

    useEffect(() => {
        fetchGalerias();
    }, []); // Cargar galerías una vez al montar

    // Manejadores para Galerías
    const handleSaveGaleria = async () => {
        await fetchGalerias();
        setIsGaleriaModalOpen(false);
        setSelectedGaleria(null);
    };

    const performDeleteGaleria = async (id_galeria) => {
        try {
            await deleteGaleria(id_galeria);
            toast.success('Galería eliminada exitosamente.');
            await fetchGalerias(); // Recargar la lista de galerías
            // También la eliminamos del estado de expansión si estaba abierta
            setExpandedContent(prev => { const newState = { ...prev }; delete newState[id_galeria]; return newState; });
        } catch (err) {
            setError(err.message);
            toast.error(`Error al eliminar la galería: ${err.message}`);
            console.error("Error deleting galeria:", err);
        }
    };

    const handleEditGaleria = (galeriaItem) => {
        setSelectedGaleria(galeriaItem);
        setIsGaleriaModalOpen(true);
    };

    const handleDeleteGaleria = (id_galeria) => {
        setConfirmMessage('¿Estás seguro de que quieres eliminar esta galería? Las imágenes y videos asociados quedarán sin galería asignada.');
        setConfirmAction(() => () => performDeleteGaleria(id_galeria));
        setIsConfirmModalOpen(true);
    };

    // Abre el modal para añadir contenido a una galería específica
    const handleAddContent = (type, galeriaId) => {
        setEditingGaleriaId(galeriaId);
        if (type === 'image') {
            setSelectedImagen(null);
            setIsImagenModalOpen(true);
        } else {
            setSelectedVideo(null);
            setIsVideoModalOpen(true);
        }
    };
// parte 3
        // Manejadores para Imágenes (CRUD)
    const handleSaveImagen = async () => {
        setIsImagenModalOpen(false);
        setSelectedImagen(null);
        toast.success('Imagen guardada exitosamente.');

        // Si estábamos editando contenido dentro de una galería, recargamos su contenido.
        if (editingGaleriaId) {
            await reloadGalleryContent(editingGaleriaId);
        }

        setEditingGaleriaId(null);
    };

    const handleEditImagen = (imagenItem, galeriaId) => {
        setSelectedImagen(imagenItem);
        setEditingGaleriaId(galeriaId);
        setIsImagenModalOpen(true);
    };

    const performDeleteImagen = async (id_imagen, galeriaId) => {
        try {
            await deleteImagen(id_imagen);
            toast.success('Imagen eliminada exitosamente.');
            // --- MEJORA: Actualización de estado local sin recarga ---
            setExpandedContent(prev => {
                const currentContent = prev[galeriaId] || [];
                const newContent = currentContent.filter(item => 
                    !(item.type === 'image' && item.id_imagen === id_imagen)
                );
                return { ...prev, [galeriaId]: newContent };
            });
        } catch (err) {
            setError(err.message);
            toast.error(`Error al eliminar la imagen: ${err.message}`);
            console.error("Error deleting imagen:", err);
        }
    };

    const handleDeleteImagen = (id_imagen, galeriaId) => {
        setConfirmMessage('¿Estás seguro de que quieres eliminar esta imagen?');
        setConfirmAction(() => () => performDeleteImagen(id_imagen, galeriaId));
        setIsConfirmModalOpen(true);
    };

    // Manejadores para Videos (CRUD)
    const handleSaveVideo = async () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
        toast.success('Video guardado exitosamente.');

        // Si estábamos editando contenido dentro de una galería, recargamos su contenido.
        if (editingGaleriaId) {
            await reloadGalleryContent(editingGaleriaId);
        }

        setEditingGaleriaId(null);
    };

    const handleEditVideo = (videoItem, galeriaId) => {
        setSelectedVideo(videoItem);
        setEditingGaleriaId(galeriaId);
        setIsVideoModalOpen(true);
    };

    const performDeleteVideo = async (id_video, galeriaId) => {
        try {
            await deleteVideo(id_video);
            toast.success('Video eliminado exitosamente.');
            // --- MEJORA: Actualización de estado local sin recarga ---
            setExpandedContent(prev => {
                const currentContent = prev[galeriaId] || [];
                const newContent = currentContent.filter(item =>
                    !(item.type === 'video' && item.id_video === id_video)
                );
                return { ...prev, [galeriaId]: newContent };
            });
        } catch (err) {
            setError(err.message);
            toast.error(`Error al eliminar el video: ${err.message}`);
            console.error("Error deleting video:", err);
        }
    };

    const handleDeleteVideo = (id_video, galeriaId) => {
        setConfirmMessage('¿Estás seguro de que quieres eliminar este video?');
        setConfirmAction(() => () => performDeleteVideo(id_video, galeriaId));
        setIsConfirmModalOpen(true);
    };

    // Manejadores para abrir los modales de visualización
    const handleOpenImageDisplayModal = (imageUrl) => {
        setImageToDisplay(imageUrl);
        setIsImageDisplayModalOpen(true);
    };

    const handleCloseImageDisplayModal = () => {
        setIsImageDisplayModalOpen(false);
        setImageToDisplay(null);
    };

    const handleOpenVideoDisplayModal = (videoUrl) => {
        setVideoToDisplay(videoUrl);
        setIsVideoDisplayModalOpen(true);
    };

    const handleCloseVideoDisplayModal = () => {
        setIsVideoDisplayModalOpen(false);
        setVideoToDisplay(null);
    };
// parte 4
    // Columnas para la tabla de Galerías
    const galeriasColumns = [
        {
            header: '',
            accessor: 'expand',
            cellClassName: 'w-10 text-center',
            renderCell: (item) => (
                <button
                    onClick={() => handleToggleExpand(item.id_galeria)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-xl"
                    title={expandedContent[item.id_galeria] ? 'Ocultar Contenido' : 'Ver Contenido'}
                >
                    {loadingContent[item.id_galeria] ? <LoadingSpinner size="sm" /> : (expandedContent[item.id_galeria] ? '−' : '+')}
                </button>
            )
        },
        { header: 'Nombre de Galería', accessor: 'nombre_galeria', cellClassName: 'font-medium' },
        {
            header: 'Contenido',
            accessor: 'content_count',
            renderCell: (item) => (
                <div className="flex items-center space-x-4 text-xs text-gray-300">
                    <span className="flex items-center" title="Imágenes"><CameraIcon className="w-4 h-4 mr-1.5 text-blue-400" /> {item.image_count || 0}</span>
                    <span className="flex items-center" title="Videos"><VideoCameraIcon className="w-4 h-4 mr-1.5 text-purple-400" /> {item.video_count || 0}</span>
                </div>
            )
        },
        { header: 'Descripción', accessor: 'descripcion', renderCell: (item) => item.descripcion || 'N/A' },
        {
            header: 'Acciones',
            accessor: 'actions',
            cellClassName: 'text-right',
            renderCell: (item) => (
                <>
                    <button
                        onClick={() => handleEditGaleria(item)}
                        className="text-blue-400 hover:text-blue-600 font-medium mr-3 transition-colors duration-200"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeleteGaleria(item.id_galeria)}
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
                <p className="mt-4">Cargando galerías...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar datos: {error}</p>
                <button
                    onClick={fetchGalerias}
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#0000004b] min-h-screen rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center sm:text-left">
                    Gestión de Galerías
                </h2>
                <button
                    onClick={() => { setSelectedGaleria(null); setIsGaleriaModalOpen(true); }}
                    className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 shadow-blue-700 hover:shadow-2xl transition duration-300 transform hover:scale-105">
                    + Añadir Galería
                </button>
            </div>

            {/* Tabla de Galerías con filas expandibles */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            {galeriasColumns.map((col, index) => (
                                <th key={index} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${col.headerClassName || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {galerias.length === 0 ? (
                            <tr>
                                <td colSpan={galeriasColumns.length} className="px-6 py-4 text-center text-gray-400">No se encontraron galerías.</td>
                            </tr>
                        ) : (
                            galerias.map((galeria) => (
                                <React.Fragment key={galeria.id_galeria}>
                                    <tr className="hover:bg-gray-700 transition-colors duration-200">
                                        {galeriasColumns.map((col, colIndex) => (
                                            <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ''}`}>
                                                {col.renderCell ? col.renderCell(galeria) : galeria[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
{/* parte 5 */}
                                    {/* Fila de Contenido Expandido */}
                                    {expandedContent[galeria.id_galeria] && (
                                        <tr className="bg-gray-700/50">
                                            <td colSpan={galeriasColumns.length} className="p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h5 className="text-sm  text-gray-400">Contenido de la Galería</h5>
                                                    <div className="space-x-2">
                                                        <button onClick={() => handleAddContent('image', galeria.id_galeria)} className="bg-green-600 text-white py-1 px-3 rounded-md text-sm font-semibold hover:bg-green-700 transition">
                                                            + Imagen
                                                        </button>
                                                        <button onClick={() => handleAddContent('video', galeria.id_galeria)} className="bg-indigo-600 text-white py-1 px-3 rounded-md text-sm font-semibold hover:bg-indigo-700 transition">
                                                            + Video
                                                        </button>
                                                    </div>
                                                </div>
                                                {expandedContent[galeria.id_galeria].length === 0 ? (
                                                    <p className="text-gray-400 text-center py-4">Esta galería no tiene contenido.</p>
                                                ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-4">
                                                        {expandedContent[galeria.id_galeria].map(item => (                                                            
                                                <div key={`${item.type}-${item.id_imagen || item.id_video}`} className={`relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-square ${item.type === 'video' && item.estado === 'inactivo' ? 'grayscale brightness-75' : ''}`}>
                                                    {/* Imagen de fondo con efecto de zoom al pasar el ratón (solo en desktop) */}
                                                    <img
                                                        src={item.type === 'image' ? item.url_imagen : (item.url_thumbnail || 'https://placehold.co/300x300/1a202c/FFFFFF?text=Video')}
                                                        alt={item.nombre_archivo || item.titulo}
                                                        className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-110"
                                                    />
                                                    {/* Overlay con gradiente e información. Visible por defecto en móvil, aparece en hover en desktop. */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-2 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                                                                    <div className="flex justify-end">
                                                                        <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${
                                                                            item.type === 'image' 
                                                                                ? 'bg-blue-500' 
                                                                                : item.estado === 'inactivo' 
                                                                                ? 'bg-gray-600' 
                                                                                : 'bg-purple-500'
                                                                        }`}>
                                                                            {item.type === 'image' ? 'Imagen' : (item.estado === 'inactivo' ? 'Inactivo' : 'Video')}
                                                                        </span>
                                                                    </div>
                                                        {/* Parte inferior: Título y acciones. Animación de subida solo en desktop. */}
                                                        <div className="transition-transform duration-300 md:transform md:translate-y-4 md:group-hover:translate-y-0">
                                                                        <p className="text-white text-xs font-bold truncate mb-2">{item.nombre_archivo || item.titulo}</p>
                                                                        <div className="flex justify-center space-x-2">
                                                                            <button onClick={() => item.type === 'image' ? handleOpenImageDisplayModal(item.url_imagen) : handleOpenVideoDisplayModal(item.url_video)} className="p-1.5 bg-gray-900/50 rounded-full hover:bg-green-500 transition-colors" title="Ver"><EyeIcon className="w-3 h-3 md:w-4 md:h-4 text-white"/></button>
                                                                            <button onClick={() => item.type === 'image' ? handleEditImagen(item, galeria.id_galeria) : handleEditVideo(item, galeria.id_galeria)} className="p-1.5 bg-gray-900/50 rounded-full hover:bg-blue-500 transition-colors" title="Editar"><PencilIcon className="w-3 h-3 md:w-4 md:h-4 text-white"/></button>
                                                                            <button onClick={() => item.type === 'image' ? handleDeleteImagen(item.id_imagen, galeria.id_galeria) : handleDeleteVideo(item.id_video, galeria.id_galeria)} className="p-1.5 bg-gray-900/50 rounded-full hover:bg-red-500 transition-colors" title="Eliminar"><TrashIcon className="w-3 h-3 md:w-4 md:h-4 text-white"/></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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

            {/* Modales de CRUD */}
            <GaleriaFormModal
                isOpen={isGaleriaModalOpen}
                onClose={() => { setIsGaleriaModalOpen(false); setSelectedGaleria(null); }}
                onSave={handleSaveGaleria}
                galeriaItem={selectedGaleria}
            />
            <ImagenFormModal
                isOpen={isImagenModalOpen}
                onClose={() => { setIsImagenModalOpen(false); setSelectedImagen(null); setEditingGaleriaId(null); }}
                onSave={handleSaveImagen}
                imagenItem={selectedImagen}
                galerias={galerias}
                currentGaleriaId={editingGaleriaId}
            />
            <VideoFormModal
                isOpen={isVideoModalOpen}
                onClose={() => { setIsVideoModalOpen(false); setSelectedVideo(null); setEditingGaleriaId(null); }}
                onSave={handleSaveVideo}
                videoItem={selectedVideo}
                galerias={galerias}
                currentGaleriaId={editingGaleriaId}
            />

            {/* Modales de Visualización */}
            <ImageDisplayModal
                isOpen={isImageDisplayModalOpen}
                onClose={handleCloseImageDisplayModal}
                imageUrl={imageToDisplay}
                altText="Imagen de Galería"
            />
            <VideoDisplayModal
                isOpen={isVideoDisplayModalOpen}
                onClose={handleCloseVideoDisplayModal}
                videoUrl={videoToDisplay}
                title="Video de Galería"
            />

            {/* Modal de Confirmación */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                message={confirmMessage}
                onConfirm={() => {
                    if (confirmAction) confirmAction();
                    setIsConfirmModalOpen(false);
                }}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
};

export default GaleriasListPage;
