// src/pages/PagePlaceholder.jsx
// Este componente es un marcador de posición genérico para las páginas que aún no están implementadas.
// Pertenece a 'pages' porque representa una vista completa, aunque sea temporal.
import React from 'react';

// 'title' es una prop opcional para personalizar el mensaje del placeholder.
const PagePlaceholder = ({ title }) => {
    return (
        // Contenedor principal con centrado, padding, fondo blanco, redondeado y sombra.
        // 'animate-fadeIn': Aplica la animación definida en tailwind.config.js.
        <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-lg shadow-md animate-fadeIn">
            {/* Título de la sección */}
            <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
                {title || 'Sección'} - ¡Próximamente! {/* Muestra el título o un valor por defecto */}
            </h2>
            {/* Mensaje explicativo */}
            <p className="text-lg text-gray-600 text-center max-w-2xl">
                Estamos trabajando duro para traerte la funcionalidad de {title ? title.toLowerCase() : 'esta sección'} muy pronto.
                Mantente atento a las actualizaciones.
            </p>
            {/* Un emoji de "construcción" para un toque visual */}
            <div className="mt-8 text-6xl text-primary opacity-75">
                🚧
            </div>
        </div>
    );
};

export default PagePlaceholder;