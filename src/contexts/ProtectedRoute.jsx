// src/components/contexts/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Este componente envuelve las rutas que requieren autenticación.
 * Si el usuario no está logueado, lo redirige a /login.
 * Si está logueado, renderiza la ruta hija correspondiente a través de <Outlet />.
 */
const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();

    // Si no está autenticado, redirige. 'replace' evita que el usuario pueda volver a la página anterior con el botón de atrás.
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

