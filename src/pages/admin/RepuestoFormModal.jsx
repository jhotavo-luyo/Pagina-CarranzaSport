// src/pages/admin/RepuestoFormModal.jsx
// Este componente es un modal para crear o editar repuestos.
// Incluye un selector de categoría y otros campos específicos de repuestos.
import React, { useState, useEffect } from 'react';
import { createRepuesto, updateRepuesto } from '../../api/repuestosApi';

const RepuestoFormModal = ({ isOpen, onClose, onSave, repuestoItem = null, categories = [] }) => {
    const [id_categoria_repuesto, setIdCategoriaRepuesto] = useState('');
    const [nombre_repuesto, setNombreRepuesto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo_vehiculo_compatible, setModeloVehiculoCompatible] = useState('');
    const [precio_unitario, setPrecioUnitario] = useState('');
    const [stock_disponible, setStockDisponible] = useState('');
    const [codigo_sku, setCodigoSku] = useState('');
    const [estado, setEstado] = useState('disponible'); // Estado inicial por defecto
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (repuestoItem) {
            setIdCategoriaRepuesto(repuestoItem.id_categoria_repuesto || '');
            setNombreRepuesto(repuestoItem.nombre_repuesto || '');
            setDescripcion(repuestoItem.descripcion || '');
            setMarca(repuestoItem.marca || '');
            setModeloVehiculoCompatible(repuestoItem.modelo_vehiculo_compatible || '');
            setPrecioUnitario(repuestoItem.precio_unitario !== null ? repuestoItem.precio_unitario.toString() : '');
            setStockDisponible(repuestoItem.stock_disponible !== null ? repuestoItem.stock_disponible.toString() : '');
            setCodigoSku(repuestoItem.codigo_sku || '');
            setEstado(repuestoItem.estado || 'disponible');
        } else {
            setIdCategoriaRepuesto('');
            setNombreRepuesto('');
            setDescripcion('');
            setMarca('');
            setModeloVehiculoCompatible('');
            setPrecioUnitario('');
            setStockDisponible('');
            setCodigoSku('');
            setEstado('disponible');
        }
        setFormError(null);
        setIsSubmitting(false);
    }, [repuestoItem, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        // Validaciones básicas de frontend
        if (!nombre_repuesto || precio_unitario === '' || isNaN(parseFloat(precio_unitario)) || parseFloat(precio_unitario) < 0 || stock_disponible === '' || isNaN(parseInt(stock_disponible)) || parseInt(stock_disponible) < 0) {
            setFormError('Nombre del repuesto, precio unitario (positivo) y stock disponible (no negativo) son requeridos.');
            setIsSubmitting(false);
            return;
        }

        const repuestoData = {
            id_categoria_repuesto: id_categoria_repuesto || null,
            nombre_repuesto,
            descripcion: descripcion || null,
            marca: marca || null,
            modelo_vehiculo_compatible: modelo_vehiculo_compatible || null,
            precio_unitario: parseFloat(precio_unitario),
            stock_disponible: parseInt(stock_disponible),
            codigo_sku: codigo_sku || null, // SKU puede ser null si el backend lo permite y no se provee
            estado,
        };

        try {
            if (repuestoItem) {
                await updateRepuesto(repuestoItem.id_repuesto, repuestoData);
            } else {
                await createRepuesto(repuestoData);
            }
            onSave();
        } catch (err) {
            setFormError(err.message || 'Error al guardar el repuesto.');
            console.error("Error saving repuesto:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700
                        rounded-xl shadow-2xl p-8 w-full max-w-2xl transform transition-transform duration-300 hover:scale-105">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {repuestoItem ? 'Editar Repuesto' : 'Crear Nuevo Repuesto'}
                </h2>

                {formError && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="nombre_repuesto" className="block text-gray-300 text-lg font-semibold mb-2">Nombre del Repuesto</label>
                        <input
                            type="text"
                            id="nombre_repuesto"
                            value={nombre_repuesto}
                            onChange={(e) => setNombreRepuesto(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="id_categoria_repuesto" className="block text-gray-300 text-lg font-semibold mb-2">Categoría</label>
                        <select
                            id="id_categoria_repuesto"
                            value={id_categoria_repuesto}
                            onChange={(e) => setIdCategoriaRepuesto(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        >
                            <option value="">-- Seleccionar Categoría --</option>
                            {categories.map(cat => (
                                <option key={cat.id_categoria_repuesto} value={cat.id_categoria_repuesto}>
                                    {cat.nombre_categoria}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="block text-gray-300 text-lg font-semibold mb-2">Descripción</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="marca" className="block text-gray-300 text-lg font-semibold mb-2">Marca</label>
                        <input
                            type="text"
                            id="marca"
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="modelo_vehiculo_compatible" className="block text-gray-300 text-lg font-semibold mb-2">Modelo Vehículo Compatible</label>
                        <input
                            type="text"
                            id="modelo_vehiculo_compatible"
                            value={modelo_vehiculo_compatible}
                            onChange={(e) => setModeloVehiculoCompatible(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="precio_unitario" className="block text-gray-300 text-lg font-semibold mb-2">Precio Unitario</label>
                        <input
                            type="number"
                            id="precio_unitario"
                            value={precio_unitario}
                            onChange={(e) => setPrecioUnitario(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            step="0.01"
                            min="0"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="stock_disponible" className="block text-gray-300 text-lg font-semibold mb-2">Stock Disponible</label>
                        <input
                            type="number"
                            id="stock_disponible"
                            value={stock_disponible}
                            onChange={(e) => setStockDisponible(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            min="0"
                            step="1"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="codigo_sku" className="block text-gray-300 text-lg font-semibold mb-2">Código SKU</label>
                        <input
                            type="text"
                            id="codigo_sku"
                            value={codigo_sku}
                            onChange={(e) => setCodigoSku(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                            <option value="disponible">Disponible</option>
                            <option value="agotado">Agotado</option>
                            <option value="descontinuado">Descontinuado</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6 md:col-span-2">
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
                            className="bg-primary text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (repuestoItem ? 'Guardar Cambios' : 'Crear Repuesto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RepuestoFormModal;