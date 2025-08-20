// src/components/ui/ImageDisplayModal.jsx
// Modal genérico para mostrar una imagen a pantalla completa con efecto de vidrio.
import React from 'react';

/**
 * ImageDisplayModal
 * Muestra una imagen dentro de un modal con un fondo semitransparente y efecto de desenfoque.
 *
 * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {string} imageUrl - La URL de la imagen a mostrar.
 * @param {string} [altText='Imagen'] - Texto alternativo para la imagen.
 */
const ImageDisplayModal = ({ isOpen, onClose, imageUrl, altText = 'Imagen' }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        // Overlay del modal: Fondo semitransparente con efecto de desenfoque (blur)
        <div
            className="fixed inset-0 bg-opacity-1 backdrop-filter backdrop-blur-lg
                       flex items-center justify-center z-50 animate-fadeIn"
            onClick={onClose} // Permite cerrar el modal haciendo clic fuera de la imagen
        >
            {/* Contenedor del contenido del modal: Semitransparente para mantener la coherencia */}
            <div
                className="relative bg-opacity-50 border border-gray-700
                           rounded-xl shadow-2xl p-4 max-w-3xl max-h-[90vh] overflow-hidden
                           transform transition-transform duration-300 hover:scale-105"
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white text-3xl font-bold
                               bg-red-600 rounded-full w-10 h-10 flex items-center justify-center
                               hover:bg-red-700 transition-colors duration-200 z-10"
                    aria-label="Cerrar"
                >
                    &times;
                </button>
                <div className="flex items-center justify-center w-full h-full">
                    <img
                        src={imageUrl}
                        alt={altText}
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-lg"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400/000000/FFFFFF?text=Error+al+cargar+imagen";
                            e.target.alt = "Error al cargar imagen";
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageDisplayModal;