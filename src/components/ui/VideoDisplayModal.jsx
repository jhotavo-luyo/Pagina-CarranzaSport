// src/components/ui/VideoDisplayModal.jsx
// Modal genérico para reproducir un video incrustado (ej. YouTube, Vimeo) con efecto de vidrio.
import React from 'react';

/**
 * VideoDisplayModal
 * Muestra un video incrustado dentro de un modal con un fondo semitransparente y efecto de desenfoque.
 * Soporta URLs de YouTube y Vimeo.
 *
 * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {string} videoUrl - La URL del video a reproducir.
 * @param {string} [title='Video'] - Título del video para accesibilidad.
 */
const VideoDisplayModal = ({ isOpen, onClose, videoUrl, title = 'Video' }) => {
    if (!isOpen || !videoUrl) return null;

    // Función para obtener la URL de incrustación adecuada
    const getEmbedUrl = (url) => {
        // YouTube
        const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
        if (youtubeMatch && youtubeMatch[1]) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
        }
        // Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/|)(\d+)(?:\S+)?/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        }
        // Si no es YouTube ni Vimeo, intentar usar la URL directamente (puede que no funcione para todos los formatos)
        return url;
    };

    const embedUrl = getEmbedUrl(videoUrl);

    return (
        // Overlay del modal: Fondo semitransparente con efecto de desenfoque (blur)
        <div
            className="fixed inset-0  bg-opacity-10 backdrop-filter backdrop-blur-lg
                       flex items-center justify-center z-50 animate-fadeIn p-4"
            onClick={onClose} // Permite cerrar el modal haciendo clic fuera del reproductor
        >
            {/* Contenedor del contenido del modal: Semitransparente para mantener la coherencia */}
            <div
                className="relative bg-opacity-50 border border-gray-700
                           rounded-xl shadow-2xl p-4 w-full max-w-4xl
                           transform transition-transform duration-300"
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white text-3xl font-bold
                               bg-red-600 rounded-full w-10 h-10 flex items-center justify-center
                               hover:bg-red-700 transition-colors duration-200 z-20"
                    aria-label="Cerrar"
                >
                    &times;
                </button>
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
                    {embedUrl ? (
                        <iframe
                            title={title}
                            src={embedUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    ) : (
                        <div className="text-white text-center p-8 flex flex-col justify-center items-center h-full">
                            <p>No se pudo cargar el video. Formato de URL no soportado o inválido.</p>
                            <p className="text-sm text-gray-400 mt-2 break-all">URL: {videoUrl}</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">Si el video muestra un error, es posible que el propietario haya restringido su reproducción aquí.</p>
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-700 transition-colors duration-300">
                        Abrir en YouTube
                    </a>
                </div>
            </div>
        </div>
    );
};

export default VideoDisplayModal;