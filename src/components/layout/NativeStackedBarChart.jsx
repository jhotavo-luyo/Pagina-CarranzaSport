// src/components/admin/charts/NativeStackedBarChart.jsx
import React, { useState } from 'react';

const NativeStackedBarChart = ({ data = [], keys = [], colors = {}, title = "Gráfico" }) => {
    // --- NUEVO: Estados para el tooltip ---
    const [tooltip, setTooltip] = useState({
        visible: false,
        content: {},
        x: 0,
        y: 0,
    });

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-800/70 border border-gray-700 p-6 rounded-lg text-white text-center">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400">No hay datos para mostrar.</p>
            </div>
        );
    }

    // 1. Procesar datos para obtener el total de cada barra
    const processedData = data.map(d => {
        const total = keys.reduce((acc, key) => acc + (d[key] || 0), 0);
        return { ...d, total };
    });

    // 2. Encontrar el valor máximo total para escalar las barras
    const maxValue = Math.max(...processedData.map(d => d.total), 0);

    // --- NUEVO: Manejadores para el tooltip ---
    const handleMouseEnter = (event, item) => {
        setTooltip({
            visible: true,
            content: item,
            x: event.clientX,
            y: event.clientY,
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    return (
        <div className="relative p-6 rounded-lg text-white h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-center">{title}</h3>
            
            {/* Contenedor del gráfico */}
            <div className="flex-grow flex justify-around items-end h-64 gap-4 border-l border-b border-gray-600 p-4">
                {processedData.map((item) => (
                    <div
                        key={item.name}
                        className="h-full flex-1 flex flex-col justify-end items-center gap-2"
                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* La barra apilada */}
                        <div
                            className="w-full flex flex-col"
                            style={{ height: `${maxValue > 0 ? (item.total / maxValue) * 100 : 0}%` }}
                        >
                            {keys.map(key => (
                                // Cada segmento de la barra
                                <div
                                    key={key}
                                    className={`${colors[key] || 'bg-gray-500'} transition-all duration-300`}
                                    style={{ height: `${item.total > 0 ? ((item[key] || 0) / item.total) * 100 : 0}%` }}
                                ></div>
                            ))}
                        </div>
                        {/* Etiqueta del eje X */}
                        <span className="text-xs text-gray-300 font-medium">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* Leyenda del gráfico */}
            <div className="flex justify-center flex-wrap gap-4 mt-4 pt-2 border-t border-gray-700">
                {keys.map(key => (
                    <div key={key} className="flex items-center text-xs">
                        <span
                            className={`w-3 h-3 rounded-full mr-2 ${colors[key] || 'bg-gray-500'}`}
                        ></span>
                        <span className="text-gray-300">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                ))}
            </div>

            {/* --- NUEVO: Renderizado del Tooltip --- */}
            {tooltip.visible && (
                <div
                    className="fixed bg-gray-900 border border-gray-600 rounded-lg shadow-lg p-3 text-xs text-white pointer-events-none transition-opacity duration-200 z-50"
                    style={{
                        left: `${tooltip.x + 15}px`, // Posiciona a la derecha del cursor
                        top: `${tooltip.y + 15}px`,  // Posiciona debajo del cursor
                    }}
                >
                    <p className="font-bold text-base mb-2">{tooltip.content.name}</p>
                    <ul className="space-y-1">
                        {keys.map(key => (
                            <li key={key} className="flex justify-between items-center">
                                <span className="flex items-center"><span className={`w-2 h-2 rounded-full mr-2 ${colors[key]}`}></span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                <span className="font-semibold ml-4">{tooltip.content[key] || 0}</span>
                            </li>
                        ))}
                        <li className="flex justify-between items-center border-t border-gray-700 mt-2 pt-1 font-bold"><span>Total:</span><span>{tooltip.content.total}</span></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NativeStackedBarChart;
