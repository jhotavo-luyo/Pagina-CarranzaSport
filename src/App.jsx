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
// ```
// Este documento representa el componente principal de la aplicación React. Se encarga de gestionar el estado global de autenticación, la navegación entre las diferentes páginas (tanto públicas como del panel de administración), y el layout general. Ha sido modificado para implementar un comportamiento de sidebar en escritorio donde se expande al pasar el ratón *sobre el sidebar mismo* y se colapsa al retirarlo (al entrar en el área del contenido principal), mientras mantiene el menú de hamburguesa en dispositivos móvil











// // src/App.jsx
// // Este es el componente principal de tu aplicación.
// // Ahora gestiona la autenticación real basada en localStorage y un sidebar con comportamiento de hover en escritorio.

// import React, { useState, useEffect } from 'react';
// import Header from './components/layout/Header';
// import Sidebar from './components/layout/Sidebar';

// // Importa las páginas desde sus ubicaciones estructuradas
// import LoginPage from './pages/auth/LoginPage';
// import HomePage from './pages/public/HomePage';
// import DashboardPage from './pages/admin/DashboardPage';
// import NewsListPage from './pages/admin/news/NewsListPage';
// import ServicesListPage from './pages/admin/ServicesListPage';
// import RepuestosListPage from './pages/admin/RepuestosListPage';
// import UsuariosListPage from './pages/admin/UsuariosListPage';
// import ClientesListPage from './pages/admin/ClientesListPage';
// import PromocionesListPage from './pages/admin/PromocionesListPage';
// import TestimoniosListPage from './pages/admin/TestimoniosListPage';
// import GaleriasListPage from './pages/admin/GaleriasListPage';
// import SolicitudesListPage from './pages/admin/SolicitudesListPage';

// import PagePlaceholder from './pages/PagePlaceholder';
// import { logoutUser } from './api/newsApi'; // Reutilizamos logoutUser de newsApi

// function App() {
//     // Estado de autenticación inicializado directamente desde localStorage
//     const [isLoggedIn, setIsLoggedIn] = useState(() => {
//         return !!localStorage.getItem('jwt_token');
//     });

//     // Estado de la página actual, dependiente del estado de autenticación
//     const [currentPage, setCurrentPage] = useState(isLoggedIn ? 'dashboard' : 'home');

//     // Estado para controlar la visibilidad/colapso del sidebar
//     // Se inicializa en false para que en desktop aparezca colapsado por defecto (solo iconos).
//     // En móvil, el useEffect lo manejará para que inicie cerrado.
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     // Efecto para redirigir a login si no está autenticado y no está en home/login
//     useEffect(() => {
//         if (!isLoggedIn && currentPage !== 'home' && currentPage !== 'login') {
//             setCurrentPage('login');
//         }
//     }, [isLoggedIn, currentPage]);

//     // Efecto para ajustar el estado del sidebar al cargar o redimensionar la ventana
//     useEffect(() => {
//         const handleResize = () => {
//             // Si el ancho de la ventana es menor que el breakpoint 'md' (768px)
//             if (window.innerWidth < 768) {
//                 // En móvil, siempre asegúrate de que el sidebar esté cerrado (oculto)
//                 setIsSidebarOpen(false);
//             } else {
//                 // En desktop, el sidebar debe estar colapsado por defecto (solo iconos)
//                 // El hover lo expandirá.
//                 setIsSidebarOpen(false);
//             }
//         };

//         window.addEventListener('resize', handleResize);
//         handleResize(); // Ejecutar al montar para establecer el estado inicial correcto

//         return () => window.removeEventListener('resize', handleResize);
//     }, []); // Dependencia vacía para que se ejecute solo una vez al montar y en cada resize

//     const handleLoginSuccess = () => {
//         setIsLoggedIn(true);
//         setCurrentPage('dashboard');
//         // Al iniciar sesión, en desktop, el sidebar debe estar colapsado por defecto.
//         if (window.innerWidth >= 768) {
//             setIsSidebarOpen(false); // Colapsa el sidebar en desktop al iniciar sesión
//         }
//     };

//     const handleLogout = () => {
//         logoutUser(); // Llama a la función de logout que limpia el token
//         setIsLoggedIn(false);
//         setCurrentPage('home');
//         setIsSidebarOpen(false); // Cierra el sidebar al cerrar sesión
//     };

