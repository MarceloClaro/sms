




import { Patient, Procedure, Appointment, Doctor, Municipality, HealthCampaign, PriceTable, PriceTableEntry, ProcedureType, Location, Occurrence, ChatMessage } from '../types';

// --- Base Data ---
export const mockMunicipalities: Municipality[] = [
    { id: 'mun01', name: 'Crateús', healthSecretariat: 'Secretaria Municipal de Saúde de Crateús' },
    { id: 'mun02', name: 'Independência', healthSecretariat: 'Secretaria de Saúde de Independência' },
    { id: 'mun03', name: 'Novo Oriente', healthSecretariat: 'SMS de Novo Oriente' },
];

export const mockDoctors: Doctor[] = [
    { id: 'doc01', name: 'Dra. Evelyn Reed', specialty: 'Cardiologia', crm: '12345-CE' },
    { id: 'doc02', name: 'Dr. João Smith', specialty: 'Clínica Geral', crm: '67890-CE' },
    { id: 'doc03', name: 'Dra. Maria Garcia', specialty: 'Pediatria', crm: '11223-CE' },
];

export const mockLocations: Location[] = [
    { id: 'loc01', name: 'Consultório 1', description: 'Sala de atendimento geral, primeiro andar.' },
    { id: 'loc02', name: 'Consultório 2', description: 'Sala de atendimento geral, primeiro andar.' },
    { id: 'loc03', name: 'Sala de Exames A', description: 'Sala para ultrassonografias e ECG.' },
    { id: 'loc04', name: 'Centro Cirúrgico', description: 'Sala para pequenos procedimentos cirúrgicos.' },
];

export const mockProcedureTypes: ProcedureType[] = [
  { id: 'ptype01', name: 'Consulta' },
  { id: 'ptype02', name: 'Exame' },
  { id: 'ptype03', name: 'Cirurgia' },
  { id: 'ptype04', name: 'Procedimento' },
  { id: 'ptype05', name: 'Retorno' },
  { id: 'ptype06', name: 'Avaliação' },
  { id: 'ptype07', name: 'Terapia' },
  { id: 'ptype08', name: 'Vacinação' },
];

export const mockOccurrences: Occurrence[] = [
    { id: 'occ01', name: "Paciente chegou" },
    { id: 'occ02', name: "Paciente adiantado" },
    { id: 'occ03', name: "Paciente atrasado" },
    { id: 'occ04', name: "Aguardando na recepção" },
    { id: 'occ05', name: "Acompanhante presente" },
    { id: 'occ06', name: "Em atendimento" },
    { id: 'occ07', name: "Aguardando exames" },
    { id: 'occ08', name: "Exames finalizados" },
    { id: 'occ09', name: "Retornou ao consultório" },
    { id: 'occ10', name: "Atendimento finalizado" },
    { id: 'occ11', name: "Paciente liberado" },
    { id: 'occ12', name: "Receita/Atestado emitido" },
    { id: 'occ13', name: "Encaminhado para especialista" },
    { id: 'occ14', name: "Retorno agendado" },
    { id: 'occ15', name: "Já realizou o procedimento" },
    { id: 'occ16', name: "Paciente remarcou" },
    { id: 'occ17', name: "Paciente solicitou reagendamento" },
    { id: 'occ18', name: "Conflito de horário" },
    { id: 'occ19', name: "Atraso na agenda do médico" },
    { id: 'occ20', name: "Médico impedido (deslocamento) / Remarcado" },
    { id: 'occ21', name: "Falta de documentação" },
    { id: 'occ22', name: "Cadastro do paciente desatualizado" },
    { id: 'occ23', name: "Aguardando autorização do convênio" },
    { id: 'occ24', name: "Guia de autorização vencida" },
    { id: 'occ25', name: "Pendência financeira" },
    { id: 'occ26', name: "Equipamento em manutenção" },
    { id: 'occ27', name: "Realizado contato telefônico" },
    { id: 'occ28', name: "Necessita de atenção especial" },
    { id: 'occ29', name: "Observação" },
    { id: 'occ30', name: "Outro" },
];

