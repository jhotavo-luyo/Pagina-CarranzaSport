// src/pages/admin/TestimonioFormModal.jsx
// Este componente es un modal para crear o editar testimonios.
import React, { useState, useEffect } from 'react';
import { createTestimonio, updateTestimonio } from '../../api/testimoniosApi';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TestimonioFormModal = ({ isOpen, onClose, onSave, testimonioItem = null }) => {
    const [nombre_cliente, setNombreCliente] = useState('');
    const [comentario, setComentario] = useState('');
    const [calificacion, setCalificacion] = useState(''); // Puede ser string para input type="number"
    const [aprobado, setAprobado] = useState(false); // Por defecto no aprobado al crear
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (testimonioItem) {
            setNombreCliente(testimonioItem.nombre_cliente || '');
            setComentario(testimonioItem.comentario || '');
            setCalificacion(testimonioItem.calificacion !== null ? testimonioItem.calificacion.toString() : '');
            setAprobado(!!testimonioItem.aprobado); // Convertir 0/1 a booleano
        } else {
            setNombreCliente('');
            setComentario('');
            setCalificacion('');
            setAprobado(false);
        }
        setErrors({});
        setIsSubmitting(false);
    }, [testimonioItem, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!nombre_cliente.trim()) newErrors.nombre_cliente = 'El nombre del cliente es requerido.';
        if (!comentario.trim()) newErrors.comentario = 'El comentario es requerido.';
        
        const calificacionNum = parseFloat(calificacion);
        if (calificacion !== '' && (isNaN(calificacionNum) || calificacionNum < 1 || calificacionNum > 5)) {
            newErrors.calificacion = 'La calificación debe ser un número entre 1 y 5.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.warn('Por favor, corrija los errores en el formulario.');
            return;
        }
        setIsSubmitting(true);

        const testimonioData = {
            nombre_cliente,
            comentario,
            calificacion: calificacion !== '' ? parseFloat(calificacion) : null,
            aprobado,
        };

        try {
            if (testimonioItem) {
                await updateTestimonio(testimonioItem.id_testimonio, testimonioData);
            } else {
                await createTestimonio(testimonioData);
            }
            onSave();
        } catch (err) {
            setErrors({ api: err.message || 'Error al guardar el testimonio.' });
            console.error("Error saving testimonio:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-[#1e2939d7] bg-opacity-80 backdrop-filter backdrop-blur-md border border-gray-700
                        rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8">
                    {/* Cabecera del Modal */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">
                            {testimonioItem ? 'Editar Testimonio' : 'Crear Nuevo Testimonio'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {errors.api && (
                        <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-md mb-4 text-sm text-center">
                            {errors.api}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="nombre_cliente" className="block text-sm font-medium text-gray-300 mb-1">Nombre del Cliente</label>
                            <input
                                type="text"
                                id="nombre_cliente"
                                value={nombre_cliente}
                                onChange={(e) => setNombreCliente(e.target.value)}
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border ${errors.nombre_cliente ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                disabled={isSubmitting}
                            />
                            {errors.nombre_cliente && <p className="text-red-400 text-xs mt-1">{errors.nombre_cliente}</p>}
                        </div>
                        <div>
                            <label htmlFor="comentario" className="block text-sm font-medium text-gray-300 mb-1">Comentario</label>
                            <textarea
                                id="comentario"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                rows="4"
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border ${errors.comentario ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                disabled={isSubmitting}
                            ></textarea>
                            {errors.comentario && <p className="text-red-400 text-xs mt-1">{errors.comentario}</p>}
                        </div>
                        <div>
                            <label htmlFor="calificacion" className="block text-sm font-medium text-gray-300 mb-1">Calificación (1-5)</label>
                            <input
                                type="number"
                                id="calificacion"
                                value={calificacion}
                                onChange={(e) => setCalificacion(e.target.value)}
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border ${errors.calificacion ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                min="1"
                                max="5"
                                step="1"
                                disabled={isSubmitting}
                            />
                            {errors.calificacion && <p className="text-red-400 text-xs mt-1">{errors.calificacion}</p>}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="aprobado"
                                checked={aprobado}
                                onChange={(e) => setAprobado(e.target.checked)}
                                className="h-5 w-5 text-primary rounded border-gray-600 focus:ring-primary bg-gray-700"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="aprobado" className="ml-2 text-gray-300 text-base font-semibold">Aprobado</label>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto bg-gray-600 text-white py-2 px-4 rounded-lg text-base font-semibold shadow-md hover:bg-gray-700 transition duration-300"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-primary text-white bg-orange-800 py-2 px-4 rounded-lg text-base font-semibold shadow-md hover:bg-orange-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Guardando...' : (testimonioItem ? 'Guardar Cambios' : 'Crear Testimonio')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TestimonioFormModal;