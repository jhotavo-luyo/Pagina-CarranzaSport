// src/pages/admin/VideoFormModal.jsx
// Este componente es un modal para crear o editar videos.
// Permite asignar el video a una galería existente.
import React, { useState, useEffect } from 'react';
import { createVideo, updateVideo } from '../../api/videosApi';
import { getYoutubeVideoId } from '../../utils/youtubeUtils'; // Importar la utilidad
import YoutubeThumbnail from '../../components/ui/YoutubeThumbnail'; // Importar el componente de previsualización

const VideoFormModal = ({ isOpen, onClose, onSave, videoItem = null, galerias = [], currentGaleriaId = null }) => {
    // Estado unificado para los campos del formulario
    const [formData, setFormData] = useState({
        id_galeria: '',
        titulo: '',
        url_video: '',
        url_thumbnail: '',
        duracion_segundos: '',
        descripcion: '',
        estado: 'activo',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const estadosPermitidos = ['activo', 'inactivo'];

    useEffect(() => {
        if (isOpen) {
            if (videoItem) {
                setFormData({
                    id_galeria: videoItem.id_galeria || '',
                    titulo: videoItem.titulo || '',
                    url_video: videoItem.url_video || '',
                    url_thumbnail: videoItem.url_thumbnail || '',
                    duracion_segundos: videoItem.duracion_segundos !== null ? videoItem.duracion_segundos.toString() : '',
                    descripcion: videoItem.descripcion || '',
                    estado: videoItem.estado || 'activo',
                });
            } else {
                // Si es un nuevo video y se viene de una galería específica, preseleccionar
                setFormData({
                    id_galeria: currentGaleriaId || '',
                    titulo: '',
                    url_video: '',
                    url_thumbnail: '',
                    duracion_segundos: '',
                    descripcion: '',
                    estado: 'activo',
                });
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [videoItem, isOpen, galerias, currentGaleriaId]);

    // Efecto para autocompletar la URL de la miniatura desde la URL de YouTube
    useEffect(() => {
        if (formData.url_video) {
            const videoId = getYoutubeVideoId(formData.url_video);
            if (videoId) {
                // Si se detecta un ID de video de YouTube, se establece la URL de la miniatura automáticamente.
                // El usuario aún puede sobreescribirla si lo desea.
                setFormData(prev => ({ ...prev, url_thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }));
            }
        }
    }, [formData.url_video]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.titulo.trim()) {
            newErrors.titulo = 'El título es requerido.';
        } else if (formData.titulo.length > 150) {
            newErrors.titulo = 'El título no puede exceder los 150 caracteres.';
        }

        if (!formData.url_video.trim()) {
            newErrors.url_video = 'La URL del video es requerida.';
        } else if (!/^https?:\/\/\S+$/.test(formData.url_video)) {
            newErrors.url_video = 'El formato de la URL es inválido.';
        }

        if (formData.url_thumbnail && !/^https?:\/\/\S+$/.test(formData.url_thumbnail)) {
            newErrors.url_thumbnail = 'El formato de la URL de la miniatura es inválido.';
        }

        const duracionNum = parseInt(formData.duracion_segundos, 10);
        if (formData.duracion_segundos && (isNaN(duracionNum) || duracionNum < 0)) {
            newErrors.duracion_segundos = 'La duración debe ser un número positivo.';
        }

        if (formData.descripcion && formData.descripcion.length > 500) {
            newErrors.descripcion = 'La descripción no puede exceder los 500 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const videoData = {
            ...formData,
            id_galeria: formData.id_galeria === '' ? null : formData.id_galeria,
            url_thumbnail: formData.url_thumbnail || null,
            duracion_segundos: formData.duracion_segundos ? parseInt(formData.duracion_segundos, 10) : null,
            descripcion: formData.descripcion || null,
        };

        try {
            if (videoItem) {
                await updateVideo(videoItem.id_video, videoData);
            } else {
                await createVideo(videoData);
            }
            onSave(); // Notificamos al padre que se guardó para que pueda recargar los datos.
        } catch (err) {
            setErrors({ api: err.message || 'Error al guardar el video.' });
            console.error("Error saving video:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#101828a0] bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
            <div
                className="bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-700
                           rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    {videoItem ? 'Editar Video' : 'Añadir Nuevo Video'}
                </h2>

                {errors.api && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="titulo" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Título</label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.titulo ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.titulo && <p className="text-red-400 text-sm mt-1">{errors.titulo}</p>}
                    </div>
                    <div>
                        <label htmlFor="url_video" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">URL de Video</label>
                        <input
                            type="url"
                            id="url_video"
                            name="url_video"
                            value={formData.url_video}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.url_video ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.url_video && <p className="text-red-400 text-sm mt-1">{errors.url_video}</p>}
                    </div>

                    {/* Previsualización de la miniatura */}
                    {formData.url_video && !errors.url_video && (
                        <div className="mt-4">
                            <label className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Previsualización</label>
                            <YoutubeThumbnail
                                videoUrl={formData.url_video}
                                className="w-full max-w-sm rounded-lg object-cover mx-auto"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="url_thumbnail" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">URL de Miniatura (Opcional)</label>
                        <input
                            type="url"
                            id="url_thumbnail"
                            name="url_thumbnail"
                            value={formData.url_thumbnail}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.url_thumbnail ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        />
                        {errors.url_thumbnail && <p className="text-red-400 text-sm mt-1">{errors.url_thumbnail}</p>}
                    </div>
                    <div>
                        <label htmlFor="duracion_segundos" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Duración (segundos, Opcional)</label>
                        <input
                            type="number"
                            id="duracion_segundos"
                            name="duracion_segundos"
                            value={formData.duracion_segundos}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.duracion_segundos ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            min="0"
                            step="1"
                            disabled={isSubmitting}
                        />
                        {errors.duracion_segundos && <p className="text-red-400 text-sm mt-1">{errors.duracion_segundos}</p>}
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Descripción (Opcional)</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.descripcion ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.descripcion && <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>}
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Estado</label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            {estadosPermitidos.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="id_galeria" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Asignar a Galería (Opcional)</label>
                        <select
                            id="id_galeria"
                            name="id_galeria"
                            value={formData.id_galeria}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="">-- Sin Galería --</option>
                            {galerias.map(galeria => (
                                <option key={galeria.id_galeria} value={galeria.id_galeria}>
                                    {galeria.nombre_galeria}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 mt-6 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto mt-2 sm:mt-0 bg-gray-600 text-white py-2 px-5 rounded-lg text-base font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-primary text-white py-2 px-5 rounded-lg text-base font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (videoItem ? 'Guardar Cambios' : 'Crear Video')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VideoFormModal;
