


import React, { useState } from 'react';
import Modal from './Modal';
import { CancellationData } from '../types';
import toast from 'react-hot-toast';
import { useActionsContext, useUIContext } from '../context';

const CancellationModal: React.FC = () => {
    const { isCancellationModalOpen: isOpen, closeCancellationModal: onClose } = useUIContext();
    const { saveCancellation: onSave } = useActionsContext();

    const [cancelledBy, setCancelledBy] = useState<'patient' | 'doctor'>('patient');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason) {
            onSave({ cancelledBy, reason });
            setReason('');
        } else {
            toast.error('Por favor, informe o motivo do cancelamento.');
        }
    };

    const renderFooter = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Fechar
            </button>
            <button type="submit" form="cancellation-form" className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
                Confirmar Cancelamento
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Cancelamento" size="md" footer={renderFooter}>
            <form id="cancellation-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cancelado por:</label>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="patient"
                                checked={cancelledBy === 'patient'}
                                onChange={() => setCancelledBy('patient')}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Paciente</span>
                        </label>
                         <label className="flex items-center">
                            <input
                                type="radio"
                                value="doctor"
                                checked={cancelledBy === 'doctor'}
                                onChange={() => setCancelledBy('doctor')}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Médico/Equipe</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Motivo do Cancelamento</label>
                    <textarea
                        id="cancellation-reason"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    ></textarea>
                </div>
            </form>
        </Modal>
    );
};

export default CancellationModal;
