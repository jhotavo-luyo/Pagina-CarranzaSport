// src/pages/public/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="text-9xl font-bold text-orange-500">404</h1>
            <h2 className="text-4xl font-semibold mt-4 mb-2">Página No Encontrada</h2>
            <p className="text-lg text-gray-300 mb-8">
                Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <Link to="/" className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-orange-600 transition duration-300">
                Volver al Inicio
            </Link>
        </div>
    );
};

export default NotFoundPage;
