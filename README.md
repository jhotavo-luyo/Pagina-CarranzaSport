# Motosport Carranza - Frontend(React - Vite)

Interfaz de usuario para el sistema de gestión de Motosport Carranza. Esta aplicación web, desarrollada con React y Vite, ofrece una experiencia moderna y fluida tanto para los clientes como para los administradores del taller.

## ✨ Características Principales

### Para Clientes:
- **Pagina de Inicio Dinámica:** Presenta un modelo 3D interactivo de una mototaxi, noticias, promociones y testimonios.
- **Secciones Informativas:** Paginas dedicadas para "Servicios", "Repuestos", "Promociones" y "Nosotros".
- **Contacto Fácil:** Un formulario de contacto integrado para solicitudes generales.
- **Diseño Adaptable:** Interfaz completamente responsive que se adapta a cualquier dispositivo (móvil, tablet, escritorio).

### Panel de Administración:
- **Inicio de Sesión Seguro:**  Acceso protegido mediante autenticación basada en JWT (JSON Web Tokens) con manejo seguro de sesiones.
- **Dashboard de Gestión:** Un panel central para administrar todos los aspectos del sitio.
- **Gestión de Contenido:** CRUD completo para:
  - Clientes
  - Usuarios (administradores)
  - Testimonios
  - Galerías de imágenes y videos
  - Promociones
  - Servicios y sus categorías
  - Repuestos y sus categorías
  - Noticias
- **Interfaz Intuitiva:** Tablas, modales y formularios diseñados para una fácil administración.

## 🚀 Tecnologías Utilizadas
- **Framework Principal:** [React](https://reactjs.org/)
- **Herramientas de Build:** [Vite](https://vitejs.dev/)
- **Enrutamiento:** [React Router](https://reactrouter.com/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes 3D:**  [@google/model-viewer](https://modelviewer.dev/)
- **Iconos:** [Heroicons](https://heroicons.com/)
- **Notificaciones:** [React Toastify](https://fkhadra.github.io/react-toastify/introduction)
- **Seguridad**: [JWT](https://jwt.io/)
- **Fechas y Formateo:** [DateFns](https://date-fns.org/)




## 🛠️ Instalación y Puesta en Marcha

Sigue estos pasos para levantar el proyecto en tu entorno local.

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/jhotavo-luyo/Pagina-CarranzaSport.git
    cd Frontend-CarranzaSport-final
    ```

2.  **Instalar dependencias:**
    Se te recomienda usar `npm`.
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    - Renombra el archivo `.env.example` a `.env`.
    - Modifica las variables según la configuración de tu backend.
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

4.  **Ejecutar el proyecto:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Hot-Module Replacement (HMR).
- `npm run build`: Compila la aplicación para producción en la carpeta `dist/`.
- `npm run lint`: Ejecuta ESLint para analizar el código en busca de errores y problemas de estilo.
- `npm run preview`: Sirve la carpeta de `build` de producción localmente para previsualizar.





## extras
📝 Notas de Desarrollo
Esta sección contiene una serie de comandos y notas utilizadas durante la configuración inicial del proyecto.

**Creación del proyecto:**
```bash
# Creamos el proyecto con Vite
npm create vite@latest
```
**Instalación de dependencias:**
```bash
# Instalamos las dependencias iniciales (package.json)
npm install
```
**Instalación de Tailwind CSS:**
```bash
# Esto instala Tailwind CSS para Vite
npm install tailwindcss @tailwindcss/vite
```
*Nota: Después de instalar, se debe configurar `vite.config.js` para incluir el plugin de Tailwind CSS. El archivo debe quedar similar a esto:*
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Otras dependencias importantes:**
```bash
# Para notificaciones (toasts)
npm install react-toastify

# Para el enrutamiento de la aplicación
npm install react-router-dom

# Para la biblioteca de iconos
npm install @heroicons/react

# Para decodificar JSON Web Tokens (JWT) que vienen del backend
npm install jwt-decode

# Para el formateo y manipulación de fechas
npm install date-fns
