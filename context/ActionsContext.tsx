

import React, { createContext, useContext } from 'react';
import { DataEntityType, Patient, Procedure, Appointment, Doctor, Municipality, HealthCampaign, PriceTable, PriceTableEntry, AppointmentStatus, CancellationData, ProcedureType, Location, FullDatabase, Occurrence, ChatMessage } from '../types';
import * as db from '../utils/db';
import toast from 'react-hot-toast';
import { DataContext } from './DataContext';
import { UIContext } from './UIContext';

interface ActionsContextType {
    savePatient: (patient: Omit<Patient, 'id' | 'avatarUrl' | 'lastVisit' | 'registeredDate'>, id?: string) => Promise<void>;
    saveAppointment: (appointmentData: Partial<Appointment>, id?: string) => Promise<void>;
    saveProcedure: (procedure: Omit<Procedure, 'id'>, id?: string) => Promise<void>;
    saveProcedureType: (procedureType: Omit<ProcedureType, 'id'>, id?: string) => Promise<void>;
    saveOccurrence: (occurrence: Omit<Occurrence, 'id'>, id?: string) => Promise<void>;
    saveDoctor: (doctor: Omit<Doctor, 'id'>, id?: string) => Promise<void>;
    saveLocation: (location: Omit<Location, 'id'>, id?: string) => Promise<void>;
    saveMunicipality: (municipality: Omit<Municipality, 'id'>, id?: string) => Promise<void>;
    saveCampaign: (campaign: Omit<HealthCampaign, 'id'>, id?: string) => Promise<void>;
    savePriceTable: (table: Omit<PriceTable, 'id'>, id?: string) => Promise<void>;
    saveChatHistory: (messages: ChatMessage[]) => Promise<void>;
    updatePriceTableEntries: (tableId: string, entries: {procedureId: string, code: string, value: number}[]) => Promise<void>;
    saveCancellation: (data: Omit<CancellationData, 'appointmentId'>) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    deleteProcedure: (id: string) => Promise<void>;
    deleteProcedureType: (id: string) => Promise<void>;
    deleteOccurrence: (id: string) => Promise<void>;
    deleteDoctor: (id: string) => Promise<void>;
    deleteLocation: (id: string) => Promise<void>;
    deleteMunicipality: (id: string) => Promise<void>;
    deleteCampaign: (id: string) => Promise<void>;
    deletePriceTable: (id: string) => Promise<void>;
    updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
    updateAppointmentOccurrence: (appointmentId: string, occurrenceId: string) => Promise<void>;
    handleDataImport: (dataType: DataEntityType, data: any[]) => Promise<void>;
    exportFullDatabase: () => Promise<void>;
    importFullDatabase: (data: FullDatabase) => Promise<void>;
    resetDatabase: () => Promise<void>;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const useActionsContext = () => {
    const context = useContext(ActionsContext);
    if (!context) throw new Error('useActionsContext must be used within an ActionsProvider');
    return context;
};

export const ActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dataCtx = useContext(DataContext);
    const uiCtx = useContext(UIContext);

    if (!dataCtx || !uiCtx) {
        // This should not happen if providers are nested correctly
        return null;
    }

    const { reloadData } = dataCtx;
    
    const createSaveHandler = <T extends { id: string }>(
        storeName: DataEntityType,
        closeModal?: () => void
      ) => async (data: Omit<T, 'id'>, id?: string) => {
        const newId = id || `${storeName.slice(0, 4)}${Date.now()}`;
        const itemToSave: T = { ...(data as T), id: newId };
        await db.saveData(storeName, itemToSave);
        await reloadData([storeName]);
        if (closeModal) closeModal();
    };

    const savePatient = async (patientData: Omit<Patient, 'id' | 'avatarUrl' | 'lastVisit' | 'registeredDate'>, id?: string) => {
        const newId = id || `p${Date.now()}`;
        let patientToSave: Patient;
        if (id) {
            const existingPatient = dataCtx.patients.find(p => p.id === id);
            patientToSave = { ...(existingPatient as Patient), ...patientData, id };
        } else {
             patientToSave = {
                ...patientData,
                id: newId,
                avatarUrl: `https://picsum.photos/seed/${newId}/100/100`,
                lastVisit: 'N/A',
                registeredDate: new Date().toISOString().split('T')[0],
            };
        }
        await db.saveData('patients', patientToSave);
        await reloadData(['patients']);
        uiCtx.closePatientModal();
    };

