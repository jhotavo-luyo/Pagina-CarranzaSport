// src/components/ui/GlassBox.jsx
// Este es un componente de UI reutilizable para demostrar el efecto Glassmorphism.
// Se ubica en 'components/ui' porque es un elemento de interfaz genérico.
import React from 'react';

const GlassBox = ({ title, content, className = '' }) => {
    return (
        // Aplica las clases de Tailwind para el efecto Glassmorphism:
        // 'bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md': Fondo oscuro translúcido con desenfoque.
        // 'border border-gray-700': Borde sutil que le da definición.
        // 'rounded-xl shadow-lg p-5': Bordes redondeados, sombra y padding interno.
        // 'flex flex-col items-center justify-center': Centra el contenido internamente.
        // 'text-white': Texto blanco para contraste.
        // 'transform transition-transform duration-300 hover:scale-105': Efecto de escala al pasar el ratón.
        // La prop 'className' permite añadir clases adicionales desde el padre para personalizar.
        <div className={` bg-opacity-70 backdrop-filter backdrop-blur-md
                        border border-gray-700 rounded-xl shadow-lg p-5
                        flex flex-col items-center justify-center text-white
                        transform transition-transform duration-300 hover:scale-105 ${className}`}>
            {title && <h3 className="text-2xl font-semibold mb-2">{title}</h3>}
            {content && <div className="text-lg text-center">{content}</div>}
            {/* <p className="text-xs mt-2 text-gray-400">
                (Este es el efecto glass aplicado)
            </p> */}
        </div>
    );
};

export default GlassBox;