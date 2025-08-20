// src/components/layout/ProtectedLayout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Este componente actúa como una plantilla para todas las rutas protegidas.
 * Renderiza el Header, el Sidebar y el contenido de la página actual a través del componente <Outlet>.
 * También gestiona el estado y la lógica del sidebar (colapsado/expandido).
 */
const ProtectedLayout = ({ onLogout }) => {
    // Estado para controlar la visibilidad/colapso del sidebar
    // Se inicializa en false para que en desktop aparezca colapsado por defecto (solo iconos).
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Efecto para ajustar el estado del sidebar al cargar o redimensionar la ventana
    useEffect(() => {
        const handleResize = () => {
            // Al redimensionar la ventana, siempre colapsamos/cerramos el sidebar
            // para evitar estados inconsistentes. El usuario lo reabrirá con hover (desktop) o el botón (móvil).
            setIsSidebarOpen(false);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Ejecutar al montar para establecer el estado inicial correcto

        return () => window.removeEventListener('resize', handleResize);
    }, []); // Dependencia vacía para que se ejecute solo una vez al montar

    // Función para alternar la visibilidad del sidebar (usada solo por el botón de hamburguesa en móvil)
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Manejador para cuando el ratón entra en el área del Sidebar en desktop
    const handleSidebarMouseEnter = () => {
        if (window.innerWidth >= 768) { // Solo en desktop
            setIsSidebarOpen(true); // Expande el sidebar
        }
    };

    // Manejador para cuando el ratón entra en el área del contenido principal en desktop
    const handleMainContentMouseEnter = () => {
        if (window.innerWidth >= 768) { // Solo en desktop
            setIsSidebarOpen(false); // Colapsa el sidebar
        }
    };

    // Calcula el margen dinámico para el contenido principal en desktop
    const mainContentMarginClass = isSidebarOpen ? 'md:ml-64' : 'md:ml-20';

    return (
        <div className="flex flex-col min-h-screen bg-neutral-950 bg-[url(/fondo.jpg)] bg-center bg-cover bg-no-repeat bg-gradient-to-r from-gray-900 to-[#013] bg-g font-inter">
            <Header onLogout={onLogout} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <div className="flex flex-1 pt-4 pb-4 px-1 gap-4 sm:px-4">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={toggleSidebar}
                    onMouseEnter={handleSidebarMouseEnter}
                />
                <main
                    className={`flex-1 p-0 overflow-y-auto rounded-lg transition-all duration-300 ease-in-out ${mainContentMarginClass}`}
                    onMouseEnter={handleMainContentMouseEnter}
                >
                    <Outlet /> {/* ¡Aquí se renderizará la página actual! */}
                </main>
            </div>
        </div>
    );
};

export default ProtectedLayout;
