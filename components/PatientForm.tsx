


import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Patient, Address, Contact, Municipality, HealthCampaign, Gender, Ethnicity, Condition, Conditions } from '../types';
import { calculateAge } from '../utils/export';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import { useActionsContext, useDataContext, useUIContext } from '../context';


const PatientForm: React.FC = () => {
  const { municipalities, campaigns: allCampaigns } = useDataContext();
  const { isPatientModalOpen: isOpen, editingPatient: initialData, closePatientModal: onClose } = useUIContext();
  const { savePatient: onSave } = useActionsContext();

  const [activeTab, setActiveTab] = useState('personal');

  // Form State
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [motherName, setMotherName] = useState('');
  const [cns, setCns] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [displayAge, setDisplayAge] = useState<number | ''>('');
  const [municipalityId, setMunicipalityId] = useState('');
  const [gender, setGender] = useState<Gender>('Não Declarado');
  const [ethnicity, setEthnicity] = useState<Ethnicity>('Não Declarado');
  const [address, setAddress] = useState<Address>({ street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' });
  const [contact, setContact] = useState<Contact>({ name: '', relationship: '', phone: '' });
  const [healthPost, setHealthPost] = useState('');
  const [healthAgent, setHealthAgent] = useState('');
  const [participatingCampaignIds, setParticipatingCampaignIds] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);

  
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDateOfBirth(initialData.dateOfBirth);
      setMotherName(initialData.motherName);
      
      const doc = initialData.cnsOrCpf || '';
      const isCns = doc.replace(/\D/g, '').length === 15;
      setCns(isCns ? doc : '');
      setCpf(!isCns ? doc : '');

      setEmail(initialData.email);
      setPhone(initialData.phone);
      setDisplayAge(calculateAge(initialData.dateOfBirth));
      setMunicipalityId(initialData.municipalityId);
      setAddress(initialData.addresses[0] || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' });
      setContact(initialData.contacts[0] || { name: '', relationship: '', phone: '' });
      setHealthPost(initialData.healthPost);
      setHealthAgent(initialData.healthAgent);
      setParticipatingCampaignIds(initialData.participatingCampaignIds || []);
      setGender(initialData.gender || 'Não Declarado');
      setEthnicity(initialData.ethnicity || 'Não Declarado');
      setConditions(initialData.conditions || []);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setActiveTab('personal');
    setName('');
    setDateOfBirth('');
    setMotherName('');
    setCns('');
    setCpf('');
    setEmail('');
    setPhone('');
    setDisplayAge('');
    setMunicipalityId('');
    setGender('Não Declarado');
    setEthnicity('Não Declarado');
    setConditions([]);
    setAddress({ street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' });
    setContact({ name: '', relationship: '', phone: '' });
    setHealthPost('');
    setHealthAgent('');
    setParticipatingCampaignIds([]);
  }

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dob = e.target.value;
      setDateOfBirth(dob);
      if (dob) {
          setDisplayAge(calculateAge(dob));
      } else {
          setDisplayAge('');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && phone && dateOfBirth && motherName && (cns || cpf)) {
      onSave({ 
        name, dateOfBirth, motherName, cnsOrCpf: cns || cpf,
        email, phone, municipalityId,
        addresses: [address],
        contacts: [contact],
        healthPost,
        healthAgent,
        participatingCampaignIds,
        gender,
        ethnicity,
        conditions,
      }, initialData?.id);
      resetForm();
      onClose();
    } else {
      toast.error('Preencha os campos obrigatórios na aba "Dados Pessoais", incluindo CNS ou CPF.', { duration: 4000 });
      setActiveTab('personal');
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({...address, [e.target.name]: e.target.value});
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact({...contact, [e.target.name]: e.target.value});
  }

  const handleCampaignToggle = (id: string) => {
    setParticipatingCampaignIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };
  
  const handleConditionToggle = (condition: Condition) => {
    setConditions(prev => 
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const municipalityOptions = useMemo(() => municipalities.map(m => ({ value: m.id, label: m.name })), [municipalities]);

  const TabButton: React.FC<{tabId: string; children: React.ReactNode}> = ({ tabId, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
      {children}
    </button>
  );

  const InputField: React.FC<{label: string, id: string, value: string | number, onChange: (e: any) => void, type?: string, required?: boolean, name?: string, readOnly?: boolean, disabled?: boolean}> = 
  ({ label, id, value, onChange, type = 'text', required = false, name = id, readOnly = false, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type={type} id={id} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} disabled={disabled}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${readOnly || disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
        />
    </div>
  );
  
  const renderFooter = (
    <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
        Cancelar
        </button>
        <button type="submit" form="patient-form" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
        {initialData ? 'Salvar Alterações' : 'Salvar Paciente'}
        </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Paciente' : 'Cadastrar Novo Paciente'} size="3xl" footer={renderFooter}>
      <form id="patient-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                <TabButton tabId="personal">Dados Pessoais</TabButton>
                <TabButton tabId="address">Endereço</TabButton>
                <TabButton tabId="contacts">Contatos</TabButton>
                <TabButton tabId="health">Saúde</TabButton>
                <TabButton tabId="campaigns">Campanhas</TabButton>
            </nav>
        </div>

        <div className="pt-4">
            {activeTab === 'personal' && (
                <div className="space-y-4">
                    <InputField label="Nome Completo" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <InputField label="Nome da Mãe" id="motherName" value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Data de Nascimento" id="dateOfBirth" value={dateOfBirth} onChange={handleDateOfBirthChange} type="date" required />
                        <InputField label="Idade" id="age" value={displayAge} onChange={() => {}} readOnly />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <InputField label="CNS" id="cns" value={cns} onChange={(e) => setCns(e.target.value)} disabled={!!cpf}/>
                        <InputField label="CPF" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={!!cns} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gênero</label>
                            <select id="gender" value={gender} onChange={e => setGender(e.target.value as Gender)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Não Declarado">Não Declarado</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etnia</label>
                            <select id="ethnicity" value={ethnicity} onChange={e => setEthnicity(e.target.value as Ethnicity)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="Branco">Branco</option>
                                <option value="Pardo">Pardo</option>
                                <option value="Preto">Preto</option>
                                <option value="Indígena">Indígena</option>
                                <option value="Amarelo">Amarelo</option>
                                <option value="Não Declarado">Não Declarado</option>
                            </select>
                        </div>
                     </div>
                    <InputField label="Endereço de Email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                    <InputField label="Telefone (com DDD, somente números)" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required />
                     <div>
                        <label htmlFor="municipalityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Município</label>
                        <SearchableSelect
                            id="municipalityId"
                            placeholder="Selecione ou busque um município..."
                            options={municipalityOptions}
                            value={municipalityId}
                            onChange={setMunicipalityId}
                        />
                    </div>
                </div>
            )}
            {activeTab === 'address' && (
                <div className="space-y-4">
                    <InputField label="Logradouro (Rua, Av.)" id="street" name="street" value={address.street} onChange={handleAddressChange} />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1"><InputField label="Número" id="number" name="number" value={address.number} onChange={handleAddressChange} /></div>
                        <div className="col-span-2"><InputField label="Complemento" id="complement" name="complement" value={address.complement || ''} onChange={handleAddressChange} /></div>
                    </div>
                    <InputField label="Bairro" id="neighborhood" name="neighborhood" value={address.neighborhood} onChange={handleAddressChange} />
                    <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-2"><InputField label="Cidade" id="city" name="city" value={address.city} onChange={handleAddressChange} /></div>
                        <div className="col-span-1"><InputField label="Estado" id="state" name="state" value={address.state} onChange={handleAddressChange} /></div>
                    </div>
                     <InputField label="CEP" id="zipCode" name="zipCode" value={address.zipCode} onChange={handleAddressChange} />
                </div>
            )}
            {activeTab === 'contacts' && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Contato de Emergência</h3>
                    <InputField label="Nome do Contato" id="c_name" name="name" value={contact.name} onChange={handleContactChange} />
                    <InputField label="Parentesco" id="c_relationship" name="relationship" value={contact.relationship} onChange={handleContactChange} />
                    <InputField label="Telefone do Contato" id="c_phone" name="phone" value={contact.phone} onChange={handleContactChange} type="tel" />
                 </div>
            )}
             {activeTab === 'health' && (
                 <div className="space-y-4">
                    <InputField label="Posto Médico de Referência" id="healthPost" value={healthPost} onChange={(e) => setHealthPost(e.target.value)} />
                    <InputField label="Agente de Saúde Responsável" id="healthAgent" value={healthAgent} onChange={(e) => setHealthAgent(e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condições / Transtornos</label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 border border-gray-300 dark:border-gray-600 rounded-md p-4">
                            {Conditions.map(cond => (
                                <div key={cond} className="flex items-center">
                                    <input
                                        id={`cond-check-${cond}`}
                                        type="checkbox"
                                        checked={conditions.includes(cond)}
                                        onChange={() => handleConditionToggle(cond)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <label htmlFor={`cond-check-${cond}`} className="ml-3 text-sm text-gray-700 dark:text-gray-200">{cond}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
            )}
            {activeTab === 'campaigns' && (
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Participação em Campanhas</h3>
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-4 space-y-2">
                        {allCampaigns.map(camp => (
                        <div key={camp.id} className="flex items-center">
                            <input
                                id={`camp-check-${camp.id}`}
                                type="checkbox"
                                checked={participatingCampaignIds.includes(camp.id)}
                                onChange={() => handleCampaignToggle(camp.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor={`camp-check-${camp.id}`} className="ml-3 text-sm text-gray-700 dark:text-gray-200">
                                {camp.name}
                            </label>
                        </div>
                        ))}
                        {allCampaigns.length === 0 && <p className="text-sm text-gray-500">Nenhuma campanha disponível.</p>}
                    </div>
                </div>
            )}
        </div>
      </form>
    </Modal>
  );
};

export default PatientForm;
