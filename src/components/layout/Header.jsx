// src/components/layout/Header.jsx

import React from 'react';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = ({ onLogout, toggleSidebar, isSidebarOpen }) => {

    return (
        <header className=" sticky top-0 w-full bg-gradient-to-r from-[#0000004b] shadow-[#0000004b] to-orange-500 text-white shadow-lg h-16 flex items-center justify-between px-4 z-50">
            {/* Lado Izquierdo: Icono de menú */}
            <div className="flex items-center gap-4">
                {/* Botón de hamburguesa para móvil, solo se muestra si el sidebar está cerrado */}
                {!isSidebarOpen && (
                    <button onClick={toggleSidebar} className="text-white md:hidden p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Abrir menú">
                        <Bars3Icon className="h-6 w-6 " />
                    </button>
                )}
            </div>
            {/* Lado Derecho: Botón de Cerrar Sesión */}
            <div className="flex items-center">
                <button
                    onClick={onLogout}
                    className="flex items-center p-2 rounded-md hover:bg-white/20 transition-colors"
                    aria-label="Cerrar sesión"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    <span className="ml-2 hidden sm:inline">Cerrar Sesión</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