export const mockProcedures: Procedure[] = [
    { id: 'proc001', name: 'Consulta Geral', description: 'Uma consulta padrão com um clínico geral.', duration: 30, procedureTypeId: 'ptype01', slotsAvailable: 500 },
    { id: 'proc002', name: 'Acompanhamento Cardiológico', description: 'Consulta de retorno para pacientes com condições cardíacas.', duration: 30, procedureTypeId: 'ptype01', slotsAvailable: 250 },
    { id: 'proc003', name: 'Consulta Pediátrica', description: 'Consulta de rotina para crianças e adolescentes.', duration: 40, procedureTypeId: 'ptype01', slotsAvailable: 300 },
    { id: 'proc004', name: 'US ABDOMINAL', description: 'Ultrassonografia Abdominal.', duration: 15, procedureTypeId: 'ptype02', slotsAvailable: 400 },
    { id: 'proc005', name: 'Eletrocardiograma (ECG)', description: 'Exame que mede a atividade elétrica do coração.', duration: 20, procedureTypeId: 'ptype02', slotsAvailable: 150 },
    { id: 'proc006', name: 'Pequena Sutura', description: 'Realização de sutura para ferimentos simples.', duration: 30, procedureTypeId: 'ptype03' },
    { id: 'proc007', name: 'US TIREOIDE', description: 'Ultrassonografia da Tireoide.', duration: 15, procedureTypeId: 'ptype02', slotsAvailable: 180 },
    { id: 'proc008', name: 'Retorno de Consulta', description: 'Consulta de retorno para acompanhamento.', duration: 20, procedureTypeId: 'ptype05', slotsAvailable: 400 },
    { id: 'proc009', name: 'Sessão de Fisioterapia', description: 'Sessão de fisioterapia motora.', duration: 50, procedureTypeId: 'ptype07', slotsAvailable: 80 },
];

export const mockHealthCampaigns: HealthCampaign[] = [
    {
        id: 'camp01',
        name: 'Campanha de Vacinação contra a Gripe 2024',
        targetAudience: 'Idosos (acima de 60 anos) e crianças (abaixo de 5 anos)',
        startDate: '2024-07-01',
        endDate: '2024-08-30',
        procedureIds: ['proc001'] // Simboliza a consulta de triagem
    }
];

