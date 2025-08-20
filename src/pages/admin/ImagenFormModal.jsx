// src/pages/admin/ImagenFormModal.jsx
// Este componente es un modal para crear o editar imágenes.
// Permite asignar la imagen a una galería existente.
import React, { useState, useEffect } from 'react';
import { createImagen, updateImagen } from '../../api/imagenesApi';

const ImagenFormModal = ({ isOpen, onClose, onSave, imagenItem = null, galerias = [], currentGaleriaId = null }) => {
    // Estado unificado para los campos del formulario
    const [formData, setFormData] = useState({
        id_galeria: '',
        nombre_archivo: '',
        url_imagen: '',
        descripcion: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviewError, setImagePreviewError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (imagenItem) {
                setFormData({
                    id_galeria: imagenItem.id_galeria || '',
                    nombre_archivo: imagenItem.nombre_archivo || '',
                    url_imagen: imagenItem.url_imagen || '',
                    descripcion: imagenItem.descripcion || '',
                });
            } else {
                // Preseleccionar galería si se añade desde una específica
                setFormData({
                    id_galeria: currentGaleriaId || '',
                    nombre_archivo: '',
                    url_imagen: '',
                    descripcion: '',
                });
            }
            setErrors({});
            setIsSubmitting(false);
            setImagePreviewError(false);
        }
    }, [imagenItem, isOpen, galerias, currentGaleriaId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al modificarlo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        // Resetear error de previsualización al cambiar la URL
        if (name === 'url_imagen') {
            setImagePreviewError(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombre_archivo.trim()) {
            newErrors.nombre_archivo = 'El nombre del archivo es requerido.';
        } else if (formData.nombre_archivo.length > 150) {
            newErrors.nombre_archivo = 'El nombre no puede exceder los 150 caracteres.';
        }

        if (!formData.url_imagen.trim()) {
            newErrors.url_imagen = 'La URL de la imagen es requerida.';
        } else if (!/^https?:\/\/\S+$/.test(formData.url_imagen)) {
            newErrors.url_imagen = 'El formato de la URL es inválido.';
        }

        if (formData.descripcion && formData.descripcion.length > 500) {
            newErrors.descripcion = 'La descripción no puede exceder los 500 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const imageData = {
            ...formData,
            id_galeria: formData.id_galeria === '' ? null : formData.id_galeria,
            descripcion: formData.descripcion || null,
        };

        try {
            if (imagenItem) {
                await updateImagen(imagenItem.id_imagen, imageData);
            } else {
                await createImagen(imageData);
            }
            onSave(); // Notificamos al padre que se guardó para que pueda recargar los datos.
        } catch (err) {
            const apiError = err.message || 'Error al guardar la imagen.';
            setErrors({ api: apiError });
            console.error("Error saving imagen:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#101828a0] bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
            <div
                className="bg-[#101828a0] bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-700
                           rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    {imagenItem ? 'Editar Imagen' : 'Añadir Nueva Imagen'}
                </h2>

                {errors.api && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nombre_archivo" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Nombre de Archivo</label>
                        <input
                            type="text"
                            id="nombre_archivo"
                            name="nombre_archivo"
                            value={formData.nombre_archivo}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.nombre_archivo ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.nombre_archivo && <p className="text-red-400 text-sm mt-1">{errors.nombre_archivo}</p>}
                    </div>
                    <div>
                        <label htmlFor="url_imagen" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">URL de Imagen</label>
                        <input
                            type="url"
                            id="url_imagen"
                            name="url_imagen"
                            value={formData.url_imagen}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.url_imagen ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.url_imagen && <p className="text-red-400 text-sm mt-1">{errors.url_imagen}</p>}
                    </div>

                    {/* Previsualización de la imagen */}
                    {formData.url_imagen && !errors.url_imagen && (
                        <div className="mt-4">
                            <label className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Previsualización</label>
                            <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                {imagePreviewError ? (
                                    <p className="text-gray-400">No se pudo cargar la imagen.</p>
                                ) : (
                                    <img
                                        src={formData.url_imagen}
                                        alt="Previsualización"
                                        className="w-full h-full object-contain"
                                        onError={() => setImagePreviewError(true)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="descripcion" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Descripción (Opcional)</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.descripcion ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.descripcion && <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>}
                    </div>
                    <div>
                        <label htmlFor="id_galeria" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Asignar a Galería (Opcional)</label>
                        <select
                            id="id_galeria"
                            name="id_galeria"
                            value={formData.id_galeria}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="">-- Sin Galería --</option>
                            {galerias.map(galeria => (
                                <option key={galeria.id_galeria} value={galeria.id_galeria}>
                                    {galeria.nombre_galeria}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 mt-6 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto mt-2 sm:mt-0 bg-gray-600 text-white py-2 px-5 rounded-lg text-base font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-primary bg-orange-600 text-white py-2 px-5 rounded-lg text-base font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (imagenItem ? 'Guardar Cambios' : 'Crear Imagen')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImagenFormModal;










// // src/pages/admin/ImagenFormModal.jsx
// // Este componente es un modal para crear o editar imágenes.
// // Permite asignar la imagen a una galería existente.
// import React, { useState, useEffect } from 'react';
// import { createImagen, updateImagen } from '../../api/imagenesApi';
// import { getAllGalerias } from '../../api/galeriasApi'; // Para obtener la lista de galerías

// const ImagenFormModal = ({ isOpen, onClose, onSave, imagenItem = null, galerias = [], currentGaleriaId = null }) => {
//     const [id_galeria, setIdGaleria] = useState('');
//     const [nombre_archivo, setNombreArchivo] = useState('');
//     const [url_imagen, setUrlImagen] = useState('');
//     const [descripcion, setDescripcion] = useState('');
//     const [formError, setFormError] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [availableGalerias, setAvailableGalerias] = useState([]);

//     useEffect(() => {
//         // Cargar galerías si no se pasan como prop (o si se quiere asegurar que estén actualizadas)
//         const fetchAndSetGalerias = async () => {
//             try {
//                 const data = await getAllGalerias();
//                 setAvailableGalerias(data);
//             } catch (err) {
//                 console.error("Error fetching galerias for image modal:", err);
//                 setAvailableGalerias([]);
//             }
//         };

//         if (isOpen) {
//             if (galerias.length > 0) {
//                 setAvailableGalerias(galerias);
//             } else {
//                 fetchAndSetGalerias();
//             }

//             if (imagenItem) {
//                 setIdGaleria(imagenItem.id_galeria || '');
//                 setNombreArchivo(imagenItem.nombre_archivo || '');
//                 setUrlImagen(imagenItem.url_imagen || '');
//                 setDescripcion(imagenItem.descripcion || '');
//             } else {
//                 // Si es una nueva imagen y se viene de una galería específica, preseleccionar
//                 setIdGaleria(currentGaleriaId || '');
//                 setNombreArchivo('');
//                 setUrlImagen('');
//                 setDescripcion('');
//             }
//             setFormError(null);
//             setIsSubmitting(false);
//         }
//     }, [imagenItem, isOpen, galerias, currentGaleriaId]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError(null);
//         setIsSubmitting(true);

//         // Validaciones básicas de frontend
//         if (!nombre_archivo || !url_imagen) {
//             setFormError('Nombre de archivo y URL de imagen son campos requeridos.');
//             setIsSubmitting(false);
//             return;
//         }
//         if (!/^https?:\/\/\S+$/.test(url_imagen)) {
//             setFormError('El formato de la URL de la imagen es inválido. Debe comenzar con http:// o https://');
//             setIsSubmitting(false);
//             return;
//         }

//         const imageData = {
//             id_galeria: id_galeria === '' ? null : id_galeria, // Enviar null si no se selecciona galería
//             nombre_archivo,
//             url_imagen,
//             descripcion: descripcion || null,
//         };

//         try {
//             if (imagenItem) {
//                 await updateImagen(imagenItem.id_imagen, imageData);
//             } else {
//                 await createImagen(imageData);
//             }
//             onSave();
//         } catch (err) {
//             setFormError(err.message || 'Error al guardar la imagen.');
//             console.error("Error saving imagen:", err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
//             <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700
//                         rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-transform duration-300 hover:scale-105">
//                 <h2 className="text-3xl font-bold text-white mb-6 text-center">
//                     {imagenItem ? 'Editar Imagen' : 'Añadir Nueva Imagen'}
//                 </h2>

//                 {formError && (
//                     <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
//                         {formError}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     <div>
//                         <label htmlFor="nombre_archivo" className="block text-gray-300 text-lg font-semibold mb-2">Nombre de Archivo</label>
//                         <input
//                             type="text"
//                             id="nombre_archivo"
//                             value={nombre_archivo}
//                             onChange={(e) => setNombreArchivo(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="url_imagen" className="block text-gray-300 text-lg font-semibold mb-2">URL de Imagen</label>
//                         <input
//                             type="url"
//                             id="url_imagen"
//                             value={url_imagen}
//                             onChange={(e) => setUrlImagen(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             required
//                             disabled={isSubmitting}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="descripcion" className="block text-gray-300 text-lg font-semibold mb-2">Descripción (Opcional)</label>
//                         <textarea
//                             id="descripcion"
//                             value={descripcion}
//                             onChange={(e) => setDescripcion(e.target.value)}
//                             rows="3"
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             disabled={isSubmitting}
//                         ></textarea>
//                     </div>
//                     <div>
//                         <label htmlFor="id_galeria" className="block text-gray-300 text-lg font-semibold mb-2">Asignar a Galería (Opcional)</label>
//                         <select
//                             id="id_galeria"
//                             value={id_galeria}
//                             onChange={(e) => setIdGaleria(e.target.value)}
//                             className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             disabled={isSubmitting}
//                         >
//                             <option value="">-- Sin Galería --</option>
//                             {availableGalerias.map(galeria => (
//                                 <option key={galeria.id_galeria} value={galeria.id_galeria}>
//                                     {galeria.nombre_galeria}
//                                 </option>
//                             ))}
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
//                             {isSubmitting ? 'Guardando...' : (imagenItem ? 'Guardar Cambios' : 'Crear Imagen')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default ImagenFormModal;