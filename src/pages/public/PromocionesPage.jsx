// src/pages/public/PromocionesPage.jsx
// Este componente muestra las promociones disponibles. Incluye un buscador
// y una grilla de tarjetas responsiva.
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MagnifyingGlassIcon, CalendarDaysIcon , MinusIcon} from '@heroicons/react/24/solid';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import { getPublicPromociones } from '../../api/promocionesApi'; // Importamos la nueva función

// --- Helper para formatear fechas ---
const formatDate = (dateString) => {
    // Agregamos un día para corregir problemas de zona horaria que pueden hacer que la fecha se muestre un día antes.
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Componente Modal para ver detalles ---
const PromotionModal = ({ promo, onClose }) => {
    if (!promo) return null;

    // Usamos un portal para renderizar el modal en el root del DOM, evitando problemas de z-index.
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <img className="w-full h-64 object-cover" src={promo.imagen_promocion} alt={promo.titulo} />
                    <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{promo.titulo}</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-green-400 font-semibold text-lg">- {(parseFloat(promo.descuento) || 0).toFixed(2)}% OFF</span>
                        <span className="text-sm bg-blue-500 text-white py-1 px-3 rounded-full capitalize">{promo.categoria}</span>
                    </div>
                    <p className="text-gray-300 mb-4 text-base">{promo.descripcion}</p>

                    {/* Fechas de validez */}
                    <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center text-sm text-gray-400">
                            <CalendarDaysIcon className="h-5 w-5 mr-3 text-blue-400" />
                            <span>Válido desde el <strong>{formatDate(promo.fecha_inicio)}</strong> hasta el <strong>{formatDate(promo.fecha_fin)}</strong></span>
                        </div>
                    </div>

                    {/* Términos y Condiciones (si existen) */}
                    {promo.terminos_condiciones && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-200 mb-2">Términos y Condiciones</h4>
                            <p className="text-xs text-gray-500 whitespace-pre-wrap">{promo.terminos_condiciones}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

// --- Componente de Tarjeta de Promoción (Reutilizable) ---
const PromotionCard = ({ promo, onCardClick }) => {
    const cardRef = useRef(null);
    const isInactive = promo.estado !== 'activa';
    const statusLabel = promo.estado.charAt(0).toUpperCase() + promo.estado.slice(1);

    const handleMouseMove = (e) => {
        if (!cardRef.current || isInactive) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const rotateX = -1 * ((y - height / 2) / (height / 2)) * 10;
        const rotateY = ((x - width / 2) / (width / 2)) * 10;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        
        const spotlightX = (x / width) * 100;
        const spotlightY = (y / height) * 100;
        cardRef.current.style.setProperty('--spotlight-x', `${spotlightX}%`);
        cardRef.current.style.setProperty('--spotlight-y', `${spotlightY}%`);
    };

    const handleMouseLeave = () => {
        if (!cardRef.current || isInactive) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    const cardClasses = `team-card relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg ${isInactive ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`;

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => !isInactive && onCardClick(promo)}
            className={cardClasses}
            style={{ transition: 'transform 0.2s' }}
        >
            {!isInactive && <div className="team-card-spotlight absolute inset-0 pointer-events-none z-20"></div>}
            <div className="relative z-10" style={!isInactive ? { transform: 'translateZ(20px)' } : {}}>
                <img className="w-full h-48 object-cover" src={promo.imagen_promocion} alt={promo.titulo} />
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 transition-colors">{promo.titulo}</h3>
                    <p className="text-gray-400 text-sm h-16">{promo.descripcion?.substring(0, 100)}{promo.descripcion?.length > 100 && '...'}</p>
                    {promo.fecha_fin && (
                        <div className="flex items-center text-xs text-gray-500 mt-3">
                            <CalendarDaysIcon className="h-4 w-4 mr-2" />
                            <span>Válido hasta: {formatDate(promo.fecha_fin)}</span>
                        </div>
                    )}
                </div>
                <div className={`absolute top-4 right-4 text-white text-sm font-bold py-1 px-3 rounded-full transform transition-transform ${isInactive ? 'bg-gray-600' : 'bg-orange-500'}`}>
                    {isInactive ? statusLabel : `- ${(parseFloat(promo.descuento) || 0).toFixed(2)}% `}
                </div>
                <div className="p-4 pt-0">
                    <button disabled={isInactive} className="w-full bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente de Botón de Paginación con Estilo ---
const PaginationButton = ({ onClick, disabled, children }) => (
    <div className="relative group">
        <div className={`relative w-40 h-14 m-auto overflow-hidden rounded-xl bg-black z-10 ${disabled ? 'opacity-50' : 'opacity-90'}`}>
            {/* brillo */}
            {!disabled && (
                <div className="absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transition-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12"></div>
            )}
            <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-[#000000]">
                <button
                    onClick={onClick}
                    disabled={disabled}
                    className="input font-semibold text-lg h-full opacity-90 w-full px-4 py-3 rounded-xl bg-[#00000066] disabled:cursor-not-allowed"
                >
                    {children}
                </button>
            </div>
            {/* marco */}
            {!disabled && (
                <div className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-blue-500 to-orange-500 blur-[30px]"></div>
            )}
        </div>
    </div>
);

// --- Componente Skeleton para el estado de carga ---
const SkeletonCard = () => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg animate-pulse">
        <div className="w-full h-48 bg-gray-700"></div>
        <div className="p-6">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="p-4 pt-0">
            <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
        </div>
    </div>
);

const PromocionesPage = () => {
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filter, setFilter] = useState('activa'); // 'activa', 'inactiva', '' (todas)
    const [categoryFilter, setCategoryFilter] = useState(''); // '', 'servicios', 'repuestos', 'otros'
    const [selectedPromo, setSelectedPromo] = useState(null);

    // Nuevos estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 20; // 8 tarjetas por página

    // Efecto para debouncing de la búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(tempSearchTerm);
            setCurrentPage(1); // Resetear a la página 1 en cada nueva búsqueda
        }, 500); // 500ms de retraso

        return () => {
            clearTimeout(handler);
        };
    }, [tempSearchTerm]);

    // Efecto para obtener los datos de la API cuando cambian los filtros o la página
    useEffect(() => {
        const fetchPromociones = async () => {
            setLoading(true);
            setError(null);
            try {
                // Pasamos los parámetros de paginación a la API
                const result = await getPublicPromociones(filter, debouncedSearchTerm, categoryFilter, currentPage, ITEMS_PER_PAGE);
                setPromociones(result.data || []);
                setTotalPages(result.totalPages || 1);
                setCurrentPage(result.currentPage || 1);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar las promociones.');
            } finally {
                setLoading(false);
            }
        };

        fetchPromociones();
        // Desplazarse al inicio de la sección de promociones al cambiar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filter, debouncedSearchTerm, categoryFilter, currentPage]); // Añadimos currentPage a las dependencias

    const FilterButton = ({ value, label, currentFilter, setFilterFunction }) => (
        <button
            onClick={() => {
                setFilterFunction(value);
                setCurrentPage(1); // Resetear a la página 1 al cambiar de filtro
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentFilter === value ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-black text-white min-h-screen p-4 sm:p-8 animate-radial-move overflow-x-hidden">
            <div className="container mx-auto">
                {/* --- Cabecera y Buscador --- */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                        Nuestras Promociones
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Aprovecha nuestras ofertas especiales en servicios y repuestos. ¡Calidad y ahorro garantizados!
                    </p>
                    {/* Filtros */}
                    <div className="flex justify-center flex-wrap gap-2 sm:gap-4 my-6">
                        <div className="flex gap-2 sm:gap-4">
                            <FilterButton value="activa" label="Activas" currentFilter={filter} setFilterFunction={setFilter} />
                            <FilterButton value="inactiva" label="Expiradas" currentFilter={filter} setFilterFunction={setFilter} />
                            <FilterButton value="" label="Todas" currentFilter={filter} setFilterFunction={setFilter} />
                        </div>
                        <div className="border-l border-gray-600 pl-2 sm:pl-4 flex gap-2 sm:gap-4">
                            <FilterButton value="" label="Todos" currentFilter={categoryFilter} setFilterFunction={setCategoryFilter} />
                            <FilterButton value="servicios" label="Servicios" currentFilter={categoryFilter} setFilterFunction={setCategoryFilter} />
                            <FilterButton value="repuestos" label="Repuestos" currentFilter={categoryFilter} setFilterFunction={setCategoryFilter} />
                            <FilterButton value="otros" label="Otros" currentFilter={categoryFilter} setFilterFunction={setCategoryFilter} />
                        </div>
                    </div>
                    <div className="mt-8 max-w-lg mx-auto">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar promoción (ej. aceite, llantas...)"
                                value={tempSearchTerm}
                                onChange={(e) => setTempSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </header>

                {/* --- Grilla de Promociones --- */}
                <main>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" style={{ perspective: '2000px' }}>
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <h2 className="text-2xl font-bold text-red-500">Error al cargar</h2>
                            <p className="text-gray-400 mt-2">{error}</p>
                        </div>
                    ) : promociones.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" style={{ perspective: '2000px' }}>
                            {promociones.map(promo => (
                                <PromotionCard key={promo.id_promocion} promo={promo} onCardClick={setSelectedPromo} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <TagIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-400">No se encontraron promociones</h2>
                            <p className="text-gray-500 mt-2">Prueba a cambiar los filtros o el término de búsqueda.</p>
                        </div>
                    )}
                </main>

                {/* --- Controles de Paginación --- */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <PaginationButton
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </PaginationButton>

                        <span className="text-lg font-semibold text-gray-300">
                            Página {currentPage} de {totalPages}
                        </span>

                        <PaginationButton
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </PaginationButton>
                    </div>
                )}
            </div>
            <PromotionModal promo={selectedPromo} onClose={() => setSelectedPromo(null)} />
        </div>
    );
}

export default PromocionesPage;