// --- Patient Data ---
export const mockPatients: Patient[] = [
    { 
        id: 'p001', name: 'Artur Silva', dateOfBirth: '1988-04-10', motherName: 'Helena Silva', cnsOrCpf: '700508376121251', lastVisit: '2024-07-15', avatarUrl: 'https://picsum.photos/id/433/100/100', email: 'a.silva@example.com', phone: '5588987654321', registeredDate: '2023-01-20',
        municipalityId: 'mun01',
        addresses: [{ street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'Crateús', state: 'CE', zipCode: '63700-000' }],
        contacts: [{ name: 'Mariana Silva', relationship: 'Esposa', phone: '5588987654322' }],
        healthPost: 'UBS Centro',
        healthAgent: 'Agente Silva',
        gender: 'Masculino',
        ethnicity: 'Pardo',
        conditions: ['Ansiedade']
    },
    { 
        id: 'p002', name: 'Sofia Almeida', dateOfBirth: '1996-09-22', motherName: 'Clara Almeida', cnsOrCpf: '702809668024064', lastVisit: '2024-07-12', avatarUrl: 'https://picsum.photos/id/564/100/100', email: 's.almeida@example.com', phone: '5588912345678', registeredDate: '2023-03-11',
        municipalityId: 'mun02',
        addresses: [{ street: 'Avenida da Independência', number: '456', neighborhood: 'Centro', city: 'Independência', state: 'CE', zipCode: '63760-000' }],
        contacts: [{ name: 'Roberto Almeida', relationship: 'Pai', phone: '5588912345679' }],
        healthPost: 'Clínica da Família Independência',
        healthAgent: 'Agente Costa',
        gender: 'Feminino',
        ethnicity: 'Branco',
        conditions: ['Neurotípico']
    },
    { 
        id: 'p003', name: 'João Pereira', dateOfBirth: '1983-01-15', motherName: 'Lúcia Pereira', cnsOrCpf: '700003567086302', lastVisit: '2024-07-20', avatarUrl: 'https://picsum.photos/id/628/100/100', email: 'j.pereira@example.com', phone: '5588988887777', registeredDate: '2022-11-05',
        municipalityId: 'mun03',
        addresses: [{ street: 'Rua Principal', number: '789', neighborhood: 'Lourdes', city: 'Novo Oriente', state: 'CE', zipCode: '63740-000' }],
        contacts: [{ name: 'Ana Pereira', relationship: 'Irmã', phone: '5588988887776' }],
        healthPost: 'Centro de Saúde Novo Oriente',
        healthAgent: 'Agente Souza',
        gender: 'Masculino',
        ethnicity: 'Pardo',
        conditions: ['Depressão', 'Ansiedade']
    },
     { 
        id: 'p004', name: 'Maria Oliveira', dateOfBirth: '1964-07-20', motherName: 'Beatriz Oliveira', cnsOrCpf: '702100821473670', lastVisit: '2024-06-25', avatarUrl: 'https://picsum.photos/id/1027/100/100', email: 'm.oliveira@example.com', phone: '5588999991111', registeredDate: '2024-01-10',
        municipalityId: 'mun01',
        addresses: [{ street: 'Rua do Sol', number: '101', neighborhood: 'Fátima I', city: 'Crateús', state: 'CE', zipCode: '63700-000' }],
        contacts: [{ name: 'Carlos Oliveira', relationship: 'Filho', phone: '5588999991112' }],
        healthPost: 'UBS Fátima',
        healthAgent: 'Agente Silva',
        participatingCampaignIds: ['camp01'],
        gender: 'Feminino',
        ethnicity: 'Não Declarado',
        conditions: ['Neurotípico']
    },
    { 
        id: 'p005', name: 'Pedro Martins', dateOfBirth: '2020-02-02', motherName: 'Vanessa Martins', cnsOrCpf: '44546475349', lastVisit: 'N/A', avatarUrl: 'https://picsum.photos/id/1005/100/100', email: 'p.martins@example.com', phone: '5588981812222', registeredDate: '2024-05-15',
        municipalityId: 'mun02',
        addresses: [{ street: 'Rua Nova', number: '202', neighborhood: 'Planalto', city: 'Independência', state: 'CE', zipCode: '63760-000' }],
        contacts: [{ name: 'Julia Martins', relationship: 'Mãe', phone: '5588981812223' }],
        healthPost: 'UBS Planalto',
        healthAgent: 'Agente Costa',
        participatingCampaignIds: ['camp01'],
        gender: 'Masculino',
        ethnicity: 'Branco',
        conditions: ['TDAH']
    },
];

// --- Date Helpers ---
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const getDate = (baseDate: Date, hour: number, minute: number = 0) => new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, minute, 0);

// --- Linked Data ---
export const mockAppointments: Appointment[] = [
    // --- Atendimentos de Hoje ---
    { id: 'app01', patientId: 'p001', procedureId: 'proc002', doctorId: 'doc01', locationId: 'loc01', date: getDate(today, 8).toISOString(), status: 'atendido' },
    { id: 'app02', patientId: 'p002', procedureId: 'proc003', doctorId: 'doc03', locationId: 'loc02', date: getDate(today, 9).toISOString(), status: 'em_espera' },
    { id: 'app03', patientId: 'p004', procedureId: 'proc001', doctorId: 'doc02', locationId: 'loc01', date: getDate(today, 10).toISOString(), status: 'em_espera', campaignId: 'camp01' },
    { id: 'app04', patientId: 'p005', procedureId: 'proc005', doctorId: 'doc01', locationId: 'loc03', date: getDate(today, 11).toISOString(), status: 'agendado', campaignId: 'camp01' },
    { id: 'app05', patientId: 'p001', procedureId: 'proc001', doctorId: 'doc02', locationId: 'loc02', date: getDate(today, 14).toISOString(), status: 'agendado' },
    
    // --- Ocorrências de Hoje ---
    { id: 'app06', patientId: 'p003', procedureId: 'proc004', doctorId: 'doc02', locationId: 'loc03', date: getDate(today, 13).toISOString(), status: 'nao_compareceu' },
    { id: 'app07', patientId: 'p002', procedureId: 'proc001', doctorId: 'doc01', locationId: 'loc01', date: getDate(today, 15).toISOString(), status: 'cancelado_paciente', cancellationReason: 'Conflito de horário' },
    { id: 'app08', patientId: 'p004', procedureId: 'proc001', doctorId: 'doc03', locationId: 'loc02', date: getDate(today, 16).toISOString(), status: 'cancelado_medico' },
    
    // --- Agendamentos Futuros ---
    { id: 'app09', patientId: 'p001', procedureId: 'proc002', doctorId: 'doc01', locationId: 'loc01', date: getDate(tomorrow, 9).toISOString(), status: 'agendado' },
    { id: 'app10', patientId: 'p003', procedureId: 'proc001', doctorId: 'doc02', locationId: 'loc02', date: getDate(tomorrow, 10).toISOString(), status: 'agendado' },

    // --- Agendamentos Passados (para follow-up) ---
    { id: 'app11', patientId: 'p005', procedureId: 'proc003', doctorId: 'doc03', locationId: 'loc02', date: getDate(yesterday, 11).toISOString(), status: 'atendido', campaignId: 'camp01' },
    { id: 'app12', patientId: 'p002', procedureId: 'proc002', doctorId: 'doc01', locationId: 'loc01', date: getDate(yesterday, 14).toISOString(), status: 'atendido' },
    { id: 'app13', patientId: 'p001', procedureId: 'proc001', doctorId: 'doc02', locationId: 'loc01', date: getDate(yesterday, 15).toISOString(), status: 'cancelado_paciente', cancellationReason: 'Paciente adoeceu' },
    { id: 'app14', patientId: 'p004', procedureId: 'proc004', doctorId: 'doc02', locationId: 'loc03', date: getDate(yesterday, 16).toISOString(), status: 'cancelado_paciente', cancellationReason: 'Conflito de horário' },
];

