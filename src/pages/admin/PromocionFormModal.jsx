// src/pages/admin/PromocionFormModal.jsx
// Este componente es un modal para crear o editar promociones.
import React, { useState, useEffect } from 'react';
import { createPromocion, updatePromocion } from '../../api/promocionesApi';

const PromocionFormModal = ({ isOpen, onClose, onSave, promocionItem = null }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha_inicio, setFechaInicio] = useState('');
    const [fecha_fin, setFechaFin] = useState('');
    const [imagen_promocion, setImagenPromocion] = useState(''); // URL de la imagen
    const [estado, setEstado] = useState('activa'); // Estado por defecto
    const [descuento, setDescuento] = useState('');
    const [categoria, setCategoria] = useState('');
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados permitidos para la promoción
    const estadosPermitidos = ['activa', 'inactiva', 'finalizada'];

    // Categorías permitidas para la promoción
    const categoriasPermitidas = ['repuestos', 'servicios', 'otros'];

    useEffect(() => {
        if (promocionItem) {
            setTitulo(promocionItem.titulo || '');
            setDescripcion(promocionItem.descripcion || '');
            // Formatear fechas para input type="date"
            setFechaInicio(promocionItem.fecha_inicio ? new Date(promocionItem.fecha_inicio).toISOString().split('T')[0] : '');
            setFechaFin(promocionItem.fecha_fin ? new Date(promocionItem.fecha_fin).toISOString().split('T')[0] : '');
            setImagenPromocion(promocionItem.imagen_promocion || '');
            setEstado(promocionItem.estado || 'activa');
            setDescuento(promocionItem.descuento || '');
            setCategoria(promocionItem.categoria || '');
        } else {
            setTitulo('');
            setDescripcion('');
            setFechaInicio('');
            setFechaFin('');
            setImagenPromocion('');
            setEstado('activa');
            setDescuento('');
            setCategoria('');
        }
        setFormError(null);
        setIsSubmitting(false);
    }, [promocionItem, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        // Validaciones básicas de frontend
        if (!titulo || !fecha_inicio) {
            setFormError('El título y la fecha de inicio son campos requeridos.');
            setIsSubmitting(false);
            return;
        }
        if (!estadosPermitidos.includes(estado)) {
            setFormError('Estado no válido.');
            setIsSubmitting(false);
            return;
        }

        // Validar fechas
        const inicio = new Date(fecha_inicio);
        const fin = fecha_fin ? new Date(fecha_fin) : null;

        if (isNaN(inicio.getTime())) {
            setFormError('Formato de Fecha de Inicio inválido.');
            setIsSubmitting(false);
            return;
        }
        if (fin && isNaN(fin.getTime())) {
            setFormError('Formato de Fecha de Fin inválido.');
            setIsSubmitting(false);
            return;
        }
        if (fin && inicio > fin) {
            setFormError('La Fecha de Fin no puede ser anterior a la Fecha de Inicio.');
            setIsSubmitting(false);
            return;
        }

        // Validación para el descuento
        if (descuento && (isNaN(parseFloat(descuento)) || descuento < 0 || descuento > 99.99)) {
            setFormError('El descuento debe ser un número entre 0.00 y 99.99.');
            setIsSubmitting(false);
            return;
        }

        const promocionData = {
            titulo,
            descripcion: descripcion || null,
            fecha_inicio,
            fecha_fin: fecha_fin || null,
            imagen_promocion: imagen_promocion || null,
            estado,
            descuento: descuento ? parseFloat(descuento) : 0.00,
            categoria: categoria || null,
        };

        try {
            if (promocionItem) {
                await updatePromocion(promocionItem.id_promocion, promocionData);
            } else {
                await createPromocion(promocionData);
            }
            onSave();
        } catch (err) {
            setFormError(err.message || 'Error al guardar la promoción.');
            console.error("Error saving promotion:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-[#1e2939d7] bg-opacity-80 backdrop-filter backdrop-blur-md border border-gray-700
                        rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {promocionItem ? 'Editar Promoción' : 'Crear Nueva Promoción'}
                </h2>

                {formError && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
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
                        <label htmlFor="descripcion" className="block text-gray-300 text-lg font-semibold mb-2">Descripción</label>
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
                        <label htmlFor="fecha_inicio" className="block text-gray-300 text-lg font-semibold mb-2">Fecha de Inicio</label>
                        <input
                            type="date"
                            id="fecha_inicio"
                            value={fecha_inicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="fecha_fin" className="block text-gray-300 text-lg font-semibold mb-2">Fecha de Fin (Opcional)</label>
                        <input
                            type="date"
                            id="fecha_fin"
                            value={fecha_fin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="imagen_promocion" className="block text-gray-300 text-lg font-semibold mb-2">URL de Imagen</label>
                        <input
                            type="url"
                            id="imagen_promocion"
                            value={imagen_promocion}
                            onChange={(e) => setImagenPromocion(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="descuento" className="block text-gray-300 text-lg font-semibold mb-2">Descuento (%)</label>
                        <input
                            type="number"
                            id="descuento"
                            value={descuento}
                            onChange={(e) => setDescuento(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Ej: 15.00"
                            step="0.01"
                            min="0"
                            max="99.99"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="categoria" className="block text-gray-300 text-lg font-semibold mb-2">Categoría</label>
                        <select
                            id="categoria"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="">-- Seleccione una categoría --</option>
                            {categoriasPermitidas.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
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
                            {estadosPermitidos.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
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
                            {isSubmitting ? 'Guardando...' : (promocionItem ? 'Guardar Cambios' : 'Crear Promoción')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromocionFormModal;