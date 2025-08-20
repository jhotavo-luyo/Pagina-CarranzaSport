// src/pages/admin/ServiceMediaModal.jsx
// Este modal gestiona la multimedia (imágenes y videos) asociada a un servicio específico.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
    getAllServicioImagenes,
    updateServicioImagen,
    deleteServicioImagen,
    createServicioImagen,
} from '../../api/serviciosImagenesApi';
import {
    getAllServicioVideos,
    updateServicioVideo,
    deleteServicioVideo,
    createServicioVideo,
} from '../../api/serviciosVideosApi';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import MediaSelectorModal from './MediaSelectorModal'; // Reutilizamos el selector de medios
import { StarIcon as StarSolid, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const ServiceMediaModal = ({ isOpen, onClose, servicio }) => {
    const [media, setMedia] = useState({ imagenes: [], videos: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Estado para el modal selector de medios
    const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
    const [selectorMediaType, setSelectorMediaType] = useState('image'); // 'image' o 'video'

    const fetchMedia = useCallback(async () => {
        if (!servicio?.id_servicio) return;
        setLoading(true);
        setError(null);
        try {
            const [imagenesData, videosData] = await Promise.all([
                getAllServicioImagenes(servicio.id_servicio),
                getAllServicioVideos(servicio.id_servicio)
            ]);
            setMedia({
                imagenes: imagenesData.sort((a, b) => a.orden - b.orden),
                videos: videosData.sort((a, b) => a.orden - b.orden)
            });
        } catch (err) {
            setError(`Error al cargar multimedia: ${err.message}`);
            toast.error(`Error al cargar multimedia: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [servicio]);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        } else {
            // Limpiar estado cuando el modal se cierra
            setMedia({ imagenes: [], videos: [] });
            setItemToDelete(null);
            setError(null);
        }
    }, [isOpen, fetchMedia]);

    const handleSetPrincipal = async (item, type) => {
        const toastId = toast.loading('Estableciendo como principal...');
        try {
            const updateFunction = type === 'image' ? updateServicioImagen : updateServicioVideo;
            const id = item.id_servicio_imagen || item.id_servicio_video;
            await updateFunction(id, { es_principal: true });
            toast.update(toastId, { render: 'Medio establecido como principal.', type: 'success', isLoading: false, autoClose: 3000 });
            fetchMedia();
        } catch (err) {
            toast.update(toastId, { render: `Error: ${err.message}`, type: 'error', isLoading: false, autoClose: 5000 });
        }
    };

    const handleDelete = (item, type) => {
        setItemToDelete({ item, type });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const { item, type } = itemToDelete;
        const toastId = toast.loading('Eliminando asociación...');
        try {
            const deleteFunction = type === 'image' ? deleteServicioImagen : deleteServicioVideo;
            const id = item.id_servicio_imagen || item.id_servicio_video;
            await deleteFunction(id);
            toast.update(toastId, { render: 'Asociación eliminada.', type: 'success', isLoading: false, autoClose: 3000 });
            fetchMedia();
        } catch (err) {
            toast.update(toastId, { render: `Error al eliminar: ${err.message}`, type: 'error', isLoading: false, autoClose: 5000 });
        }
        setItemToDelete(null);
    };

    const handleOpenSelector = (type) => {
        setSelectorMediaType(type);
        setIsSelectorModalOpen(true);
    };

    const handleAssociateMedia = async (selectedIds) => {
        if (!servicio?.id_servicio || selectedIds.length === 0) return;

        const mediaTypeName = selectorMediaType === 'image' ? 'imágenes' : 'videos';
        const toastId = toast.loading(`Asociando ${mediaTypeName}...`);

        try {
            const associationPromises = selectedIds.map(mediaId => {
                const associationData = { id_servicio: servicio.id_servicio };
                if (selectorMediaType === 'image') {
                    associationData.id_imagen = mediaId;
                    return createServicioImagen(associationData);
                } else {
                    associationData.id_video = mediaId;
                    return createServicioVideo(associationData);
                }
            });

            await Promise.all(associationPromises);
            toast.update(toastId, { render: `${mediaTypeName.charAt(0).toUpperCase() + mediaTypeName.slice(1)} asociadas exitosamente.`, type: 'success', isLoading: false, autoClose: 3000 });
            fetchMedia();
        } catch (err) {
            toast.update(toastId, { render: `Error al asociar: ${err.message}`, type: 'error', isLoading: false, autoClose: 5000 });
        }
    };

    const existingMediaIds = useMemo(() => {
        const imageIds = media.imagenes.map(item => item.id_imagen);
        const videoIds = media.videos.map(item => item.id_video);
        return [...imageIds, ...videoIds];
    }, [media.imagenes, media.videos]);

    const renderMediaList = (items, type) => {
        if (!items || items.length === 0) {
            return <p className="text-gray-500 text-center py-4">No hay {type === 'image' ? 'imágenes' : 'videos'} para este servicio.</p>;
        }
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div key={item.id_servicio_imagen || item.id_servicio_video} className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={type === 'image' ? item.url_imagen : (item.url_thumbnail || 'https://placehold.co/300x300/1a202c/FFFFFF?text=Video')}
                            alt={type === 'image' ? item.nombre_archivo : item.titulo}
                            className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex justify-end">
                                {item.es_principal ? (
                                    <StarSolid className="w-6 h-6 text-yellow-400" title="Principal" />
                                ) : (
                                    <button onClick={() => handleSetPrincipal(item, type)} className="text-gray-300 hover:text-yellow-400" title="Marcar como principal">
                                        <StarOutline className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                            <div className="flex justify-center space-x-2">
                                <button className="p-1.5 bg-gray-900/50 rounded-full hover:bg-blue-500 transition-colors" title="Editar"><PencilIcon className="w-4 h-4 text-white" /></button>
                                <button onClick={() => handleDelete(item, type)} className="p-1.5 bg-gray-900/50 rounded-full hover:bg-red-500 transition-colors" title="Eliminar asociación"><TrashIcon className="w-4 h-4 text-white" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Multimedia para: ${servicio?.nombre_servicio || ''}`}>
            {loading && <LoadingSpinner />}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {!loading && !error && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-200">Imágenes</h3>
                        <button
                            onClick={() => handleOpenSelector('image')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors disabled:bg-gray-500"
                            disabled={loading}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Añadir Imagen
                        </button>
                    </div>
                    {renderMediaList(media.imagenes, 'image')}

                    <div className="flex justify-between items-center mt-6 mb-4">
                        <h3 className="text-xl font-semibold text-gray-200">Videos</h3>
                        <button
                            onClick={() => handleOpenSelector('video')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors disabled:bg-gray-500"
                            disabled={loading}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Añadir Video
                        </button>
                    </div>
                    {renderMediaList(media.videos, 'video')}
                </>
            )}

            <ConfirmationModal
                isOpen={!!itemToDelete}
                message={`¿Estás seguro de que quieres eliminar la asociación de este ${itemToDelete?.type === 'image' ? 'imagen' : 'video'}?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setItemToDelete(null)}
            />

            <MediaSelectorModal
                isOpen={isSelectorModalOpen}
                onClose={() => setIsSelectorModalOpen(false)}
                onAssociate={handleAssociateMedia}
                mediaType={selectorMediaType}
                existingMediaIds={existingMediaIds}
            />
        </Modal>
    );
};

export default ServiceMediaModal;

