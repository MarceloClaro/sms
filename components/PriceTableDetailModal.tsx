
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { PriceTable, Procedure, PriceTableEntry } from '../types';
import { UploadIcon, DownloadIcon } from './icons';
import { exportToCSV } from '../utils/export';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { useActionsContext, useDataContext, useUIContext } from '../context';

const PriceTableDetailModal: React.FC = () => {
  const { procedures, priceTableEntries: entries } = useDataContext();
  const { selectedPriceTable: table, closePriceTableDetailModal: onClose } = useUIContext();
  const { updatePriceTableEntries: onSave } = useActionsContext();

  // Use string for value in local state to simplify form handling
  type EntryState = { procedureId: string; code: string; value: string };
  const [localEntries, setLocalEntries] = useState<EntryState[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  const inputClasses = "w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

  useEffect(() => {
    if (table) {
      // Initialize local state based on all procedures, filling in existing values
      const initialEntries = procedures.map(proc => {
        const existingEntry = entries.find(e => e.priceTableId === table.id && e.procedureId === proc.id);
        return {
          procedureId: proc.id,
          code: existingEntry?.code || '',
          value: (existingEntry?.value ?? '').toString() // Convert number to string for state
        };
      });
      setLocalEntries(initialEntries);
    }
  }, [table, procedures, entries]);

  if (!table) return null;
  
  const handleEntryChange = (procedureId: string, field: 'code' | 'value', fieldValue: string) => {
     setLocalEntries(prevEntries => {
        const newEntries = prevEntries.map(entry => {
            if (entry.procedureId === procedureId) {
                return { ...entry, [field]: fieldValue };
            }
            return entry;
        });
        return newEntries;
    });
  }
  
  const handleSave = () => {
      const entriesWithNumbers = localEntries.map(e => ({
        procedureId: e.procedureId,
        code: e.code,
        value: Number(e.value) || 0 // Convert back to number for saving, default to 0
      }));
      
      const validEntries = entriesWithNumbers
        .filter(e => e.code || e.value > 0); // Filter out empty/zero entries without a code

      onSave(table.id, validEntries);
      toast.success('Valores da tabela de preços salvos com sucesso!');
      onClose();
  }

  const handleExport = () => {
      const dataToExport = localEntries
        .map(le => {
            const procedure = procedures.find(p => p.id === le.procedureId);
            return {
                procedureId: le.procedureId,
                procedureName: procedure?.name || 'N/A',
                code: le.code,
                value: le.value
            }
        })
        .filter(e => e.code || (e.value && parseFloat(e.value) > 0)); // Export only filled entries
      
      const success = exportToCSV(dataToExport, `tabela_${table.name.replace(/\s/g, '_')}.csv`);
      if (success) {
          toast.success('Valores da tabela exportados com sucesso!');
      } else {
          toast.error('Não há valores preenchidos para exportar.');
      }
  }

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
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

            setLocalEntries(prevEntries => {
                const importedMap = new Map(jsonData.map(item => [item.procedureId, item]));
                return prevEntries.map(localEntry => {
                    const imported = importedMap.get(localEntry.procedureId);
                    if (imported) {
                        return {
                            procedureId: localEntry.procedureId,
                            code: imported.code || localEntry.code,
                            value: (imported.value !== undefined ? String(imported.value) : localEntry.value),
                        };
                    }
                    return localEntry;
                });
            });
            toast.success(`${jsonData.length} entradas foram atualizadas a partir do arquivo. Clique em "Salvar Alterações" para confirmar.`);
        } catch (error) {
            console.error("Erro ao importar arquivo:", error);
            toast.error("Erro ao importar. Verifique se o arquivo tem as colunas: procedureId, code, value.");
        } finally {
            if (importInputRef.current) {
                importInputRef.current.value = ""; // Reset file input
            }
        }
    };
    reader.readAsBinaryString(file);
  };

  const renderFooter = (
      <div className="flex justify-between items-center">
            <div className="flex gap-2">
                 <input type="file" ref={importInputRef} onChange={handleImport} accept=".csv,.xlsx" className="hidden" />
                 <button onClick={() => importInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    <UploadIcon className="h-4 w-4" />
                    Importar
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    <DownloadIcon className="h-4 w-4" />
                    Exportar
                </button>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
                    Salvar Alterações
                </button>
            </div>
        </div>
  );

  return (
    <Modal isOpen={!!table} onClose={onClose} title={`Gerenciar Valores: ${table.name}`} size="4xl" footer={renderFooter}>
        <div className="overflow-x-auto pr-2">
            <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Procedimento</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 w-32">Código</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 w-32">Valor (R$)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {localEntries.map(entry => {
                        const procedure = procedures.find(p => p.id === entry.procedureId);
                        return (
                             <tr key={entry.procedureId}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100">{procedure?.name}</td>
                                <td className="px-4 py-2">
                                     <input type="text" value={entry.code} onChange={(e) => handleEntryChange(entry.procedureId, 'code', e.target.value)}
                                            className={inputClasses}/>
                                </td>
                                <td className="px-4 py-2">
                                     <input type="number" value={entry.value} step="0.01" onChange={(e) => handleEntryChange(entry.procedureId, 'value', e.target.value)}
                                            className={inputClasses}/>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    </Modal>
  );
};

export default PriceTableDetailModal;
