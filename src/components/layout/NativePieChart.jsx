// src/components/admin/charts/NativePieChart.jsx
import React from 'react';

const COLORS = ['#FF8C0088', '#1E90FF88', '#32CD3288', '#FFD70888', '#9370DB88'];

const NativePieChart = ({ data = [], title = "Gráfico" }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-800/70 border border-gray-700 p-6 rounded-lg text-white text-center h-full flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400">No hay datos para mostrar.</p>
            </div>
        );
    }

    const totalValue = data.reduce((acc, item) => acc + item.value, 0);

    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const slices = data.map((slice, index) => {
        const percent = slice.value / totalValue;
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
        ].join(' ');

        return { path: pathData, color: COLORS[index % COLORS.length], name: slice.name, value: slice.value };
    });

    return (
        <div className=" flex flex-col md:flex-row items-center justify-center gap-6 h-full w-full">
            <div className="flex-shrink-0">
                <svg viewBox="-1 -1 2 2" className="w-40 h-40 transform -rotate-90">
                    {slices.map((slice, index) => (
                        <path key={index} d={slice.path} fill={slice.color}>
                            <title>{`${slice.name}: ${slice.value}`}</title>
                        </path>
                    ))}
                </svg>
            </div>
            <div className="flex-grow w-full">
                {title && <h3 className="font-bold text-lg mb-4 text-center md:text-left">{title}</h3>}
                <ul className="space-y-2">
                    {data.map((item, index) => (
                        <li key={index} className="flex items-center text-sm justify-between">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-gray-300">{item.name}:</span>
                            </div>
                            <span className="font-semibold">{item.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NativePieChart;
