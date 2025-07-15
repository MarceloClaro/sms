



import { DataEntityType, Patient, Procedure, Appointment, Doctor, Municipality, HealthCampaign, PriceTable, PriceTableEntry, ProcedureType, Location, Occurrence, ChatMessage } from '../types';
import { mockPatients, mockProcedures, mockAppointments, mockDoctors, mockMunicipalities, mockHealthCampaigns, mockPriceTables, mockPriceTableEntries, mockProcedureTypes, mockLocations, mockOccurrences, mockChatHistory } from '../data/mock';

const DB_NAME = 'MedSMS_DB';
const DB_VERSION = 1;
export const STORES: DataEntityType[] = [
    'patients', 'procedures', 'appointments', 'doctors', 'municipalities', 
    'campaigns', 'priceTables', 'priceTableEntries', 'procedureTypes', 'locations', 'occurrences',
    'chatHistory'
];

let db: IDBDatabase;

const seedDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized for seeding.");
        const transaction = db.transaction(STORES, 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(`Transaction error during seeding: ${event}`);

        const dataMap = {
            patients: mockPatients,
            procedures: mockProcedures,
            appointments: mockAppointments,
            doctors: mockDoctors,
            municipalities: mockMunicipalities,
            campaigns: mockHealthCampaigns,
            priceTables: mockPriceTables,
            priceTableEntries: mockPriceTableEntries,
            procedureTypes: mockProcedureTypes,
            locations: mockLocations,
            occurrences: mockOccurrences,
            chatHistory: mockChatHistory
        };
        
        STORES.forEach(storeName => {
            const store = transaction.objectStore(storeName);
            const data = dataMap[storeName as keyof typeof dataMap];
            if (data) {
                data.forEach(item => store.put(item));
            }
        });
    });
};


export const initDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            STORES.forEach(storeName => {
                if (!dbInstance.objectStoreNames.contains(storeName)) {
                    dbInstance.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            console.log('Database initialized successfully');
            
            const transaction = db.transaction(STORES[0], 'readonly');
            const store = transaction.objectStore(STORES[0]);
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                if (countRequest.result === 0) {
                    console.log('Database is empty. Seeding with mock data...');
                    seedDatabase().then(() => resolve(true)).catch(reject);
                } else {
                    resolve(true);
                }
            };
            countRequest.onerror = (e) => reject(`Failed to count items: ${e}`);
        };

        request.onerror = (event) => {
            console.error('Database error:', request.error);
            reject(`Database error: ${request.error}`);
        };
    });
};

export const getAllData = <T>(storeName: DataEntityType): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('DB not initialized');
        }
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(`Error fetching data from ${storeName}: ${request.error}`);
        };
    });
};

export const saveData = <T extends {id: string | number}>(storeName: DataEntityType, data: T): Promise<T> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(`Error saving data to ${storeName}: ${request.error}`);
    });
};

export const deleteData = (storeName: DataEntityType, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error deleting data from ${storeName}: ${request.error}`);
    });
};

export const bulkPut = <T>(storeName: DataEntityType, data: T[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (data.length === 0) return resolve();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let i = 0;
        const putNext = () => {
            if (i < data.length) {
                store.put(data[i]).onsuccess = putNext;
                i++;
            } else {
                resolve();
            }
        }
        putNext();

        transaction.onerror = (event) => reject(`Bulk put transaction error: ${event}`);
    });
};

export const clearAllData = async (storesToClear: DataEntityType[] = STORES): Promise<void> => {
    for (const storeName of storesToClear) {
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(`Failed to clear ${storeName}`);
        });
    }
}