    const saveAppointment = async (appointmentData: Partial<Appointment>, id?: string) => {
        if (id) {
            const existingApp = dataCtx.appointments.find(a => a.id === id);
            if (!existingApp) return;
            const updatedApp = { ...existingApp, ...appointmentData } as Appointment;
            await db.saveData('appointments', updatedApp);
            await reloadData(['appointments']);
        } else {
            if (!appointmentData.patientId || !appointmentData.procedureId || !appointmentData.doctorId || !appointmentData.date || !appointmentData.locationId) {
                toast.error("Erro: Para criar o agendamento, selecione Paciente, Procedimento, Médico, Local e Data.");
                return;
            }
            const newAppointment: Appointment = {
                id: `app${Date.now()}`,
                status: 'agendado',
                ...appointmentData as any
            };
            await db.saveData('appointments', newAppointment);
            await reloadData(['appointments']);
        }
        uiCtx.closeAppointmentModal();
    };
    
    const saveProcedure = createSaveHandler<Procedure>('procedures', uiCtx.closeProcedureModal);
    const saveProcedureType = createSaveHandler<ProcedureType>('procedureTypes', uiCtx.closeProcedureTypeModal);
    const saveOccurrence = createSaveHandler<Occurrence>('occurrences', uiCtx.closeOccurrenceModal);
    const saveDoctor = createSaveHandler<Doctor>('doctors', uiCtx.closeDoctorModal);
    const saveLocation = createSaveHandler<Location>('locations', uiCtx.closeLocationModal);
    const saveMunicipality = createSaveHandler<Municipality>('municipalities', uiCtx.closeMunicipalityModal);
    const saveCampaign = createSaveHandler<HealthCampaign>('campaigns', uiCtx.closeCampaignModal);
    const savePriceTable = createSaveHandler<PriceTable>('priceTables', uiCtx.closePriceTableModal);
    
    const saveChatHistory = async (messages: ChatMessage[]) => {
        await db.clearAllData(['chatHistory']);
        await db.bulkPut('chatHistory', messages);
        await reloadData(['chatHistory']);
    };

    const updatePriceTableEntries = async (tableId: string, entries: {procedureId: string, code: string, value: number}[]) => {
        const validEntries = entries
            .filter(e => e.code || e.value > 0)
            .map(e => ({
              id: `pte-${tableId}-${e.procedureId}`,
              priceTableId: tableId,
              procedureId: e.procedureId,
              code: e.code,
              value: e.value
            }));
        
        const oldEntries = dataCtx.priceTableEntries.filter(e => e.priceTableId === tableId);
        for(const entry of oldEntries) {
            await db.deleteData('priceTableEntries', entry.id);
        }
        for(const entry of validEntries) {
            await db.saveData('priceTableEntries', entry);
        }
        await reloadData(['priceTableEntries']);
        uiCtx.closePriceTableDetailModal();
    };

    const createDeleteHandler = (storeName: DataEntityType, itemName: string) => async (id: string) => {
        if (window.confirm(`Tem certeza que deseja excluir este ${itemName}?`)) {
            await db.deleteData(storeName, id);
            await reloadData([storeName]);
        }
    };

    const deletePatient = createDeleteHandler('patients', 'paciente');
    const deleteProcedure = createDeleteHandler('procedures', 'procedimento');
    const deleteProcedureType = createDeleteHandler('procedureTypes', 'tipo de procedimento');
    const deleteOccurrence = createDeleteHandler('occurrences', 'ocorrência');
    const deleteDoctor = createDeleteHandler('doctors', 'médico');
    const deleteLocation = createDeleteHandler('locations', 'local');
    const deleteMunicipality = createDeleteHandler('municipalities', 'município');
    const deleteCampaign = createDeleteHandler('campaigns', 'campanha');
    const deletePriceTable = createDeleteHandler('priceTables', 'tabela de preços');

