// src/pages/admin/ClienteFormModal.jsx
// Este componente es un modal para crear o editar clientes.
import React, { useState, useEffect } from 'react';
import { createCliente, updateCliente } from '../../api/clientesApi';
import { toast } from 'react-toastify'; // Importa toast para notificaciones
import { XMarkIcon } from '@heroicons/react/24/outline';

const ClienteFormModal = ({ isOpen, onClose, onSave, clienteItem = null }) => {
    const [nombre_completo, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (clienteItem) {
            setNombreCompleto(clienteItem.nombre_completo || '');
            setEmail(clienteItem.email || '');
            setTelefono(clienteItem.telefono || '');
            setDireccion(clienteItem.direccion || '');
        } else {
            setNombreCompleto('');
            setEmail('');
            setTelefono('');
            setDireccion('');
        }
        setErrors({});
        setIsSubmitting(false);
    }, [clienteItem, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!nombre_completo.trim()) newErrors.nombre_completo = 'El nombre completo es requerido.';
        if (!email.trim()) {
            newErrors.email = 'El email es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'El formato del email es inválido.';
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
        setErrors({});

        const clienteData = {
            nombre_completo,
            email,
            telefono: telefono || null,
            direccion: direccion || null,
        };

        try {
            if (clienteItem) {
                await updateCliente(clienteItem.id_cliente, clienteData);
                toast.success('Cliente actualizado exitosamente.');
            } else {
                await createCliente(clienteData);
                toast.success('Cliente creado exitosamente.');
            }
            onSave(); // Llama a onSave para recargar la lista en el componente padre
        } catch (err) {
            setErrors({ api: err.message || 'Error al guardar el cliente.' });
            console.error("Error saving client:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-[#1e2939d7] bg-opacity-80 backdrop-filter backdrop-blur-md  border border-gray-700
                         rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* --- Cabecera del Modal --- */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                            {clienteItem ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* --- Formulario --- */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errors.api && (
                            <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-md text-sm text-center">
                                {errors.api}
                            </div>
                        )}

                        <div>
                            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                            <input type="text" id="nombre_completo" value={nombre_completo} onChange={(e) => setNombreCompleto(e.target.value)} disabled={isSubmitting} aria-invalid={!!errors.nombre_completo} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border ${errors.nombre_completo ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                            {errors.nombre_completo && <p className="text-red-400 text-xs mt-1">{errors.nombre_completo}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} aria-invalid={!!errors.email} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                            <input type="text" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                            <textarea id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} rows="3" disabled={isSubmitting} className="w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                        </div>

                        {/* --- Botones de Acción --- */}
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
                                {isSubmitting ? 'Guardando...' : (clienteItem ? 'Guardar Cambios' : 'Crear Cliente')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClienteFormModal;
