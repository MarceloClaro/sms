

import React from 'react';
import { DataProvider, UIProvider, ActionsProvider, useUIContext } from './context';
import { ViewType } from './types';
import { Toaster } from 'react-hot-toast';

import { Sidebar } from './components/Sidebar';
import Header from './components/Header';
import { Dashboard } from './components/Dashboard';
import PatientList from './components/PatientList';
import AiAssistant from './components/AiAssistant';
import AutomationCenter from './components/AutomationCenter';
import ProcedureList from './components/ProcedureList';
import DoctorList from './components/DoctorList';
import LocationList from './components/LocationList';
import MunicipalityList from './components/MunicipalityList';
import HealthCampaignList from './components/HealthCampaignList';
import PriceTableList from './components/PriceTableList';
import ReportsView from './components/ReportsView';
import ProcedureTypeList from './components/ProcedureTypeList';
import DatabaseManager from './components/DatabaseManager';
import OccurrenceList from './components/OccurrenceList';

import PatientForm from './components/PatientForm';
import AppointmentForm from './components/AppointmentForm';
import ProcedureForm from './components/ProcedureForm';
import DoctorForm from './components/DoctorForm';
import LocationForm from './components/LocationForm';
import MunicipalityForm from './components/MunicipalityForm';
import HealthCampaignForm from './components/HealthCampaignForm';
import PriceTableForm from './components/PriceTableForm';
import CancellationModal from './components/CancellationModal';
import ProcedureTypeForm from './components/ProcedureTypeForm';
import OccurrenceForm from './components/OccurrenceForm';

import PatientDetailModal from './components/PatientDetailModal';
import DailyScheduleModal from './components/DailyScheduleModal';
import PriceTableDetailModal from './components/PriceTableDetailModal';
import ApiSettingsModal from './components/ApiSettingsModal';


const AppContent: React.FC = () => {
  const { currentView } = useUIContext();
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <PatientList />;
      case 'procedures':
        return <ProcedureList />;
      case 'procedure_types':
        return <ProcedureTypeList />;
      case 'occurrences':
        return <OccurrenceList />;
      case 'doctors':
        return <DoctorList />;
      case 'locations':
        return <LocationList />;
      case 'municipalities':
        return <MunicipalityList />;
      case 'campaigns':
        return <HealthCampaignList />;
      case 'price_tables':
        return <PriceTableList />;
      case 'reports':
        return <ReportsView />;
      case 'ai_assistant':
        return <AiAssistant />;
      case 'automation':
        return <AutomationCenter />;
      case 'database_manager':
        return <DatabaseManager />;
      default:
        return <Dashboard />;
    }
  };
  
  const getTitleForView = (view: ViewType): string => {
      switch(view) {
          case 'dashboard': return 'Painel Principal';
          case 'database_manager': return 'Gerenciamento de Dados';
          case 'patients': return 'Cadastro de Pacientes';
          case 'procedures': return 'Cadastro de Procedimentos';
          case 'procedure_types': return 'Tipos de Procedimento';
          case 'occurrences': return 'Cadastro de Ocorrências';
          case 'doctors': return 'Cadastro de Médicos';
          case 'locations': return 'Cadastro de Locais';
          case 'municipalities': return 'Cadastro de Municípios';
          case 'campaigns': return 'Campanhas de Saúde';
          case 'price_tables': return 'Tabelas de Preços';
          case 'reports': return 'Relatórios Gerenciais';
          case 'ai_assistant': return 'Assistente Clínico (IA)';
          case 'automation': return 'Central de Automação (IA)';
          default: return 'Painel Principal';
      }
  }

  return (
    <>
      <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
              className: 'dark:bg-gray-700 dark:text-white',
              duration: 5000,
              success: {
                  duration: 3000,
              },
          }}
      />
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 print:block print:h-auto">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">
          <Header title={getTitleForView(currentView)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible print:bg-white dark:print:bg-white">
            {renderView()}
          </main>
        </div>
      </div>
      
      <PatientForm />
      <AppointmentForm />
      <ProcedureForm />
      <ProcedureTypeForm />
      <OccurrenceForm />
      <DoctorForm />
      <LocationForm />
      <MunicipalityForm />
      <HealthCampaignForm />
      <PriceTableForm />
      <CancellationModal />
      <PatientDetailModal />
      <DailyScheduleModal />
      <PriceTableDetailModal />
      <ApiSettingsModal />
    </>
  );
};


const App: React.FC = () => {
    return (
      <DataProvider>
        <UIProvider>
          <ActionsProvider>
            <AppContent />
          </ActionsProvider>
        </UIProvider>
      </DataProvider>
    );
  };
  
export default App;