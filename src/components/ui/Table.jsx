// src/components/ui/Table.jsx
import React, { useRef, useEffect } from 'react'; // Importamos los hooks useRef y useEffect de React.

/**
 * Componente genérico de tabla para mostrar datos con paginación.
 *
 * @param {Object} props - Las props del componente.
 * @param {Array<Object>} props.columns - Un array de objetos que definen las columnas de la tabla.
 * Cada objeto debe tener:
 * - `header`: String, el texto del encabezado de la columna.
 * - `accessor`: String, la clave para acceder al valor en los datos de cada fila.
 * - `renderCell`: Function (opcional), una función que recibe el objeto `item` (fila) y devuelve el JSX a renderizar para esa celda.
 * - `cellClassName`: String (opcional), clases CSS adicionales para aplicar a las celdas de esta columna.
 * - `headerClassName`: String (opcional), clases CSS adicionales para aplicar al encabezado de esta columna.
 * @param {Array<Object>} props.data - Un array de objetos, donde cada objeto representa una fila de datos de la página actual.
 * @param {string} props.keyAccessor - String, la clave única para cada fila (ej. 'id_usuario').
 * @param {string} [props.emptyMessage="No hay datos para mostrar."] - Mensaje a mostrar cuando no hay datos.
 * @param {number} [props.currentPage=1] - El número de la página actual (basado en 1).
 * @param {number} [props.itemsPerPage=10] - El número de elementos a mostrar por página.
 * @param {number} [props.totalItems=0] - El número total de elementos disponibles (no solo los de la página actual).
 * @param {function} props.onPageChange - Función de callback que se llama cuando cambia la página. Recibe el nuevo número de página.
 */
