// src/components/ui/Modal.jsx
import React from 'react';
import ModalBackdrop from './ModalBackdrop';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-4xl' }) => {
    if (!isOpen) return null;

    // El contenido del modal en sí
    const modalContent = (
        <div
            // Clases de animación para una entrada más suave
            className={`relative bg-[#1e2939d7] rounded-2xl shadow-xl w-[95vw] ${maxWidth} max-h-[90vh] flex flex-col border border-gray-700 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scaleIn`}
            onClick={(e) => e.stopPropagation()} // Evita que los clics dentro del modal lo cierren
        >
            {/* Encabezado con posicionamiento "sticky" */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 rounded-t-2xl">
                <h3 className="text-xl font-bold text-white truncate pr-4">{title}</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Cerrar modal"
                >
                    <XMarkIcon className="w-7 h-7" />
                </button>
            </div>

            {/* Cuerpo con manejo de desbordamiento */}
            <div className="p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );

    // Renderiza usando el telón de fondo que a su vez usa un portal
    return (
        <ModalBackdrop onClose={onClose}>
            {modalContent}
        </ModalBackdrop>
    );
};

export default Modal;
