// Este es el componente para el Dashboard del Administrador.
// Muestra un resumen completo de los datos de todas las secciones
// y un placeholder para una gráfica de pedidos, utilizando el efecto Glassmorphism.

import React, { useState, useEffect } from 'react';
import NativeStackedBarChart from '../../components/layout/NativeStackedBarChart'; // CORREGIDO: Importamos el gráfico de barras APILADAS.
import NativePieChart from '../../components/layout/NativePieChart'; // CORREGIDO: Importamos desde la ubicación correcta.
import LoadingSpinner from '../../components/ui/LoadingSpinner'; // Importa el LoadingSpinner
import GlassBox from '../../components/ui/GlassBox'; // Importa el componente GlassBox

// Importar funciones de API desde sus respectivos módulos
// Asumimos que estas funciones ya manejan la autenticación internamente si es necesario.
import { getAllServicios } from '../../api/servicesApi';
import { getAllNews } from '../../api/newsApi';
import { getAllPromociones } from '../../api/promocionesApi';
import { getAllTestimonios } from '../../api/testimoniosApi';
import { getAllGalerias } from '../../api/galeriasApi'; // Asume que existe este archivo
import { getAllSolicitudes, getSolicitudesStatsMonthlyByType, getSolicitudesStatsByStatus } from '../../api/solicitudesApi';

