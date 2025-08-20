// src/components/ui/ModalBackdrop.jsx
// Componente de fondo de modal que usa un portal para renderizarse fuera del flujo normal del DOM.
import React from 'react';
import ReactDOM from 'react-dom';

const ModalBackdrop = ({ children, onClose }) => {
    // Busca el elemento 'modal-root' en el DOM para renderizar el portal
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
        console.error("Element with ID 'modal-root' not found. Modal backdrop cannot be rendered.");
        return null;
    }

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0  bg-opacity-60 backdrop-filter backdrop-blur-lg
                       flex items-center justify-center z-50 animate-fadeIn"
            onClick={onClose} // Permite cerrar el modal haciendo clic en el fondo
        >
            {children} {/* Aquí se renderizará el contenido del modal (imagen o video) */}
        </div>,
        modalRoot // Renderiza este div dentro del 'modal-root'
    );
};

export default ModalBackdrop;