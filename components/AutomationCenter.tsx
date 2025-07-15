
import React, { useState, useEffect } from 'react';
import { AutomationSuggestion } from '../types';
import { generateAutomatedMessages } from '../services/aiService';
import { WhatsAppIcon, SparklesIcon, LightBulbIcon } from './icons';
import { useDataContext, useUIContext } from '../context';
import toast from 'react-hot-toast';

const SuggestionCard: React.FC<{ suggestion: AutomationSuggestion }> = ({ suggestion }) => {
    const isReminder = suggestion.type === 'reminder';
    const isCampaign = suggestion.type === 'campaign';
    const isFollowUp = suggestion.type === 'follow-up';
    const isPreparation = suggestion.type === 'preparation';

    let cardColor = '#a855f7'; // purple-500 for reminder
    let cardLabel = 'Lembrete';

    if (isFollowUp) {
        cardColor = '#10b981'; // emerald-500
        cardLabel = 'Acompanhamento';
    } else if (isCampaign) {
        cardColor = '#f97316'; // orange-500
        cardLabel = 'Campanha';
    } else if (isPreparation) {
        cardColor = '#3b82f6'; // blue-500
        cardLabel = 'Preparo';
    }

    const openWhatsApp = () => {
        const encodedMessage = encodeURIComponent(suggestion.message);
        window.open(`https://wa.me/${suggestion.patientPhone}?text=${encodedMessage}`, '_blank');
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-l-4 transition hover:shadow-lg" style={{ borderColor: cardColor }}>
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold uppercase px-2 py-1 rounded-full text-white" style={{ backgroundColor: cardColor }}>
                        {cardLabel}
                    </span>
                    <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">{suggestion.patientName}</h3>
                </div>
                <button 
                    onClick={openWhatsApp}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 transition-colors"
                >
                    <WhatsAppIcon className="h-4 w-4" />
                    Enviar
                </button>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                {suggestion.message}
            </p>
            {suggestion.reasoning && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                        <LightBulbIcon className="h-4 w-4 flex-shrink-0 text-yellow-400 mt-0.5" />
                        <span><strong className="font-semibold">Motivo:</strong> {suggestion.reasoning}</span>
                    </p>
                </div>
            )}
        </div>
    )
}

export const AutomationCenter: React.FC = () => {
    const { patients, appointments, doctors, campaigns, procedures, procedureTypes, locations } = useDataContext();
    const { aiProvider, geminiApiKey, hfToken, groqApiKey, lmStudioUrl, lmStudioModel } = useUIContext();
    
    const [suggestions, setSuggestions] = useState<AutomationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [targetDate, setTargetDate] = useState(new Date());
    const [analysisStarted, setAnalysisStarted] = useState(false);

    const dateToInputValue = (date: Date): string => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchSuggestions = async () => {
        if (patients.length === 0 || appointments.length === 0) {
            toast.error("Não há dados de pacientes ou agendamentos para analisar.");
            setAnalysisStarted(true);
            return;
        };

        setAnalysisStarted(true);
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const apiKeys = { gemini: geminiApiKey, huggingface: hfToken, groq: groqApiKey, lmStudioUrl, lmStudioModel };
            const results = await generateAutomatedMessages(
                { patients, appointments, doctors, campaigns, procedures, procedureTypes, locations },
                aiProvider,
                apiKeys,
                targetDate
            );
            setSuggestions(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setAnalysisStarted(false);
        setSuggestions([]);
        setError(null);
    }, [targetDate]);

    const reminders = suggestions.filter(s => s.type === 'reminder');
    const followUps = suggestions.filter(s => s.type === 'follow-up');
    const campaignMsgs = suggestions.filter(s => s.type === 'campaign');
    const preparations = suggestions.filter(s => s.type === 'preparation');

    return (
        <div className="space-y-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <SparklesIcon className="h-12 w-12 mx-auto text-primary-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Central de Automação</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    A IA pode analisar seus dados para otimizar o engajamento, confirmar procedimentos e gerar mensagens personalizadas. Para exames e cirurgias, a IA sugere instruções de preparo. Revise e envie com um clique.
                </p>
                 <div className="mt-6 flex justify-center items-center gap-3">
                    <label htmlFor="automation-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gerar sugestões para a data:
                    </label>
                    <input
                        type="date"
                        id="automation-date"
                        value={dateToInputValue(targetDate)}
                        onChange={(e) => setTargetDate(new Date(e.target.value.replace(/-/g, '/')))}
                        className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                </div>
            </div>
            
             <div className="mt-8">
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Analisando dados e gerando sugestões inteligentes...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Erro ao Carregar Sugestões</p>
                        <p>{error}</p>
                    </div>
                ) : !analysisStarted ? (
                     <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                         <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Pronto para Otimizar?</h2>
                         <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                             Clique no botão abaixo para que a IA analise os dados e gere sugestões de comunicação para a data selecionada.
                         </p>
                         <button
                             onClick={fetchSuggestions}
                             className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 text-lg"
                         >
                             <SparklesIcon className="h-6 w-6" />
                             Analisar e Gerar Sugestões
                         </button>
                     </div>
                ) : suggestions.length > 0 ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                         <div className="space-y-8">
                             <div>
                                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lembretes de Consulta</h2>
                                 <div className="space-y-6">
                                     {reminders.length > 0 ? reminders.map(s => <SuggestionCard key={s.patientId + s.type + s.message} suggestion={s} />) : <p className="text-gray-500 dark:text-gray-400">Nenhum lembrete para os próximos dias.</p>}
                                 </div>
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acompanhamentos</h2>
                                 <div className="space-y-6">
                                     {followUps.length > 0 ? followUps.map(s => <SuggestionCard key={s.patientId + s.type + s.message} suggestion={s} />) : <p className="text-gray-500 dark:text-gray-400">Nenhum acompanhamento recente necessário.</p>}
                                 </div>
                             </div>
                         </div>
                          <div className="space-y-8">
                             <div>
                                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Preparo para Procedimentos</h2>
                                 <div className="space-y-6">
                                     {preparations.length > 0 ? preparations.map(s => <SuggestionCard key={s.patientId + s.type + s.message} suggestion={s} />) : <p className="text-gray-500 dark:text-gray-400">Nenhuma instrução de preparo necessária.</p>}
                                 </div>
                             </div>
                             <div>
                                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Campanhas</h2>
                                  <div className="space-y-6">
                                     {campaignMsgs.length > 0 ? campaignMsgs.map(s => <SuggestionCard key={s.patientId + s.type + s.message} suggestion={s} />) : <p className="text-gray-500 dark:text-gray-400">Nenhuma sugestão de campanha.</p>}
                                  </div>
                             </div>
                         </div>
                     </div>
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                         <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Tudo em Ordem!</h2>
                         <p className="mt-2 text-gray-500 dark:text-gray-400">Nenhuma ação de comunicação automática é necessária para a data selecionada.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default AutomationCenter;