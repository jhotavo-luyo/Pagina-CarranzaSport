// src/pages/admin/GaleriaFormModal.jsx
// Este componente es un modal para crear o editar galerías.
import React, { useState, useEffect } from 'react';
import { createGaleria, updateGaleria } from '../../api/galeriasApi';

const GaleriaFormModal = ({ isOpen, onClose, onSave, galeriaItem = null }) => {
    const [nombre_galeria, setNombreGaleria] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [errors, setErrors] = useState({}); // Estado para errores de validación por campo
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (galeriaItem) {
                setNombreGaleria(galeriaItem.nombre_galeria || '');
                setDescripcion(galeriaItem.descripcion || '');
            } else {
                setNombreGaleria('');
                setDescripcion('');
            }
            setErrors({}); // Limpiar errores al abrir el modal
            setIsSubmitting(false);
        }
    }, [galeriaItem, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!nombre_galeria.trim()) {
            newErrors.nombre_galeria = 'El nombre de la galería es requerido.';
        } else if (nombre_galeria.length > 100) {
            newErrors.nombre_galeria = 'El nombre no puede exceder los 100 caracteres.';
        }

        if (descripcion && descripcion.length > 500) {
            newErrors.descripcion = 'La descripción no puede exceder los 500 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return; // Detiene el envío si hay errores de validación
        }

        setIsSubmitting(true);

        const galeriaData = {
            nombre_galeria,
            descripcion: descripcion || null,
        };

        let apiError = null;
        try {
            if (galeriaItem) {
                await updateGaleria(galeriaItem.id_galeria, galeriaData);
            } else {
                await createGaleria(galeriaData);
            }
            onSave();
        } catch (err) {
            // Maneja errores de la API, como nombres duplicados
            apiError = err.message || 'Error al guardar la galería.';
            setErrors({ api: apiError });
            console.error("Error saving galeria:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        // 1. Añadido onClick={onClose} al overlay para cerrar el modal al hacer clic fuera.
        <div className="fixed inset-0 bg-[#0302028c] bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
            {/* 2. Añadido onClick para detener la propagación y evitar que el modal se cierre al hacer clic dentro de él.
                3. Las clases max-h-[90vh] y overflow-y-auto ya aseguran el scroll cuando el contenido es muy alto. */}
            <div className="bg-[#1018289d] bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-700
                        rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    {galeriaItem ? 'Editar Galería' : 'Crear Nueva Galería'}
                </h2>

                {errors.api && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nombre_galeria" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Nombre de Galería</label>
                        <input
                            type="text"
                            id="nombre_galeria"
                            name="nombre_galeria"
                            value={nombre_galeria}
                            onChange={(e) => {
                                setNombreGaleria(e.target.value);
                                if (errors.nombre_galeria) setErrors(prev => ({ ...prev, nombre_galeria: null }));
                            }}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.nombre_galeria ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.nombre_galeria && <p className="text-red-400 text-sm mt-1">{errors.nombre_galeria}</p>}
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Descripción (Opcional)</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={descripcion}
                            onChange={(e) => {
                                setDescripcion(e.target.value);
                                if (errors.descripcion) setErrors(prev => ({ ...prev, descripcion: null }));
                            }}
                            rows="3"
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.descripcion ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.descripcion && <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>}
                    </div>

                    {/* Botones responsivos: se apilan en móvil y se alinean en escritorio */}
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
                            {isSubmitting ? 'Guardando...' : (galeriaItem ? 'Guardar Cambios' : 'Crear Galería')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GaleriaFormModal;