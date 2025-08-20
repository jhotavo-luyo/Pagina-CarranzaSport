// src/components/ui/LoadingSpinner.jsx
// Componente de indicador de carga reutilizable.
import React from 'react';

/**
 * Componente LoadingSpinner
 * Muestra un spinner de carga animado.
 * @param {string} [size='md'] - Tamaño del spinner ('sm', 'md', 'lg').
 * @param {string} [color='primary'] - Color del spinner (ej. 'primary', 'blue-500', 'white').
 */
const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
    // Definir el tamaño del spinner basado en la prop 'size'.
    let spinnerSizeClass;
    switch (size) {
        case 'sm':
            spinnerSizeClass = 'w-6 h-6 border-2';
            break;
        case 'lg':
            spinnerSizeClass = 'w-16 h-16 border-4';
            break;
        case 'md':
        default:
            spinnerSizeClass = 'w-10 h-10 border-3';
            break;
    }

    // Definir el color del spinner.
    const spinnerColorClass = `border-${color}`;
    const spinnerBorderColorClass = `border-t-${color}`; // El borde superior es el que gira

    return (
        <div className="flex items-center justify-center">
            <div
                className={`
                    ${spinnerSizeClass}
                    ${spinnerColorClass}
                    ${spinnerBorderColorClass}
                    border-solid rounded-full animate-spin
                `}
                style={{
                    // Asegura que el borde de abajo sea transparente o un color de fondo sutil
                    borderColor: `var(--color-${color}, ${color})`, // Usa variable CSS si existe, sino el color directo
                    borderTopColor: `var(--color-${color}, ${color})`,
                    borderRightColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                    // Ajusta el color del borde "base" para que no se vea
                    // Esto es un pequeño truco para que solo el borde superior sea visible al girar
                    // Puedes ajustar 'transparent' o un color muy sutil si prefieres un anillo completo
                    borderWidth: size === 'lg' ? '4px' : (size === 'sm' ? '2px' : '3px')
                }}
            ></div>
        </div>
    );
};

export default LoadingSpinner;