
export type AIProvider = 'gemini' | 'huggingface' | 'lm-studio' | 'groq-gemma' | 'groq-deepseek';

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Contact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Municipality {
  id: string;
  name: string;
  healthSecretariat: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
}

export type Gender = 'Masculino' | 'Feminino' | 'Não Declarado';
export type Ethnicity = 'Branco' | 'Pardo' | 'Preto' | 'Indígena' | 'Amarelo' | 'Não Declarado';
export const Conditions = [
  'Neurotípico', 
  'Intelectual', 
  'Múltiplas', 
  'TEA', 
  'TDAH', 
  'TOD', 
  'Ansiedade', 
  'Depressão', 
  'Outras', 
  'SDAH'
] as const;
export type Condition = typeof Conditions[number];

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string; // ISO Date
  motherName: string;
  cnsOrCpf: string;
  lastVisit: string;
  avatarUrl: string;
  email: string;
  phone: string;
  registeredDate: string;
  municipalityId: string;
  addresses: Address[];
  contacts: Contact[];
  healthPost: string;
  healthAgent: string;
  participatingCampaignIds?: string[];
  gender?: Gender;
  ethnicity?: Ethnicity;
  conditions?: Condition[];
}

export interface ProcedureType {
  id: string;
  name: string;
}

export interface Occurrence {
  id: string;
  name: string;
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  procedureTypeId: string;
  duration: number; // in minutes
  slotsAvailable?: number;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    crm: string;
}

export type AppointmentStatus = 'agendado' | 'em_espera' | 'atendido' | 'nao_compareceu' | 'cancelado_paciente' | 'cancelado_medico';

export interface Appointment {
  id: string;
  patientId: string;
  procedureId: string;
  doctorId: string;
  locationId: string;
  campaignId?: string;
  date: string; // ISO string
  status: AppointmentStatus;
  cancellationReason?: string;
  occurrenceId?: string;
}

export interface HealthCampaign {
    id: string;
    name: string;
    targetAudience: string;
    startDate: string; // ISO date
    endDate: string; // ISO date
    procedureIds: string[];
}

export interface PriceTable {
    id:string;
    name: string;
    description: string;
}

export interface PriceTableEntry {
    id: string;
    priceTableId: string;
    procedureId: string;
    code: string;
    value: number;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export type ViewType = 
  | 'dashboard' 
  | 'patients' 
  | 'procedures'
  | 'doctors'
  | 'locations'
  | 'municipalities'
  | 'campaigns'
  | 'price_tables'
  | 'procedure_types'
  | 'occurrences'
  | 'reports'
  | 'ai_assistant' 
  | 'automation'
  | 'database_manager';

export interface AutomationSuggestion {
  patientId: string;
  patientName: string;
  patientPhone: string;
  type: 'reminder' | 'follow-up' | 'campaign' | 'preparation';
  message: string;
  reasoning?: string;
}

export type CancellationData = {
  appointmentId: string;
  cancelledBy: 'patient' | 'doctor';
  reason: string;
};

export type DataEntityType = 'patients' | 'doctors' | 'procedures' | 'procedureTypes' | 'municipalities' | 'campaigns' | 'priceTables' | 'appointments' | 'priceTableEntries' | 'locations' | 'occurrences' | 'chatHistory';

export interface ChatContext {
    patients: Patient[];
    appointments: Appointment[];
    doctors: Doctor[];
    locations: Location[];
    procedures: Procedure[];
    procedureTypes: ProcedureType[];
    occurrences: Occurrence[];
    campaigns: HealthCampaign[];
    municipalities: Municipality[];
    priceTables: PriceTable[];
    priceTableEntries: PriceTableEntry[];
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface FullDatabase {
    patients: Patient[];
    appointments: Appointment[];
    doctors: Doctor[];
    locations: Location[];
    procedures: Procedure[];
    procedureTypes: ProcedureType[];
    campaigns: HealthCampaign[];
    municipalities: Municipality[];
    priceTables: PriceTable[];
    priceTableEntries: PriceTableEntry[];
    occurrences: Occurrence[];
    chatHistory: ChatMessage[];
}
