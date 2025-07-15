

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Patient, Procedure, Appointment, Doctor, Municipality, HealthCampaign, PriceTable, PriceTableEntry, ProcedureType, Location, Occurrence, DataEntityType, ChatMessage } from '../types';
import * as db from '../utils/db';
import { STORES } from '../utils/db';
import toast from 'react-hot-toast';

export interface DataState {
  patients: Patient[];
  procedures: Procedure[];
  procedureTypes: ProcedureType[];
  appointments: Appointment[];
  doctors: Doctor[];
  locations: Location[];
  municipalities: Municipality[];
  campaigns: HealthCampaign[];
  priceTables: PriceTable[];
  priceTableEntries: PriceTableEntry[];
  occurrences: Occurrence[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

export interface DataContextType extends DataState {
  reloadData: (storeNames?: DataEntityType[]) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>({
    patients: [],
    procedures: [],
    procedureTypes: [],
    appointments: [],
    doctors: [],
    locations: [],
    municipalities: [],
    campaigns: [],
    priceTables: [],
    priceTableEntries: [],
    occurrences: [],
    chatHistory: [],
    isLoading: true,
  });

  const loadData = async () => {
    try {
      await db.initDB();
      const [
        patients, procedures, appointments, doctors, municipalities, campaigns, priceTables, priceTableEntries, procedureTypes, locations, occurrences, chatHistory
      ] = await Promise.all([
        db.getAllData<Patient>('patients'),
        db.getAllData<Procedure>('procedures'),
        db.getAllData<Appointment>('appointments'),
        db.getAllData<Doctor>('doctors'),
        db.getAllData<Municipality>('municipalities'),
        db.getAllData<HealthCampaign>('campaigns'),
        db.getAllData<PriceTable>('priceTables'),
        db.getAllData<PriceTableEntry>('priceTableEntries'),
        db.getAllData<ProcedureType>('procedureTypes'),
        db.getAllData<Location>('locations'),
        db.getAllData<Occurrence>('occurrences'),
        db.getAllData<ChatMessage>('chatHistory'),
      ]);
      setState({
        patients, procedures, appointments, doctors, municipalities, campaigns, priceTables, priceTableEntries, procedureTypes, locations, occurrences, chatHistory,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load data from database", error);
      toast.error("Não foi possível carregar o banco de dados local.");
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const reloadData = async (storeNames: DataEntityType[] = STORES) => {
    const newState: Partial<DataState> = {};
    for (const storeName of storeNames) {
        const data = await db.getAllData(storeName);
        (newState as any)[storeName] = data;
    }
    setState(s => ({ ...s, ...newState }));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando banco de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ ...state, reloadData }}>
      {children}
    </DataContext.Provider>
  );
};