const Table = ({ columns, data, keyAccessor, emptyMessage = "No hay datos para mostrar.", currentPage = 1, itemsPerPage = 10, totalItems = 0, onPageChange }) => {
    // 1. REFERENCIA AL CONTENEDOR DE LA TABLA
    // `useRef` nos da una forma de acceder directamente a un elemento del DOM.
    // Lo usaremos para escuchar eventos de la rueda del ratón en el div que contiene la tabla.
    const tableContainerRef = useRef(null);

    // 2. EFECTO PARA EL SCROLL HORIZONTAL CON LA RUEDA DEL RATÓN
    // `useEffect` se ejecuta después de que el componente se renderiza.
    // El array vacío `[]` como segundo argumento asegura que este efecto se ejecute solo una vez,
    // cuando el componente se monta por primera vez.
    useEffect(() => {
        // Obtenemos el elemento del DOM a través de la referencia.
        const tableContainer = tableContainerRef.current;
        // Si el contenedor no existe todavía, no hacemos nada.
        if (!tableContainer) return;

        // Esta es la función que se ejecutará cada vez que el usuario mueva la rueda del ratón
        // sobre el contenedor de la tabla.
        const handleWheel = (event) => {
            // `event.deltaY` es el valor del scroll vertical. Si no es cero, significa que el usuario
            // está moviendo la rueda del ratón hacia arriba o hacia abajo.
            if (event.deltaY !== 0) {
                // `event.preventDefault()` evita el comportamiento por defecto, que sería hacer scroll
                // vertical en toda la página.
                event.preventDefault();
                // `tableContainer.scrollLeft` es la posición del scroll horizontal.
                // Le sumamos el valor del scroll vertical (`event.deltaY`) para moverlo horizontalmente.
                tableContainer.scrollLeft += event.deltaY;
            }
        };

        // Añadimos el 'event listener' al evento 'wheel' (rueda del ratón).
        tableContainer.addEventListener('wheel', handleWheel);

        // 3. FUNCIÓN DE LIMPIEZA
        // La función que se retorna dentro de `useEffect` se ejecuta cuando el componente se "desmonta"
        // (deja de ser visible). Es crucial para evitar fugas de memoria.
        // Aquí, eliminamos el 'event listener' que añadimos, para que no siga existiendo
        // cuando el componente ya no está en pantalla.
        return () => {
            tableContainer.removeEventListener('wheel', handleWheel);
        };
    }, []); // El array vacío `[]` asegura que el efecto se ejecute solo una vez.

    // 4. LÓGICA DE PAGINACIÓN
    // Calcula el número total de páginas necesarias. `Math.ceil` redondea hacia arriba.
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Genera un array de números de página para mostrar en los controles de paginación.
    // Esto crea una paginación "inteligente" que no muestra todos los números si hay muchas páginas.
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Número máximo de botones de página a mostrar (ej. 1, 2, 3, 4, 5)
        
        // Calcula la página de inicio para centrar la página actual.
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        // Calcula la página final.
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // Ajusta el inicio si el final se sale del rango (estamos cerca del final de las páginas).
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        // Llena el array con los números de página a mostrar.
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    // 5. RENDERIZADO DEL COMPONENTE
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* --- VISTA DE TABLA PARA ESCRITORIO (md y superior) --- */}
            {/* `hidden md:block` oculta este div en pantallas pequeñas y lo muestra como bloque en medianas y grandes. */}
            <div className="hidden md:block">
                {/* `ref={tableContainerRef}` asocia nuestra referencia al div para el scroll horizontal. */}
                {/* `overflow-x-auto` permite el scroll horizontal si el contenido es más ancho. */}
                {/* `max-h-[95vh] overflow-y-auto` limita la altura y permite el scroll vertical si es necesario. */}
                <div ref={tableContainerRef} className="max-h-[95vh] overflow-y-auto  overflow-x-hidden ">
                    <table className="min-w-full divide-y divide-gray-700 ">
                        {/* `sticky top-0` hace que el encabezado se quede fijo en la parte superior al hacer scroll vertical. */}
                        <thead className="bg-gray-700 sticky top-0 z-10">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${col.headerClassName || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {/* Si no hay datos, muestra un mensaje. */}
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                // Si hay datos, mapea cada item a una fila `<tr>`.
                                data.map((item) => (
                                    <tr key={item[keyAccessor]} className="hover:bg-gray-700 transition-colors duration-200">
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ''}`}
                                            >
                                                {/* `renderCell` permite renderizado personalizado. Si no existe, usa el `accessor` para mostrar el dato. */}
                                                {col.renderCell ? col.renderCell(item) : item[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- VISTA DE TARJETAS PARA MÓVIL (oculto en md y superior) --- */}
            {/* `md:hidden` muestra este div solo en pantallas pequeñas (móviles). */}
            <div className="md:hidden p-4 space-y-4">
                {data.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">{emptyMessage}</p>
                ) : (
                    // Mapea cada item de datos a una tarjeta.
                    data.map(item => (
                        <div key={item[keyAccessor]} className="bg-gray-700/50 rounded-lg p-4 shadow-md flex flex-col space-y-3">
                            {columns.map((col, index) => {
                                // La columna de acciones se renderiza al final de forma especial.
                                if (col.accessor === 'actions') return null; 
                                return (
                                    // Cada columna se convierte en una fila de "Etiqueta: Valor".
                                    <div key={index} className={index === 0 ? 'border-b border-gray-600 pb-2' : ''}>
                                        <span className="text-sm font-semibold text-gray-400">{col.header}: </span>
                                        <span className="text-white break-words">{col.renderCell ? col.renderCell(item) : item[col.accessor]}</span>
                                    </div>
                                );
                            })}
                            {/* Renderiza las acciones al final de la tarjeta. */}
                            <div className="flex justify-end pt-3">{columns.find(c => c.accessor === 'actions')?.renderCell(item)}</div>
                        </div>
                    ))
                )}
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {/* Solo se muestra si hay más de una página. */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center py-4 bg-gray-700 border-t border-gray-600">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Anterior
                    </button>

                    {/* Mapea los números de página generados a botones. */}
                    {getPageNumbers().map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={`px-3 py-1 mx-1 rounded-md ${
                                pageNumber === currentPage
                                    ? 'bg-primary text-white' // Estilo para la página activa.
                                    : 'bg-gray-600 text-white hover:bg-gray-500'
                            } transition-colors duration-200`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 mx-1 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default Table;
