// src/App.jsx
// Refactorizado para usar AuthContext. La lógica de autenticación ahora está centralizada.

import React, { Suspense, lazy } from 'react'; // Importamos Suspense y lazy
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importa las páginas desde sus ubicaciones estructuradas
import LoginPage from './pages/auth/LoginPage';
const HomePage = lazy(() => import('./pages/public/HomePage'));
const PromocionesPage = lazy(() => import('./pages/public/PromocionesPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const NewsListPage = lazy(() => import('./pages/admin/news/NewsListPage'));
const ServicesListPage = lazy(() => import('./pages/admin/ServicesListPage'));
const RepuestosListPage = lazy(() => import('./pages/admin/RepuestosListPage'));
const UsuariosListPage = lazy(() => import('./pages/admin/UsuariosListPage'));
const ClientesListPage = lazy(() => import('./pages/admin/ClientesListPage'));
const PromocionesListPage = lazy(() => import('./pages/admin/PromocionesListPage'));
const TestimoniosListPage = lazy(() => import('./pages/admin/TestimoniosListPage'));
const GaleriasListPage = lazy(() => import('./pages/admin/GaleriasListPage'));
const SolicitudesListPage = lazy(() => import('./pages/admin/SolicitudesListPage'));
const RepuestosPage = lazy(() => import('./pages/public/RepuestosPage'));
const ServiciosPage = lazy(() => import('./pages/public/ServiciosPage'));
const NosostrosPage = lazy(() => import('./pages/public/NosotrosPage'));


// Importamos el componente de Layout para las rutas protegidas
import ProtectedLayout from './components/layout/ProtectedLayout';
import PublicLayout from './components/public/PublicLayout';
import ProtectedRoute from './contexts/ProtectedRoute';
import NotFoundPage from './pages/public/NotFoundPage';
// Importamos nuestro hook de autenticación
import { useAuth } from './contexts/AuthContext';

function App() {
    // Obtenemos el estado y las funciones del contexto
    const { isLoggedIn, login, logout } = useAuth();
    const navigate = useNavigate();

    const handleLoginSuccess = (token) => {
        login(token); // El contexto se encarga de todo el estado
        navigate('/dashboard'); // App.jsx se encarga de la navegación
    };

    const handleLogout = () => {
        logout(); // El contexto se encarga de todo
        navigate('/'); // Navega a la página de inicio/login
    };

    return (
        <>
            {/* Suspense mostrará un fallback mientras se carga el código de la página */}
            <Suspense fallback={<div className="flex justify-center items-center h-screen bg-gray-900 text-white">Cargando...</div>}>
                <Routes>
                    {/* --- Rutas Públicas (envueltas en el PublicLayout) --- */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/public/servicios" element={<ServiciosPage/>} />
                        <Route path="/public/repuestos" element={<RepuestosPage/>} />
                        <Route path="/public/promociones" element={<PromocionesPage />} />
                        <Route path="/public/nosotros" element={<NosostrosPage/>} />

                    </Route>

                    {/* --- Ruta de Autenticación (fuera de los layouts) --- */}
                    <Route path="/login" element={!isLoggedIn ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />

                    {/* --- Rutas Protegidas (envueltas en ProtectedRoute y ProtectedLayout) --- */}
                    {/* Rutas para todos los usuarios logueados */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<ProtectedLayout onLogout={handleLogout} />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/noticias" element={<NewsListPage />} />
                            <Route path="/servicios" element={<ServicesListPage />} />
                            <Route path="/repuestos" element={<RepuestosListPage />} />
                            <Route path="/clientes" element={<ClientesListPage />} />
                            <Route path="/promociones" element={<PromocionesListPage />} />
                            <Route path="/testimonios" element={<TestimoniosListPage />} />
                            <Route path="/galerias" element={<GaleriasListPage />} />
                            <Route path="/solicitudes" element={<SolicitudesListPage />} />
                        </Route>
                    </Route>

                    {/* Rutas solo para administradores */}
                    <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
                        <Route element={<ProtectedLayout onLogout={handleLogout} />}>
                            <Route path="/usuarios" element={<UsuariosListPage />} />
                        </Route>
                    </Route>

                    {/* --- Ruta para página no encontrada (atrapa todo lo demás) --- */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        </>
    );
}

export default App;
