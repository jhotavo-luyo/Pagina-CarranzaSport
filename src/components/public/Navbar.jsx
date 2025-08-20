// src/components/public/Navbar.jsx
// --- Importaciones de React y Librerías ---
import React, { useState, useEffect } from 'react'; // Importamos los hooks de React para manejar el estado y los efectos secundarios.
import { Link, NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'; // Importamos los iconos para el menú de hamburguesa.

// --- Definición del Componente Funcional Navbar ---
const Navbar = () => {
    // --- Estado ---
    // 'isMenuOpen' es un estado booleano que controla si el menú móvil está visible o no.
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- Lógica de Estilos ---
    // Clases base para todos los enlaces de navegación.
    const navLinkClasses = "hover:text-orange-400 transition-colors duration-300";
    // Clases que se aplican SOLO al enlace de la página activa.
    const activeNavLinkClasses = "text-orange-500 underline underline-offset-4 decoration-orange-500";

    // Función que NavLink utiliza para determinar qué clases aplicar.
    // Recibe un objeto con la propiedad 'isActive' (booleano) de react-router-dom.
    const getNavLinkClass = ({ isActive }) => {
        return `${navLinkClasses} ${isActive ? activeNavLinkClasses : 'text-white'}`;
    };

    // --- Efecto Secundario (Side Effect) ---
    // Este 'useEffect' se ejecuta cada vez que el estado 'isMenuOpen' cambia.
    // Su propósito es mejorar la experiencia de usuario en móviles.
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'; // Bloquea el scroll de la página de fondo cuando el menú está abierto.
        } else {
            document.body.style.overflow = 'unset'; // Restaura el scroll cuando el menú se cierra.
        }
        return () => {
            document.body.style.overflow = 'unset'; // Función de limpieza: se asegura de restaurar el scroll si el componente se desmonta.
        };
    }, [isMenuOpen]);

    return (
        // --- Estructura JSX del Componente ---
        <nav className="fixed w-full bg-linear-to-t from-[#00000022] to-[#030303f4] backdrop-filter backdrop-blur-sm shadow-xl shadow-[#00000022] top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-orange-500">CarranzaSport</Link>

                    {/* Menú para Escritorio (Desktop) */}
                    {/* 'hidden md:flex': Oculto por defecto, se muestra como flexbox en pantallas medianas (md) y superiores. */}
                    <div className="hidden md:flex items-center space-x-4 text-lg">
                        <NavLink to="/" className={getNavLinkClass}>Inicio</NavLink>
                        <NavLink to="/public/nosotros" className={getNavLinkClass}>Nosotros</NavLink>
                        <NavLink to="/public/promociones" className={getNavLinkClass}>Promociones</NavLink>
                        <NavLink to="/public/repuestos" className={getNavLinkClass}>Repuestos</NavLink>
                        <NavLink to="/public/servicios" className={getNavLinkClass}>Servicios</NavLink>
                        
                        {/* Botón animado para "Iniciar sesión" */}
                        <div className="relative group ml-8">
                            <div className="relative w-44 h-12 m-auto opacity-90 overflow-hidden rounded-xl bg-black z-10">
                                <div className="absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transition-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12"></div>
                                <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-[#000000]">
                                    <Link to="/login" className="input font-semibold text-lg h-full opacity-90 w-full px-6 py-2 rounded-xl bg-[#00000066] flex items-center justify-center">
                                        Iniciar sesión
                                    </Link>
                                </div>
                                <div className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-blue-500 to-orange-500 blur-[30px]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Botón del Menú Móvil (Hamburguesa) */}
                    {/* 'md:hidden': Se muestra solo en pantallas más pequeñas que medianas (md). */}
                    <div className="md:hidden flex items-center">
                        <button
                            // Al hacer clic, se invierte el valor del estado 'isMenuOpen'.
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white focus:outline-none z-50"
                            // Atributos de accesibilidad para lectores de pantalla.
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            {/* Texto solo para lectores de pantalla. */}
                            <span className="sr-only">Abrir menú principal</span>
                            {/* Renderizado condicional: muestra el icono de 'X' si el menú está abierto, o el de hamburguesa si está cerrado. */}
                            {isMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú Desplegable para Móvil */}
            {/* 'md:hidden': Oculto en pantallas medianas y superiores. */}
            {/* Clases condicionales para la animación de despliegue: */}
            {/* Si 'isMenuOpen' es true, se aplican clases para mostrarlo; si es false, para ocultarlo. */}
            <div id="mobile-menu" className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="bg-[#030303f4] backdrop-filter backdrop-blur-sm px-2 pt-2 pb-4 space-y-2 flex flex-col items-center">
                    {/* Cada NavLink, al ser presionado, cierra el menú para mejorar la navegación. */}
                    <NavLink to="/" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>Inicio</NavLink>
                    <NavLink to="/public/nosotros" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>Nosotros</NavLink>
                    <NavLink to="/public/promociones" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>Promociones</NavLink>
                    <NavLink to="/public/repuestos" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>Repuestos</NavLink>
                    <NavLink to="/public/servicios" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>Servicios</NavLink>
                    <div className="mt-4">
                        {/* Botón de Iniciar Sesión para el menú móvil. */}
                        <Link to="/login" className="bg-orange-500 text-white text-lg font-bold py-2 px-8 rounded-[30px] shadow-md hover:bg-orange-700 transition duration-300 transform hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
