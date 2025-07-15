


import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Doctor } from '../types';
import toast from 'react-hot-toast';
import { useActionsContext, useUIContext } from '../context';

const DoctorForm: React.FC = () => {
    const { isDoctorModalOpen: isOpen, editingDoctor: initialData, closeDoctorModal: onClose } = useUIContext();
    const { saveDoctor: onSave } = useActionsContext();

    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [crm, setCrm] = useState('');
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";


    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSpecialty(initialData.specialty);
            setCrm(initialData.crm);
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setName('');
        setSpecialty('');
        setCrm('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && specialty && crm) {
            onSave({ name, specialty, crm }, initialData?.id);
            resetForm();
            onClose();
        } else {
            toast.error('Por favor, preencha todos os campos.');
        }
    };

    const renderFooter = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Cancelar
            </button>
            <button type="submit" form="doctor-form" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
                {initialData ? 'Salvar Alterações' : 'Salvar Médico'}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Médico" : "Adicionar Novo Médico"} size="lg" footer={renderFooter}>
            <form id="doctor-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Médico</label>
                    <input type="text" id="doc-name" value={name} onChange={e => setName(e.target.value)} required 
                           className={inputClasses}/>
                </div>
                 <div>
                    <label htmlFor="doc-specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Especialidade</label>
                    <input type="text" id="doc-specialty" value={specialty} onChange={e => setSpecialty(e.target.value)} required
                            className={inputClasses}/>
                </div>
                <div>
                    <label htmlFor="doc-crm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CRM</label>
                    <input type="text" id="doc-crm" value={crm} onChange={e => setCrm(e.target.value)} required 
                           className={inputClasses}/>
                </div>
            </form>
        </Modal>
    );
}

export default DoctorForm;
