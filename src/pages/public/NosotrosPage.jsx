import React, { useState, useRef } from 'react';
import { HeartIcon, ShieldCheckIcon, CalendarDaysIcon, WrenchScrewdriverIcon, FlagIcon, RocketLaunchIcon, UsersIcon, ClockIcon, ChatBubbleLeftRightIcon, WrenchIcon, MapPinIcon, PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';


// --- Datos del Equipo (Simulados) ---
const teamMembers = [
    {
        name: 'Juan Carranza',
        role: 'Fundador y Mecánico Jefe',
        bio: 'Con más de 20 años de experiencia, Juan fundó el taller con la visión de ofrecer un servicio honesto y de la más alta calidad.',
        imageUrl: 'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        name: 'Ana Sofía',
        role: 'Especialista en Electrónica',
        bio: 'Ana es nuestra experta en diagnósticos electrónicos y sistemas de inyección. No hay falla que se le resista.',
        imageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        name: 'Carlos Pérez',
        role: 'Mecánico y Atención al Cliente',
        bio: 'Carlos combina su pasión por la mecánica con un excelente trato al cliente, asegurando que cada visita sea una gran experiencia.',
        imageUrl: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
];

// --- Componente de Tarjeta de Miembro del Equipo ---
const TeamMemberCard = ({ member }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const rotateX = -1 * ((y - height / 2) / (height / 2)) * 12; // Max rotation 12deg
        const rotateY = ((x - width / 2) / (width / 2)) * 12;

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
            className="team-card relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
            style={{ transition: 'transform 0.2s' }}
        >
            <div className="team-card-spotlight absolute inset-0 pointer-events-none"></div>
            <div className="relative z-10 p-6 text-center" style={{ transform: 'translateZ(40px)' }}>
                <img className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-700 object-cover shadow-lg" src={member.imageUrl} alt={member.name} />
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-orange-400 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.bio}</p>
            </div>
        </div>
    );
};

// --- Componente de Hito en la Línea de Tiempo ---
const TimelineItem = ({ year, title, description, icon }) => (
    <div className="relative pl-8 sm:pl-32 py-6 group">
        <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:w-px before:bg-gray-700 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-orange-500 after:border-4 after:box-content after:border-gray-800 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
            <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-28 h-6 mb-3 sm:mb-0 text-orange-400 bg-gray-800 rounded-full">
                {icon}
                {year}
            </time>
            <div className="text-xl font-bold text-white">{title}</div>
        </div>
        <div className="text-gray-400 ml-0 sm:ml-36">{description}</div>
    </div>
);

// --- Componente para "Por qué elegirnos" ---
const FeatureItem = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                {icon}
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-gray-400">{description}</p>
        </div>
    </div>
);

// --- Datos para FAQ ---
const faqs = [
    {
        question: '¿Qué tipo de motocicletas reparan?',
        answer: 'Trabajamos con una amplia gama de marcas y modelos, desde motos de bajo cilindraje hasta superbikes de alto rendimiento. Nos especializamos en marcas japonesas y europeas, pero nuestro equipo tiene la experiencia para atender casi cualquier moto.',
    },
    {
        question: '¿Necesito agendar una cita para un servicio?',
        answer: 'Para mantenimientos preventivos y servicios programados, te recomendamos agendar una cita para asegurar un espacio y minimizar tu tiempo de espera. Para emergencias o diagnósticos rápidos, puedes acercarte y haremos lo posible por atenderte cuanto antes.',
    },
    {
        question: '¿Ofrecen garantía en sus reparaciones?',
        answer: '¡Sí! Confiamos plenamente en la calidad de nuestro trabajo. Todas nuestras reparaciones y servicios cuentan con una garantía de 30 días o 1,000 km, lo que ocurra primero. La garantía cubre la mano de obra y los repuestos instalados por nosotros.',
    },
    {
        question: '¿Puedo llevar mis propios repuestos?',
        answer: 'Sí, puedes traer tus propios repuestos. Sin embargo, en esos casos, nuestra garantía solo cubrirá la mano de obra del servicio realizado, no el repuesto en sí. Recomendamos usar los repuestos que ofrecemos para garantizar la compatibilidad y calidad.',
    },
];

