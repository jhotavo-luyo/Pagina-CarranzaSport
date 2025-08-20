// src/pages/admin/news/NewsFormModal.jsx
// proxima mejora sera incluir videos para un futuro por ahora es imagen
// --- Parte 1: Importaciones y Definición de Estados ---
import React, { useState, useEffect } from 'react';
import { createNews, updateNews } from '../../../api/newsApi'; // API para noticias
import { getAllGalerias } from '../../../api/galeriasApi'; // API para obtener la lista de galerías
import { getAllImagenes } from '../../../api/imagenesApi'; // API para obtener las imágenes de una galería específica

const NewsFormModal = ({ isOpen, onClose, onSave, newsItem = null, loggedInUserId }) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagen_noticia, setImagenNoticia] = useState('');
    const [fecha_publicacion, setFechaPublicacion] = useState('');
    const [estado, setEstado] = useState('borrador');
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para la selección de galería e imagen
    const [galleries, setGalleries] = useState([]);
    const [galleriesLoading, setGalleriesLoading] = useState(false);
    const [selectedGalleryId, setSelectedGalleryId] = useState('');
    const [images, setImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(false);
// --- Parte 2: Hooks useEffect para Carga de Datos y Gestión del Formulario ---

    // Inicializa el formulario cuando se abre el modal o se selecciona una noticia.
    useEffect(() => {
        if (isOpen) {
            if (newsItem) {
                setTitulo(newsItem.titulo || '');
                setContenido(newsItem.contenido || '');
                setImagenNoticia(newsItem.imagen_noticia || '');
                const formattedDate = newsItem.fecha_publicacion ? new Date(newsItem.fecha_publicacion).toISOString().split('T')[0] : '';
                setFechaPublicacion(formattedDate);
                setEstado(newsItem.estado || 'borrador');
                // NOTA: Al editar, el usuario deberá re-seleccionar la galería y la imagen.
                // Es complejo determinar la galería a partir de solo la URL de la imagen.
                setSelectedGalleryId('');
                setImages([]);
            } else {
                // Resetea el formulario para creación.
                setTitulo('');
                setContenido('');
                setImagenNoticia('');
                setFechaPublicacion('');
                setEstado('borrador');
                setSelectedGalleryId('');
                setImages([]);
            }
            setFormError(null);
            setIsSubmitting(false);
        }
    }, [newsItem, isOpen]);

    // Carga las galerías cuando se abre el modal.
    useEffect(() => {
        if (isOpen) {
            const fetchGalleries = async () => {
                setGalleriesLoading(true);
                try {
                    const galleryData = await getAllGalerias();
                    setGalleries(galleryData);
                } catch (error) {
                    console.error("Error al cargar las galerías:", error);
                    setFormError('No se pudieron cargar las galerías.');
                } finally {
                    setGalleriesLoading(false);
                }
            };
            fetchGalleries();
        }
    }, [isOpen]);

    // Carga las imágenes de la galería seleccionada.
    useEffect(() => {
        if (!selectedGalleryId) {
            setImages([]);
            return;
        }

        const fetchImages = async () => {
            setImagesLoading(true);
            try {
                const imageData = await getAllImagenes(selectedGalleryId);
                setImages(imageData);
            } catch (error) {
                console.error(`Error al cargar imágenes para la galería ${selectedGalleryId}:`, error);
                setFormError('No se pudieron cargar las imágenes de la galería seleccionada.');
            } finally {
                setImagesLoading(false);
            }
        };

        fetchImages();
    }, [selectedGalleryId]);
// --- Parte 3: Manejadores de Eventos y Lógica de Envío ---

    const handleGalleryChange = (e) => {
        setSelectedGalleryId(e.target.value);
        setImagenNoticia(''); // Resetea la imagen seleccionada al cambiar de galería
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        if (!titulo || !contenido || !fecha_publicacion) {
            setFormError('Por favor, completa todos los campos requeridos (Título, Contenido, Fecha de Publicación).');
            setIsSubmitting(false);
            return;
        }

        // Validación del código antiguo: Asegurarse de que el autor_id está disponible al crear una noticia.
        if (!newsItem && !loggedInUserId) {
            setFormError('No se pudo identificar al autor. Por favor, inicie sesión de nuevo.');
            setIsSubmitting(false);
            return;
        }

        const newsData = {
            titulo,
            contenido,
            imagen_noticia: imagen_noticia || null,
            autor_id: loggedInUserId,
            estado: estado || 'borrador',
            fecha_publicacion: fecha_publicacion
        };

        try {
            if (newsItem) {
                await updateNews(newsItem.id_noticia, newsData);
            } else {
                await createNews(newsData);
            }
            onSave();
        } catch (err) {
            setFormError(err.message || 'Error al guardar la noticia.');
            console.error("Error saving news:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
// --- Parte 4: JSX (El Componente Renderizado) ---
    return (
        <div className="fixed inset-0 bg-[#0000004b] flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-700
                        rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {newsItem ? 'Editar Noticia' : 'Crear Nueva Noticia'}
                </h2>

                {formError && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center whitespace-pre-wrap">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="titulo" className="block text-gray-300 text-lg font-semibold mb-2">Título</label>
                        <input
                            type="text"
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="contenido" className="block text-gray-300 text-lg font-semibold mb-2">Contenido</label>
                        <textarea
                            id="contenido"
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            rows="6"
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    {/* --- Nuevos selects para galería e imagen --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="galeria" className="block text-gray-300 text-lg font-semibold mb-2">Galería</label>
                            <select
                                id="galeria"
                                value={selectedGalleryId}
                                onChange={handleGalleryChange}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                disabled={isSubmitting || galleriesLoading}
                            >
                                <option value="">{galleriesLoading ? 'Cargando galerías...' : 'Selecciona una galería'}</option>
                                {galleries.map((gallery) => (
                                    <option key={gallery.id_galeria} value={gallery.id_galeria}>
                                        {gallery.nombre_galeria}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="imagen_noticia" className="block text-gray-300 text-lg font-semibold mb-2">Imagen</label>
                            <select
                                id="imagen_noticia"
                                value={imagen_noticia}
                                onChange={(e) => setImagenNoticia(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                disabled={isSubmitting || imagesLoading || !selectedGalleryId}
                            >
                                <option value="">{imagesLoading ? 'Cargando imágenes...' : 'Selecciona una imagen'}</option>
                                {images.map((image) => (
                                    <option key={image.id_imagen} value={image.url_imagen}>
                                        {image.nombre_archivo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* --- Vista previa de la imagen --- */}
                    {imagen_noticia && (
                        <div className="mt-4">
                            <label className="block text-gray-300 text-lg font-semibold mb-2">Vista Previa</label>
                            <div className="bg-gray-700 p-2 rounded-md flex justify-center items-center">
                                <img
                                    src={imagen_noticia}
                                    alt="Vista previa de la noticia"
                                    className="max-h-48 w-auto rounded-md object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="fecha_publicacion" className="block text-gray-300 text-lg font-semibold mb-2">Fecha de Publicación</label>
                        <input
                            type="date"
                            id="fecha_publicacion"
                            value={fecha_publicacion}
                            onChange={(e) => setFechaPublicacion(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-gray-300 text-lg font-semibold mb-2">Estado</label>
                        <select
                            id="estado"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="publicada">Publicada</option>
                            <option value="borrador">Borrador</option>
                            <option value="archivada">Archivada</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-orange-600 bg-orange-700 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (newsItem ? 'Guardar Cambios' : 'Crear Noticia')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsFormModal;



// codigo antiguo



// // src/pages/admin/news/NewsFormModal.jsx
// // Este componente es un modal (ventana emergente) utilizado para crear o editar una noticia.
// // Ahora se integra con las funciones de la API y maneja los IDs de MySQL.
// import React, { useState, useEffect } from 'react';
// import { createNews, updateNews } from '../../../api/newsApi';
// import { getAllGalerias } from '../../../api/galeriasApi'; // Importa la función para obtener imágenes de la galería

// const NewsFormModal = ({ isOpen, onClose, onSave, newsItem = null, loggedInUserId }) => {
//     const [titulo, setTitulo] = useState(''); // Cambiado a 'titulo'
//     const [contenido, setContenido] = useState(''); // Cambiado a 'contenido'
//     const [imagen_noticia, setImagenNoticia] = useState(''); // Cambiado a 'imagen_noticia'
//     const [fecha_publicacion, setFechaPublicacion] = useState(''); // Cambiado a 'fecha_publicacion'
//     const [estado, setEstado] = useState('borrador'); // Cambiado a 'estado', por defecto 'borrador'
//     const [formError, setFormError] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     // Nuevos estados para manejar la carga de imágenes de la galería
//     const [galleryImages, setGalleryImages] = useState([]);
//     const [galleryLoading, setGalleryLoading] = useState(false);

//     // useEffect para inicializar el formulario cuando se abre el modal o se selecciona una noticia.
//     useEffect(() => {
//         if (newsItem) {
//             setTitulo(newsItem.titulo || '');
//             setContenido(newsItem.contenido || '');
//             setImagenNoticia(newsItem.imagen_noticia || '');
//             // Formatea la fecha para que el input type="date" la muestre correctamente.
//             const formattedDate = newsItem.fecha_publicacion ? new Date(newsItem.fecha_publicacion).toISOString().split('T')[0] : '';
//             setFechaPublicacion(formattedDate);
//             setEstado(newsItem.estado || 'borrador');
//         } else {
//             // Resetea el formulario si no hay noticia seleccionada (modo creación).
//             setTitulo('');
//             setContenido('');
//             setImagenNoticia('');
//             setFechaPublicacion('');
//             setEstado('borrador');
//         }
//         setFormError(null); // Limpia errores al abrir/cambiar noticia
//         setIsSubmitting(false); // Resetea el estado de envío
//     }, [newsItem, isOpen]);

//     // useEffect para cargar las imágenes de la galería cuando se abre el modal para ello desaeeollare otro campo que defina las galerias y luego este para escoger la imagen de la galeria escogida
//     useEffect(() => {
//         if (isOpen) {
//             const fetchGallery = async () => {
//                 setGalleryLoading(true);
//                 try {
//                     // Se asume que getAllGalerias devuelve un array de objetos: { id_galeria, titulo, url_imagen }
//                     const images = await getAllGalerias();
//                     setGalleryImages(images);
//                 } catch (error) {
//                     console.error("Error al cargar la galería:", error);
//                     // Opcional: mostrar un error en el formulario si la galería no carga
//                     setFormError(prev => prev ? `${prev}\nNo se pudo cargar la galería.` : 'No se pudo cargar la galería.');
//                 } finally {
//                     setGalleryLoading(false);
//                 }
//             };
//             fetchGallery();
//         }
//     }, [isOpen]);

//     // Manejador del envío del formulario.
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError(null);
//         setIsSubmitting(true);

//         // Validación básica del formulario
//         if (!titulo || !contenido || !fecha_publicacion) {
//             setFormError('Por favor, completa todos los campos requeridos (Título, Contenido, Fecha de Publicación).');
//             setIsSubmitting(false);
//             return;
//         }

//         // Validación adicional: Asegurarse de que el autor_id está disponible al crear una noticia.
//         // En modo edición, el autor_id ya viene con newsItem.
//         if (!newsItem && !loggedInUserId) {
//             setFormError('No se pudo identificar al autor. Por favor, inicie sesión de nuevo.');
//             setIsSubmitting(false);
//             return;
//         }

//         const newsData = {
//             titulo,
//             contenido,
//             imagen_noticia: imagen_noticia || null, // Permite null si no se proporciona imagen
//             autor_id: loggedInUserId, // Usa el ID del usuario logueado
//             estado: estado || 'borrador',
//             fecha_publicacion: fecha_publicacion // Asegura que la fecha se envíe
//         };

//         try {
//             if (newsItem) {
//                 // Modo edición: llama a la función de actualización de la API
//                 await updateNews(newsItem.id_noticia, newsData);
//             } else {
//                 // Modo creación: llama a la función de creación de la API
//                 await createNews(newsData);
//             }
//             onSave(); // Llama a la función onSave (que recarga la lista de noticias en el padre)
//         } catch (err) {
//             setFormError(err.message || 'Error al guardar la noticia.');
//             console.error("Error saving news:", err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Si el modal no está abierto, no renderiza nada.
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-[#0000004b] flex items-center justify-center z-50 animate-fadeIn">
//             <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700
//                         rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-transform duration-300 hover:scale-105">
//                 <h2 className="text-3xl font-bold text-white mb-6 text-center">
//                     {newsItem ? 'Editar Noticia' : 'Crear Nueva Noticia'}
//                 </h2>

//                 {formError && (
//                     <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
//                         {formError}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     <div>
//                         <label htmlFor="titulo" className="block text-gray-300 text-lg font-semibold mb-2">Título</label>
//                         <input
//                             type="text"
//                             id="titulo"
//                             value={titulo}
//                             onChange={(e) => setTitulo(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="contenido" className="block text-gray-300 text-lg font-semibold mb-2">Contenido</label>
//                         <textarea
//                             id="contenido"
//                             value={contenido}
//                             onChange={(e) => setContenido(e.target.value)}
//                             rows="6"
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         ></textarea>
//                     </div>
//                     <div>
//                         <label htmlFor="imagen_noticia" className="block text-gray-300 text-lg font-semibold mb-2">Imagen de la Galería</label>
//                         <select
//                             id="imagen_noticia"
//                             value={imagen_noticia}
//                             onChange={(e) => setImagenNoticia(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             disabled={isSubmitting || galleryLoading}
//                         >
//                             <option value="">{galleryLoading ? 'Cargando galería...' : 'Selecciona una imagen'}</option>
//                             {galleryImages.map((image) => (
//                                 <option key={image.id_galeria} value={image.url_imagen}>
//                                     {image.titulo || `Imagen ${image.id_galeria}`}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label htmlFor="fecha_publicacion" className="block text-gray-300 text-lg font-semibold mb-2">Fecha de Publicación</label>
//                         <input
//                             type="date"
//                             id="fecha_publicacion"
//                             value={fecha_publicacion}
//                             onChange={(e) => setFechaPublicacion(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="estado" className="block text-gray-300 text-lg font-semibold mb-2">Estado</label>
//                         <select
//                             id="estado"
//                             value={estado}
//                             onChange={(e) => setEstado(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             disabled={isSubmitting}
//                         >
//                             <option value="publicada">Publicada</option>
//                             <option value="borrador">Borrador</option>
//                             <option value="archivada">Archivada</option> {/* Agregado 'archivada' */}
//                         </select>
//                     </div>
//                     <div className="flex justify-end space-x-4 mt-6">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
//                             disabled={isSubmitting}
//                         >
//                             Cancelar
//                         </button>
//                         <button
//                             type="submit"
//                             className="bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105"
//                             disabled={isSubmitting}
//                         >
//                             {isSubmitting ? 'Guardando...' : (newsItem ? 'Guardar Cambios' : 'Crear Noticia')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default NewsFormModal;