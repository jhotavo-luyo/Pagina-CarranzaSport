// src/components/ui/ConfirmationModal.jsx
// Componente de modal de confirmación reutilizable.

import React from 'react';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#00000088]  bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#101828f1] rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700 animate-scaleIn">
                <h3 className="text-xl font-bold text-white mb-4">Confirmación</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-3 " >
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-500 transition duration-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition duration-300"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