// --- Componente para el Acordeón de FAQ ---
const FaqItem = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-700 py-6">
        <dt>
            <button onClick={onClick} className="flex w-full items-start justify-between text-left text-gray-300">
                <span className="text-base font-semibold text-white">{question}</span>
                <span className="ml-6 flex h-7 items-center">
                    {isOpen ? (
                        <MinusIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                        <PlusIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                </span>
            </button>
        </dt>
        {isOpen && (
            <dd className="mt-4 pr-12 animate-fadeIn">
                <p className="text-base leading-7 text-gray-400">{answer}</p>
            </dd>
        )}
    </div>
);

// --- Datos para la sección de Transformaciones ---
const transformationProjects = [
    {
        title: 'Restauración Clásica: Honda CB750',
        description: 'Devolvimos a la vida esta joya de los 70. Se realizó una reconstrucción completa del motor, un nuevo trabajo de pintura y se restauraron todos los cromados a su esplendor original.',
        beforeSrc: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        afterSrc: 'https://images.pexels.com/photos/2393821/pexels-photo-2393821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
        title: 'Reparación de Siniestro: Yamaha R6',
        description: 'Esta R6 llegó con daños significativos en el chasis y carenado. Nuestro equipo realizó una alineación precisa del chasis y una reconstrucción de la fibra de vidrio, dejándola lista para la pista de nuevo.',
        beforeSrc: 'https://images.pexels.com/photos/2167143/pexels-photo-2167143.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        afterSrc: 'https://images.pexels.com/photos/104842/bmw-vehicle-ride-bike-104842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
        title: 'Customización Scrambler: BMW R80',
        description: 'Transformamos una BMW R80 estándar en una Scrambler única. Se modificó el subchasis, se instaló un asiento a medida, llantas de tacos y un escape artesanal para un look agresivo y funcional.',
        beforeSrc: 'https://images.pexels.com/photos/1705097/pexels-photo-1705097.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        afterSrc: 'https://images.pexels.com/photos/257997/pexels-photo-257997.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
];

// --- Componente Interactivo Antes y Después ---
const BeforeAfterSlider = ({ beforeSrc, afterSrc }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const imageContainerRef = useRef(null);

    const handleMove = (clientX) => {
        if (!imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    };

    const handleInteractionStart = () => setIsDragging(true);
    const handleInteractionEnd = () => setIsDragging(false);

    const handleMouseMove = (e) => { if (isDragging) handleMove(e.clientX); };
    const handleTouchMove = (e) => { if (isDragging) handleMove(e.touches[0].clientX); };

    return (
        <div
            ref={imageContainerRef}
            className="relative w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden select-none cursor-ew-resize shadow-2xl"
            onMouseDown={handleInteractionStart} onMouseUp={handleInteractionEnd} onMouseMove={handleMouseMove} onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart} onTouchEnd={handleInteractionEnd} onTouchMove={handleTouchMove}
        >
            <img src={afterSrc} alt="Después" className="absolute inset-0 w-full h-full object-cover" draggable="false" />
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                <img src={beforeSrc} alt="Antes" className="absolute inset-0 w-full h-full object-cover" draggable="false" />
            </div>
            <div className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-sm" style={{ left: `calc(${sliderPosition}% - 2px)` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white rounded-full h-9 w-9 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
        </div>
    );
};

const NosotrosPage = () => {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

    const handleFaqClick = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handlePrevProject = () => {
        setCurrentProjectIndex(prev => (prev === 0 ? transformationProjects.length - 1 : prev - 1));
    };

    const handleNextProject = () => {
        setCurrentProjectIndex(prev => (prev === transformationProjects.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="bg-black text-white min-h-screen animate-radial-move overflow-x-hidden">
            {/* --- Sección Hero --- */}
            <section className="relative text-center py-20 sm:py-32 px-4 bg-gray-900/50">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4">Nuestra Pasión, Tu Moto</h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                        Más que un taller, somos una familia de entusiastas dedicados a cuidar y potenciar lo que más te apasiona.
                    </p>
                </div>
            </section>

            {/* --- Sección de Historia (Línea de Tiempo) --- */}
            <section className="container mx-auto px-4 sm:px-8 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Nuestra Trayectoria</h2>
                    <p className="text-gray-400">
                        Desde un pequeño sueño en 2012 hasta convertirnos en un referente de confianza y calidad para la comunidad motera.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <TimelineItem year="2012" title="Nace un Sueño" description="Con herramientas básicas y una pasión inmensa, abrimos nuestras puertas en un pequeño garaje, con el objetivo de ofrecer un servicio mecánico honesto y confiable." icon={<CalendarDaysIcon className="w-3 h-3 mr-1.5" />} />
                    <TimelineItem year="2015" title="Primera Expansión" description="Gracias a la confianza de nuestros clientes, nos mudamos a un local más grande, incorporando nuestro primer elevador y equipo de diagnóstico electrónico." icon={<CalendarDaysIcon className="w-3 h-3 mr-1.5" />} />
                    <TimelineItem year="2019" title="Especialización y Equipo" description="Ampliamos el equipo con especialistas en electrónica y motores de alto cilindraje, convirtiéndonos en un taller integral para todo tipo de motocicletas." icon={<CalendarDaysIcon className="w-3 h-3 mr-1.5" />} />
                    <TimelineItem year="Hoy" title="Mirando al Futuro" description="Seguimos comprometidos con la innovación, la formación continua y, sobre todo, con la satisfacción de cada cliente que nos confía su moto." icon={<CalendarDaysIcon className="w-3 h-3 mr-1.5" />} />
                </div>
            </section>

            {/* --- Sección de Misión y Visión --- */}
            <section className="bg-gray-900 py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Misión */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-4 mb-6"><div className="bg-blue-500 p-4 rounded-full"><FlagIcon className="h-8 w-8 text-white" /></div><h2 className="text-3xl sm:text-4xl font-bold text-white">Nuestra Misión</h2></div>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Ofrecer un servicio de diagnóstico, reparación y mantenimiento de motocicletas con los más altos estándares de calidad, utilizando tecnología de punta y un equipo de expertos apasionados, para garantizar la seguridad y satisfacción de nuestros clientes en cada kilómetro.
                            </p>
                        </div>
                        {/* Visión */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-4 mb-6"><div className="bg-purple-500 p-4 rounded-full"><RocketLaunchIcon className="h-8 w-8 text-white" /></div><h2 className="text-3xl sm:text-4xl font-bold text-white">Nuestra Visión</h2></div>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Ser el taller de motocicletas líder y de mayor confianza en la región, reconocidos por nuestra innovación, integridad y por construir una comunidad sólida de moteros que comparten nuestra pasión por la libertad sobre dos ruedas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Sección de Valores --- */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">Lo Que Nos Mueve</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center"><div className="bg-orange-500 p-4 rounded-full mb-4"><HeartIcon className="h-8 w-8 text-white" /></div><h3 className="text-2xl font-bold text-white mb-2">Pasión</h3><p className="text-gray-400 max-w-xs">Amamos las motocicletas tanto como tú. Cada moto que entra a nuestro taller es tratada como si fuera nuestra.</p></div>
                        <div className="flex flex-col items-center"><div className="bg-blue-500 p-4 rounded-full mb-4"><WrenchScrewdriverIcon className="h-8 w-8 text-white" /></div><h3 className="text-2xl font-bold text-white mb-2">Calidad</h3><p className="text-gray-400 max-w-xs">Utilizamos solo repuestos de la mejor calidad y las herramientas más avanzadas para garantizar un trabajo impecable.</p></div>
                        <div className="flex flex-col items-center"><div className="bg-green-500 p-4 rounded-full mb-4"><ShieldCheckIcon className="h-8 w-8 text-white" /></div><h3 className="text-2xl font-bold text-white mb-2">Confianza</h3><p className="text-gray-400 max-w-xs">La honestidad es nuestro pilar. Te explicamos cada proceso y te ofrecemos precios justos, sin sorpresas.</p></div>
                    </div>
                </div>
            </section>

            {/* --- Sección Por Qué Elegirnos --- */}
            <section className="container mx-auto px-4 sm:px-8 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Por Qué Elegirnos?</h2>
                    <p className="text-gray-400">
                        Tu moto merece el mejor cuidado. Aquí te damos algunas razones para confiarnos tu compañera de dos ruedas.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 max-w-6xl mx-auto">
                    <FeatureItem 
                        icon={<UsersIcon className="h-6 w-6" />} 
                        title="Técnicos Certificados" 
                        description="Nuestro equipo está en constante capacitación y cuenta con certificaciones de las principales marcas del mercado." 
                    />
                    <FeatureItem 
                        icon={<ClockIcon className="h-6 w-6" />} 
                        title="Tiempos de Entrega Reales" 
                        description="Valoramos tu tiempo. Te damos diagnósticos precisos y cumplimos con los plazos de entrega acordados." 
                    />
                    <FeatureItem 
                        icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />} 
                        title="Comunicación Transparente" 
                        description="Te mantenemos informado durante todo el proceso. No realizamos ningún trabajo sin tu previa autorización." 
                    />
                    <FeatureItem 
                        icon={<WrenchIcon className="h-6 w-6" />} 
                        title="Herramientas de Vanguardia" 
                        description="Invertimos en la mejor tecnología y herramientas especializadas para ofrecer un servicio preciso y eficiente." 
                    />
                    <FeatureItem 
                        icon={<ShieldCheckIcon className="h-6 w-6" />} 
                        title="Garantía en Todos los Trabajos" 
                        description="Confiamos tanto en nuestro trabajo que todos nuestros servicios y reparaciones cuentan con garantía." 
                    />
                    <FeatureItem 
                        icon={<MapPinIcon className="h-6 w-6" />} 
                        title="Ubicación Conveniente" 
                        description="Encuéntranos fácilmente en una zona céntrica de la ciudad, con fácil acceso y parqueadero para tu comodidad." 
                    />
                </div>
            </section>

            {/* --- Sección de Transformaciones (Antes y Después) --- */}
            <section className="bg-gray-900 py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Transformaciones: Antes y Después</h2>
                        <p className="text-gray-400">
                            Una imagen vale más que mil palabras. Desliza para ver la magia de nuestro trabajo.
                        </p>
                    </div>
                    <div className="relative">
                        <BeforeAfterSlider 
                            beforeSrc={transformationProjects[currentProjectIndex].beforeSrc}
                            afterSrc={transformationProjects[currentProjectIndex].afterSrc}
                        />
                        <button onClick={handlePrevProject} className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-8 bg-black/50 p-2 rounded-full text-white hover:bg-orange-500 transition-all z-10"><ChevronLeftIcon className="h-8 w-8" /></button>
                        <button onClick={handleNextProject} className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-8 bg-black/50 p-2 rounded-full text-white hover:bg-orange-500 transition-all z-10"><ChevronRightIcon className="h-8 w-8" /></button>
                    </div>
                    <div className="text-center mt-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-orange-400 mb-2">{transformationProjects[currentProjectIndex].title}</h3>
                        <p className="text-gray-300">{transformationProjects[currentProjectIndex].description}</p>
                    </div>
                </div>
            </section>

            {/* --- Sección del Equipo --- */}
            <section className="container mx-auto px-4 sm:px-8 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto text-center mb-16"><h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Conoce al Equipo</h2><p className="text-gray-400">Las manos y mentes expertas que cuidan de tu moto.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto" style={{ perspective: '2000px' }}>
                    {teamMembers.map((member, index) => (<TeamMemberCard key={index} member={member} />))}
                </div>
            </section>

            {/* --- Sección de Preguntas Frecuentes (FAQ) --- */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
                        <p className="text-gray-400">
                            Resolvemos algunas de las dudas más comunes de nuestros clientes.
                        </p>
                    </div>
                    <div className="mx-auto max-w-4xl">
                        <dl className="space-y-4">
                            {faqs.map((faq, index) => (
                                <FaqItem key={index} question={faq.question} answer={faq.answer} isOpen={openFaqIndex === index} onClick={() => handleFaqClick(index)} />
                            ))}
                        </dl>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NosotrosPage;