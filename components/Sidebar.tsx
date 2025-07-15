


import React, { useState } from 'react';
import { ViewType, AIProvider } from '../types';
import { useUIContext } from '../context';
import toast from 'react-hot-toast';
import { 
    DashboardIcon, PatientsIcon, AiAssistantIcon, SparklesIcon, ProcedureIcon, DoctorIcon, 
    MunicipalityIcon, CampaignIcon, PriceTableIcon, DatabaseIcon, ChevronDownIcon, ChartBarIcon, TagIcon, MapPinIcon, FolderIcon, TableCellsIcon,
    CogIcon
} from './icons';

interface NavItemProps {
    id: ViewType;
    label: string;
    icon: React.ElementType;
    currentView: ViewType;
    onClick: (view: ViewType) => void;
    isSubItem?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon: Icon, currentView, onClick, isSubItem = false }) => (
    <li className={`${isSubItem ? 'pl-8' : 'px-4'} py-1`}>
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
            currentView === id
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            <Icon className="h-6 w-6" />
            <span className="ml-4 font-medium">{label}</span>
        </button>
    </li>
);

const CollapsibleMenu: React.FC<{
    label: string;
    icon: React.ElementType;
    children: React.ReactNode;
}> = ({ label, icon: Icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <li className="px-4 py-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <Icon className="h-6 w-6" />
                <span className="ml-4 font-medium">{label}</span>
                <ChevronDownIcon className={`h-5 w-5 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <ul className="mt-1 space-y-1">
                    {children}
                </ul>
            )}
        </li>
    );
}

export const Sidebar: React.FC = () => {
  const { 
      currentView, setCurrentView, 
      aiProvider, setAiProvider, 
      openApiSettingsModal,
      geminiApiKey, hfToken, groqApiKey
  } = useUIContext();

  const mainNavItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Painel', icon: DashboardIcon },
    { id: 'database_manager', label: 'Gerenciamento de Dados', icon: DatabaseIcon },
    { id: 'campaigns', label: 'Campanhas', icon: CampaignIcon },
    { id: 'reports', label: 'Relatórios', icon: ChartBarIcon },
  ];

  const registrationNavItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: 'patients', label: 'Pacientes', icon: PatientsIcon },
    { id: 'doctors', label: 'Médicos', icon: DoctorIcon },
    { id: 'locations', label: 'Locais', icon: MapPinIcon },
    { id: 'procedures', label: 'Procedimentos', icon: ProcedureIcon },
    { id: 'procedure_types', label: 'Tipos de Procedimento', icon: TagIcon },
    { id: 'occurrences', label: 'Ocorrências', icon: TableCellsIcon },
    { id: 'municipalities', label: 'Municípios', icon: MunicipalityIcon },
    { id: 'price_tables', label: 'Tabelas de Preços', icon: PriceTableIcon },
  ];
  
  const aiNavItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: 'ai_assistant', label: 'Assistente IA', icon: AiAssistantIcon },
    { id: 'automation', label: 'Automação', icon: SparklesIcon },
  ];

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider;
    let isKeyMissing = false;
    let providerName = '';

    if (newProvider === 'gemini') {
        providerName = 'Google Gemini';
        if (!geminiApiKey || !geminiApiKey.trim()) isKeyMissing = true;
    } else if (newProvider === 'huggingface') {
        providerName = 'Hugging Face';
        if (!hfToken || !hfToken.trim()) isKeyMissing = true;
    } else if (newProvider.startsWith('groq')) {
        providerName = 'Groq';
        if (!groqApiKey || !groqApiKey.trim()) isKeyMissing = true;
    }

    setAiProvider(newProvider);
    
    if (isKeyMissing) {
        toast.error(`Chave de API para ${providerName} não encontrada. Por favor, configure-a antes de usar.`, { 
            duration: 6000,
            id: `api-key-missing-${newProvider}`
        });
        openApiSettingsModal();
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg print:hidden">
      <div className="flex flex-col items-center justify-center h-auto p-4 border-b dark:border-gray-700">
        <img src="https://github.com/MarceloClaro/logos/blob/main/sms.png?raw=true" alt="MedSMS-Crateús AI Logo" className="w-[90%] h-auto mb-2"/>
        <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400 text-center">MedSMS-Crateús AI</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-6">
          <ul className="space-y-2">
            {mainNavItems.map((item) => (
              <NavItem key={item.id} {...item} currentView={currentView} onClick={setCurrentView} />
            ))}

            <CollapsibleMenu label="Cadastros" icon={FolderIcon}>
                 {registrationNavItems.map((item) => (
                    <NavItem key={item.id} {...item} currentView={currentView} onClick={setCurrentView} isSubItem />
                 ))}
            </CollapsibleMenu>

            {aiNavItems.map((item) => (
              <NavItem key={item.id} {...item} currentView={currentView} onClick={setCurrentView} />
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <div className="flex justify-between items-center">
                <label htmlFor="ai-provider-select" className="flex items-center text-sm font-semibold text-gray-800 dark:text-white">
                    <AiAssistantIcon className="h-5 w-5 mr-2 text-primary-500" />
                    <span>Provedor de IA</span>
                </label>
                <button 
                    onClick={openApiSettingsModal}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
                    title="Configurar Chaves de API"
                >
                    <CogIcon className="h-5 w-5" />
                </button>
            </div>
            <select
                id="ai-provider-select"
                value={aiProvider}
                onChange={handleProviderChange}
                className="w-full p-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
                <option value="gemini">Google Gemini</option>
                <option value="huggingface">Hugging Face (Gaia)</option>
                <option value="groq-gemma">Groq (Gemma2)</option>
                <option value="groq-deepseek">Groq (DeepSeek)</option>
                <option value="lm-studio">LM Studio (Local)</option>
            </select>
        </div>
    </div>
  );
};

// No longer a default export
// export default Sidebar;