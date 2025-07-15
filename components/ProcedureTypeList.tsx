
import React, { useRef } from 'react';
import { ProcedureType } from '../types';
import { PlusIcon, EditIcon, TrashIcon, DownloadIcon, UploadIcon } from './icons';
import { useDataContext, useUIContext, useActionsContext } from '../context';
import { exportToCSV } from '../utils/export';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';


const ProcedureTypeList: React.FC = () => {
    const { procedureTypes } = useDataContext();
    const { openProcedureTypeModal } = useUIContext();
    const { deleteProcedureType, handleDataImport } = useActionsContext();
    const importInputRef = useRef<HTMLInputElement>(null);

     const handleExport = () => {
        const success = exportToCSV(procedureTypes, 'tipos_procedimento.csv');
        if (success) {
            toast.success('Tipos de procedimento exportados com sucesso!');
        } else {
            toast.error('Não há tipos de procedimento para exportar.');
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
                handleDataImport('procedureTypes', jsonData);
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
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tipos de Procedimento</h1>
                <div className="flex items-center gap-2 flex-wrap justify-end">
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
                        onClick={() => openProcedureTypeModal()}
                        className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Novo Tipo
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome do Tipo</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {procedureTypes.map((pt) => (
                            <tr key={pt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{pt.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     <button onClick={() => openProcedureTypeModal(pt)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600" title="Editar">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                     <button onClick={() => deleteProcedureType(pt.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-gray-600" title="Excluir">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProcedureTypeList;
