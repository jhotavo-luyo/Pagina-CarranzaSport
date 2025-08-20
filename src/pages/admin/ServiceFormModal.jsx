// src/pages/admin/ServiceFormModal.jsx
// Este componente es un modal para crear o editar servicios.
// Incluye un selector de categoría.
import React, { useState, useEffect } from 'react';
import { createService, updateService } from '../../api/servicesApi';

const ServiceFormModal = ({ isOpen, onClose, onSave, serviceItem = null, categories = [] }) => {
    const [id_categoria_servicio, setIdCategoriaServicio] = useState('');
    const [nombre_servicio, setNombreServicio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio_referencia, setPrecioReferencia] = useState('');
    const [estado, setEstado] = useState('activo');
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (serviceItem) {
            setIdCategoriaServicio(serviceItem.id_categoria_servicio || '');
            setNombreServicio(serviceItem.nombre_servicio || '');
            setDescripcion(serviceItem.descripcion || '');
            setPrecioReferencia(serviceItem.precio_referencia !== null ? serviceItem.precio_referencia.toString() : '');
            setEstado(serviceItem.estado || 'activo');
        } else {
            setIdCategoriaServicio('');
            setNombreServicio('');
            setDescripcion('');
            setPrecioReferencia('');
            setEstado('activo');
        }
        setFormError(null);
        setIsSubmitting(false);
    }, [serviceItem, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        // Validaciones básicas
        if (!nombre_servicio || precio_referencia === '' || isNaN(parseFloat(precio_referencia)) || parseFloat(precio_referencia) < 0) {
            setFormError('El nombre del servicio y un precio de referencia válido son requeridos.');
            setIsSubmitting(false);
            return;
        }

        const serviceData = {
            id_categoria_servicio: id_categoria_servicio || null, // Permite null si no se selecciona categoría
            nombre_servicio,
            descripcion: descripcion || null,
            precio_referencia: parseFloat(precio_referencia),
            estado,
        };

        try {
            if (serviceItem) {
                await updateService(serviceItem.id_servicio, serviceData);
            } else {
                await createService(serviceData);
            }
            onSave();
        } catch (err) {
            setFormError(err.message || 'Error al guardar el servicio.');
            console.error("Error saving service:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#] flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-[#1e2939d7] bg-opacity-80 backdrop-filter backdrop-blur-md border border-gray-700
                        rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                
                <div className="p-6 sm:p-8 overflow-y-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    {serviceItem ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                </h2>

                {formError && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-md mb-4 text-sm text-center">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nombre_servicio" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Nombre del Servicio</label>
                        <input
                            type="text"
                            id="nombre_servicio"
                            value={nombre_servicio}
                            onChange={(e) => setNombreServicio(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Descripción</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="precio_referencia" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Precio de Referencia</label>
                        <input
                            type="number"
                            id="precio_referencia"
                            value={precio_referencia}
                            onChange={(e) => setPrecioReferencia(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            step="0.01" // Permite decimales
                            min="0" // No permite precios negativos
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="id_categoria_servicio" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Categoría</label>
                        <select
                            id="id_categoria_servicio"
                            value={id_categoria_servicio}
                            onChange={(e) => setIdCategoriaServicio(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="">-- Seleccionar Categoría --</option>
                            {categories.map(cat => (
                                <option key={cat.id_categoria_servicio} value={cat.id_categoria_servicio}>
                                    {cat.nombre_categoria}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Estado</label>
                        <select
                            id="estado"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto bg-gray-600 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-orange-600 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (serviceItem ? 'Guardar Cambios' : 'Crear Servicio')}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default ServiceFormModal;