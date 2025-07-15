


import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { HealthCampaign, Procedure } from '../types';
import toast from 'react-hot-toast';
import { useActionsContext, useDataContext, useUIContext } from '../context';

const HealthCampaignForm: React.FC = () => {
    const { procedures: allProcedures } = useDataContext();
    const { isCampaignModalOpen: isOpen, editingCampaign: initialData, closeCampaignModal: onClose } = useUIContext();
    const { saveCampaign: onSave } = useActionsContext();

    const [name, setName] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [procedureIds, setProcedureIds] = useState<string[]>([]);
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setTargetAudience(initialData.targetAudience);
            setStartDate(initialData.startDate);
            setEndDate(initialData.endDate);
            setProcedureIds(initialData.procedureIds);
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setName('');
        setTargetAudience('');
        setStartDate('');
        setEndDate('');
        setProcedureIds([]);
    };

    const handleProcedureToggle = (id: string) => {
        setProcedureIds(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && targetAudience && startDate && endDate) {
            onSave({ name, targetAudience, startDate, endDate, procedureIds }, initialData?.id);
            resetForm();
            onClose();
        } else {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
        }
    };

    const renderFooter = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Cancelar
            </button>
            <button type="submit" form="campaign-form" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
                {initialData ? 'Salvar Alterações' : 'Salvar Campanha'}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Campanha" : "Criar Nova Campanha de Saúde"} size="2xl" footer={renderFooter}>
            <form id="campaign-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="camp-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Campanha</label>
                    <input type="text" id="camp-name" value={name} onChange={e => setName(e.target.value)} required 
                           className={inputClasses}/>
                </div>
                 <div>
                    <label htmlFor="camp-target" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Público-alvo</label>
                    <input type="text" id="camp-target" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} required
                            className={inputClasses}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="camp-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                        <input type="date" id="camp-start" value={startDate} onChange={e => setStartDate(e.target.value)} required 
                               className={inputClasses}/>
                    </div>
                    <div>
                        <label htmlFor="camp-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Término</label>
                        <input type="date" id="camp-end" value={endDate} onChange={e => setEndDate(e.target.value)} required 
                               className={inputClasses}/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Procedimentos Incluídos</label>
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 space-y-2">
                        {allProcedures.map(proc => (
                            <div key={proc.id} className="flex items-center">
                                <input
                                    id={`proc-check-${proc.id}`}
                                    type="checkbox"
                                    checked={procedureIds.includes(proc.id)}
                                    onChange={() => handleProcedureToggle(proc.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor={`proc-check-${proc.id}`} className="ml-3 text-sm text-gray-700 dark:text-gray-200">
                                    {proc.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default HealthCampaignForm;
