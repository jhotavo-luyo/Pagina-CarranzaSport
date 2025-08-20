import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, EnvelopeIcon, UserIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const ContactFormModal = ({ isOpen, onClose, item, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre_completo: '',
        email: '',
        telefono: '',
        mensaje_usuario: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Pre-fill message if an item (repuesto or servicio) is provided
            if (item) {
                const isRepuesto = !!item.nombre_repuesto;
                const message = isRepuesto
                    ? `Hola, estoy interesado/a en el repuesto "${item.nombre_repuesto}" (SKU: ${item.codigo_sku || 'N/A'}). ¿Podrían darme más información?`
                    : `Hola, estoy interesado/a en el servicio "${item.nombre_servicio}". Me gustaría agendar una cita.`;

                setFormData(prev => ({
                    ...prev,
                    mensaje_usuario: message
                }));
            }
        } else {
            // Reset form when modal closes
            setFormData({
                nombre_completo: '',
                email: '',
                telefono: '',
                mensaje_usuario: '',
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre es requerido.';
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El formato del email es inválido.';
        }
        if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido.';
        if (!formData.mensaje_usuario.trim()) newErrors.mensaje_usuario = 'El mensaje es requerido.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            // The onSuccess prop will handle the API call and subsequent actions
            await onSuccess(formData);
        } catch (error) {
            setErrors({ api: error.message || 'Ocurrió un error. Inténtelo de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isRepuesto = !!item?.nombre_repuesto;
    const modalTitle = isRepuesto ? 'Contactar para Comprar' : 'Agendar Cita';
    const itemLabel = isRepuesto ? 'Repuesto' : 'Servicio';
    const itemName = item?.nombre_repuesto || item?.nombre_servicio;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[#00000055] bg-opacity-75 flex justify-center items-center z-[60] p-4 animate-fadeIn" onClick={onClose}>
            <div
                className="bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-gray-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{modalTitle}</h2>
                            <p className="text-sm text-gray-400">{itemLabel}: {itemName}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {errors.api && (
                        <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-md mb-4 text-sm">
                            {errors.api}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nombre Completo, Email, Teléfono y Mensaje (código de campos omitido por brevedad) */}
                        <div>
                            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-500" /></span>
                                <input type="text" name="nombre_completo" id="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${errors.nombre_completo ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                            </div>
                            {errors.nombre_completo && <p className="text-red-400 text-xs mt-1">{errors.nombre_completo}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><EnvelopeIcon className="h-5 w-5 text-gray-500" /></span>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-500" /></span>
                                <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange} className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${errors.telefono ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                            </div>
                            {errors.telefono && <p className="text-red-400 text-xs mt-1">{errors.telefono}</p>}
                        </div>

                        <div>
                            <label htmlFor="mensaje_usuario" className="block text-sm font-medium text-gray-300 mb-1">Mensaje</label>
                            <div className="relative">
                                <span className="absolute top-3 left-0 flex items-center pl-3"><ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" /></span>
                                <textarea name="mensaje_usuario" id="mensaje_usuario" rows="4" value={formData.mensaje_usuario} onChange={handleChange} className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${errors.mensaje_usuario ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}></textarea>
                            </div>
                            {errors.mensaje_usuario && <p className="text-red-400 text-xs mt-1">{errors.mensaje_usuario}</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar y Contactar por WhatsApp'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ContactFormModal;