const DashboardPage = () => {
    const [summaryData, setSummaryData] = useState({
        serviciosActivos: 0,
        noticiasTotales: 0,
        promocionesActivas: 0,
        testimoniosAprobados: 0,
        galeriasTotales: 0,
        solicitudesPendientes: 0,
        solicitudesMensualesPorTipo: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para el gráfico de torta interactivo ---
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [pieChartData, setPieChartData] = useState([]);
    const [pieChartLoading, setPieChartLoading] = useState(true);
    const [pieChartError, setPieChartError] = useState(null);

    // --- Opciones para los selectores de fecha ---
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('es-ES', { month: 'long' }) }));

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Realiza todas las llamadas a las API importadas en paralelo
                const [
                    serviciosRes,
                    newsRes,
                    promocionesRes,
                    testimoniosRes,
                    galeriasRes,
                    solicitudesPendientesRes, // Llamada para la tarjeta de resumen
                    solicitudesMensualesPorTipoRes // Llamada para el gráfico de barras apiladas
                ] = await Promise.all([
                    getAllServicios('activo'), // Solo servicios activos
                    getAllNews(), // Todas las noticias
                    getAllPromociones('activa'), // Solo promociones activas
                    getAllTestimonios(true), // Solo testimonios aprobados
                    getAllGalerias(), // Todas las galerías
                    getAllSolicitudes(null, null, null, 'pendiente', 1, 1), // CORREGIDO: Parámetros correctos para el estado
                    getSolicitudesStatsMonthlyByType() // Estadísticas mensuales por tipo para el gráfico de barras
                ]);

                // Formatea los datos para el gráfico
                const formatMonth = (isoMonth) => {
                    const [year, month] = isoMonth.split('-');
                    const date = new Date(year, month - 1, 1);
                    return date.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
                };

                // Formatear datos para el gráfico de barras apiladas
                const dataMap = new Map();
                const monthOrder = [];

                solicitudesMensualesPorTipoRes.forEach(({ mes, tipo_solicitud, total }) => {
                    if (!dataMap.has(mes)) {
                        dataMap.set(mes, {
                            name: formatMonth(mes),
                            cita: 0,
                            cotizacion: 0,
                            consulta: 0,
                        });
                        monthOrder.push(mes);
                    }
                    const monthData = dataMap.get(mes);
                    if (monthData.hasOwnProperty(tipo_solicitud)) {
                        monthData[tipo_solicitud] = total;
                    }
                });
                monthOrder.sort();
                const formattedStackedBarData = monthOrder.map(mes => dataMap.get(mes));

                // Calcula los resúmenes basados en los datos reales de las APIs
                // Cuando una API devuelve un objeto paginado, debes usar .totalItems en lugar de .length
                setSummaryData({
                    serviciosActivos: serviciosRes.totalItems ?? serviciosRes.length,
                    noticiasTotales: newsRes.totalItems ?? newsRes.length,
                    promocionesActivas: promocionesRes.totalItems ?? promocionesRes.length,
                    testimoniosAprobados: testimoniosRes.totalItems ?? testimoniosRes.length,
                    galeriasTotales: galeriasRes.totalItems ?? galeriasRes.length,
                    solicitudesPendientes: solicitudesPendientesRes.totalItems,
                    solicitudesMensualesPorTipo: formattedStackedBarData
                });
            } catch (err) {
                setError(err.message);
                console.error("Error fetching dashboard data:", err);
                // Si el error es 401, podría ser útil redirigir al login o mostrar un mensaje específico
                if (err.message.includes('401')) {
                    setError('Acceso no autorizado. Por favor, inicie sesión.');
                    // Opcional: Redirigir al login si es un error de autenticación
                    // onNavigate('login'); // Necesitarías pasar onNavigate como prop al DashboardPage
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Se ejecuta solo una vez al montar el componente

    // --- useEffect para cargar los datos del gráfico de torta ---
    useEffect(() => {
        const fetchPieData = async () => {
            setPieChartLoading(true);
            setPieChartError(null);
            try {
                const data = await getSolicitudesStatsByStatus(selectedYear, selectedMonth);
                
                // Formatear datos para el gráfico de torta
                const formattedData = data.map(item => ({
                    name: item.estado_solicitud.charAt(0).toUpperCase() + item.estado_solicitud.slice(1).replace('_', ' '),
                    value: item.total
                }));

                setPieChartData(formattedData);

            } catch (err) {
                setPieChartError(`Error al cargar datos del mes: ${err.message}`);
                setPieChartData([]); // Limpiar datos en caso de error
                console.error("Error fetching pie chart data:", err);
            } finally {
                setPieChartLoading(false);
            }
        };
        fetchPieData();
    }, [selectedYear, selectedMonth]); // Se ejecuta cada vez que cambia el año o el mes seleccionado

    if (loading) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
                <LoadingSpinner size="lg" color="primary" />
                <p className="mt-4">Cargando resumen del dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center text-red-400 text-xl">
                <p>Error al cargar datos: {error}</p>
                <button
                    onClick={() => window.location.reload()} // Simple recarga para reintentar
                    className="mt-4 bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition duration-300"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        // El fondo principal de esta página es bg-gray-900, heredado del contenedor principal en App.jsx.
        <div className="p-8 bg-[#0000004b] min-h-screen rounded-lg shadow-md animate-fadeIn text-white border-[1px] border-gray-700">
            <h2 className="text-4xl font-bold text-gray-100 mb-6">Panel de Administración</h2>
            <p className="text-lg text-gray-400 mb-8">
                Aquí podrás ver un resumen rápido de la actividad de tu negocio y acceder a las herramientas de gestión.
            </p>

            {/* Cuadrícula de tarjetas de resumen usando el componente GlassBox */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <GlassBox
                    title="Servicios Activos"
                    content={summaryData.serviciosActivos.toString()}
                    className="h-40 bg-[#1e293937]" // Color primario con transparencia
                />
                <GlassBox
                    title="Noticias Publicadas"
                    content={summaryData.noticiasTotales.toString()}
                    className="h-40 bg-[#1e293937]" // Color secundario con transparencia
                />
                <GlassBox
                    title="Promociones Activas"
                    content={summaryData.promocionesActivas.toString()}
                    className="h-40  bg-[#1e293937]" // Color acento con transparencia
                />
                <GlassBox
                    title="Testimonios Aprobados"
                    content={summaryData.testimoniosAprobados.toString()}
                    className="h-40 bg-blue-900/60" // Un color adicional para variedad
                />
                <GlassBox
                    title="Galerías Totales"
                    content={summaryData.galeriasTotales.toString()}
                    className="h-40 bg-teal-600/50" // Otro color para variedad
                />
                <GlassBox
                    title="Solicitudes Pendientes"
                    content={summaryData.solicitudesPendientes.toString()}
                    className="h-40 bg-orange-600/60" // Naranja oscuro con transparencia
                />
            </div>

            {/* Sección para la Gráfica de Pedidos */}
            <div className="my-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start bg-[#1e29392c] rounded-xl ">
                <div className="w-full">
                    <NativeStackedBarChart
                        data={summaryData.solicitudesMensualesPorTipo}
                        title="Actividad Mensual por Tipo"
                        keys={['cita', 'cotizacion', 'consulta']}
                        colors={{
                            cita: 'bg-blue-600/50', cotizacion: 'bg-orange-500/40', consulta: 'bg-green-500/40'
                        }}
                    />
                </div>
                {/* grafico de estado de solicitudes */}
                <div className="w-full fill-black drop-shadow-xl/50 drop-shadow-black/50 ">
                    <div className=" p-6 rounded-lg text-white h-full flex flex-col">
                        <h3 className="font-bold text-lg mb-4 text-center">Estado de Solicitudes</h3>
                        {/* Selectores de Mes y Año */}
                        <div className="flex justify-center gap-4 mb-4">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-3 py-1 rounded-lg bg-[#1e2939d7] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>{month.name}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-3 py-1 rounded-lg bg-[#1e2939d7] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-grow relative ">
                            {pieChartLoading && <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center z-10"><LoadingSpinner /></div>}
                            <NativePieChart data={pieChartData} title="" />
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default DashboardPage;
