// src/components/layout/Sidebar.jsx

// Importa las dependencias necesarias de React y React Router.
import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'; // 'Link' para la navegación y 'useLocation' para saber la ruta actual.
// Importa los iconos que se usarán en el menú desde la librería Heroicons.
import { HomeIcon, NewspaperIcon, CogIcon, UsersIcon, TagIcon, ChatBubbleBottomCenterTextIcon, PhotoIcon, WrenchScrewdriverIcon, TruckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext'; // Importa el hook de autenticación.
        
// Se exporta 'navGroups' para que otros componentes (como Header.jsx) puedan usar esta misma estructura de navegación.
// Esto centraliza la configuración de la navegación en un solo lugar, evitando duplicación.
export const navGroups = [
    {
        title: 'Principal', // Título de la sección de navegación.
        links: [ // Array de enlaces para esta sección.
            { name: 'Dashboard', icon: HomeIcon, page: 'dashboard' }, // Accesible para todos
            { name: 'Solicitudes', icon: TruckIcon, page: 'solicitudes', roles: ['administrador', 'editor', 'observador'] },
        ]
    },
    {
        title: 'Gestión del Taller',
        links: [
            { name: 'Servicios', icon: WrenchScrewdriverIcon, page: 'servicios', roles: ['administrador', 'editor', 'observador'] },
            { name: 'Repuestos', icon: CogIcon, page: 'repuestos', roles: ['administrador', 'editor', 'observador'] },
            { name: 'Clientes', icon: UserGroupIcon, page: 'clientes', roles: ['administrador', 'editor', 'observador'] },
        ]
    },
    {
        title: 'Gestión de Contenido',
        links: [
            { name: 'Noticias', icon: NewspaperIcon, page: 'noticias', roles: ['administrador', 'editor', 'observador'] },
            { name: 'Promociones', icon: TagIcon, page: 'promociones', roles: ['administrador', 'editor', 'observador'] },
            { name: 'Testimonios', icon: ChatBubbleBottomCenterTextIcon, page: 'testimonios', roles: ['administrador', 'editor', 'observador'] },
            { name: 'Galerías', icon: PhotoIcon, page: 'galerias', roles: ['administrador', 'editor', 'observador'] },
        ]
    },
    {
        title: 'Administración',
        links: [
            { name: 'Usuarios', icon: UsersIcon, page: 'usuarios', roles: ['administrador'] }, // Correcto: 'observador' no está aquí
        ]
    }
];

// Definición del componente Sidebar. Recibe props para controlar su estado.
// isOpen: booleano que indica si el sidebar está expandido o colapsado.
// onClose: función para cerrar el sidebar (usada en móvil).
// onMouseEnter: función que se ejecuta cuando el cursor entra en el área del sidebar (usada en desktop para expandirlo).
const Sidebar = ({ isOpen, onClose, onMouseEnter }) => {
    // Hook de React Router que devuelve el objeto de ubicación actual (URL, pathname, etc.).
    const location = useLocation();
    // Obtiene los datos del usuario (incluido el rol) desde el AuthContext.
    const { user } = useAuth();

    // --- Lógica para el gesto de deslizar (Swipe) en móvil ---
    // Refs para almacenar las coordenadas de inicio y fin del toque.
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);
    // Distancia mínima en píxeles para considerar el gesto como un swipe válido.
    const minSwipeDistance = 50;

    // Manejador para cuando el usuario empieza a tocar la pantalla.
    const handleTouchStart = (e) => {
        // Solo nos interesa el primer punto de contacto.
        touchEndRef.current = null; // Resetea el punto final.
        touchStartRef.current = e.targetTouches[0].clientX; // Guarda la coordenada X inicial.
    };

    // Manejador para cuando el usuario mueve el dedo sobre la pantalla.
    const handleTouchMove = (e) => {
        // Actualiza la coordenada X del punto final mientras se mueve.
        touchEndRef.current = e.targetTouches[0].clientX;
    };

    // Manejador para cuando el usuario levanta el dedo de la pantalla.
    const handleTouchEnd = () => {
        // Si no hay un punto de inicio o fin, no hace nada.
        if (!touchStartRef.current || !touchEndRef.current) return;

        // Calcula la distancia del deslizamiento.
        const distance = touchStartRef.current - touchEndRef.current;

        // Si la distancia es positiva (deslizamiento a la izquierda) y supera el umbral mínimo...
        if (distance > minSwipeDistance) {
            onClose(); // ...cierra el sidebar.
        }
    };

    return (
        // Se utiliza un Fragment (<>) para agrupar múltiples elementos sin añadir un nodo extra al DOM.
        <>
            {/* Overlay para móvil: es un fondo semitransparente que cubre la pantalla. */}
            {/* Solo es visible en pantallas pequeñas (md:hidden) y cuando el sidebar está abierto (isOpen). */}
            <div
                className={`fixed inset-0  bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose} // Al hacer clic en el overlay, se llama a la función onClose para cerrar el menú.
            ></div>



            {/* Elemento <aside> que representa la barra lateral. */}
            <aside
                onMouseEnter={onMouseEnter} // Llama a la función para expandir el menú en desktop cuando el ratón entra.
                // Añade los manejadores de eventos táctiles para el gesto de swipe.
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                // Clases de Tailwind CSS para estilizar el sidebar:
                // - Posicionamiento: fixed top-0 left-0 h-full z-40
                // - Estilo visual: bg-[#36415390] bg-opacity-50 backdrop-blur-lg text-white
                // - Layout: flex flex-col
                // - Transiciones: transform transition-all duration-300 ease-in-out
                // - Ancho condicional: si 'isOpen' es true, el ancho es 'w-64', si no, 'w-20'.
                // - Visibilidad en móvil: si 'isOpen' es true, se traslada a la vista ('translate-x-0'), si no, se oculta a la izquierda ('-translate-x-full').
                className={`fixed top-0 left-0 h-full bg-[#36415390] bg-opacity-50 backdrop-blur-lg
                    text-white z-60 flex flex-col transform transition-all duration-300 ease-in-out
                            ${isOpen ? 'w-64' : 'w-20'}
                            md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Cabecera del Sidebar: contiene el logo y el nombre/rol. */}
                <div className="w-[80%] m-auto flex items-center justify-evenly  h-16 border-b border-orange-500">
                    <Link to="/dashboard" className="flex items-center ">
                        <img src="/fondo.jpg" alt="Logo" className="h-10 w-10 rounded-full flex-shrink-0" />
                    </Link>
                        {/* Contenedor para el texto que aparece y desaparece con una transición suave. */}
                        <div className={`flex flex-col overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <span className="font-bold text-lg leading-tight whitespace-nowrap">CarranzaSport</span>
                            <span className="text-xs text-gray-300 capitalize leading-tight whitespace-nowrap">{user?.rol}</span>
                        </div>
                </div>
                {/* Cuerpo del Sidebar: contiene la lista de enlaces de navegación. */}
                <nav className="mt-4 flex-1 overflow-y-auto">
                    {/* Itera sobre el array 'navGroups' para renderizar cada sección de navegación. */}
                    {navGroups.map((group) => (
                        <div key={group.title} className="mb-4">
                            {/* Título de la sección, visible solo cuando el sidebar está expandido */}
                            <h3 className={`px-4 mb-1 h-[16px] truncate text-xs font-semibold text-gray-400 uppercase tracking-wider transition-opacity duration-200 ${isOpen ? 'opacity-100 ' : 'opacity-0'}`}>
                                {group.title}
                            </h3>
                            <ul>
                                {/* Filtra los enlaces basándose en el rol del usuario ANTES de mapearlos */}
                                {group.links
                                    .filter(link => 
                                        // Un enlace se muestra si:
                                        // 1. No tiene una propiedad 'roles' (es público para todos los logueados)
                                        // 2. El rol del usuario (user?.rol) está incluido en el array de 'roles' del enlace.
                                        !link.roles || (user && link.roles.includes(user.rol))
                                    )
                                    .map((link) => {
                                        // Lógica para detectar si el enlace actual es la página activa.
                                        const isActive = location.pathname.startsWith(`/${link.page}`);
                                        return (
                                            <li key={link.name} className="px-4">
                                                <Link
                                                    to={`/${link.page}`}
                                                    className={`w-full flex items-center p-2 my-1 rounded-md transition-colors duration-200 ${isActive ? 'bg-[#ff7332a8] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                                >
                                                    <link.icon className="h-6 w-6 flex-shrink-0" />
                                                    <span className={`ml-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{link.name}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                        ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;











// ? src/components/layout/Sidebar.jsx
//  Este componente define la barra lateral de navegación,
//  con elementos condicionales basados en el rol del usuario
//  y alineados con las rutas principales del backend.
//  Ahora implementa un menú de hamburguesa responsivo y se colapsa/expande con hover en escritorio.

// import React, { useState, useEffect } from 'react';

// // Componente auxiliar para un elemento de navegación
// // Se añade 'icon' y 'isSidebarOpen' como props para controlar la visibilidad del texto
// const NavItem = ({ text, pathKey, icon, onNavigate, isSidebarOpen }) => (
//     <li>
//         <button
//             onClick={() => onNavigate(pathKey)}
//             className="w-full flex items-center py-3 px-3 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition-all duration-300 font-medium transform hover:scale-105"
//         >
//             <span className={`text-2xl mr-4 ${isSidebarOpen ? 'ml-0' : 'mx-auto'}`}>
//                 {icon}
//             </span>
//             {/* El texto se muestra solo si el sidebar está abierto (expandido) o si no es una pantalla md (móvil) */}
//             <span className={`whitespace-nowrap ${isSidebarOpen ? 'block' : 'hidden md:hidden'}`}>
//                 {text}
//             </span>
//         </button>
//     </li>
// );

// // Se añade 'isOpen' y 'onClose' como props para controlar la visibilidad y el colapso del sidebar
// // Además, se añade onMouseEnter para el comportamiento de hover en desktop.
// const Sidebar = ({ onNavigate, isOpen, onClose, onMouseEnter }) => { // onMouseLeave ya no es necesario aquí
//     const [userRole, setUserRole] = useState(null);

//     // Efecto para obtener el rol del usuario desde localStorage al montar el componente
//     useEffect(() => {
//         try {
//             const userData = localStorage.getItem('user_data');
//             if (userData) {
//                 const user = JSON.parse(userData);
//                 setUserRole(user.rol);
//             }
//         } catch (e) {
//             console.error("Error parsing user data from localStorage in Sidebar:", e);
//             setUserRole(null); // Asegurarse de que el rol sea nulo en caso de error
//         }
//     }, []); // Se ejecuta solo una vez al montar

//     // Función auxiliar para verificar si el usuario tiene un rol permitido
//     const hasAccess = (requiredRoles) => {
//         if (!userRole) return false; // Si no hay rol, no hay acceso
//         return requiredRoles.includes(userRole);
//     };

//     // Definición de roles para cada sección (ajustar según tus necesidades de negocio)
//     const adminAndEditorRoles = ['administrador', 'editor'];
//     const adminOnlyRoles = ['administrador'];
//     const allLoggedInRoles = ['administrador', 'editor', 'observador']; // Asumiendo que 'observador' también puede ver el dashboard y secciones públicas

//     return (
//         <>
//             {/* Overlay para pantallas pequeñas cuando el sidebar está abierto */}
//             {isOpen && (
//                 <div
//                     className="fixed inset-0 bg-opacity-50 z-30 md:hidden"// aqui le quite el fondo negro
//                     onClick={onClose} // Cierra el sidebar al hacer clic fuera
//                 ></div>
//             )}

//             {/* Sidebar principal */}
//             <aside
//                 // Clases condicionales para el menú de hamburguesa y el colapso en escritorio
//                 // 'fixed inset-y-0 left-0 z-40': Fija el sidebar a la izquierda de la pantalla.
//                 // 'bg-white p-4 shadow-xl rounded-r-lg': Estilos de fondo, padding, sombra y bordes.
//                 // 'flex flex-col justify-between': Diseño flexbox.
//                 // 'transform transition-all duration-300 ease-in-out': Animación de deslizamiento y cambio de ancho.
//                 // Mobile: ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//                 // Desktop: ${isOpen ? 'w-64' : 'w-20'} md:translate-x-0
//                 className={`fixed inset-y-0 left-0 z-40  bg-[#ddd5] backdrop-filter backdrop-blur-sm  p-4 shadow-xl rounded-r-lg flex flex-col justify-between
//                            transform transition-all duration-300 ease-in-out
//                            ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
//                            md:translate-x-0 ${isOpen ? 'md:w-64' : 'md:w-20'}`}
//                 onMouseEnter={onMouseEnter} // Aplica el manejador de mouseEnter recibido de App.jsx
//                 // onMouseLeave se ha eliminado de aquí, ya que el control de colapso se gestiona en App.jsx al entrar en el main content.
//             >
//                 <nav className="space-y-2 flex-1"> {/* flex-1 para empujar el toggle al final si hay mucho contenido */}
//                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
//                         {/* Título "Menú" solo visible cuando el sidebar está expandido en escritorio */}
//                         <h2 className={`text-xl font-bold text-gray-800 ${isOpen ? 'block' : 'hidden md:hidden'}`}>Menú</h2>
//                         {/* Botón de cerrar para el menú de hamburguesa en pantallas pequeñas */}
//                         <button onClick={onClose} className="md:hidden text-gray-800 hover:text-primary text-4xl font-bold">
//                             &times;
//                         </button>
//                         {/* El botón de alternar para expandir/colapsar en escritorio se ha eliminado de aquí,
//                             ya que el control ahora se realiza por hover desde App.jsx */}
//                     </div>
//                     <ul className="space-y-2"> {/* Agrega space-y-2 para NavItem */}
//                         {/* Dashboard: Accesible por todos los roles logueados */}
//                         {hasAccess(allLoggedInRoles) && (
//                             <NavItem text="Dashboard" pathKey="dashboard" icon="🏠" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Servicios: /api/servicios */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Servicios" pathKey="servicios" icon="⚙️" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Repuestos: /api/repuestos */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Repuestos" pathKey="repuestos" icon="🔩" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Noticias: /api/noticias */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Noticias" pathKey="noticias" icon="📰" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Promociones: /api/promociones */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Promociones" pathKey="promociones" icon="🏷️" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Testimonios: /api/testimonios */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Testimonios" pathKey="testimonios" icon="🗣️" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Galerías: /api/galerias */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Galerías" pathKey="galerias" icon="📸" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Solicitudes: /api/solicitudes */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Solicitudes" pathKey="solicitudes" icon="📧" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Clientes: /api/clientes - ¡NUEVA SECCIÓN! */}
//                         {hasAccess(adminAndEditorRoles) && (
//                             <NavItem text="Clientes" pathKey="clientes" icon="👥" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}

//                         {/* Usuarios: /api/usuarios - Solo administradores pueden gestionar usuarios */}
//                         {hasAccess(adminOnlyRoles) && (
//                             <NavItem text="Usuarios" pathKey="usuarios" icon="🔑" onNavigate={onNavigate} isSidebarOpen={isOpen} />
//                         )}
//                     </ul>
//                 </nav>
//             </aside>
//         </>
//     );
// };

// export default Sidebar;
// // ```
// // Este documento contiene el componente `Sidebar.jsx`, que define la barra lateral de navegación de la aplicación. Ha sido adaptado para funcionar como un menú de hamburguesa en dispositivos móviles (ocultándose y mostrándose) y como un menú colapsable/expandible en escritorios. Ahora, su expansión se activa al pasar el ratón sobre el propio sidebar (mediante `onMouseEnter`), y su colapso se gestiona externamente desde `App.jsx` cuando el ratón entra en el área del contenido principal. Incluye lógica para controlar la visibilidad de los elementos de navegación basada en el rol del usuario y utiliza iconos (emojis) para una mejor experiencia visu
