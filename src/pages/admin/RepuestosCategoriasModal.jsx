// src/pages/admin/RepuestosCategoriasModal.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getAllRepuestoCategories,
    createRepuestoCategory,
    updateRepuestoCategory,
    deleteRepuestoCategory,
} from '../../api/categoriaRepuestosApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';

const RepuestosCategoriasModal = ({ isOpen, onClose }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para el formulario (crear o editar)
    const [editingCategory, setEditingCategory] = useState(null); // null para crear, objeto para editar
    const [formData, setFormData] = useState({ nombre_categoria: '', descripcion: '' });

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllRepuestoCategories();
            setCategorias(data);
        } catch (err) {
            setError(err.message);
            toast.error(`Error al cargar categorías: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (categoria) => {
        setEditingCategory(categoria);
        setFormData({
            nombre_categoria: categoria.nombre_categoria,
            descripcion: categoria.descripcion || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setFormData({ nombre_categoria: '', descripcion: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre_categoria.trim()) {
            toast.error('El nombre de la categoría es requerido.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateRepuestoCategory(editingCategory.id_categoria_repuesto, formData);
                toast.success('Categoría actualizada exitosamente.');
            } else {
                await createRepuestoCategory(formData);
                toast.success('Categoría creada exitosamente.');
            }
            handleCancelEdit();
            await fetchCategories();
        } catch (err) {
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id_categoria_repuesto) => {
        if (window.confirm('¿Estás seguro? Si la categoría tiene repuestos asociados, no se podrá eliminar.')) {
            try {
                await deleteRepuestoCategory(id_categoria_repuesto);
                toast.success('Categoría eliminada.');
                await fetchCategories();
            } catch (err) {
                toast.error(`Error al eliminar: ${err.message}`);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0000004b] bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
            <div
                className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg border border-gray-700
                           rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Gestionar Categorías de Repuestos</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-7 w-7" /></button>
                </div>

                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">{editingCategory ? 'Editando Categoría' : 'Crear Nueva Categoría'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="nombre_categoria" value={formData.nombre_categoria} onChange={handleInputChange} placeholder="Nombre de la categoría" className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <input type="text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Descripción (opcional)" className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                        {editingCategory && (<button type="button" onClick={handleCancelEdit} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition">Cancelar Edición</button>)}
                        <button type="submit" disabled={isSubmitting} className="bg-primary text-white py-2 px-5 rounded-lg hover:bg-orange-600 transition disabled:opacity-50">{isSubmitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}</button>
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? (<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>) : error ? (<p className="text-red-400 text-center">{error}</p>) : (
                        <ul className="divide-y divide-gray-700">
                            {categorias.map(cat => (
                                <li key={cat.id_categoria_repuesto} className="py-3 flex justify-between items-center">
                                    <div><p className="font-semibold text-white">{cat.nombre_categoria}</p><p className="text-sm text-gray-400">{cat.descripcion || 'Sin descripción'}</p></div>
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleEditClick(cat)} className="text-blue-400 hover:text-blue-600" title="Editar"><PencilIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDelete(cat.id_categoria_repuesto)} className="text-red-400 hover:text-red-600" title="Eliminar"><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RepuestosCategoriasModal;
