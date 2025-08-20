// src/pages/auth/LoginPage.jsx
// Este componente maneja la interfaz de inicio de sesión, ahora con integración de API.
import React, { useState } from 'react';
import { loginUser } from '../../api/newsApi'; // Importa la función de login

const LoginPage = ({ onLoginSuccess }) => {
    const [identificador, setIdentificador] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Estado para manejar errores de login
    const [loading, setLoading] = useState(false); // Estado para indicar si está cargando

    // Manejador del envío del formulario.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Limpia errores anteriores
        setLoading(true); // Inicia el estado de carga

        try {
            // Llama a la función de login de la API
            const data = await loginUser(identificador, password);

            // Llama a la función del padre (en App.jsx) y le pasa el token.
            onLoginSuccess(data.token); 
        } catch (err) {
            setError(err.message || 'Error en el login. Verifica tus credenciales.');
            console.error('Error en el login:', err);
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen  px-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-transform duration-300 hover:scale-105">
                <h2 className="text-4xl font-bold text-center text-primary mb-8">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="identificador" className="block text-gray-700 text-lg font-semibold mb-2">
                            Usuario o Correo Electrónico
                        </label>
                        <input
                            type="text" // Puede ser text para nombre de usuario o email
                            id="identificador"
                            name="identificador"
                            placeholder="tu.usuario o tu.correo@ejemplo.com"
                            value={identificador}
                            onChange={(e) => setIdentificador(e.target.value)}
                            required
                            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-lg font-semibold mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800"
                            disabled={loading}
                        />
                    </div>

                    {error && ( // Muestra el mensaje de error si existe
                        <div className="bg-red-500 text-white p-3 rounded-md text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white text-xl font-bold py-3 rounded-lg shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
                        disabled={loading} // Deshabilita el botón mientras carga
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                    <p className="text-center text-gray-600 text-sm mt-4">
                        ¿Olvidaste tu contraseña? <a href="#" className="text-orange-500 hover:underline">Recuperar</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;