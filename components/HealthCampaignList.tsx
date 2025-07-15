import React, { useRef } from 'react';
import { HealthCampaign } from '../types';
import { PlusIcon, EditIcon, TrashIcon, DownloadIcon, UploadIcon } from './icons';
import { useDataContext, useUIContext, useActionsContext } from '../context';
import { exportToCSV } from '../utils/export';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';


const HealthCampaignList: React.FC = () => {
    const { campaigns, procedures } = useDataContext();
    const { openCampaignModal } = useUIContext();
    const { deleteCampaign, handleDataImport } = useActionsContext();
    const importInputRef = useRef<HTMLInputElement>(null);

    const getProcedureNames = (ids: string[]): string => {
        return ids.map(id => procedures.find(p => p.id === id)?.name).filter(Boolean).join(', ');
    }

     const handleExport = () => {
        const dataToExport = campaigns.map(c => ({
            ...c,
            procedureIds: c.procedureIds.join(';')
        }));
        const success = exportToCSV(dataToExport, 'campanhas.csv');
        if (success) {
            toast.success('Campanhas exportadas com sucesso!');
        } else {
            toast.error('Não há campanhas para exportar.');
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                handleDataImport('campaigns', jsonData);
            } catch (error) {
                console.error("Erro ao importar arquivo:", error);
                toast.error("Erro ao importar arquivo. Verifique o formato.");
            } finally {
                if (importInputRef.current) {
                    importInputRef.current.value = "";
                }
            }
        };
        reader.readAsBinaryString(file);
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campanhas e Ações de Saúde</h1>
                <div className="flex items-center gap-2 flex-wrap justify-end mt-4 sm:mt-0">
                    <input type="file" ref={importInputRef} onChange={handleImport} accept=".csv,.xlsx" className="hidden" />
                    <button onClick={() => importInputRef.current?.click()} className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-3 rounded-lg shadow-sm transition-all duration-300 text-sm">
                        <UploadIcon className="h-5 w-5 mr-2" />
                        Importar
                    </button>
                    <button onClick={handleExport} className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-3 rounded-lg shadow-sm transition-all duration-300 text-sm">
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Exportar
                    </button>
                    <button 
                        onClick={() => openCampaignModal()}
                        className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nova Campanha
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-xl hover:-translate-y-1 flex flex-col">
                        <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">{campaign.name}</h2>
                        <div className="mt-4 space-y-3 text-sm flex-grow">
                            <p><strong className="text-gray-500 dark:text-gray-400">Período:</strong> {new Date(campaign.startDate).toLocaleDateString('pt-BR')} - {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</p>
                            <p><strong className="text-gray-500 dark:text-gray-400">Público-alvo:</strong> {campaign.targetAudience}</p>
                            <p><strong className="text-gray-500 dark:text-gray-400">Procedimentos:</strong> {getProcedureNames(campaign.procedureIds)}</p>
                        </div>
                         <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-2">
                            <button onClick={() => openCampaignModal(campaign)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700" title="Editar">
                                <EditIcon className="h-5 w-5" />
                            </button>
                             <button onClick={() => deleteCampaign(campaign.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700" title="Excluir">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
                 {campaigns.length === 0 && (
                    <div className="col-span-full text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma campanha cadastrada no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthCampaignList;