import React, { useState, useRef } from 'react';
import { useActionsContext } from '../context';
import { DatabaseIcon, DownloadIcon, UploadIcon, XCircleIcon } from './icons';
import toast from 'react-hot-toast';
import { FullDatabase } from '../types';

const DatabaseManager: React.FC = () => {
    const { exportFullDatabase, importFullDatabase, resetDatabase } = useActionsContext();
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setIsExporting(true);
        const toastId = toast.loading('Exportando banco de dados...');
        try {
            await exportFullDatabase();
            toast.success('Banco de dados exportado com sucesso!', { id: toastId });
        } catch(e) {
            console.error(e);
            toast.error("Falha ao exportar o banco de dados.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            setIsImporting(true);
            const toastId = toast.loading('Importando banco de dados...');
            try {
                const content = e.target?.result as string;
                const data: FullDatabase = JSON.parse(content);

                if (!window.confirm("Atenção! Esta ação substituirá todos os dados atuais pelos dados do arquivo. Deseja continuar?")) {
                    toast.dismiss(toastId);
                    setIsImporting(false);
                    if(importInputRef.current) importInputRef.current.value = "";
                    return;
                }
                
                await importFullDatabase(data);
                toast.success('Banco de dados importado com sucesso! A página será recarregada.', { id: toastId, duration: 4000 });
                setTimeout(() => window.location.reload(), 4000);

            } catch(err) {
                console.error("Erro ao importar arquivo:", err);
                toast.error("Falha na importação. O arquivo pode estar corrompido ou em formato inválido.", { id: toastId });
                setIsImporting(false);
            } finally {
                 if(importInputRef.current) importInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handleReset = async () => {
        const confirmation = prompt("Esta ação é irreversível e apagará todos os dados, restaurando o sistema para o estado inicial. Para confirmar, digite 'RESETAR BANCO DE DADOS'.");
        if (confirmation !== 'RESETAR BANCO DE DADOS') {
            toast.error("Confirmação inválida. A redefinição foi cancelada.");
            return;
        }

        setIsResetting(true);
        const toastId = toast.loading('Redefinindo o banco de dados...');
        try {
            await resetDatabase();
            toast.success('Banco de dados redefinido com sucesso! A página será recarregada.', { id: toastId, duration: 4000 });
            setTimeout(() => window.location.reload(), 4000);
        } catch(e) {
            console.error(e);
            toast.error("Falha ao redefinir o banco de dados.", { id: toastId });
            setIsResetting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg space-y-8">
            <div className="flex items-center gap-4">
                <DatabaseIcon className="h-8 w-8 text-primary-500"/>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Dados</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Exporte, importe ou redefina todo o banco de dados da aplicação.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                    <div className="flex items-center gap-3">
                        <DownloadIcon className="h-6 w-6 text-blue-500"/>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Exportar Dados</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4">
                        Crie um backup completo de todos os dados do sistema. Este arquivo JSON pode ser usado para restaurar o estado atual em outro momento ou dispositivo.
                    </p>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting || isImporting || isResetting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <DownloadIcon className="h-5 w-5"/>
                        {isExporting ? 'Exportando...' : 'Exportar Backup Completo (.json)'}
                    </button>
                </div>

                {/* Import Card */}
                <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                    <div className="flex items-center gap-3">
                        <UploadIcon className="h-6 w-6 text-green-500"/>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Importar Dados</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4">
                        Restaure o sistema a partir de um arquivo de backup (.json). <strong className="text-yellow-500">Atenção:</strong> Isso substituirá todos os dados existentes.
                    </p>
                    <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    <button 
                        onClick={handleImportClick}
                        disabled={isImporting || isExporting || isResetting}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <UploadIcon className="h-5 w-5"/>
                        {isImporting ? 'Importando...' : 'Importar de Backup (.json)'}
                    </button>
                </div>
            </div>

            {/* Reset Section */}
            <div className="border border-red-500/50 dark:border-red-500/30 p-6 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                 <div className="flex items-center gap-3">
                    <XCircleIcon className="h-6 w-6 text-red-500"/>
                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-300">Zona de Perigo</h2>
                </div>
                <p className="text-sm text-red-700 dark:text-red-200 mt-2 mb-4">
                    A ação abaixo é irreversível. Redefinir o banco de dados apagará <strong className="font-bold">TODOS</strong> os pacientes, agendamentos, médicos e configurações, restaurando o sistema ao seu estado inicial de demonstração.
                </p>
                 <button 
                    onClick={handleReset}
                    disabled={isResetting || isImporting || isExporting}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <XCircleIcon className="h-5 w-5"/>
                    {isResetting ? 'Redefinindo...' : 'Redefinir Banco de Dados'}
                </button>
            </div>
        </div>
    );
};

export default DatabaseManager;