//     const handleNavigate = (page) => {
//         setCurrentPage(page);
//         // En móviles, cierra el sidebar al navegar.
//         if (window.innerWidth < 768) {
//             setIsSidebarOpen(false);
//         }
//         // En desktop, el sidebar se mantiene en su estado de hover (colapsado/expandido)
//     };

//     // Función para alternar la visibilidad del sidebar (usada solo por el botón de hamburguesa en móvil)
//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     // Manejador para cuando el ratón entra en el área del sidebar en desktop
//     const handleMouseEnterSidebarArea = () => {
//         if (window.innerWidth >= 768) { // Solo en desktop
//             setIsSidebarOpen(true); // Expande el sidebar
//         }
//     };

//     // Manejador para cuando el ratón sale del área del sidebar en desktop
//     const handleMouseLeaveSidebarArea = () => {
//         if (window.innerWidth >= 768) { // Solo en desktop
//             setIsSidebarOpen(false); // Colapsa el sidebar
//         }
//     };

//     // Calcula el margen dinámico para el contenido principal en desktop
//     // Si el sidebar está abierto (expandido), el margen es 64px. Si está cerrado (colapsado), el margen es 20px.
//     const mainContentMarginClass = isSidebarOpen ? 'md:ml-64' : 'md:ml-20';

//     return (
//         <div className="flex flex-col min-h-screen bg-gray-900 font-inter">
//             {/* Si no está logueado, muestra solo la página de login */}
//             {!isLoggedIn ? (
//                 <LoginPage onLoginSuccess={handleLoginSuccess} />
//             ) : (
//                 <>
//                     {/* Header: Pasa la función para alternar el sidebar (solo para móvil) */}
//                     <Header onNavigate={handleNavigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} toggleSidebar={toggleSidebar} />

//                     {/* Contenedor principal del layout, ahora con eventos de hover para el sidebar en desktop */}
//                     <div
//                         className="flex flex-1 pt-4 pb-4 px-4 gap-4"
//                         onMouseEnter={handleMouseEnterSidebarArea} // Expande al pasar el ratón
//                         onMouseLeave={handleMouseLeaveSidebarArea} // Colapsa al salir el ratón
//                     >
//                         {/* Sidebar: Pasa el estado de apertura/colapso y la función para alternar (usada por el overlay en móvil) */}
//                         <Sidebar onNavigate={handleNavigate} isOpen={isSidebarOpen} onClose={toggleSidebar} />

//                         {/* Área principal de contenido */}
//                         <main className={`flex-1 p-0 overflow-y-auto rounded-lg transition-all duration-300 ease-in-out ${mainContentMarginClass}`}>
//                             {(() => {
//                                 switch (currentPage) {
//                                     case 'home':
//                                         return <HomePage />;
//                                     case 'dashboard':
//                                         return <DashboardPage onNavigate={handleNavigate} />;
//                                     case 'noticias':
//                                         return <NewsListPage onNavigate={handleNavigate} />;
//                                     case 'servicios':
//                                         return <ServicesListPage onNavigate={handleNavigate} />;
//                                     case 'repuestos':
//                                         return <RepuestosListPage onNavigate={handleNavigate} />;
//                                     case 'usuarios':
//                                         return <UsuariosListPage onNavigate={handleNavigate} />;
//                                     case 'clientes':
//                                         return <ClientesListPage onNavigate={handleNavigate} />;
//                                     case 'promociones':
//                                         return <PromocionesListPage onNavigate={handleNavigate} />;
//                                     case 'testimonios':
//                                         return <TestimoniosListPage onNavigate={handleNavigate} />;
//                                     case 'galerias':
//                                         return <GaleriasListPage onNavigate={handleNavigate} />;
//                                     case 'solicitudes':
//                                         return <SolicitudesListPage onNavigate={handleNavigate} />;
//                                     case 'contacto':
//                                         return <PagePlaceholder title="Contacto" />;
//                                     case 'acerca':
//                                         return <PagePlaceholder title="Acerca de" />;
//                                     case 'login':
//                                         return (
//                                             <div className="p-8 bg-white rounded-lg shadow-md animate-fadeIn">
//                                                 <h2 className="text-2xl font-bold text-gray-800">Ya has iniciado sesión.</h2>
//                                                 <p className="text-gray-600 mt-2">Puedes navegar por el menú lateral.</p>
//                                             </div>
//                                         );
//                                     default:
//                                         return (
//                                             <div className="p-8 bg-white rounded-lg shadow-md animate-fadeIn">
//                                                 <h2 className="text-2xl font-bold text-gray-800">Página no encontrada</h2>
//                                                 <p className="text-gray-600 mt-2">La URL a la que intentaste acceder no existe.</p>
//                                             </div>
//                                         );
//                                 }
//                             })()}
//                         </main>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default App;

