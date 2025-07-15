
import React, { useState, createContext, useCallback, useContext } from 'react';
import { ViewType, Patient, Procedure, Doctor, Municipality, HealthCampaign, PriceTable, ProcedureType, Location, Occurrence, AIProvider } from '../types';

export interface UIState {
  currentView: ViewType;
  aiProvider: AIProvider;
  geminiApiKey: string;
  hfToken: string;
  groqApiKey: string;
  lmStudioUrl: string;
  lmStudioModel: string;
  isApiSettingsModalOpen: boolean;
  isPatientModalOpen: boolean;
  editingPatient: Patient | null;
  isAppointmentModalOpen: boolean;
  isProcedureModalOpen: boolean;
  editingProcedure: Procedure | null;
  isProcedureTypeModalOpen: boolean;
  editingProcedureType: ProcedureType | null;
  isOccurrenceModalOpen: boolean;
  editingOccurrence: Occurrence | null;
  isDoctorModalOpen: boolean;
  editingDoctor: Doctor | null;
  isLocationModalOpen: boolean;
  editingLocation: Location | null;
  isMunicipalityModalOpen: boolean;
  editingMunicipality: Municipality | null;
  isCampaignModalOpen: boolean;
  editingCampaign: HealthCampaign | null;
  isPriceTableModalOpen: boolean;
  editingPriceTable: PriceTable | null;
  isCancellationModalOpen: boolean;
  cancellingAppointmentId: string | null;
  isDailyScheduleModalOpen: boolean;
  selectedDate: Date;
  isPatientDetailModalOpen: boolean;
  selectedPatient: Patient | null;
  isPriceTableDetailModalOpen: boolean;
  selectedPriceTable: PriceTable | null;
}

export interface UIContextType extends UIState {
  setCurrentView: (view: ViewType) => void;
  setAiProvider: (provider: AIProvider) => void;
  setGeminiApiKey: (key: string) => void;
  setHfToken: (key: string) => void;
  setGroqApiKey: (key: string) => void;
  setLmStudioUrl: (url: string) => void;
  setLmStudioModel: (model: string) => void;
  openApiSettingsModal: () => void;
  closeApiSettingsModal: () => void;
  
  openPatientModal: (patient?: Patient | null) => void;
  closePatientModal: () => void;
  
  openAppointmentModal: () => void;
  closeAppointmentModal: () => void;
  
  openProcedureModal: (procedure?: Procedure | null) => void;
  closeProcedureModal: () => void;
  
  openProcedureTypeModal: (procedureType?: ProcedureType | null) => void;
  closeProcedureTypeModal: () => void;

  openOccurrenceModal: (occurrence?: Occurrence | null) => void;
  closeOccurrenceModal: () => void;
  
  openDoctorModal: (doctor?: Doctor | null) => void;
  closeDoctorModal: () => void;

  openLocationModal: (location?: Location | null) => void;
  closeLocationModal: () => void;
  
  openMunicipalityModal: (municipality?: Municipality | null) => void;
  closeMunicipalityModal: () => void;

  openCampaignModal: (campaign?: HealthCampaign | null) => void;
  closeCampaignModal: () => void;

  openPriceTableModal: (table?: PriceTable | null) => void;
  closePriceTableModal: () => void;

  openCancellationModal: (appointmentId: string) => void;
  closeCancellationModal: () => void;

  openDailyScheduleModal: (date: Date) => void;
  closeDailyScheduleModal: () => void;

  setSelectedDate: (date: Date) => void;

  openPatientDetailModal: (patient: Patient) => void;
  closePatientDetailModal: () => void;

