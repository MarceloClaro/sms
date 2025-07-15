


import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ProcedureType } from '../types';
import toast from 'react-hot-toast';
import { useActionsContext, useUIContext } from '../context';

const ProcedureTypeForm: React.FC = () => {
    const { isProcedureTypeModalOpen: isOpen, editingProcedureType: initialData, closeProcedureTypeModal: onClose } = useUIContext();
    const { saveProcedureType: onSave } = useActionsContext();

    const [name, setName] = useState('');
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setName('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onSave({ name }, initialData?.id);
            resetForm();
            onClose();
        } else {
            toast.error('Por favor, preencha o nome do tipo.');
        }
    };

    const renderFooter = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Cancelar
            </button>
            <button type="submit" form="procedure-type-form" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
                {initialData ? 'Salvar Alterações' : 'Salvar Tipo'}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Tipo de Procedimento" : "Adicionar Novo Tipo"} size="md" footer={renderFooter}>
            <form id="procedure-type-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="pt-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Tipo</label>
                    <input type="text" id="pt-name" value={name} onChange={e => setName(e.target.value)} required 
                           className={inputClasses}/>
                </div>
            </form>
        </Modal>
    );
}

export default ProcedureTypeForm;