// // sEste documento representa el componente principal de la aplicación React. Se encarga de gestionar el estado global de autenticación, la navegación entre las diferentes páginas (tanto públicas como del panel de administración), y el layout general. Ha sido modificado para implementar un comportamiento de sidebar en escritorio donde se expande al pasar el ratón sobre el área izquierda y se colapsa al retirarlo, mientras mantiene el menú de hamburguesa en dispositivos móvil




// arriba listo





// // src/App.jsx
// // Este es el componente principal de tu aplicación.
// // Ahora gestiona la autenticación real basada en localStorage y un sidebar colapsable.

// import React, { useState, useEffect } from 'react';
// import Header from './components/layout/Header';
// import Sidebar from './components/layout/Sidebar';

// // Importa las páginas desde sus ubicaciones estructuradas
// import LoginPage from './pages/auth/LoginPage';
// import HomePage from './pages/public/HomePage';
// import DashboardPage from './pages/admin/DashboardPage';
// import NewsListPage from './pages/admin/news/NewsListPage';
// import ServicesListPage from './pages/admin/ServicesListPage';
// import RepuestosListPage from './pages/admin/RepuestosListPage';
// import UsuariosListPage from './pages/admin/UsuariosListPage';
// import ClientesListPage from './pages/admin/ClientesListPage';
// import PromocionesListPage from './pages/admin/PromocionesListPage';
// import TestimoniosListPage from './pages/admin/TestimoniosListPage';
// import GaleriasListPage from './pages/admin/GaleriasListPage';
// import SolicitudesListPage from './pages/admin/SolicitudesListPage';

// import PagePlaceholder from './pages/PagePlaceholder';
// import { logoutUser } from './api/newsApi'; // Reutilizamos logoutUser de newsApi

// function App() {
//     // Estado de autenticación inicializado directamente desde localStorage
//     const [isLoggedIn, setIsLoggedIn] = useState(() => {
//         return !!localStorage.getItem('jwt_token');
//     });

//     // Estado de la página actual, dependiente del estado de autenticación
//     const [currentPage, setCurrentPage] = useState(isLoggedIn ? 'dashboard' : 'home');

//     // Estado para controlar la visibilidad/colapso del sidebar
//     // Se inicializa en true para que en desktop aparezca abierto por defecto.
//     // En móvil, el useEffect lo manejará para que inicie cerrado.
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//     // Efecto para redirigir a login si no está autenticado y no está en home/login
//     useEffect(() => {
//         if (!isLoggedIn && currentPage !== 'home' && currentPage !== 'login') {
//             setCurrentPage('login');
//         }
//     }, [isLoggedIn, currentPage]);

//     // Efecto para ajustar el estado del sidebar al cargar o redimensionar la ventana
//     useEffect(() => {
//         const handleResize = () => {
//             // Si el ancho de la ventana es menor que el breakpoint 'md' (768px)
//             if (window.innerWidth < 768) {
//                 // En móvil, siempre asegúrate de que el sidebar esté cerrado (oculto)
//                 setIsSidebarOpen(false);
//             } else {
//                 // En desktop, si el sidebar estaba oculto (ej. al pasar de móvil a desktop),
//                 // asegúrate de que esté abierto (expandido) por defecto.
//                 // Si el usuario lo colapsó manualmente en desktop, su estado se mantendrá.
//                 if (!isSidebarOpen) {
//                     setIsSidebarOpen(true); // Abre el sidebar por defecto en desktop
//                 }
//             }
//         };

//         window.addEventListener('resize', handleResize);
//         handleResize(); // Ejecutar al montar para establecer el estado inicial correcto

//         return () => window.removeEventListener('resize', handleResize);
//     }, []); // Dependencia vacía para que se ejecute solo una vez al montar y en cada resize

//     const handleLoginSuccess = () => {
//         setIsLoggedIn(true);
//         setCurrentPage('dashboard');
//         // Al iniciar sesión, asegúrate de que el sidebar se muestre según el tamaño de la pantalla
//         if (window.innerWidth >= 768) {
//             setIsSidebarOpen(true); // Abre el sidebar en desktop al iniciar sesión
//         }
//     };

