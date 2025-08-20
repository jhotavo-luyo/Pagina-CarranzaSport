// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importamos la librería para decodificar

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Crear el Proveedor del Contexto (AuthProvider)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // El estado del usuario contendrá el payload decodificado del token

    // Efecto para inicializar el estado desde localStorage al cargar la app
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // Verificamos si el token ha expirado
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser); // decodedUser contiene { id_usuario, rol, iat, exp }
                } else {
                    // Si el token está expirado, lo limpiamos
                    localStorage.removeItem('jwt_token');
                    setUser(null);
                }
            } catch (error) {
                console.error("Error decodificando el token:", error);
                localStorage.removeItem('jwt_token');
                setUser(null);
            }
        }
    }, []); // Se ejecuta solo una vez, al montar el componente

    // Función de login: ahora solo necesita el token.
    const login = (token) => {
        localStorage.setItem('jwt_token', token);
        try {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
        } catch (error) {
            console.error("Error decodificando el token en login:", error);
            setUser(null);
        }
    };

    // Función de logout: centraliza la limpieza de localStorage y la actualización del estado
    const logout = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
    };

    // El valor que proveeremos a los componentes hijos.
    // `isLoggedIn` se deriva directamente de la existencia del objeto `user`.
    const value = { user, isLoggedIn: !!user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Crear un hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
