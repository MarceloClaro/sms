import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { DownloadIcon, ChartBarIcon, UploadIcon, CameraIcon, FilterIcon, XCircleIcon, TableCellsIcon } from './icons';
import { exportToXLSX, exportToCSV } from '../utils/export';
import { useDataContext, useActionsContext } from '../context';
import * as XLSX from 'xlsx';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';

type ReportRow = { [key: string]: string | number };

// --- Helper Functions and Sub-components (copied from Dashboard) ---
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
    canvas.width = width * 2;
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

const BarChart: React.FC<{
    data: { name: string; value: number | string }[];
    chartId: string;
    title: string;
    color: string;
}> = ({ data, chartId, title, color }) => {
    const numericValues = data.map(d => typeof d.value === 'number' ? d.value : parseFloat(d.value.toString().replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0);
    const maxValue = Math.max(...numericValues, 1);
    
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
                        const currentBarWidth = (itemValue / maxValue) * barAreaWidth;
                        
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

const initialColumnVisibility = {
    'Nº': true,
    'DATA AGENDAMENTO': true,
    'HORA': true,
    'PACIENTE': true,
    'MUNICÍPIO': true,
    'TELEFONE': true,
    'CNS': false,
    'CPF': false,
    'LOCAL': true,
    'PROCEDIMENTO': true,
    'TIPO PROCED.': true,
    'MÉDICO(A)': true,
    'CAMPANHA': false,
    'STATUS': true,
    'VALOR (SUS)': false,
    'VALOR (Part.)': true,
    'MOTIVO CANCEL.': false,
};

const allReportColumns = Object.keys(initialColumnVisibility) as Array<keyof typeof initialColumnVisibility>;

// --- Main Component ---
const ReportsView: React.FC = () => {
    const { 
        appointments, patients, procedures, doctors, locations, municipalities, 
        procedureTypes, campaigns, priceTableEntries 
    } = useDataContext();
    const { handleDataImport } = useActionsContext();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterProcedureType, setFilterProcedureType] = useState('');
  const [filterProcedure, setFilterProcedure] = useState('');

  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  const columnSelectorRef = useRef<HTMLDivElement>(null);

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const inputClasses = "mt-1 block w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";
  
  const handleColumnToggle = (colName: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({...prev, [colName]: !prev[colName]}));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
            setIsColumnSelectorOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [columnSelectorRef]);


  const getPrice = (procedureId: string, priceTableId: string): number => {
      const entry = priceTableEntries.find(e => e.priceTableId === priceTableId && e.procedureId === procedureId);
      return entry?.value || 0;
  };

  const handleGenerateReport = () => {
    let filtered = [...appointments];

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        filtered = filtered.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= start && appDate <= end;
        });
    }

    if (filterDoctor) {
        filtered = filtered.filter(app => app.doctorId === filterDoctor);
    }

    if (filterLocation) {
        filtered = filtered.filter(app => app.locationId === filterLocation);
    }

    if (filterMunicipality) {
        filtered = filtered.filter(app => {
            const patient = patients.find(p => p.id === app.patientId);
            return patient?.municipalityId === filterMunicipality;
        });
    }

    if (filterProcedureType) {
        filtered = filtered.filter(app => {
            const procedure = procedures.find(p => p.id === app.procedureId);
            return procedure?.procedureTypeId === filterProcedureType;
        });
    }
    
    if (filterProcedure) {
        filtered = filtered.filter(app => app.procedureId === filterProcedure);
    }

    setFilteredAppointments(filtered);

    const statusMap: Record<AppointmentStatus, string> = {
      agendado: 'Agendado',
      em_espera: 'Em Espera',
      atendido: 'Atendido',
      nao_compareceu: 'Não Compareceu',
      cancelado_paciente: 'Cancelado (Paciente)',
      cancelado_medico: 'Cancelado (Equipe)',
    };
    
    const generatedData = filtered
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((app, index) => {
        const patient = patients.find(p => p.id === app.patientId);
        const procedure = procedures.find(p => p.id === app.procedureId);
        const doctor = doctors.find(d => d.id === app.doctorId);
        const location = locations.find(l => l.id === app.locationId);
        const municipality = patient ? municipalities.find(m => m.id === patient.municipalityId) : null;
        const procedureType = procedure ? procedureTypes.find(pt => pt.id === procedure.procedureTypeId) : null;
        const campaign = app.campaignId ? campaigns.find(c => c.id === app.campaignId) : null;
        
        const cnsOrCpf = patient?.cnsOrCpf || '';
        const isCNS = cnsOrCpf.replace(/\D/g, '').length === 15;
        
        const appFullDate = new Date(app.date);

        const rowData: ReportRow = {
          'Nº': index + 1,
          'DATA AGENDAMENTO': appFullDate.toLocaleDateString('pt-BR'),
          'HORA': appFullDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          'PACIENTE': patient?.name || 'N/A',
          'MUNICÍPIO': municipality?.name || 'N/A',
          'TELEFONE': patient?.phone || 'N/A',
          'CNS': isCNS ? cnsOrCpf : '',
          'CPF': !isCNS ? cnsOrCpf : '',
          'LOCAL': location?.name || 'N/A',
          'PROCEDIMENTO': procedure?.name || 'N/A',
          'TIPO PROCED.': procedureType?.name || 'N/A',
          'MÉDICO(A)': doctor?.name || 'N/A',
          'CAMPANHA': campaign?.name || 'N/A',
          'STATUS': statusMap[app.status] || app.status,
          'VALOR (SUS)': getPrice(app.procedureId, 'pt01').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}),
          'VALOR (Part.)': getPrice(app.procedureId, 'pt02').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}),
          'MOTIVO CANCEL.': app.cancellationReason || '',
        };
        return rowData;
    });

    setReportData(generatedData);
  };

  const chartDataByStatus = useMemo(() => {
    if (filteredAppointments.length === 0) return [];
    const statusMap: Record<AppointmentStatus, string> = {
      agendado: 'Agendado', em_espera: 'Em Espera', atendido: 'Atendido', nao_compareceu: 'Não Compareceu',
      cancelado_paciente: 'Cancelado (Pac.)', cancelado_medico: 'Cancelado (Equipe)',
    };
    const counts = filteredAppointments.reduce((acc, app) => {
        const statusName = statusMap[app.status] || app.status;
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredAppointments]);

  const chartDataByDoctor = useMemo(() => {
      if (filteredAppointments.length === 0) return [];
      const counts = filteredAppointments.reduce((acc, app) => {
          const doctorName = doctors.find(d => d.id === app.doctorId)?.name || 'N/A';
          acc[doctorName] = (acc[doctorName] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredAppointments, doctors]);

  const chartDataByMunicipality = useMemo(() => {
      if (filteredAppointments.length === 0) return [];
      const counts = filteredAppointments.reduce((acc, app) => {
          const patient = patients.find(p => p.id === app.patientId);
          const municipalityName = patient ? (municipalities.find(m => m.id === patient.municipalityId)?.name || 'N/A') : 'N/A';
          acc[municipalityName] = (acc[municipalityName] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredAppointments, patients, municipalities]);
  
  const financialChartData = useMemo(() => {
    if (filteredAppointments.length === 0) return [];
    const revenueByProcedureType = filteredAppointments
        .filter(app => app.status === 'atendido')
        .reduce((acc, app) => {
            const procedure = procedures.find(p => p.id === app.procedureId);
            const procedureType = procedure ? procedureTypes.find(pt => pt.id === procedure.procedureTypeId) : null;
            if (procedureType) {
                const price = getPrice(app.procedureId, 'pt02'); // Tabela Particular
                acc[procedureType.name] = (acc[procedureType.name] || 0) + price;
            }
            return acc;
        }, {} as Record<string, number>);

    return Object.entries(revenueByProcedureType)
        .map(([name, value]) => ({ name, value: value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }))
        .filter(d => parseFloat(d.value.replace(/[^0-9,-]+/g,"").replace(',','.')) > 0)
        .sort((a,b) => parseFloat(b.value.replace(/[^0-9,-]+/g,"").replace(',','.')) - parseFloat(a.value.replace(/[^0-9,-]+/g,"").replace(',','.')));
  }, [filteredAppointments, procedures, procedureTypes, priceTableEntries]);


  const handleExportXLSX = () => {
    if (reportData.length === 0) {
      toast.error('Gere um relatório antes de exportar.');
      return;
    }
    
    const visibleColumns = allReportColumns.filter(key => columnVisibility[key]);
    const dataToExport = reportData.map(row => {
      const newRow: ReportRow = {};
      visibleColumns.forEach(col => {
        newRow[col] = (row as any)[col];
      });
      return newRow;
    });

    const fileName = `relatorio_agendamentos.xlsx`;
    const success = exportToXLSX(dataToExport, fileName, 'Agendamentos');
    if (success) {
        toast.success('Relatório exportado com sucesso!');
    }
  };

  const handleExportCSV = () => {
    const success = exportToCSV(filteredAppointments, `agendamentos_raw.csv`);
    if (success) {
      toast.success('Dados brutos exportados com sucesso!');
    } else {
      toast.error('Gere um relatório antes de exportar os dados brutos.');
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
                handleDataImport('appointments', jsonData);
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

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setFilterDoctor('');
        setFilterLocation('');
        setFilterMunicipality('');
        setFilterProcedureType('');
        setFilterProcedure('');
        setFilteredAppointments([]);
        setReportData([]);
    };

    const doctorOptions = useMemo(() => doctors.map(d => ({ value: d.id, label: d.name })), [doctors]);
    const locationOptions = useMemo(() => locations.map(l => ({ value: l.id, label: l.name })), [locations]);
    const municipalityOptions = useMemo(() => municipalities.map(m => ({ value: m.id, label: m.name })), [municipalities]);
    const procedureTypeOptions = useMemo(() => procedureTypes.map(pt => ({ value: pt.id, label: pt.name })), [procedureTypes]);
    const procedureOptions = useMemo(() => procedures.map(p => ({ value: p.id, label: p.name })), [procedures]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios Gerenciais</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Filtre por período e outros critérios para gerar relatórios detalhados.</p>
          </div>
          <div className="flex items-center gap-4">
            <div ref={columnSelectorRef} className="relative">
                <button
                    onClick={() => setIsColumnSelectorOpen(prev => !prev)}
                    className="flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    <TableCellsIcon className="h-5 w-5 mr-2" />
                    Colunas
                </button>
                {isColumnSelectorOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                        <div className="p-2 grid grid-cols-1 gap-1">
                            {allReportColumns.map((name) => (
                                <label key={name} className="flex items-center space-x-3 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={columnVisibility[name]}
                                        onChange={() => handleColumnToggle(name)}
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <button
              onClick={handleExportXLSX}
              disabled={reportData.length === 0}
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filtros do Relatório</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                    <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Fim</label>
                    <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="filter-doctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Médico(a)</label>
                    <SearchableSelect
                      id="filter-doctor"
                      placeholder='Todos'
                      options={doctorOptions}
                      value={filterDoctor}
                      onChange={setFilterDoctor}
                      allowClear
                    />
                </div>
                 <div>
                    <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local</label>
                    <SearchableSelect
                      id="filter-location"
                      placeholder='Todos'
                      options={locationOptions}
                      value={filterLocation}
                      onChange={setFilterLocation}
                      allowClear
                    />
                </div>
                <div>
                    <label htmlFor="filter-municipality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Município</label>
                    <SearchableSelect
                      id="filter-municipality"
                      placeholder='Todos'
                      options={municipalityOptions}
                      value={filterMunicipality}
                      onChange={setFilterMunicipality}
                      allowClear
                    />
                </div>
                <div>
                    <label htmlFor="filter-procedure-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Procedimento</label>
                     <SearchableSelect
                      id="filter-procedure-type"
                      placeholder='Todos'
                      options={procedureTypeOptions}
                      value={filterProcedureType}
                      onChange={setFilterProcedureType}
                      allowClear
                    />
                </div>
                <div>
                    <label htmlFor="filter-procedure" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Procedimento</label>
                     <SearchableSelect
                      id="filter-procedure"
                      placeholder='Todos'
                      options={procedureOptions}
                      value={filterProcedure}
                      onChange={setFilterProcedure}
                      allowClear
                    />
                </div>
            </div>
             <div className="flex justify-start gap-4 pt-4">
                <button
                    onClick={handleGenerateReport}
                    className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Gerar Relatório
                </button>
                 <button onClick={clearFilters} className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-bold py-2 px-3 rounded-lg shadow-sm transition-all duration-300">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Limpar Filtros
                </button>
                <div className="flex gap-2">
                    <input type="file" ref={importInputRef} onChange={handleImport} accept=".csv,.xlsx" className="hidden" />
                    <button onClick={() => importInputRef.current?.click()} className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-3 rounded-lg shadow-sm transition-all duration-300 text-sm">
                        <UploadIcon className="h-5 w-5 mr-2" />
                        Importar CSV
                    </button>
                    <button onClick={handleExportCSV} className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-3 rounded-lg shadow-sm transition-all duration-300 text-sm">
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Exportar CSV
                    </button>
                </div>
            </div>
        </div>
      </div>
      
      {filteredAppointments.length > 0 && (
          <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <ChartBarIcon className="h-7 w-7 text-primary-500"/>
                  Visualizações do Relatório
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <BarChart chartId="report-status-chart" title="Agendamentos por Status" data={chartDataByStatus} color="#3b82f6" />
                  <BarChart chartId="report-revenue-chart" title="Receita por Tipo de Procedimento (Particular)" data={financialChartData} color="#8b5cf6" />
                  <BarChart chartId="report-doctor-chart" title="Atendimentos por Médico" data={chartDataByDoctor} color="#16a34a" />
                  <BarChart chartId="report-municipality-chart" title="Atendimentos por Município" data={chartDataByMunicipality} color="#f97316" />
              </div>
          </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {allReportColumns.filter(key => columnVisibility[key]).map(key => (
                 <th key={key} scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {allReportColumns.filter(header => columnVisibility[header]).map(header => (
                  <td key={header} className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{(row as any)[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
         {filteredAppointments.length > 0 && reportData.length === 0 && (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Clique em "Gerar Relatório" para popular a tabela com os filtros selecionados.</p>
            </div>
        )}
         {filteredAppointments.length === 0 && reportData.length === 0 && (
             <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Nenhum agendamento encontrado para os filtros selecionados. Tente uma busca diferente ou limpe os filtros.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ReportsView;