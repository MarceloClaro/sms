


import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Procedure, ProcedureType } from '../types';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import { useActionsContext, useDataContext, useUIContext } from '../context';

const ProcedureForm: React.FC = () => {
    const { procedureTypes } = useDataContext();
    const { isProcedureModalOpen: isOpen, editingProcedure: initialData, closeProcedureModal: onClose } = useUIContext();
    const { saveProcedure: onSave } = useActionsContext();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [procedureTypeId, setProcedureTypeId] = useState<string>('');
    const [duration, setDuration] = useState<number | ''>('');
    const [slotsAvailable, setSlotsAvailable] = useState<number | ''>('');
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setProcedureTypeId(initialData.procedureTypeId);
            setDuration(initialData.duration);
            setSlotsAvailable(initialData.slotsAvailable ?? '');
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setProcedureTypeId(procedureTypes[0]?.id || '');
        setDuration('');
        setSlotsAvailable('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && description && procedureTypeId && duration) {
            onSave({ 
                name, 
                description, 
                procedureTypeId, 
                duration: Number(duration),
                slotsAvailable: slotsAvailable ? Number(slotsAvailable) : undefined
            }, initialData?.id);
            resetForm();
            onClose();
        } else {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
        }
    };
    
    const procedureTypeOptions = useMemo(() => procedureTypes.map(pt => ({ value: pt.id, label: pt.name })), [procedureTypes]);

    const renderFooter = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Cancelar
            </button>
            <button type="submit" form="procedure-form" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
                {initialData ? 'Salvar Alterações' : 'Salvar Procedimento'}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Procedimento" : "Adicionar Novo Procedimento"} size="xl" footer={renderFooter}>
            <form id="procedure-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="proc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Procedimento</label>
                    <input type="text" id="proc-name" value={name} onChange={e => setName(e.target.value)} required 
                           className={inputClasses}/>
                </div>
                 <div>
                    <label htmlFor="proc-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                    <SearchableSelect
                        id="proc-type"
                        placeholder="Selecione um tipo"
                        options={procedureTypeOptions}
                        value={procedureTypeId}
                        onChange={setProcedureTypeId}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="proc-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração (minutos)</label>
                        <input type="number" id="proc-duration" value={duration} onChange={e => setDuration(e.target.value ? parseInt(e.target.value) : '')} required 
                               className={inputClasses}/>
                    </div>
                    <div>
                        <label htmlFor="proc-slots" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº de Vagas Ofertadas</label>
                        <input type="number" id="proc-slots" value={slotsAvailable} placeholder="(Opcional)" onChange={e => setSlotsAvailable(e.target.value ? parseInt(e.target.value) : '')}
                               className={inputClasses}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="proc-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <textarea id="proc-desc" value={description} onChange={e => setDescription(e.target.value)} required rows={3} 
                              className={inputClasses}></textarea>
                </div>
            </form>
        </Modal>
    );
}

export default ProcedureForm;