    const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
        if (status === 'cancelado_paciente' || status === 'cancelado_medico') {
            uiCtx.openCancellationModal(appointmentId);
        } else {
            const appToUpdate = dataCtx.appointments.find(app => app.id === appointmentId);
            if (appToUpdate) {
                const updatedApp = { ...appToUpdate, status };
                await db.saveData('appointments', updatedApp);
                await reloadData(['appointments']);
            }
        }
    };

    const updateAppointmentOccurrence = async (appointmentId: string, occurrenceId: string) => {
        const appToUpdate = dataCtx.appointments.find(app => app.id === appointmentId);
        if (appToUpdate) {
            const occurrence = dataCtx.occurrences.find(o => o.id === occurrenceId);
            const updatedApp = { 
                ...appToUpdate, 
                occurrenceId: occurrenceId || undefined,
                // Se a ocorrência for 'Paciente chegou', atualiza o status para 'em_espera'
                status: occurrence?.name === 'Paciente chegou' ? 'em_espera' : appToUpdate.status
            };
            await db.saveData('appointments', updatedApp);
            await reloadData(['appointments']);
        }
    };

    const saveCancellation = async (data: Omit<CancellationData, 'appointmentId'>) => {
        if (!uiCtx.cancellingAppointmentId) return;
        const appToUpdate = dataCtx.appointments.find(app => app.id === uiCtx.cancellingAppointmentId);
        if (appToUpdate) {
            const updatedApp: Appointment = { 
                ...appToUpdate, 
                status: data.cancelledBy === 'patient' ? 'cancelado_paciente' : 'cancelado_medico',
                cancellationReason: data.reason,
            };
            await db.saveData('appointments', updatedApp);
            await reloadData(['appointments']);
        }
        uiCtx.closeCancellationModal();
    };

    const handleDataImport = async (dataType: DataEntityType, data: any[]) => {
        if (!window.confirm(`Isso irá adicionar ou atualizar ${data.length} registros em "${dataType}". Os registros existentes com o mesmo 'id' serão atualizados. Deseja continuar?`)) return;
        try {
            let coercedData = data;
            if (dataType === 'patients') coercedData = data.map(row => ({...row, participatingCampaignIds: typeof row.participatingCampaignIds === 'string' ? row.participatingCampaignIds.split(';').filter(Boolean) : (row.participatingCampaignIds || []), conditions: typeof row.conditions === 'string' ? row.conditions.split(';').map((c:string) => c.trim()).filter(Boolean) : (row.conditions || [])}));
            else if (dataType === 'campaigns') coercedData = data.map(row => ({...row, procedureIds: typeof row.procedureIds === 'string' ? row.procedureIds.split(';').filter(Boolean) : (row.procedureIds || [])}));
            else if (dataType === 'procedures') coercedData = data.map(row => ({...row, duration: Number(row.duration) || 0, slotsAvailable: row.slotsAvailable ? Number(row.slotsAvailable) : undefined}));
            
            await db.bulkPut(dataType, coercedData);
            await reloadData([dataType]);
            toast.success(`${data.length} registros foram importados com sucesso para "${dataType}".`);
        } catch(error) {
            console.error("Erro ao importar arquivo:", error);
            toast.error("Ocorreu um erro ao importar o arquivo. Verifique se o formato está correto.");
        }
    };
    
    const exportFullDatabase = async () => {
        const fullDb: { [key: string]: any } = {};
        for(const storeName of db.STORES) {
            fullDb[storeName] = await db.getAllData(storeName);
        }
        const jsonString = JSON.stringify(fullDb, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medsms_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importFullDatabase = async (data: FullDatabase) => {
        await db.clearAllData();
        for (const storeName of db.STORES) {
            const storeData = (data as any)[storeName];
            if (storeData) await db.bulkPut(storeName, storeData);
        }
        await reloadData();
    };

    const resetDatabase = async () => {
        await db.clearAllData();
        await db.initDB();
        await reloadData();
    };

    const contextValue: ActionsContextType = {
        savePatient,
        saveAppointment,
        saveProcedure,
        saveProcedureType,
        saveOccurrence,
        saveDoctor,
        saveLocation,
        saveMunicipality,
        saveCampaign,
        savePriceTable,
        saveChatHistory,
        updatePriceTableEntries,
        saveCancellation,
        deletePatient,
        deleteProcedure,
        deleteProcedureType,
        deleteOccurrence,
        deleteDoctor,
        deleteLocation,
        deleteMunicipality,
        deleteCampaign,
        deletePriceTable,
        updateAppointmentStatus,
        updateAppointmentOccurrence,
        handleDataImport,
        exportFullDatabase,
        importFullDatabase,
        resetDatabase
    };

    return <ActionsContext.Provider value={contextValue}>{children}</ActionsContext.Provider>;
};
