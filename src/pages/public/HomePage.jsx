// src/pages/public/HomePage.jsx
// Este componente representa la página de inicio o dashboard principal para el usuario final.
// Está en 'pages/public' porque es una vista accesible para todos los visitantes del sitio.
import React, { useRef, useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation'; // Importamos nuestro hook personalizado
import { Link } from 'react-router-dom'; // Importamos Link para la navegación
import '@google/model-viewer'; // Importamos el componente de visor 3D
import { getPublicNoticias } from '../../api/newsApi'; // Importamos la API de noticias
import { getPublicPromociones } from '../../api/promocionesApi';
import { createGeneralContactRequest } from '../../api/solicitudesApi';
import TestimonialCarousel from '../../components/public/TestimonialCarousel'; // NUEVO: Importar el carrusel de testimonios
import { CalendarDaysIcon, XMarkIcon, UserIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon, WrenchScrewdriverIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'; // eslint-disable-line no-unused-vars

// --- Helper para formatear fechas (copiado de PromocionesPage.jsx) ---
const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Componente Modal (copiado de PromocionesPage.jsx) ---
const PromotionModal = ({ promo, onClose }) => {
    if (!promo) return null;
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fadeIn md:w-full overflow-hidden" onClick={onClose}>
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
                        <span className="text-green-400 font-semibold text-lg">{(parseFloat(promo.descuento) || 0).toFixed(2)}% OFF</span>
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
// --- Componente de Tarjeta de Promoción (he copiado de PromocionesPage.jsx) ---
const PromotionCard = ({ promo, onCardClick }) => {
    const cardRef = useRef(null);
    // En HomePage, las promociones siempre están activas, pero mantenemos la lógica por consistencia.
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

    const cardClasses = `team-card relative w-full max-w-[255px] min-h-[380px] bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden shadow-lg ${isInactive ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`;

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
                    {isInactive ? statusLabel : `${(parseFloat(promo.descuento) || 0).toFixed(2)}% OFF`}
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
// --- Componente Skeleton para el estado de carga ---
const SkeletonCard = () => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg animate-pulse w-full max-w-[280px] h-[380px]">
        <div className="w-full h-48 bg-gray-700"></div>
        <div className="p-6">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);
// --- Componente Skeleton para Noticias ---
const NewsSkeletonCard = () => (
    <div className="bg-gray-800/50 p-4 rounded-lg animate-pulse w-full max-w-xs">
        <div className="h-32 bg-gray-700 rounded-md mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
    </div>
);

// --- Componente para la tarjeta de Noticia ---
const NewsCard = ({ noticia }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const rotateX = -1 * ((y - height / 2) / (height / 2)) * 8; // Rotación sutil
        const rotateY = ((x - width / 2) / (width / 2)) * 8;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

        const spotlightX = (x / width) * 100;
        const spotlightY = (y / height) * 100;
        cardRef.current.style.setProperty('--spotlight-x', `${spotlightX}%`);
        cardRef.current.style.setProperty('--spotlight-y', `${spotlightY}%`);
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="team-card relative bg-gray-800/50 p-4 rounded-lg w-full max-w-xs border border-gray-700 cursor-pointer"
            style={{ transition: 'transform 0.2s' }}
        >
            <div className="team-card-spotlight absolute inset-0 pointer-events-none z-20 rounded-lg"></div>
            <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                <img
                    src={noticia.imagen_noticia || 'https://placehold.co/400x300/1a202c/FFFFFF?text=Noticia'}
                    alt={noticia.titulo}
                    className="w-full h-32 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-bold text-orange-400 transition-colors truncate">{noticia.titulo}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mt-2">{noticia.contenido}</p>
                <div className="text-xs text-gray-500 mt-3 flex justify-between">
                    <span className="truncate pr-2">{noticia.autor_nombre || 'Anónimo'}</span>
                    <span>{formatDate(noticia.fecha_publicacion)}</span>
                </div>
            </div>
        </div>
    );
};


const HomePage = () => {
    // Objeto de configuración para la animación del visor 3D.
    const animationConfig = {
        scrollDuration: 500,
        startOrientation: { yaw: 0, pitch: 0, roll: 0 },
        endOrientation: { yaw: 0, pitch: 0, roll: 360 },
        startOrbit: { radius: 450 }, // CORRECCIÓN 1: Ajustar el zoom inicial a un valor visible.
        endOrbit: { radius: 120 },   // Zoom final (un radio menor acerca la cámara)
        startExposure: -20,
        endExposure: 0,
        startTranslateX: 0,
        endTranslateX: 10,
    };

    const modelViewerRef = useRef(null);
    const containerRef = useRef(null);
    const contactSectionRef = useRef(null); // Ref para la sección de contacto

    // Usamos el hook personalizado para aplicar la animación.
    useScrollAnimation(modelViewerRef, containerRef, animationConfig);

    // Estados para las noticias
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [errorNoticias, setErrorNoticias] = useState(null);

    // Estados para las promociones
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPromo, setSelectedPromo] = useState(null);
    // useEffect para cargar las promociones activas al montar el componente
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                // Pedimos solo las 4 primeras promociones activas
                const data = await getPublicPromociones('activa', '', '', 1, 8);
                setPromotions(data.data || []);
            } catch (err) {
                setError('No se pudieron cargar las promociones.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []); // Dependencia vacía para que se ejecute solo al montar

    // useEffect para cargar las noticias al montar el componente
    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                setLoadingNoticias(true);
                const data = await getPublicNoticias(10); // Pedimos las 10 últimas noticias
                setNoticias(data || []);
            } catch (err) {
                setErrorNoticias('No se pudieron cargar las noticias.');
                console.error(err);
            } finally {
                setLoadingNoticias(false);
            }
        };
        fetchNoticias();
    }, []);

    // --- Lógica para el formulario de contacto ---
    const [contactForm, setContactForm] = useState({
        nombre_completo: '',
        email: '',
        telefono: '',
        mensaje_usuario: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateContactForm = () => {
        const newErrors = {};
        if (!contactForm.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre es requerido.';
        if (!contactForm.email.trim()) {
            newErrors.email = 'El email es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
            newErrors.email = 'El formato del email es inválido.';
        }
        if (!contactForm.telefono.trim()) newErrors.telefono = 'El teléfono es requerido.';
        if (!contactForm.mensaje_usuario.trim()) newErrors.mensaje_usuario = 'El mensaje es requerido.';
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!validateContactForm()) {
            toast.warn('Por favor, complete todos los campos requeridos.');
            return;
        }
        setIsSubmitting(true);
        try {
            await createGeneralContactRequest(contactForm);
            toast.success('¡Mensaje enviado! Nos pondremos en contacto pronto.');
            setContactForm({ nombre_completo: '', email: '', telefono: '', mensaje_usuario: '' });
            setFormErrors({});
        } catch (error) {
            toast.error(error.message || 'No se pudo enviar el mensaje. Inténtelo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Lógica para el scroll suave al hacer clic en el botón de contacto ---
    const handleScrollToContact = () => {
        contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-black text-white shadow-2xl min-h-screen animate-radial-move overflow-hidden ">
            <>
                <title>Motosport Carranza - Taller y Repuestos para Motos</title>
                <meta name="description" content="Bienvenido a Motosport Carranza. Ofrecemos mantenimiento experto, repuestos de alta calidad y las mejores promociones para tu moto. ¡Contáctanos!" />
            </>

        {/* ========================================================================================== */}
        {/* SECCIÓN 01: HÉROE (TITULAR Y MODELO 3D CON MODEL-VIEWER) */}
        {/* ========================================================================================== */}
        <section id="hero" className="mt-8 mb-8 flex flex-col lg:flex-row justify-center items-center gap-8 min-h-[78vh] lg:min-h-[80vh]">
            <div className='text-center lg:text-left lg:w-1/2'>
                <h2 className="text-4xl text-center md:text-5xl lg:text-6xl font-bold text-gray-100 mb-4">¡Bienvenido a <br /> Motosport Carranza!</h2>
                <p className='text-xl text-center md:text-2xl font-extralight text-gray-300 mt-4 mb-8'>Perfección en cada servicio, <br /> excelencia en cada repuesto.</p>
                <div className="relative group">
                    <div className="relative w-52 h-14 m-auto opacity-90 overflow-hidden rounded-xl bg-black z-10">
                        <div className="absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transition-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12"></div>
                        <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-[#000000]">
                            <button onClick={handleScrollToContact} className="input font-semibold text-lg h-full opacity-90 w-full px-16 py-3 rounded-xl bg-[#00000066] cursor-pointer">
                                contactar
                            </button>
                        </div>
                        <div className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-blue-500 to-orange-500 blur-[30px]"></div>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="h-[50vh] w-full lg:h-[70vh] lg:w-1/2">
                <model-viewer ref={modelViewerRef} className="h-full w-full bg-transparent "
                    src="/moto.glb"
                    alt="Moto torito 3d"
                    camera-controls
                    environment-image="neutral"
                    disable-zoom
                    shadow-intensity="9"
                    autoplay
                    animation-name="*">
                </model-viewer>
            </div>
        </section>

        {/* ========================================================================================== */}
        {/* SECCIÓN 02: PROPUESTA DE VALOR (¿QUÉ BRINDAMOS?) */}
        {/* ========================================================================================== */}
        <section id="services-overview" className="py-16 ">
            <div className='w-full text-center mb-12'>
                <h2 className='text-3xl font-bold text-white'>¿Qué te Ofrecemos?</h2>
                <p className='mt-2 text-lg text-gray-400'>Profesionales a tu disposición, con la excelencia como nuestro norte.</p>
            </div>
            <div className='flex flex-wrap justify-center gap-8 p-4'>
                {/* Card 1: Mantenimiento Preventivo */}
                <div className="flip-card w-80 h-96">
                    <div className="flip-card-inner relative w-full h-full text-center">
                        <div className="flip-card-front bg-gray-900/80 border border-gray-700 flex flex-col justify-center items-center p-6 rounded-2xl">
                            <ShieldCheckIcon className="w-20 h-20 text-blue-400 mb-4" />
                            <h2 className="text-2xl font-bold text-white">Mantenimiento Preventivo</h2>
                            <p className="text-gray-400 mt-2">Mantén tu moto siempre lista y segura.</p>
                            <p className="mt-4 text-sm font-extralight text-gray-500">¡Pasa el ratón para saber más!</p>
                        </div>
                        <div className="flip-card-back bg-gray-800/90 border border-blue-500/50 text-white p-6 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4">Beneficios Clave</h3>
                            <p className="text-base leading-relaxed">
                                Aseguramos la longevidad y el rendimiento óptimo de tu moto con revisiones exhaustivas, cambios de aceite, filtros y ajustes necesarios para garantizar tu seguridad.
                            </p>
                            <p className="mt-4 text-sm text-blue-400">¡Confía en los expertos!</p>
                        </div>
                    </div>
                </div>
                {/* Card 2: Mantenimiento Correctivo */}
                <div className="flip-card w-80 h-96">
                    <div className="flip-card-inner relative w-full h-full text-center">
                        <div className="flip-card-front bg-gray-900/80 border border-gray-700 flex flex-col justify-center items-center p-6 rounded-2xl">
                            <WrenchScrewdriverIcon className="w-20 h-20 text-orange-400 mb-4" />
                            <h2 className="text-2xl font-bold text-white">Mantenimiento Correctivo</h2>
                            <p className="text-gray-400 mt-2">Reparaciones expertas para cualquier avería.</p>
                            <p className="mt-4 text-sm font-extralight text-gray-500">¡Pasa el ratón para saber más!</p>
                        </div>
                        <div className="flip-card-back bg-gray-800/90 border border-orange-500/50 text-white p-6 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4">Soluciones Precisas</h3>
                            <p className="text-base leading-relaxed">
                                Diagnosticamos y reparamos con precisión cualquier problema. Usamos herramientas avanzadas para devolverle a tu vehículo su funcionalidad y seguridad originales.
                            </p>
                            <p className="mt-4 text-sm text-orange-400">¡Recupera el camino con nosotros!</p>
                        </div>
                    </div>
                </div>
                {/* Card 3: Repuestos de Alta Calidad */}
                <div className="flip-card w-80 h-96">
                    <div className="flip-card-inner relative w-full h-full text-center">
                        <div className="flip-card-front bg-gray-900/80 border border-gray-700 flex flex-col justify-center items-center p-6 rounded-2xl">
                            <CubeTransparentIcon className="w-20 h-20 text-green-400 mb-4" />
                            <h2 className="text-2xl font-bold text-white">Repuestos de Calidad</h2>
                            <p className="text-gray-400 mt-2">Componentes originales y alternativos.</p>
                            <p className="mt-4 text-sm font-extralight text-gray-500">¡Pasa el ratón para saber más!</p>
                        </div>
                        <div className="flip-card-back bg-gray-800/90 border border-green-500/50 text-white p-6 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4">Garantía y Rendimiento</h3>
                            <p className="text-base leading-relaxed">
                                Ofrecemos una amplia gama de repuestos originales y de alta calidad. Garantizamos la durabilidad y el ajuste perfecto para que tu moto opere al máximo rendimiento.
                            </p>
                            <p className="mt-4 text-sm text-green-400">¡Encuentra lo que necesitas aquí!</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ========================================================================================== */}
        {/* SECCIÓN 03: PRUEBA SOCIAL (TESTIMONIOS) */}
        {/* ========================================================================================== */}
        <section id="testimonials" className="mt-16 py-12 p-5 bg-gray-900/50 rounded-2xl overflow-hidden">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Lo que dicen nuestros clientes</h2>
            <p className="text-center text-gray-400 mb-10">Tu confianza es nuestro mayor logro.</p>
            <TestimonialCarousel />
        </section>

        {/* ========================================================================================== */}
        {/* SECCIÓN 04: CONTENIDO DE INTERÉS (PROMOCIONES Y NOTICIAS) */}
        {/* ========================================================================================== */}
        <section id="latest-content" className="mt-16 py-12">
            <div className="max-w-full flex flex-col  lg:flex-row justify-between gap-12">
                {/* Columna de Promociones */}
                <div className="promociones lg:w-2/3">
                    <h2 className='text-3xl text-center my-3'>Nuestras Promociones</h2>
                    <div className='flex flex-wrap items-stretch justify-center gap-6 p-2 w-full'>
                        {loading ? (
                            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                        ) : error ? (
                            <p className="text-red-400 col-span-full text-center">{error}</p>
                        ) : promotions.length > 0 ? (
                            promotions.map(promo => (
                                <PromotionCard key={promo.id_promocion} promo={promo} onCardClick={setSelectedPromo} />
                            ))
                        ) : (
                            <p className="text-gray-400 col-span-full text-center">No hay promociones activas en este momento.</p>
                        )}
                    </div>
                    {promotions.length > 0 && (
                        <div className="text-center mt-8">
                            <div className="relative group inline-block">
                                <div className="relative w-64 h-14 m-auto opacity-90 overflow-hidden rounded-xl bg-black z-10">
                                    <div className="absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transition-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12"></div>
                                    <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-[#000000]">
                                        <Link to="/public/promociones" className="input font-semibold text-lg h-full opacity-90 w-full px-6 py-3 rounded-xl bg-[#00000066] flex items-center justify-center">
                                            Ver Más Promociones
                                        </Link>
                                    </div>
                                    <div className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-blue-500 to-orange-500 blur-[30px]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Columna de Noticias */}
                <div className="flex flex-col items-center gap-6 lg:w-1/3 min-w-[310px] border-t-2 lg:border-t-0 lg:border-l-2 border-gray-700 pt-8 lg:pt-0 lg:pl-8">
                    <h2 className='text-3xl text-center my-3'>Últimas Noticias</h2>
                    {loadingNoticias ? (
                        [...Array(3)].map((_, i) => <NewsSkeletonCard key={i} />)
                    ) : errorNoticias ? (
                        <p className="text-red-400 text-center">{errorNoticias}</p>
                    ) : noticias.length > 0 ? (
                        noticias.map(noticia => (
                            <NewsCard key={noticia.id_noticia} noticia={noticia} />
                        ))
                    ) : (
                        <p className="text-gray-400 text-center">No hay noticias recientes.</p>
                    )}
                </div>
            </div>
        </section>

        {/* ========================================================================================== */}
        {/* SECCIÓN 05: CONTACTO */}
        {/* ========================================================================================== */}
        <section id="contact" ref={contactSectionRef} className="mt-16 py-16 bg-gray-900/50 rounded-2xl scroll-mt-20">
            <div className="grow-1 max-w-md mx-auto relative overflow-hidden z-10 p-8">
                <h2 className="text-2xl text-center font-bold text-white mb-6">Contáctanos</h2>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nombre_completo" className="sr-only">Nombre Completo</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-500" /></span>
                            <input type="text" name="nombre_completo" id="nombre_completo" value={contactForm.nombre_completo} onChange={handleContactChange} placeholder="Nombre Completo" className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${formErrors.nombre_completo ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                        </div>
                        {formErrors.nombre_completo && <p className="text-red-400 text-xs mt-1">{formErrors.nombre_completo}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><EnvelopeIcon className="h-5 w-5 text-gray-500" /></span>
                            <input type="email" name="email" id="email" value={contactForm.email} onChange={handleContactChange} placeholder="Email" className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${formErrors.email ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                        </div>
                        {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="telefono" className="sr-only">Teléfono</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-500" /></span>
                            <input type="tel" name="telefono" id="telefono" value={contactForm.telefono} onChange={handleContactChange} placeholder="Teléfono" className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${formErrors.telefono ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                        </div>
                        {formErrors.telefono && <p className="text-red-400 text-xs mt-1">{formErrors.telefono}</p>}
                    </div>

                    <div>
                        <label htmlFor="mensaje_usuario" className="sr-only">Mensaje</label>
                        <div className="relative">
                            <span className="absolute top-3 left-0 flex items-center pl-3"><ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" /></span>
                            <textarea name="mensaje_usuario" id="mensaje_usuario" rows="4" value={contactForm.mensaje_usuario} onChange={handleContactChange} placeholder="Escribe tu mensaje aquí..." className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${formErrors.mensaje_usuario ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}></textarea>
                        </div>
                        {formErrors.mensaje_usuario && <p className="text-red-400 text-xs mt-1">{formErrors.mensaje_usuario}</p>}
                    </div>

                    <div className="flex justify-center">
                        <div className="relative group ">
                            <div className="relative w-52 h-14 m-auto opacity-90 overflow-hidden rounded-xl bg-black z-10">
                                <div className="absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transition-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12"></div>
                                <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-[#000000]">
                                    <button type="submit" disabled={isSubmitting} className="input font-semibold text-lg h-full opacity-90 w-full px-16 py-3 rounded-xl bg-[#00000066] disabled:bg-gray-600 disabled:cursor-not-allowed">
                                        {isSubmitting ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </div>
                                <div className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-blue-500 to-orange-500 blur-[30px]"></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
        {/* modales */}
        <PromotionModal promo={selectedPromo} onClose={() => setSelectedPromo(null)} />
        </div>
    );
};

export default HomePage;