//     const handleLogout = () => {
//         logoutUser(); // Llama a la función de logout que limpia el token
//         setIsLoggedIn(false);
//         setCurrentPage('home');
//         setIsSidebarOpen(false); // Cierra el sidebar al cerrar sesión
//     };

//     const handleNavigate = (page) => {
//         setCurrentPage(page);
//         // En móviles, cierra el sidebar al navegar. En escritorio, no cambia el estado de colapso/expansión.
//         if (window.innerWidth < 768) {
//             setIsSidebarOpen(false);
//         }
//     };

//     // Función para alternar la visibilidad/colapso del sidebar
//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     // Calcula el margen dinámico para el contenido principal en desktop
//     // Si el sidebar está abierto (expandido), el margen es 64px. Si está cerrado (colapsado), el margen es 20px.
//     const mainContentMarginClass = isSidebarOpen ? 'md:ml-20' : 'md:ml-20';

//     return (
//         <div className="flex flex-col min-h-screen bg-gray-900 font-inter">
//             {/* Si no está logueado, muestra solo la página de login */}
//             {!isLoggedIn ? (
//                 <LoginPage onLoginSuccess={handleLoginSuccess} />
//             ) : (
//                 <>
//                     {/* Header: Pasa la función para alternar el sidebar */}
//                     <Header onNavigate={handleNavigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} toggleSidebar={toggleSidebar} />

//                     <div className="flex flex-1 pt-4 pb-4 px-4 gap-4">
//                         {/* Sidebar: Pasa el estado de apertura/colapso y la función para alternar */}
//                         <Sidebar onNavigate={handleNavigate} isOpen={isSidebarOpen} onClose={toggleSidebar} />

//                         {/* Área principal de contenido */}
//                         <main className={`flex-1 p-0 overflow-y-auto rounded-lg transition-all duration-300 ease-in-out ${mainContentMarginClass}`}>
//                             {(() => {
//                                 switch (currentPage) {
//                                     case 'home':
//                                         return <HomePage />;
//                                     case 'dashboard':
//                                         return <DashboardPage onNavigate={handleNavigate} />;
//                                     case 'noticias':
//                                         return <NewsListPage onNavigate={handleNavigate} />;
//                                     case 'servicios':
//                                         return <ServicesListPage onNavigate={handleNavigate} />;
//                                     case 'repuestos':
//                                         return <RepuestosListPage onNavigate={handleNavigate} />;
//                                     case 'usuarios':
//                                         return <UsuariosListPage onNavigate={handleNavigate} />;
//                                     case 'clientes':
//                                         return <ClientesListPage onNavigate={handleNavigate} />;
//                                     case 'promociones':
//                                         return <PromocionesListPage onNavigate={handleNavigate} />;
//                                     case 'testimonios':
//                                         return <TestimoniosListPage onNavigate={handleNavigate} />;
//                                     case 'galerias':
//                                         return <GaleriasListPage onNavigate={handleNavigate} />;
//                                     case 'solicitudes':
//                                         return <SolicitudesListPage onNavigate={handleNavigate} />;
//                                     case 'contacto':
//                                         return <PagePlaceholder title="Contacto" />;
//                                     case 'acerca':
//                                         return <PagePlaceholder title="Acerca de" />;
//                                     case 'login':
//                                         return (
//                                             <div className="p-8 bg-white rounded-lg shadow-md animate-fadeIn">
//                                                 <h2 className="text-2xl font-bold text-gray-800">Ya has iniciado sesión.</h2>
//                                                 <p className="text-gray-600 mt-2">Puedes navegar por el menú lateral.</p>
//                                             </div>
//                                         );
//                                     default:
//                                         return (
//                                             <div className="p-8 bg-white rounded-lg shadow-md animate-fadeIn">
//                                                 <h2 className="text-2xl font-bold text-gray-800">Página no encontrada</h2>
//                                                 <p className="text-gray-600 mt-2">La URL a la que intentaste acceder no existe.</p>
//                                             </div>
//                                         );
//                                 }
//                             })()}
//                         </main>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default App;

// // Este documento representa el componente principal de la aplicación React. Se encarga de gestionar el estado global de autenticación, la navegación entre las diferentes páginas (tanto públicas como del panel de administración), y el layout general. Incluye la lógica para el sidebar responsivo que se oculta en móviles y se colapsa/expande en escritorio, adaptando el contenido principal dinámicamen
