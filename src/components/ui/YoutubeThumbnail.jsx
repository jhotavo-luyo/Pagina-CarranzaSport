// src/components/ui/YoutubeThumbnail.jsx

import React from 'react';
import { getYoutubeVideoId } from '../../utils/youtubeUtils';

const YoutubeThumbnail = ({ videoUrl, className }) => {
    const videoId = getYoutubeVideoId(videoUrl);

    if (!videoId) {
        // Muestra un placeholder si la URL no es válida o está vacía
        return (
            <div className={`bg-gray-700 flex items-center justify-center text-gray-400 text-sm rounded-lg ${className}`}>
                Previsualización no disponible
            </div>
        );
    }

    // Usamos la miniatura de alta calidad (hqdefault)
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
        <img
            src={thumbnailUrl}
            alt="Miniatura de YouTube"
            className={className}
            onError={(e) => {
                // Si hqdefault falla, intenta con una de menor calidad o muestra un error
                e.target.onerror = null;
                e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
        />
    );
};

export default YoutubeThumbnail;