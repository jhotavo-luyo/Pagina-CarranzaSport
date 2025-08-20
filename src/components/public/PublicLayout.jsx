// src/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../public/Navbar';
import Footer from '../public/Footer';

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-200 text-white">
            <Navbar />
            <main className="flex-grow container min-w-full bg-Grey-500">
                <Outlet /> {/* Aquí se renderizarán las páginas públicas */}
            </main>
            <Footer/>
        </div>
    );
};

export default PublicLayout;

