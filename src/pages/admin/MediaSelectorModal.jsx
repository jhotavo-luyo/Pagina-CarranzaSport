// src/pages/admin/MediaSelectorModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getAllGalerias } from '../../api/galeriasApi';
import { getAllImagenes } from '../../api/imagenesApi';
import { getAllVideos } from '../../api/videosApi';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const MediaSelectorModal = ({ isOpen, onClose, onAssociate, mediaType, existingMediaIds = [] }) => {
    // State for data
    const [galleries, setGalleries] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    
    // State for user interaction
    const [selectedGalleryId, setSelectedGalleryId] = useState('');
    const [selectedMediaIds, setSelectedMediaIds] = useState(new Set());

    // State for UI feedback
    const [loadingGalleries, setLoadingGalleries] = useState(false);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [error, setError] = useState(null);

    const mediaTypeName = mediaType === 'image' ? 'Imagen' : 'Video';
    const mediaTypeNamePlural = mediaType === 'image' ? 'Imágenes' : 'Videos';

    // Fetch galleries when the modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchGalleries = async () => {
                setLoadingGalleries(true);
                setError(null);
                try {
                    const data = await getAllGalerias();
                    setGalleries(data);
                } catch (err) {
                    setError(`Error al cargar galerías: ${err.message}`);
                    toast.error(`Error al cargar galerías: ${err.message}`);
                } finally {
                    setLoadingGalleries(false);
                }
            };
            fetchGalleries();
        } else {
            // Reset state when modal closes
            setGalleries([]);
            setMediaItems([]);
            setSelectedGalleryId('');
            setSelectedMediaIds(new Set());
            setError(null);
        }
    }, [isOpen]);

    // Fetch media when a gallery is selected
    useEffect(() => {
        if (!selectedGalleryId) {
            setMediaItems([]);
            return;
        }

        const fetchMedia = async () => {
            setLoadingMedia(true);
            setError(null);
            try {
                let data;
                if (mediaType === 'image') {
                    data = await getAllImagenes(selectedGalleryId);
                } else {
                    data = await getAllVideos('', selectedGalleryId);
                }
                setMediaItems(data);
            } catch (err) {
                setError(`Error al cargar ${mediaTypeNamePlural.toLowerCase()}: ${err.message}`);
                toast.error(`Error al cargar ${mediaTypeNamePlural.toLowerCase()}: ${err.message}`);
            } finally {
                setLoadingMedia(false);
            }
        };

        fetchMedia();
    }, [selectedGalleryId, mediaType]);

    const handleMediaSelect = (mediaId) => {
        setSelectedMediaIds(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(mediaId)) {
                newSelected.delete(mediaId);
            } else {
                newSelected.add(mediaId);
            }
            return newSelected;
        });
    };

    const handleAssociateClick = () => {
        onAssociate(Array.from(selectedMediaIds));
        onClose(); // Close the modal after associating
    };

    const existingMediaIdsSet = useMemo(() => new Set(existingMediaIds), [existingMediaIds]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Seleccionar `}>
            <div className="p-6 bg-[#1d2736bc] text-white rounded-lg shadow-xl w-[90vw] max-w-full max-h-[80vh] flex flex-col">
                <div className="mb-4">
                    <label htmlFor="gallery-select" className="block text-sm font-medium text-gray-300 mb-2">
                        1. Seleccione una Galería
                    </label>
                    <select
                        id="gallery-select"
                        value={selectedGalleryId}
                        onChange={(e) => setSelectedGalleryId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loadingGalleries}
                    >
                        <option value="">-- {loadingGalleries ? 'Cargando galerías...' : 'Elija una galería'} --</option>
                        {galleries.map(gal => (
                            <option key={gal.id_galeria} value={gal.id_galeria}>
                                {gal.nombre_galeria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                        2. Seleccione los Medios a Asociar
                    </h3>
                    {loadingMedia ? (
                        <div className="flex justify-center items-center h-48">
                            <LoadingSpinner />
                        </div>
                    ) : mediaItems.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {mediaItems.map(item => {
                                const mediaId = item.id_imagen || item.id_video;
                                const isAlreadyAssociated = existingMediaIdsSet.has(mediaId);
                                const isSelected = selectedMediaIds.has(mediaId);

                                return (
                                    <div
                                        key={mediaId}
                                        onClick={() => !isAlreadyAssociated && handleMediaSelect(mediaId)}
                                        className={`relative group aspect-square rounded-lg overflow-hidden shadow-lg transition-all duration-200
                                            ${isAlreadyAssociated 
                                                ? 'cursor-not-allowed grayscale opacity-50' 
                                                : 'cursor-pointer hover:scale-105'}
                                            ${isSelected ? 'ring-4 ring-blue-500' : 'ring-2 ring-gray-700 hover:ring-blue-600'}
                                        `}
                                    >
                                        <img
                                            src={item.url_imagen || item.url_thumbnail || 'https://placehold.co/300x300/1a202c/FFFFFF?text=Video'}
                                            alt={item.nombre_archivo || item.titulo}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs font-bold text-center p-1 truncate">{item.nombre_archivo || item.titulo}</p>
                                        </div>
                                        {isAlreadyAssociated && (
                                            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">Ya asociado</span>
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute top-1 right-1">
                                                <CheckCircleIcon className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            {selectedGalleryId ? `No hay ${mediaTypeNamePlural.toLowerCase()} en esta galería.` : 'Por favor, seleccione una galería para ver su contenido.'}
                        </div>
                    )}
                </div>

                {error && <p className="text-red-400 mt-4">{error}</p>}

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleAssociateClick}
                        disabled={selectedMediaIds.size === 0}
                        className="py-2 px-4 bg-primary hover:bg-orange-600 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Asociar {selectedMediaIds.size} {selectedMediaIds.size === 1 ? mediaTypeName : mediaTypeNamePlural}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MediaSelectorModal;
