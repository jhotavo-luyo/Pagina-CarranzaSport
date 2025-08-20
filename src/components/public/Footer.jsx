// src/components/public/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-400 py-6 text-center">
            <p>&copy; {new Date().getFullYear()} Motosport Carranza. Todos los derechos reservados.</p>
        </footer>
    );
};

export default Footer;

