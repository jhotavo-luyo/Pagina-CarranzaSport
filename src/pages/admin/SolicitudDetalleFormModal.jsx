// src/pages/admin/SolicitudDetalleFormModal.jsx
// Este componente es un modal para crear o editar detalles de solicitud.
import React, { useState, useEffect } from 'react';
import { createSolicitudDetalle, updateSolicitudDetalle } from '../../api/solicitudDetalleApi';
import { toast } from 'react-toastify';

const SolicitudDetalleFormModal = ({ isOpen, onClose, onSave, detalleItem = null, idSolicitud, servicios = [], repuestos = [] }) => {
    // Estado unificado para los campos del formulario
    const [formData, setFormData] = useState({
        id_servicio: '',
        id_repuesto: '',
        cantidad: '1',
        observaciones: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (detalleItem) {
                setFormData({
                    id_servicio: detalleItem.id_servicio || '',
                    id_repuesto: detalleItem.id_repuesto || '',
                    cantidad: detalleItem.cantidad !== null ? detalleItem.cantidad.toString() : '1',
                    observaciones: detalleItem.observaciones || '',
                });
            } else {
                // Resetear para un nuevo detalle
                setFormData({
                    id_servicio: '',
                    id_repuesto: '',
                    cantidad: '1',
                    observaciones: '',
                });
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [detalleItem, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Lógica para asegurar que solo uno (servicio o repuesto) esté seleccionado
        if (name === 'id_servicio' && value) {
            setFormData(prev => ({ ...prev, id_servicio: value, id_repuesto: '' }));
        } else if (name === 'id_repuesto' && value) {
            setFormData(prev => ({ ...prev, id_repuesto: value, id_servicio: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Limpiar errores al interactuar
        if (errors[name] || errors.item) {
            setErrors(prev => ({ ...prev, [name]: null, item: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.id_servicio && !formData.id_repuesto) {
            newErrors.item = 'Debe seleccionar un servicio o un repuesto.';
        }

        const cantidadNum = parseInt(formData.cantidad, 10);
        if (!formData.cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
            newErrors.cantidad = 'La cantidad debe ser un número entero positivo.';
        }

        if (formData.observaciones && formData.observaciones.length > 500) {
            newErrors.observaciones = 'Las observaciones no pueden exceder los 500 caracteres.';
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

        const detalleData = {
            id_solicitud: idSolicitud,
            id_servicio: formData.id_servicio === '' ? null : parseInt(formData.id_servicio),
            id_repuesto: formData.id_repuesto === '' ? null : parseInt(formData.id_repuesto),
            cantidad: parseInt(formData.cantidad, 10),
            observaciones: formData.observaciones || null,
        };

        try {
            if (detalleItem) {
                await updateSolicitudDetalle(detalleItem.id_solicitud_detalle, detalleData);
                toast.success('Detalle actualizado exitosamente.');
            } else {
                await createSolicitudDetalle(detalleData);
                toast.success('Detalle añadido exitosamente.');
            }
            onSave();
        } catch (err) {
            setErrors({ api: err.message || 'Error al guardar el detalle.' });
            console.error("Error saving detalle de solicitud:", err);
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
                <h2 className="text-2xl sm:text-3xl font-bold  text-white mb-6 text-center">
                    {detalleItem ? 'Editar Detalle de Solicitud' : `Añadir Detalle a Solicitud #${idSolicitud}`}
                </h2>

                {errors.api && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="id_servicio" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Servicio</label>
                        <select
                            id="id_servicio"
                            name="id_servicio"
                            value={formData.id_servicio}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.item ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        >
                            <option value="">-- Seleccionar Servicio --</option>
                            {servicios.map(servicio => (
                                <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                    {servicio.nombre_servicio}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="id_repuesto" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Repuesto</label>
                        <select
                            id="id_repuesto"
                            name="id_repuesto"
                            value={formData.id_repuesto}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.item ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        >
                            <option value="">-- Seleccionar Repuesto --</option>
                            {repuestos.map(repuesto => (
                                <option key={repuesto.id_repuesto} value={repuesto.id_repuesto}>
                                    {repuesto.nombre_repuesto} ({repuesto.marca})
                                </option>
                            ))}
                        </select>
                        {errors.item && <p className="text-red-400 text-sm mt-1">{errors.item}</p>}
                    </div>
                    <div>
                        <label htmlFor="cantidad" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Cantidad</label>
                        <input
                            type="number"
                            id="cantidad"
                            name="cantidad"
                            value={formData.cantidad}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.cantidad ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            min="1"
                            step="1"
                            required
                            disabled={isSubmitting}
                        />
                        {errors.cantidad && <p className="text-red-400 text-sm mt-1">{errors.cantidad}</p>}
                    </div>
                    <div>
                        <label htmlFor="observaciones" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Observaciones (Opcional)</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.observaciones ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.observaciones && <p className="text-red-400 text-sm mt-1">{errors.observaciones}</p>}
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
                            className="w-full sm:w-auto bg-orange-600 text-white py-2 px-5 rounded-lg text-base font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (detalleItem ? 'Guardar Cambios' : 'Añadir Detalle')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitudDetalleFormModal;