export const mockPriceTables: PriceTable[] = [
    { id: 'pt01', name: 'Tabela SUS', description: 'Valores baseados na tabela do Sistema Único de Saúde.' },
    { id: 'pt02', name: 'Tabela Particular', description: 'Valores para atendimento particular.' },
];

export const mockPriceTableEntries: PriceTableEntry[] = [
    // Tabela SUS
    { id: 'pte01-001', priceTableId: 'pt01', procedureId: 'proc001', code: '03.01.01.007-2', value: 22.50 },
    { id: 'pte01-004', priceTableId: 'pt01', procedureId: 'proc004', code: '02.11.02.003-8', value: 35.41 },
    { id: 'pte01-005', priceTableId: 'pt01', procedureId: 'proc005', code: '02.05.01.002-9', value: 15.00 },
    { id: 'pte01-007', priceTableId: 'pt01', procedureId: 'proc007', code: '02.04.03.013-0', value: 41.50 },
    { id: 'pte01-008', priceTableId: 'pt01', procedureId: 'proc008', code: '03.01.01.007-2R', value: 15.00 },
    { id: 'pte01-009', priceTableId: 'pt01', procedureId: 'proc009', code: '03.01.06.002-9', value: 10.75 },

    // Tabela Particular
    { id: 'pte02-001', priceTableId: 'pt02', procedureId: 'proc001', code: 'CONS-GERAL', value: 150.00 },
    { id: 'pte02-002', priceTableId: 'pt02', procedureId: 'proc002', code: 'CONS-CARDIO', value: 250.00 },
    { id: 'pte02-003', priceTableId: 'pt02', procedureId: 'proc003', code: 'CONS-PED', value: 180.00 },
    { id: 'pte02-004', priceTableId: 'pt02', procedureId: 'proc004', code: 'US-ABD', value: 120.00 },
    { id: 'pte02-005', priceTableId: 'pt02', procedureId: 'proc005', code: 'EX-ECG', value: 120.00 },
    { id: 'pte02-006', priceTableId: 'pt02', procedureId: 'proc006', code: 'CIR-SUTURA', value: 300.00 },
    { id: 'pte02-007', priceTableId: 'pt02', procedureId: 'proc007', code: 'US-TIR', value: 140.00 },
    { id: 'pte02-008', priceTableId: 'pt02', procedureId: 'proc008', code: 'CONS-RETORNO', value: 100.00 },
    { id: 'pte02-009', priceTableId: 'pt02', procedureId: 'proc009', code: 'FISIO-SESSAO', value: 90.00 },
];

export const mockChatHistory: ChatMessage[] = [
    { id: 1, text: "Olá! Sou seu assistente clínico de IA. Selecione um provedor no menu e pergunte-me sobre o histórico de um paciente, a agenda de um médico, finanças e muito mais.", sender: 'ai' }
];
