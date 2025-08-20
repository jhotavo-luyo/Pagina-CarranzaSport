// src/pages/admin/SolicitudFormModal.jsx
// Este componente es un modal para crear o editar solicitudes.
import React, { useState, useEffect } from 'react';
import { createSolicitud, updateSolicitud } from '../../api/solicitudesApi';
import { toast } from 'react-toastify';

const SolicitudFormModal = ({ isOpen, onClose, onSave, solicitudItem = null, clientes = [] }) => {
    // Estado unificado para los campos del formulario
    const [formData, setFormData] = useState({
        id_cliente: '',
        tipo_solicitud: 'cotizacion',
        mensaje: '',
        estado_solicitud: 'pendiente',
        observaciones_internas: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tiposPermitidos = ['cotizacion', 'cita', 'consulta'];
    const estadosPermitidos = ['pendiente', 'en_proceso', 'completada', 'rechazada'];

    useEffect(() => {
        if (isOpen) {
            if (solicitudItem) {
                setFormData({
                    id_cliente: solicitudItem.id_cliente || '',
                    tipo_solicitud: solicitudItem.tipo_solicitud || 'cotizacion',
                    mensaje: solicitudItem.mensaje || '',
                    estado_solicitud: solicitudItem.estado_solicitud || 'pendiente',
                    observaciones_internas: solicitudItem.observaciones_internas || '',
                });
            } else {
                // Resetear para una nueva solicitud
                setFormData({
                    id_cliente: '',
                    tipo_solicitud: 'cotizacion',
                    mensaje: '',
                    estado_solicitud: 'pendiente',
                    observaciones_internas: '',
                });
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [solicitudItem, isOpen]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.id_cliente) {
            newErrors.id_cliente = 'Debe seleccionar un cliente.';
        }
        if (!formData.tipo_solicitud) {
            newErrors.tipo_solicitud = 'El tipo de solicitud es requerido.';
        }
        if (!formData.mensaje.trim()) {
            newErrors.mensaje = 'El mensaje es requerido.';
        } else if (formData.mensaje.length > 1000) {
            newErrors.mensaje = 'El mensaje no puede exceder los 1000 caracteres.';
        }
        if (!formData.estado_solicitud) {
            newErrors.estado_solicitud = 'El estado de la solicitud es requerido.';
        }
        if (formData.observaciones_internas && formData.observaciones_internas.length > 500) {
            newErrors.observaciones_internas = 'Las observaciones no pueden exceder los 500 caracteres.';
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

        const solicitudData = {
            ...formData,
            id_cliente: parseInt(formData.id_cliente, 10),
            observaciones_internas: formData.observaciones_internas || null,
        };

        try {
            if (solicitudItem) {
                await updateSolicitud(solicitudItem.id_solicitud, solicitudData);
                toast.success('Solicitud actualizada exitosamente.');
            } else {
                await createSolicitud(solicitudData);
                toast.success('Solicitud creada exitosamente.');
            }
            onSave();
        } catch (err) {
            setErrors({ api: err.message || 'Error al guardar la solicitud.' });
            console.error("Error saving solicitud:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#101828a0] scroll-none bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
            <div
                className="bg-[#101828a0] bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-700
                           rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    {solicitudItem ? 'Editar Solicitud' : 'Crear Nueva Solicitud'}
                </h2>

                {errors.api && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 ">
                    <div>
                        <label htmlFor="id_cliente" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Cliente</label>
                        <select
                            id="id_cliente"
                            name="id_cliente"
                            value={formData.id_cliente}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.id_cliente ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Seleccionar Cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                    {cliente.nombre_completo}
                                </option>
                            ))}
                        </select>
                        {errors.id_cliente && <p className="text-red-400 text-sm mt-1">{errors.id_cliente}</p>}
                    </div>
                    <div>
                        <label htmlFor="tipo_solicitud" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Tipo de Solicitud</label>
                        <select
                            id="tipo_solicitud"
                            name="tipo_solicitud"
                            value={formData.tipo_solicitud}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.tipo_solicitud ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        >
                            {tiposPermitidos.map(tipo => (
                                <option key={tipo} value={tipo}>
                                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                </option>
                            ))}
                        </select>
                        {errors.tipo_solicitud && <p className="text-red-400 text-sm mt-1">{errors.tipo_solicitud}</p>}
                    </div>
                    <div>
                        <label htmlFor="mensaje" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Mensaje</label>
                        <textarea
                            id="mensaje"
                            name="mensaje"
                            value={formData.mensaje}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.mensaje ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.mensaje && <p className="text-red-400 text-sm mt-1">{errors.mensaje}</p>}
                    </div>
                    <div>
                        <label htmlFor="estado_solicitud" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Estado de Solicitud</label>
                        <select
                            id="estado_solicitud"
                            name="estado_solicitud"
                            value={formData.estado_solicitud}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.estado_solicitud ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            required
                            disabled={isSubmitting}
                        >
                            {estadosPermitidos.map(estado => (
                                <option key={estado} value={estado}>
                                    {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        {errors.estado_solicitud && <p className="text-red-400 text-sm mt-1">{errors.estado_solicitud}</p>}
                    </div>
                    <div>
                        <label htmlFor="observaciones_internas" className="block text-gray-300 text-base sm:text-lg font-semibold mb-2">Observaciones Internas (Opcional)</label>
                        <textarea
                            id="observaciones_internas"
                            name="observaciones_internas"
                            value={formData.observaciones_internas}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md border ${errors.observaciones_internas ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.observaciones_internas && <p className="text-red-400 text-sm mt-1">{errors.observaciones_internas}</p>}
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
                            {isSubmitting ? 'Guardando...' : (solicitudItem ? 'Guardar Cambios' : 'Crear Solicitud')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitudFormModal;
