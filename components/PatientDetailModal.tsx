

import React from 'react';
import Modal from './Modal';
import { Patient, Municipality, HealthCampaign } from '../types';
import { WhatsAppIcon } from './icons';
import { calculateAge } from '../utils/export';
import { useDataContext, useUIContext } from '../context';

const DetailSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-600 pb-2 mb-3 text-primary-600 dark:text-primary-400">{title}</h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {children}
        </div>
    </div>
);

const DetailItem: React.FC<{label: string; value: React.ReactNode}> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 items-start">
        <span className="font-medium text-gray-500 dark:text-gray-400 col-span-1">{label}:</span>
        <span className="text-left ml-2 col-span-2">{value || 'N/A'}</span>
    </div>
);


const PatientDetailModal: React.FC = () => {
  const { municipalities, campaigns: allCampaigns } = useDataContext();
  const { selectedPatient: patient, closePatientDetailModal: onClose } = useUIContext();

  if (!patient) return null;

  const mainAddress = patient.addresses[0];
  const mainContact = patient.contacts[0];
  const municipality = municipalities.find(m => m.id === patient.municipalityId);
  const patientCampaigns = allCampaigns.filter(c => patient.participatingCampaignIds?.includes(c.id));
  
  const doc = patient.cnsOrCpf || '';
  const isCns = doc.replace(/\D/g, '').length === 15;

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Olá ${patient.name}, `);
    window.open(`https://wa.me/${patient.phone}?text=${message}`, '_blank');
  }

  const renderFooter = (
      <div className="flex justify-between items-center">
        <button 
            type="button" 
            onClick={openWhatsApp}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-green-600"
        >
            <WhatsAppIcon className="h-5 w-5" />
            Enviar Mensagem
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
            Fechar
        </button>
    </div>
  );

  return (
    <Modal isOpen={!!patient} onClose={onClose} title="Detalhes do Paciente" size="2xl" footer={renderFooter}>
      <div className="flex items-center mb-6">
        <img src={patient.avatarUrl} alt={patient.name} className="h-20 w-20 rounded-full object-cover" />
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</p>
        </div>
      </div>
      
      <DetailSection title="Informações Pessoais">
        <DetailItem label="Data de Nasc." value={new Date(patient.dateOfBirth).toLocaleDateString('pt-BR')} />
        <DetailItem label="Idade" value={`${calculateAge(patient.dateOfBirth)} anos`} />
        <DetailItem label="Gênero" value={patient.gender} />
        <DetailItem label="Etnia" value={patient.ethnicity} />
        <DetailItem label="Nome da Mãe" value={patient.motherName} />
        <DetailItem label="CNS" value={isCns ? doc : 'N/A'} />
        <DetailItem label="CPF" value={!isCns ? doc : 'N/A'} />
        <DetailItem label="Telefone" value={patient.phone} />
        <DetailItem label="Data de Cadastro" value={new Date(patient.registeredDate).toLocaleDateString('pt-BR')} />
        <DetailItem label="Última Visita" value={patient.lastVisit !== 'N/A' ? new Date(patient.lastVisit).toLocaleDateString('pt-BR') : 'N/A'} />
      </DetailSection>

       <DetailSection title="Informações de Saúde e Vínculo">
            <DetailItem label="Município" value={municipality?.name} />
            <DetailItem label="Secretaria" value={municipality?.healthSecretariat} />
            <DetailItem label="Posto de Referência" value={patient.healthPost} />
            <DetailItem label="Agente de Saúde" value={patient.healthAgent} />
             {patient.conditions && patient.conditions.length > 0 && (
                <div className="mt-4">
                    <DetailItem label="Condições" value={
                        <div className="flex flex-wrap gap-2">
                            {patient.conditions.map(cond => (
                                <span key={cond} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs font-medium rounded-full">
                                    {cond}
                                </span>
                            ))}
                        </div>
                    } />
                </div>
            )}
        </DetailSection>

      {mainAddress && (
        <DetailSection title="Endereço Principal">
            <DetailItem label="Logradouro" value={`${mainAddress.street}, ${mainAddress.number}`} />
            <DetailItem label="Complemento" value={mainAddress.complement} />
            <DetailItem label="Bairro" value={mainAddress.neighborhood} />
            <DetailItem label="Cidade/Estado" value={`${mainAddress.city} - ${mainAddress.state}`} />
            <DetailItem label="CEP" value={mainAddress.zipCode} />
        </DetailSection>
      )}

      {mainContact && (
         <DetailSection title="Contato de Emergência">
            <DetailItem label="Nome" value={mainContact.name} />
            <DetailItem label="Parentesco" value={mainContact.relationship} />
            <DetailItem label="Telefone" value={mainContact.phone} />
        </DetailSection>
      )}

      {patientCampaigns.length > 0 && (
          <DetailSection title="Campanhas de Saúde">
            <ul className="list-disc list-inside ml-2">
                {patientCampaigns.map(c => <li key={c.id}>{c.name}</li>)}
            </ul>
        </DetailSection>
      )}
    </Modal>
  );
};

export default PatientDetailModal;
