// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para aplicar un retardo (debounce) a un valor.
 * Útil para búsquedas en tiempo real, donde no quieres que la acción se dispare
 * con cada pulsación de tecla, sino solo después de que el usuario haya terminado de escribir.
 *
 * @param {any} value - El valor que se desea debounced (ej. el texto de un input).
 * @param {number} delay - El tiempo en milisegundos para esperar antes de actualizar el valor debounced.
 * @returns {any} El valor debounced.
 */
function useDebounce(value, delay) {
    // Estado para almacenar el valor debounced
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Configura un temporizador que actualizará el valor debounced después del 'delay'
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Función de limpieza:
        // Si el 'value' cambia antes de que el temporizador se complete,
        // este efecto se limpia y el temporizador anterior se cancela.
        // Esto asegura que solo el último valor (después de que el usuario deja de escribir)
        // sea el que finalmente actualice 'debouncedValue'.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Solo re-ejecuta el efecto si 'value' o 'delay' cambian

    return debouncedValue;
}

export default useDebounce;
// ```
// Este documento contiene el código para el custom hook `useDebounce.js`. Este hook permite aplicar un retardo a cualquier valor, lo que es ideal para implementar búsquedas automáticas que no se disparen con cada pulsación de tecla, sino solo después de que el usuario haya dejado de escribir por un tiempo determinado. Recibe el valor a debounced y el tiempo de retardo en milisegundos