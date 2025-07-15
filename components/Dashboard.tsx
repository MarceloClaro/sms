
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppointmentStatus, SwotAnalysis, ChatContext } from '../types';
import CalendarView from './CalendarView';
import { useDataContext, useUIContext, useActionsContext } from '../context';
import { generateSwotAnalysis } from '../services/aiService';
import { 
    ClockWaitingIcon, 
    UserXIcon, 
    ClipboardXIcon, 
    QuestionMarkCircleIcon, 
    ProcedureIcon, 
    DoctorIcon,
    PatientsIcon,
    FilterIcon,
    XCircleIcon,
    DotsVerticalIcon,
    CameraIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ChartPieIcon,
    AcademicCapIcon,
    MunicipalityIcon,
    DownloadIcon,
    LightBulbIcon,
    ChevronDownIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
} from './icons';
import { calculateAge, exportToCSV } from '../utils/export';

// --- Helper Functions ---
const downloadChartAsPNG = (svgId: string, title: string) => {
    const svgEl = document.getElementById(svgId);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#1f2937' : '#ffffff';

    const { width, height } = svgEl.getBoundingClientRect();
    canvas.width = width * 2; // Increase resolution
    canvas.height = height * 2;
    
    const img = new Image();
    img.onload = () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${title.replace(/ /g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
};


// --- Sub-components ---

const SwotQuadrant: React.FC<{
    title: string;
    items?: string[];
    colorClass: string;
    quadrantId: string;
    onSpeak: (text: string, quadrantId: string) => void;
    speakingQuadrantId: string | null;
}> = ({ title, items = [], colorClass, quadrantId, onSpeak, speakingQuadrantId }) => {
    const isSpeaking = speakingQuadrantId === quadrantId;
    const textToSpeak = `${title}. ${items.join('. ')}`;

    return (
        <div className={`p-4 rounded-lg ${colorClass}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg text-white">{title}</h4>
                {items.length > 0 && (
                    <button
                        onClick={() => onSpeak(textToSpeak, quadrantId)}
                        className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
                        aria-label={isSpeaking ? "Parar leitura" : "Ouvir análise"}
                    >
                        {isSpeaking ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {items.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-white">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-sm text-white/80">Nenhum ponto gerado pela IA.</p>
            )}
        </div>
    );
};

const SwotSection: React.FC<{
    topic: string;
    swotState: { data: SwotAnalysis | null; isLoading: boolean; error: string | null };
    onGenerate: () => void;
    onSpeak: (text: string, quadrantId: string) => void;
    speakingQuadrantId: string | null;
}> = ({ topic, swotState, onGenerate, onSpeak, speakingQuadrantId }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        if (!swotState.data && !swotState.isLoading && !isExpanded) {
            onGenerate();
        }
        setIsExpanded(prev => !prev);
    };

    return (
        <div className="mt-6 border-t dark:border-gray-700 pt-4">
            <button onClick={handleToggle} className="flex justify-between items-center w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <h4 className="text-md font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5 text-yellow-400" />
                    Análise Estratégica SWOT (IA)
                </h4>
                <ChevronDownIcon className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="mt-4 px-2">
                    {swotState.isLoading && (
                         <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                            Analisando dados e gerando insights...
                        </div>
                    )}
                    {swotState.error && <p className="text-sm text-red-500 text-center">{swotState.error}</p>}
                    {swotState.data && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <SwotQuadrant title="Forças" items={swotState.data.strengths} colorClass="bg-green-500" quadrantId={`${topic}-strengths`} onSpeak={onSpeak} speakingQuadrantId={speakingQuadrantId} />
                           <SwotQuadrant title="Fraquezas" items={swotState.data.weaknesses} colorClass="bg-red-500" quadrantId={`${topic}-weaknesses`} onSpeak={onSpeak} speakingQuadrantId={speakingQuadrantId} />
                           <SwotQuadrant title="Oportunidades" items={swotState.data.opportunities} colorClass="bg-blue-500" quadrantId={`${topic}-opportunities`} onSpeak={onSpeak} speakingQuadrantId={speakingQuadrantId} />
                           <SwotQuadrant title="Ameaças" items={swotState.data.threats} colorClass="bg-yellow-500" quadrantId={`${topic}-threats`} onSpeak={onSpeak} speakingQuadrantId={speakingQuadrantId} />
                       </div>
                    )}
                </div>
            )}
        </div>
    );
};


const BarChart: React.FC<{
    data: { name: string; value: number | string }[];
    chartId: string;
    title: string;
    color: string;
}> = ({ data, chartId, title, color }) => {
    const numericValues = data.map(d => typeof d.value === 'number' ? d.value : parseFloat(d.value.toString().replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0);
    const maxValue = Math.max(...numericValues, 1);
    
    // SVG dimensions
    const barHeight = 24;
    const barSpacing = 8;
    const topPadding = 5;
    const chartHeight = data.length * (barHeight + barSpacing) + topPadding;
    const chartWidth = 500;
    const labelWidth = chartWidth * (1/3);
    const barAreaWidth = chartWidth * (2/3);

    return (
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            {data.length > 0 && (
                <button
                    onClick={() => downloadChartAsPNG(chartId, title)}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Baixar Gráfico como PNG"
                >
                    <CameraIcon className="h-5 w-5" />
                </button>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
            {data.length > 0 ? (
                <svg id={chartId} width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <style>
                        {`
                        .label-text {
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                            font-size: 14px;
                            fill: #4b5563; /* gray-600 */
                        }
                        .dark .label-text {
                            fill: #d1d5db; /* gray-300 */
                        }
                        .value-text {
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                            font-size: 12px;
                            font-weight: bold;
                            fill: white;
                        }
                        .track-rect {
                            fill: #e5e7eb; /* gray-200 */
                        }
                        .dark .track-rect {
                            fill: #374151; /* gray-700 */
                        }
                        `}
                    </style>
                    {data.map((item, index) => {
                        const y = index * (barHeight + barSpacing) + topPadding;
                        const itemValue = typeof item.value === 'number' ? item.value : parseFloat(item.value.toString().replace(/[^0-9,-]+/g, "").replace(',', '.'));
                        const currentBarWidth = (Number(itemValue) / Number(maxValue)) * barAreaWidth;
                        
                        return (
                            <g key={item.name}>
                                <text x="0" y={y + barHeight / 2} className="label-text" dominantBaseline="middle">
                                    <title>{item.name}</title>
                                    {item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name}
                                </text>
                                <rect
                                    x={labelWidth}
                                    y={y}
                                    width={barAreaWidth}
                                    height={barHeight}
                                    className="track-rect"
                                    rx="12"
                                    ry="12"
                                />
                                {currentBarWidth > 1 && (
                                    <rect
                                        x={labelWidth}
                                        y={y}
                                        width={currentBarWidth}
                                        height={barHeight}
                                        fill={color}
                                        rx="12"
                                        ry="12"
                                    />
                                )}
                                {currentBarWidth > 35 && ( // Only show value if there's enough space
                                <text
                                    x={labelWidth + currentBarWidth - 8}
                                    y={y + barHeight / 2}
                                    className="value-text"
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                >
                                    {item.value}
                                </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            ) : (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhum dado para exibir.</p>
            )}
        </div>
    );
};


const MunicipalityAnalysisCard: React.FC<{
    data: {
        name: string;
        offered: { [key: string]: number };
        executed: { [key: string]: number };
    }
}> = ({ data }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">{data.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Ofertado: <span className="font-bold text-blue-500">{data.offered.total}</span></h4>
                <ul className="text-sm mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                    {Object.entries(data.offered).filter(([key]) => key !== 'total').map(([type, count]) => (
                        <li key={type}>{type}: {count}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Executado: <span className="font-bold text-green-500">{data.executed.total}</span></h4>
                 <ul className="text-sm mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                    {Object.entries(data.executed).filter(([key]) => key !== 'total').map(([type, count]) => (
                        <li key={type}>{type}: {count}</li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);


const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
        <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
            <Icon className="h-6 w-6 text-primary-500" />
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const OperationsTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
            ? 'bg-primary-500 text-white shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);

const OperationsListItem: React.FC<{
    icon: React.ElementType,
    primaryText: string,
    secondaryText: string,
    time?: string,
    children?: React.ReactNode;
}> = ({ icon: Icon, primaryText, secondaryText, time, children }) => (
    <li className="flex items-center py-3">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500 mr-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{primaryText}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{secondaryText}</p>
        </div>
        {time && <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">{time}</span>}
        {children}
    </li>
);

const ActionMenu: React.FC<{
    appointmentId: string,
    currentStatus: AppointmentStatus,
}> = ({ appointmentId, currentStatus }) => {
    const { updateAppointmentStatus } = useActionsContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (status: AppointmentStatus) => {
        updateAppointmentStatus(appointmentId, status);
        setIsOpen(false);
    }
    
    return (
        <div className="relative ml-2">
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                <DotsVerticalIcon className="h-5 w-5"/>
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border dark:border-gray-600"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1">
                        {currentStatus === 'agendado' && (
                           <button onClick={() => handleAction('em_espera')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Confirmar Chegada</button>
                        )}
                        {currentStatus === 'em_espera' && (
                           <button onClick={() => handleAction('atendido')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Finalizar Atendimento</button>
                        )}
                        {currentStatus !== 'atendido' && currentStatus !== 'nao_compareceu' && (
                             <button onClick={() => handleAction('nao_compareceu')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Marcar Não Compareceu</button>
                        )}
                         <button onClick={() => handleAction('cancelado_paciente')} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Cancelar Agendamento</button>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Main Component ---
type SwotState = { data: SwotAnalysis | null; isLoading: boolean; error: string | null };

export const Dashboard: React.FC = () => {
    const dataContext = useDataContext();
    const { 
        openDailyScheduleModal, 
        aiProvider, 
        geminiApiKey, 
        hfToken, 
        groqApiKey,
        lmStudioUrl,
        lmStudioModel,
        selectedDate,
        setSelectedDate
    } = useUIContext();
    const { patients, appointments, doctors, procedures, procedureTypes, municipalities, campaigns, priceTables, priceTableEntries, occurrences } = dataContext;
    
    const [activeOperationsTab, setActiveOperationsTab] = useState<'queue' | 'schedule' | 'incidents'>('queue');
    const [filterDoctor, setFilterDoctor] = useState<string>('');
    const [filterMunicipality, setFilterMunicipality] = useState<string>('');
    const [filterProcedureType, setFilterProcedureType] = useState<string>('');
    const [filterCampaign, setFilterCampaign] = useState<string>('');

    // --- SWOT State ---
    const [financialSwot, setFinancialSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });
    const [doctorPerfSwot, setDoctorPerfSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });
    const [municipalityPerfSwot, setMunicipalityPerfSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });
    const [productionSwot, setProductionSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });
    const [statusChartSwot, setStatusChartSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });
    const [executedChartSwot, setExecutedChartSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });
    const [slotAnalysisSwot, setSlotAnalysisSwot] = useState<SwotState>({ data: null, isLoading: false, error: null });

    // --- Speech Synthesis State & Handler ---
    const [speakingQuadrantId, setSpeakingQuadrantId] = useState<string | null>(null);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            console.warn('A síntese de voz não é suportada neste navegador.');
            return;
        }

        const synth = window.speechSynthesis;

        const loadVoices = () => {
            voicesRef.current = synth.getVoices();
        };

        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }

        const keepAliveInterval = setInterval(() => {
            if (synth.paused) {
                synth.resume();
            }
        }, 5000);

        const handleBeforeUnload = () => synth.cancel();
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            synth.cancel();
            clearInterval(keepAliveInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (synth.onvoiceschanged !== undefined) {
                synth.onvoiceschanged = null;
            }
        };
    }, []);

    const handleSpeak = (text: string, quadrantId: string) => {
        const synth = window.speechSynthesis;
        if (!synth) {
            alert('Seu navegador não suporta a vocalização de texto.');
            return;
        }

        if (speakingQuadrantId === quadrantId && (synth.speaking || synth.pending)) {
            synth.cancel();
            setSpeakingQuadrantId(null);
            return;
        }
        
        synth.cancel();

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            
            const ptBrVoice = voicesRef.current.find(voice => voice.lang === 'pt-BR' && voice.name.includes('Google')) || voicesRef.current.find(voice => voice.lang === 'pt-BR');
            if (ptBrVoice) {
                utterance.voice = ptBrVoice;
            }

            utterance.onstart = () => setSpeakingQuadrantId(quadrantId);
            utterance.onend = () => setSpeakingQuadrantId(null);
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event.error, event);
                alert(`Ocorreu um erro ao tentar vocalizar o texto. Código do erro: ${event.error}`);
                setSpeakingQuadrantId(null);
            };
            
            synth.speak(utterance);
        }, 100);
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(app => {
            const patient = patients.find(p => p.id === app.patientId);
            const procedure = procedures.find(p => p.id === app.procedureId);
            if (!patient || !procedure) return false;

            const doctorMatch = !filterDoctor || app.doctorId === filterDoctor;
            const municipalityMatch = !filterMunicipality || patient.municipalityId === filterMunicipality;
            const procedureTypeMatch = !filterProcedureType || procedure.procedureTypeId === filterProcedureType;
            const campaignMatch = !filterCampaign || app.campaignId === filterCampaign;

            return doctorMatch && municipalityMatch && procedureTypeMatch && campaignMatch;
        });
    }, [appointments, patients, procedures, filterDoctor, filterMunicipality, filterProcedureType, filterCampaign]);
    
    const filteredPatients = useMemo(() => {
         if (!filterMunicipality) return patients;
         return patients.filter(p => p.municipalityId === filterMunicipality);
    }, [patients, filterMunicipality]);

    const appointmentsForSelectedDay = useMemo(() => {
        const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
        
        return filteredAppointments.filter(a => {
            const appDate = new Date(a.date);
            return appDate >= startOfDay && appDate <= endOfDay;
        });
    }, [filteredAppointments, selectedDate]);

    const waitingList = useMemo(() => appointmentsForSelectedDay.filter(a => a.status === 'em_espera').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [appointmentsForSelectedDay]);
    const scheduledForDay = useMemo(() => appointmentsForSelectedDay.filter(a => a.status === 'agendado').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [appointmentsForSelectedDay]);
    const attendedForDay = useMemo(() => appointmentsForSelectedDay.filter(a => a.status === 'atendido'), [appointmentsForSelectedDay]);
    
    const incidentsForDay = useMemo(() => {
        const incidentStatuses: AppointmentStatus[] = ['nao_compareceu', 'cancelado_paciente', 'cancelado_medico'];
        
        const allIncidents = appointmentsForSelectedDay
            .filter(app => 
                incidentStatuses.includes(app.status) || 
                // Considerar uma ocorrência um "incidente" se não for o check-in padrão
                (!!app.occurrenceId && occurrences.find(o => o.id === app.occurrenceId)?.name !== 'Paciente chegou')
            )
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return allIncidents;
    }, [appointmentsForSelectedDay, occurrences]);


    // --- Production Analysis Data ---
    const analysisData = useMemo(() => {
        const dataByMunicipality: {
            [key: string]: {
                name: string;
                offered: { [key: string]: number };
                executed: { [key: string]: number };
            }
        } = {};

        const municipalitiesToDisplay = filterMunicipality 
            ? municipalities.filter(m => m.id === filterMunicipality)
            : municipalities;
        
        const initialCounts = procedureTypes.reduce((acc, pt) => ({...acc, [pt.name]: 0}), {} as Record<string, number>);

        municipalitiesToDisplay.forEach(mun => {
            dataByMunicipality[mun.id] = {
                name: mun.name,
                offered: { ...initialCounts, total: 0 },
                executed: { ...initialCounts, total: 0 }
            };
        });

        filteredAppointments.forEach(app => {
            const patient = patients.find(p => p.id === app.patientId);
            const procedure = procedures.find(p => p.id === app.procedureId);
            const procedureType = procedure ? procedureTypes.find(pt => pt.id === procedure.procedureTypeId) : null;

            if (patient && procedureType && dataByMunicipality[patient.municipalityId]) {
                const munData = dataByMunicipality[patient.municipalityId];
                munData.offered[procedureType.name]++;
                munData.offered.total++;
                if (app.status === 'atendido') {
                    munData.executed[procedureType.name]++;
                    munData.executed.total++;
                }
            }
        });
        return Object.values(dataByMunicipality).filter(d => d.offered.total > 0);
    }, [filteredAppointments, patients, procedures, procedureTypes, municipalities, filterMunicipality]);

    const chartDataExecuted = useMemo(() => {
        const executed = filteredAppointments.filter(app => app.status === 'atendido');
        const counts = procedureTypes.reduce((acc, pt) => ({...acc, [pt.name]: 0}), {} as Record<string, number>);
        
        executed.forEach(app => {
            const procedure = procedures.find(p => p.id === app.procedureId);
            const procedureType = procedure ? procedureTypes.find(pt => pt.id === procedure.procedureTypeId) : null;
            if (procedureType) {
                counts[procedureType.name]++;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    }, [filteredAppointments, procedures, procedureTypes]);

    const chartDataStatus = useMemo(() => {
        const statusMap: Record<AppointmentStatus, string> = {
            agendado: 'Agendado', em_espera: 'Em Espera', atendido: 'Atendido', nao_compareceu: 'Não Compareceu',
            cancelado_paciente: 'Cancelado (Paciente)', cancelado_medico: 'Cancelado (Equipe)',
        };
        const counts: { [key: string]: number } = {};
        for (const key in statusMap) { counts[statusMap[key as AppointmentStatus]] = 0; }

        filteredAppointments.forEach(app => {
            const statusName = statusMap[app.status];
            if (statusName) { counts[statusName]++; }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    }, [filteredAppointments]);

    const slotAnalysisData = useMemo(() => {
        const executedCounts = filteredAppointments.reduce((acc, app) => {
            if (app.status === 'atendido') {
                acc[app.procedureId] = (acc[app.procedureId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const relevantProcedureIds = new Set(filteredAppointments.map(app => app.procedureId));
        
        return procedures
            .filter(proc => relevantProcedureIds.has(proc.id) && proc.slotsAvailable !== undefined)
            .map(proc => {
                const executed = executedCounts[proc.id] || 0;
                const offered = proc.slotsAvailable;
                const balance = offered !== undefined ? offered - executed : undefined;
                const procedureType = procedureTypes.find(pt => pt.id === proc.procedureTypeId);

                return {
                    id: proc.id,
                    name: proc.name,
                    type: procedureType?.name || 'N/A',
                    offered: offered ?? 'N/D',
                    executed,
                    balance: balance
                };
            });
    }, [procedures, procedureTypes, filteredAppointments]);

    // --- NEW DETAILED ANALYSIS ---
    const getProcedurePrice = (procedureId: string, priceTableId: string): number => {
        const entry = priceTableEntries.find(e => e.priceTableId === priceTableId && e.procedureId === procedureId);
        return entry?.value || 0;
    };

    const financialAnalysis = useMemo(() => {
        const particularTableId = 'pt02'; // Tabela Particular
        const attendedAppointments = filteredAppointments.filter(a => a.status === 'atendido');
        
        const totalRevenue = attendedAppointments.reduce((sum, app) => {
            return sum + getProcedurePrice(app.procedureId, particularTableId);
        }, 0);

        const revenueByProcedureType = attendedAppointments.reduce((acc, app) => {
            const procedure = procedures.find(p => p.id === app.procedureId);
            const procedureType = procedure ? procedureTypes.find(pt => pt.id === procedure.procedureTypeId) : null;
            if (procedureType) {
                const price = getProcedurePrice(app.procedureId, particularTableId);
                acc[procedureType.name] = (acc[procedureType.name] || 0) + price;
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            totalRevenue,
            averageRevenue: attendedAppointments.length > 0 ? Number(totalRevenue) / Number(attendedAppointments.length) : 0,
            revenueByProcedureType: Object.entries(revenueByProcedureType)
                .map(([name, value]) => ({ name, value: value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }))
                .filter(d => parseFloat(d.value.replace(/[^0-9,-]+/g,"").replace(',','.')) > 0),
        };
    }, [filteredAppointments, procedures, procedureTypes, priceTableEntries]);
    
    const doctorPerformance = useMemo(() => {
        const particularTableId = 'pt02';
        return doctors.map(doctor => {
            const docAppointments = filteredAppointments.filter(a => a.doctorId === doctor.id);
            const attended = docAppointments.filter(a => a.status === 'atendido').length;
            const noShows = docAppointments.filter(a => a.status === 'nao_compareceu').length;
            const cancellations = docAppointments.filter(a => a.status === 'cancelado_paciente' || a.status === 'cancelado_medico').length;
            const revenue = docAppointments
                .filter(a => a.status === 'atendido')
                .reduce((sum, app) => sum + getProcedurePrice(app.procedureId, particularTableId), 0);

            return {
                id: doctor.id,
                name: doctor.name,
                attended,
                noShows,
                cancellations,
                revenue,
            };
        }).sort((a, b) => b.revenue - a.revenue);
    }, [filteredAppointments, doctors, procedures, priceTableEntries]);

    const ageDistribution = useMemo(() => {
        const brackets: { [key: string]: number } = { '0-17': 0, '18-30': 0, '31-45': 0, '46-60': 0, '61+': 0 };
        
        filteredPatients.forEach(patient => {
            const age = calculateAge(patient.dateOfBirth);
            if (age <= 17) brackets['0-17']++;
            else if (age <= 30) brackets['18-30']++;
            else if (age <= 45) brackets['31-45']++;
            else if (age <= 60) brackets['46-60']++;
            else brackets['61+']++;
        });

        return Object.entries(brackets).map(([name, value]): { name: string; value: number } => ({ name, value }));
    }, [filteredPatients]);

    const municipalityPerformance = useMemo(() => {
        const particularTableId = 'pt02';
        return municipalities
            .map(municipality => {
                const patientsInMunicipality = filteredPatients.filter(p => p.municipalityId === municipality.id);
                const patientIdsInMunicipality = new Set(patientsInMunicipality.map(p => p.id));
                
                const municipalityAppointments = filteredAppointments.filter(a => patientIdsInMunicipality.has(a.patientId));
                
                const attended = municipalityAppointments.filter(a => a.status === 'atendido');
                const noShows = municipalityAppointments.filter(a => a.status === 'nao_compareceu').length;
                
                const revenue = attended.reduce((sum, app) => {
                    return sum + getProcedurePrice(app.procedureId, particularTableId);
                }, 0);

                return {
                    id: municipality.id,
                    name: municipality.name,
                    patientCount: patientsInMunicipality.length,
                    appointmentCount: municipalityAppointments.length,
                    attendedCount: attended.length,
                    noShowCount: noShows,
                    revenue,
                };
            })
            .filter(m => m.appointmentCount > 0) // Only show municipalities with activity
            .sort((a, b) => b.revenue - a.revenue);
    }, [filteredAppointments, filteredPatients, municipalities, priceTableEntries]);
    // --- END NEW ANALYSIS ---

    const handleGenerateSwot = async (
        topic: string, 
        data: any, 
        stateUpdater: React.Dispatch<React.SetStateAction<SwotState>>
    ) => {
        stateUpdater({ data: null, isLoading: true, error: null });
        try {
            const fullContext: ChatContext = {
                patients: dataContext.patients,
                appointments: dataContext.appointments,
                doctors: dataContext.doctors,
                locations: dataContext.locations,
                procedures: dataContext.procedures,
                procedureTypes: dataContext.procedureTypes,
                occurrences: dataContext.occurrences,
                campaigns: dataContext.campaigns,
                municipalities: dataContext.municipalities,
                priceTables: dataContext.priceTables,
                priceTableEntries: dataContext.priceTableEntries,
            };
            const result = await generateSwotAnalysis(
                topic, data, fullContext, aiProvider,
                { gemini: geminiApiKey, huggingface: hfToken, groq: groqApiKey, lmStudioUrl, lmStudioModel }
            );
            stateUpdater({ data: result, isLoading: false, error: null });
        } catch (e) {
            const error = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
            stateUpdater({ data: null, isLoading: false, error });
        }
    };


    const getPatient = (id: string) => patients.find(p => p.id === id);
    const getDoctor = (id: string) => doctors.find(d => d.id === id);
    const getProcedure = (id: string) => procedures.find(p => p.id === id);
    
    const clearFilters = () => {
        setFilterDoctor('');
        setFilterMunicipality('');
        setFilterProcedureType('');
        setFilterCampaign('');
    };

    const handleExportAnalysis = (data: any[], filename: string) => {
        exportToCSV(data, filename);
    };

    const handleCalendarDayClick = (date: Date) => {
        setSelectedDate(date);
        openDailyScheduleModal(date);
    };

    const inputClasses = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500";

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                 <div className="flex items-center gap-2 mb-2">
                    <FilterIcon className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filtros</h3>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className={inputClasses}>
                        <option value="">Todos os Médicos</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select value={filterMunicipality} onChange={e => setFilterMunicipality(e.target.value)} className={inputClasses}>
                        <option value="">Todos os Municípios</option>
                        {municipalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select value={filterProcedureType} onChange={e => setFilterProcedureType(e.target.value)} className={inputClasses}>
                        <option value="">Todos os Tipos</option>
                        {procedureTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                    </select>
                    <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} className={inputClasses}>
                        <option value="">Todas as Campanhas</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                     <button onClick={clearFilters} className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                        <XCircleIcon className="h-5 w-5"/>
                        Limpar Filtros
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pacientes em Espera" value={waitingList.length.toString()} icon={ClockWaitingIcon} />
                <StatCard title="Consultas Agendadas" value={scheduledForDay.length.toString()} icon={ProcedureIcon} />
                <StatCard title="Atendimentos no Dia" value={attendedForDay.length.toString()} icon={DoctorIcon} />
                <StatCard title="Total de Pacientes" value={filteredPatients.length.toString()} icon={PatientsIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Calendário de Consultas</h2>
                    <CalendarView
                        appointments={filteredAppointments}
                        onDayClick={handleCalendarDayClick}
                        selectedDate={selectedDate}
                    />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Operações para {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </h2>
                    <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mb-4">
                        <OperationsTab label="Fila de Espera" isActive={activeOperationsTab === 'queue'} onClick={() => setActiveOperationsTab('queue')} />
                        <OperationsTab label="Agenda" isActive={activeOperationsTab === 'schedule'} onClick={() => setActiveOperationsTab('schedule')} />
                        <OperationsTab label="Ocorrências" isActive={activeOperationsTab === 'incidents'} onClick={() => setActiveOperationsTab('incidents')} />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                        {activeOperationsTab === 'queue' && (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {waitingList.length > 0 ? waitingList.map(appt => (
                                    <OperationsListItem
                                        key={appt.id}
                                        icon={ClockWaitingIcon}
                                        primaryText={getPatient(appt.patientId)?.name || 'Paciente não encontrado'}
                                        secondaryText={`${getProcedure(appt.procedureId)?.name || ''} com ${getDoctor(appt.doctorId)?.name || ''}`}
                                        time={new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    >
                                        <ActionMenu appointmentId={appt.id} currentStatus={appt.status} />
                                    </OperationsListItem>
                                )) : <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">Fila de espera vazia.</p>}
                            </ul>
                        )}
                         {activeOperationsTab === 'schedule' && (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {scheduledForDay.length > 0 ? scheduledForDay.map(appt => (
                                     <OperationsListItem
                                        key={appt.id}
                                        icon={ProcedureIcon}
                                        primaryText={getPatient(appt.patientId)?.name || 'Paciente não encontrado'}
                                        secondaryText={`${getProcedure(appt.procedureId)?.name || ''} com ${getDoctor(appt.doctorId)?.name || ''}`}
                                        time={new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    >
                                        <ActionMenu appointmentId={appt.id} currentStatus={appt.status} />
                                    </OperationsListItem>
                                )) : <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">Nenhuma consulta agendada para o restante do dia.</p>}
                            </ul>
                        )}
                        {activeOperationsTab === 'incidents' && (
                           <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {incidentsForDay.length > 0 ? incidentsForDay.map(appt => {
                                    const patient = getPatient(appt.patientId);
                                    const occurrence = appt.occurrenceId ? occurrences.find(o => o.id === appt.occurrenceId) : null;
                                    
                                    let icon: React.ElementType = QuestionMarkCircleIcon;
                                    let primaryText = '';
                                    let secondaryText = `${patient?.name || 'Paciente não encontrado'}`;

                                    if (appt.status === 'nao_compareceu') {
                                        icon = UserXIcon;
                                        primaryText = 'Não Compareceu';
                                        secondaryText += ` - ${getProcedure(appt.procedureId)?.name || 'Procedimento'}`;
                                    } else if (appt.status.startsWith('cancelado')) {
                                        icon = ClipboardXIcon;
                                        primaryText = `Cancelado (${appt.status === 'cancelado_paciente' ? 'Paciente' : 'Equipe'})`;
                                        secondaryText += appt.cancellationReason ? ` - Motivo: ${appt.cancellationReason}` : '';
                                    } else if (occurrence) {
                                        icon = QuestionMarkCircleIcon;
                                        primaryText = occurrence.name;
                                    } else {
                                        primaryText = 'Ocorrência Desconhecida';
                                    }
                                    
                                    return (
                                        <OperationsListItem
                                            key={appt.id}
                                            icon={icon}
                                            primaryText={primaryText}
                                            secondaryText={secondaryText}
                                            time={new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        />
                                    );
                                }) : <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">Nenhuma ocorrência registrada para o dia.</p>}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                    <ChartBarIcon className="h-7 w-7 text-primary-500"/>
                    Análises Detalhadas
                </h2>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CurrencyDollarIcon className="h-6 w-6" />
                        Resumo Financeiro (Tabela Particular)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        <StatCard title="Receita Total Realizada" value={financialAnalysis.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={CurrencyDollarIcon} />
                        <StatCard title="Receita Média por Atendimento" value={financialAnalysis.averageRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={ChartPieIcon} />
                    </div>
                    <div className="mt-8">
                        <BarChart
                            chartId="revenue-by-proc-chart"
                            title="Receita por Tipo de Procedimento"
                            data={financialAnalysis.revenueByProcedureType}
                            color="#8b5cf6"
                        />
                    </div>
                    <SwotSection 
                        topic="financial"
                        swotState={financialSwot} 
                        onGenerate={() => handleGenerateSwot('Financeiro', financialAnalysis, setFinancialSwot)}
                        onSpeak={handleSpeak}
                        speakingQuadrantId={speakingQuadrantId}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AcademicCapIcon className="h-6 w-6" />
                            Desempenho por Médico
                        </h3>
                        <button onClick={() => handleExportAnalysis(doctorPerformance.map(d => ({...d, revenue: d.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})), 'desempenho_medicos.csv')} className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-lg transition-colors">
                            <DownloadIcon className="h-4 w-4" />
                            Exportar CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Médico</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Atendidos</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Faltas</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cancelados</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Receita Gerada</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {doctorPerformance.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{doc.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{doc.attended}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{doc.noShows}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{doc.cancellations}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                                            {doc.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {doctorPerformance.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum dado de desempenho para os filtros selecionados.</p>}
                    </div>
                    <SwotSection
                         topic="doctor"
                         swotState={doctorPerfSwot} 
                         onGenerate={() => handleGenerateSwot('Desempenho Médico', doctorPerformance, setDoctorPerfSwot)}
                         onSpeak={handleSpeak}
                         speakingQuadrantId={speakingQuadrantId}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MunicipalityIcon className="h-6 w-6" />
                            Análise por Município
                        </h3>
                        <button onClick={() => handleExportAnalysis(municipalityPerformance.map(m => ({...m, revenue: m.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})), 'desempenho_municipios.csv')} className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-lg transition-colors">
                            <DownloadIcon className="h-4 w-4" />
                            Exportar CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Município</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pacientes</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agend.</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Atendidos</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Faltas</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Receita (Part.)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {municipalityPerformance.map(mun => (
                                    <tr key={mun.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{mun.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{mun.patientCount}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{mun.appointmentCount}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-green-600 dark:text-green-400">{mun.attendedCount}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-600 dark:text-red-400">{mun.noShowCount}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {mun.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {municipalityPerformance.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum dado de município para os filtros selecionados.</p>}
                    </div>
                     <SwotSection
                         topic="municipality"
                         swotState={municipalityPerfSwot} 
                         onGenerate={() => handleGenerateSwot('Desempenho por Município', municipalityPerformance, setMunicipalityPerfSwot)} 
                         onSpeak={handleSpeak}
                         speakingQuadrantId={speakingQuadrantId}
                    />
                </div>

                <BarChart
                    chartId="age-distribution-chart"
                    title="Distribuição de Pacientes por Faixa Etária"
                    data={ageDistribution}
                    color="#f97316" // orange-500
                />
            </div>
            
            {/* --- Análise de Produção e Vagas --- */}
             <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                        <ChartBarIcon className="h-7 w-7 text-primary-500"/>
                        Análise de Produção
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysisData.length > 0 ? (
                            analysisData.map(data => <MunicipalityAnalysisCard key={data.name} data={data} />)
                        ) : (
                            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                                Nenhum dado de produção encontrado para os filtros selecionados.
                            </p>
                        )}
                    </div>
                     <SwotSection
                         topic="production"
                         swotState={productionSwot} 
                         onGenerate={() => handleGenerateSwot('Análise de Produção', analysisData, setProductionSwot)} 
                         onSpeak={handleSpeak}
                         speakingQuadrantId={speakingQuadrantId}
                    />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                        <BarChart
                            chartId="executed-chart"
                            title="Procedimentos Realizados por Tipo"
                            data={chartDataExecuted}
                            color="#22c55e" // green-500
                        />
                        <SwotSection
                             topic="executed"
                             swotState={executedChartSwot} 
                             onGenerate={() => handleGenerateSwot('Procedimentos Realizados', chartDataExecuted, setExecutedChartSwot)} 
                             onSpeak={handleSpeak}
                             speakingQuadrantId={speakingQuadrantId}
                        />
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                        <BarChart
                            chartId="status-chart"
                            title="Visão Geral dos Agendamentos"
                            data={chartDataStatus}
                            color="#3b82f6" // blue-500
                        />
                         <SwotSection
                             topic="status"
                             swotState={statusChartSwot} 
                             onGenerate={() => handleGenerateSwot('Visão Geral dos Agendamentos', chartDataStatus, setStatusChartSwot)} 
                             onSpeak={handleSpeak}
                             speakingQuadrantId={speakingQuadrantId}
                        />
                    </div>
                </div>
             </div>

             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                        <ChartBarIcon className="h-7 w-7 text-primary-500"/>
                        Análise de Vagas
                    </h2>
                    <button onClick={() => handleExportAnalysis(slotAnalysisData, 'analise_vagas.csv')} className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-lg transition-colors mb-4">
                        <DownloadIcon className="h-4 w-4" />
                        Exportar CSV
                    </button>
                 </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <div className="overflow-x-auto">
                        {slotAnalysisData.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                 <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Procedimento</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vagas Ofertadas</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vagas Executadas</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Saldo</th>
                                    </tr>
                                 </thead>
                                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {slotAnalysisData.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.type}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-semibold">{item.offered}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">{item.executed}</td>
                                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold ${typeof item.balance === 'number' && item.balance < 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>{item.balance}</td>
                                        </tr>
                                    ))}
                                 </tbody>
                            </table>
                        ) : (
                             <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                Nenhuma vaga para analisar com os filtros atuais. Verifique se os procedimentos têm vagas definidas.
                            </p>
                        )}
                    </div>
                     <SwotSection
                         topic="slots"
                         swotState={slotAnalysisSwot} 
                         onGenerate={() => handleGenerateSwot('Análise de Vagas', slotAnalysisData, setSlotAnalysisSwot)} 
                         onSpeak={handleSpeak}
                         speakingQuadrantId={speakingQuadrantId}
                    />
                </div>
             </div>
        </div>
    );
};