  openPriceTableDetailModal: (table: PriceTable) => void;
  closePriceTableDetailModal: () => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUIContext = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUIContext must be used within a UIProvider');
    }
    return context;
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<UIState>({
        currentView: 'dashboard',
        aiProvider: 'gemini', // Default provider
        geminiApiKey: localStorage.getItem('geminiApiKey') || process.env.API_KEY || '',
        hfToken: localStorage.getItem('hfToken') || process.env.HF_TOKEN || '',
        groqApiKey: localStorage.getItem('groqApiKey') || process.env.GROQ_API_KEY || '',
        lmStudioUrl: localStorage.getItem('lmStudioUrl') || process.env.LM_STUDIO_URL || 'http://localhost:1234',
        lmStudioModel: localStorage.getItem('lmStudioModel') || process.env.LM_STUDIO_MODEL || 'gemma-3-gaia-pt-br-4b-it-i1',
        isApiSettingsModalOpen: false,
        isPatientModalOpen: false,
        editingPatient: null,
        isAppointmentModalOpen: false,
        isProcedureModalOpen: false,
        editingProcedure: null,
        isProcedureTypeModalOpen: false,
        editingProcedureType: null,
        isOccurrenceModalOpen: false,
        editingOccurrence: null,
        isDoctorModalOpen: false,
        editingDoctor: null,
        isLocationModalOpen: false,
        editingLocation: null,
        isMunicipalityModalOpen: false,
        editingMunicipality: null,
        isCampaignModalOpen: false,
        editingCampaign: null,
        isPriceTableModalOpen: false,
        editingPriceTable: null,
        isCancellationModalOpen: false,
        cancellingAppointmentId: null,
        isDailyScheduleModalOpen: false,
        selectedDate: new Date(),
        isPatientDetailModalOpen: false,
        selectedPatient: null,
        isPriceTableDetailModalOpen: false,
        selectedPriceTable: null,
    });

    const setCurrentView = useCallback((view: ViewType) => setState(s => ({ ...s, currentView: view })), []);
    const setAiProvider = useCallback((provider: AIProvider) => setState(s => ({ ...s, aiProvider: provider})), []);

    const setGeminiApiKey = useCallback((key: string) => {
        localStorage.setItem('geminiApiKey', key);
        setState(s => ({ ...s, geminiApiKey: key }));
    }, []);

    const setHfToken = useCallback((key: string) => {
        localStorage.setItem('hfToken', key);
        setState(s => ({ ...s, hfToken: key }));
    }, []);

    const setGroqApiKey = useCallback((key: string) => {
        localStorage.setItem('groqApiKey', key);
        setState(s => ({ ...s, groqApiKey: key }));
    }, []);

    const setLmStudioUrl = useCallback((url: string) => {
        localStorage.setItem('lmStudioUrl', url);
        setState(s => ({...s, lmStudioUrl: url}));
    }, []);

    const setLmStudioModel = useCallback((model: string) => {
        localStorage.setItem('lmStudioModel', model);
        setState(s => ({...s, lmStudioModel: model}));
    }, []);

    const setSelectedDate = useCallback((date: Date) => setState(s => ({ ...s, selectedDate: date })), []);


    const openApiSettingsModal = useCallback(() => setState(s => ({ ...s, isApiSettingsModalOpen: true })), []);
    const closeApiSettingsModal = useCallback(() => setState(s => ({ ...s, isApiSettingsModalOpen: false })), []);

    const openPatientModal = useCallback((patient: Patient | null = null) => setState(s => ({ ...s, isPatientModalOpen: true, editingPatient: patient })), []);
    const closePatientModal = useCallback(() => setState(s => ({ ...s, isPatientModalOpen: false, editingPatient: null })), []);

    const openAppointmentModal = useCallback(() => setState(s => ({ ...s, isAppointmentModalOpen: true })), []);
    const closeAppointmentModal = useCallback(() => setState(s => ({ ...s, isAppointmentModalOpen: false })), []);
    
    const openProcedureModal = useCallback((procedure: Procedure | null = null) => setState(s => ({ ...s, isProcedureModalOpen: true, editingProcedure: procedure })), []);
    const closeProcedureModal = useCallback(() => setState(s => ({ ...s, isProcedureModalOpen: false, editingProcedure: null })), []);

    const openProcedureTypeModal = useCallback((procedureType: ProcedureType | null = null) => setState(s => ({ ...s, isProcedureTypeModalOpen: true, editingProcedureType: procedureType })), []);
    const closeProcedureTypeModal = useCallback(() => setState(s => ({ ...s, isProcedureTypeModalOpen: false, editingProcedureType: null })), []);

    const openOccurrenceModal = useCallback((occurrence: Occurrence | null = null) => setState(s => ({ ...s, isOccurrenceModalOpen: true, editingOccurrence: occurrence })), []);
    const closeOccurrenceModal = useCallback(() => setState(s => ({ ...s, isOccurrenceModalOpen: false, editingOccurrence: null })), []);

    const openDoctorModal = useCallback((doctor: Doctor | null = null) => setState(s => ({ ...s, isDoctorModalOpen: true, editingDoctor: doctor })), []);
    const closeDoctorModal = useCallback(() => setState(s => ({ ...s, isDoctorModalOpen: false, editingDoctor: null })), []);
    
    const openLocationModal = useCallback((location: Location | null = null) => setState(s => ({ ...s, isLocationModalOpen: true, editingLocation: location })), []);
    const closeLocationModal = useCallback(() => setState(s => ({ ...s, isLocationModalOpen: false, editingLocation: null })), []);

    const openMunicipalityModal = useCallback((municipality: Municipality | null = null) => setState(s => ({ ...s, isMunicipalityModalOpen: true, editingMunicipality: municipality })), []);
    const closeMunicipalityModal = useCallback(() => setState(s => ({ ...s, isMunicipalityModalOpen: false, editingMunicipality: null })), []);

    const openCampaignModal = useCallback((campaign: HealthCampaign | null = null) => setState(s => ({ ...s, isCampaignModalOpen: true, editingCampaign: campaign })), []);
    const closeCampaignModal = useCallback(() => setState(s => ({ ...s, isCampaignModalOpen: false, editingCampaign: null })), []);

    const openPriceTableModal = useCallback((table: PriceTable | null = null) => setState(s => ({ ...s, isPriceTableModalOpen: true, editingPriceTable: table })), []);
    const closePriceTableModal = useCallback(() => setState(s => ({ ...s, isPriceTableModalOpen: false, editingPriceTable: null })), []);

    const openCancellationModal = useCallback((appointmentId: string) => setState(s => ({ ...s, isCancellationModalOpen: true, cancellingAppointmentId: appointmentId })), []);
    const closeCancellationModal = useCallback(() => setState(s => ({ ...s, isCancellationModalOpen: false, cancellingAppointmentId: null })), []);

    const openDailyScheduleModal = useCallback((date: Date) => setState(s => ({ ...s, isDailyScheduleModalOpen: true, selectedDate: date })), []);
    const closeDailyScheduleModal = useCallback(() => setState(s => ({ ...s, isDailyScheduleModalOpen: false })), []);

    const openPatientDetailModal = useCallback((patient: Patient) => setState(s => ({ ...s, isPatientDetailModalOpen: true, selectedPatient: patient })), []);
    const closePatientDetailModal = useCallback(() => setState(s => ({ ...s, isPatientDetailModalOpen: false, selectedPatient: null })), []);
    
    const openPriceTableDetailModal = useCallback((table: PriceTable) => setState(s => ({ ...s, isPriceTableDetailModalOpen: true, selectedPriceTable: table })), []);
    const closePriceTableDetailModal = useCallback(() => setState(s => ({ ...s, isPriceTableDetailModalOpen: false, selectedPriceTable: null })), []);

    const contextValue: UIContextType = {
        ...state,
        setCurrentView,
        setAiProvider,
        setGeminiApiKey,
        setHfToken,
        setGroqApiKey,
        setLmStudioUrl,
        setLmStudioModel,
        openApiSettingsModal,
        closeApiSettingsModal,
        openPatientModal,
        closePatientModal,
        openAppointmentModal,
        closeAppointmentModal,
        openProcedureModal,
        closeProcedureModal,
        openProcedureTypeModal,
        closeProcedureTypeModal,
        openOccurrenceModal,
        closeOccurrenceModal,
        openDoctorModal,
        closeDoctorModal,
        openLocationModal,
        closeLocationModal,
        openMunicipalityModal,
        closeMunicipalityModal,
        openCampaignModal,
        closeCampaignModal,
        openPriceTableModal,
        closePriceTableModal,
        openCancellationModal,
        closeCancellationModal,
        openDailyScheduleModal,
        closeDailyScheduleModal,
        setSelectedDate,
        openPatientDetailModal,
        closePatientDetailModal,
        openPriceTableDetailModal,
        closePriceTableDetailModal
    };

    return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>;
}
