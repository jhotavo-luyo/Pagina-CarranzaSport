// src/components/public/TestimonialCarousel.jsx
import React, { useState, useEffect } from 'react';
import { getPublicTestimonios } from '../../api/testimoniosApi';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';

// --- Componente para una sola estrella ---
const Star = ({ filled }) => (
    <StarIcon className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-600'}`} />
);

// --- Componente para la calificación con estrellas ---
const Rating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="flex justify-center">
            {[...Array(totalStars)].map((_, index) => (
                <Star key={index} filled={index < rating} />
            ))}
        </div>
    );
};

// --- Componente para la tarjeta de testimonio ---
const TestimonialCard = ({ testimonio, position, total }) => {
    const getCardStyle = () => {
        const isCenter = position === 0;
        const isOffScreen = Math.abs(position) > 2;

        if (isOffScreen) {
            return {
                transform: `translateX(${position > 0 ? 100 : -100}%) scale(0.7)`,
                opacity: 0,
                zIndex: total - Math.abs(position),
            };
        }

        return {
            transform: `translateX(${position * 30}%) scale(${1 - Math.abs(position) * 0.15})`,
            opacity: isCenter ? 1 : 0.4,
            zIndex: total - Math.abs(position),
        };
    };

    return (
        <div
            className="absolute w-full h-full p-8 transition-all duration-500 ease-in-out"
            style={getCardStyle()}
        >
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full flex flex-col justify-center items-center text-center shadow-2xl overflow-hidden">
                <p className="text-gray-300 italic mb-4 text-lg line-clamp-4">"{testimonio.comentario}"</p>
                <div className="mt-auto pt-4">
                    <Rating rating={testimonio.calificacion} />
                    <h4 className="text-white font-bold mt-3 text-xl">{testimonio.nombre_cliente}</h4>
                </div>
            </div>
        </div>
    );
};

// --- Componente Skeleton para el carrusel ---
const TestimonialSkeleton = () => (
    <div className="w-full max-w-2xl h-80 mx-auto relative flex items-center justify-center">
        <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-8 h-full w-full flex flex-col justify-center items-center text-center shadow-2xl animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="flex mt-auto pt-4">
                <div className="h-5 w-5 bg-gray-700 rounded-full mr-1"></div>
                <div className="h-5 w-5 bg-gray-700 rounded-full mr-1"></div>
                <div className="h-5 w-5 bg-gray-700 rounded-full mr-1"></div>
                <div className="h-5 w-5 bg-gray-700 rounded-full mr-1"></div>
                <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded w-1/3 mt-3"></div>
        </div>
    </div>
);


// --- Componente principal del carrusel ---
const TestimonialCarousel = () => {
    const [testimonios, setTestimonios] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestimonios = async () => {
            try {
                setLoading(true);
                const data = await getPublicTestimonios(7); // Pedimos 7 para tener un buen efecto de carrusel
                setTestimonios(data || []);
            } catch (err) {
                setError('No se pudieron cargar los testimonios.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonios();
    }, []);

    const nextTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonios.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonios.length) % testimonios.length);
    };

    if (loading) return <TestimonialSkeleton />;
    if (error) return <div className="text-center text-red-400 h-80 flex items-center justify-center">{error}</div>;
    if (testimonios.length === 0) return <div className="text-center text-gray-500 h-80 flex items-center justify-center">Aún no hay testimonios para mostrar.</div>;

    return (
        <div className="w-full flex items-center mb-30 justify-center gap-2 sm:gap-4 ">
            <button onClick={prevTestimonial} className="p-2 rounded-full bg-gray-800/50 hover:bg-orange-500/50 text-white transition-colors z-50" aria-label="Testimonio anterior">
                <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <div className="w-full max-w-md h-80 mx-auto relative" style={{ perspective: '1000px' }}>
                {testimonios.map((testimonio, index) => {
                    let position = index - currentIndex;
                    if (position > testimonios.length / 2) position -= testimonios.length;
                    else if (position < -testimonios.length / 2) position += testimonios.length;
                    
                    return (
                        <TestimonialCard key={testimonio.id_testimonio} testimonio={testimonio} position={position} total={testimonios.length} />
                    );
                })}
            </div>

            <button onClick={nextTestimonial} className="p-2 rounded-full bg-gray-800/50 hover:bg-orange-500/50 text-white transition-colors z-50" aria-label="Siguiente testimonio">
                <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
        </div>
    );
};

export default TestimonialCarousel;

