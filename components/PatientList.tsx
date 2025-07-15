import React, { useState, useRef } from 'react';
import { Patient } from '../types';
import { UserPlusIcon, WhatsAppIcon, EditIcon, TrashIcon, DownloadIcon, UploadIcon } from './icons';
import { calculateAge, exportToCSV } from '../utils/export';
import { useDataContext, useUIContext, useActionsContext } from '../context';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const PatientList: React.FC = () => {
    const { patients } = useDataContext();
    const { openPatientModal, openPatientDetailModal } = useUIContext();
    const { deletePatient, handleDataImport } = useActionsContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cnsOrCpf.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openWhatsApp = (e: React.MouseEvent, phone: string, name: string) => {
        e.stopPropagation();
        const message = encodeURIComponent(`Olá ${name}, `);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }

    const handleEdit = (e: React.MouseEvent, patient: Patient) => {
        e.stopPropagation();
        openPatientModal(patient);
    };

    const handleDelete = (e: React.MouseEvent, patientId: string) => {
        e.stopPropagation();
        deletePatient(patientId);
    };

    const handleExport = () => {
        const dataToExport = filteredPatients.map(p => ({
            id: p.id,
            name: p.name,
            dateOfBirth: p.dateOfBirth,
            motherName: p.motherName,
            cnsOrCpf: p.cnsOrCpf,
            email: p.email,
            phone: p.phone,
            municipalityId: p.municipalityId,
            healthPost: p.healthPost,
            healthAgent: p.healthAgent,
            participatingCampaignIds: p.participatingCampaignIds?.join(';') || '',
            gender: p.gender || '',
            ethnicity: p.ethnicity || '',
            conditions: p.conditions?.join(';') || ''
        }));
        
        const success = exportToCSV(dataToExport, 'pacientes.csv');
        if (success) {
            toast.success('Dados dos pacientes exportados com sucesso!');
        } else {
            toast.error('Não há pacientes para exportar.');
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
                handleDataImport('patients', jsonData);
            } catch (error) {
                console.error("Erro ao importar arquivo:", error);
                toast.error("Erro ao importar arquivo. Verifique o formato.");
            } finally {
                if (importInputRef.current) {
                    importInputRef.current.value = ""; // Reset file input
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registros de Pacientes</h1>
                <div className="flex items-center gap-4 flex-wrap justify-end">
                     <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CNS/CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
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
                        onClick={() => openPatientModal()}
                        className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Novo Paciente
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contato</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Idade</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registrado em</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} onClick={() => openPatientDetailModal(patient)} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full" src={patient.avatarUrl} alt={patient.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{patient.healthAgent}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{patient.cnsOrCpf}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{patient.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{calculateAge(patient.dateOfBirth)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(patient.registeredDate).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={(e) => openWhatsApp(e, patient.phone, patient.name)} className="text-green-500 hover:text-green-700 p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-gray-600" title="Enviar WhatsApp">
                                        <WhatsAppIcon className="h-5 w-5" />
                                    </button>
                                     <button onClick={(e) => handleEdit(e, patient)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600" title="Editar">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                     <button onClick={(e) => handleDelete(e, patient.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-gray-600" title="Excluir">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredPatients.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Nenhum paciente encontrado. Tente uma busca diferente ou adicione um novo paciente.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientList;