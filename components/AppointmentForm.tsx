


import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Appointment, Patient, Procedure, Doctor, HealthCampaign, Location } from '../types';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import { useActionsContext, useDataContext, useUIContext } from '../context';

const AppointmentForm: React.FC = () => {
  const { patients, procedures, doctors, locations, campaigns } = useDataContext();
  const { isAppointmentModalOpen: isOpen, closeAppointmentModal: onClose } = useUIContext();
  const { saveAppointment: onSave } = useActionsContext();
  const initialData = null; // Appointment form always opens for new appointments from header

  const [patientId, setPatientId] = useState('');
  const [procedureId, setProcedureId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [campaignId, setCampaignId] = useState<string | undefined>('');
  const [date, setDate] = useState('');
  
  useEffect(() => {
    if (initialData) {
      setPatientId(initialData.patientId);
      setProcedureId(initialData.procedureId);
      setDoctorId(initialData.doctorId);
      setLocationId(initialData.locationId);
      setCampaignId(initialData.campaignId);
      setDate(initialData.date ? new Date(initialData.date).toISOString().substring(0, 16) : '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setPatientId('');
    setProcedureId('');
    setDoctorId('');
    setLocationId('');
    setCampaignId('');
    setDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId && procedureId && date && doctorId && locationId) {
      onSave({ patientId, procedureId, date, doctorId, locationId, campaignId: campaignId || undefined }, initialData?.id);
      resetForm();
      onClose();
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
    }
  };
  
  const patientOptions = useMemo(() => patients.map(p => ({ value: p.id, label: p.name })), [patients]);
  const procedureOptions = useMemo(() => procedures.map(p => ({ value: p.id, label: p.name })), [procedures]);
  const doctorOptions = useMemo(() => doctors.map(d => ({ value: d.id, label: `${d.name} - ${d.specialty}` })), [doctors]);
  const locationOptions = useMemo(() => locations.map(l => ({ value: l.id, label: l.name })), [locations]);

  const renderFooter = (
    <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
        Cancelar
        </button>
        <button type="submit" form="appointment-form" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
        {initialData ? "Salvar Alterações" : "Agendar Consulta"}
        </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Agendamento" : "Agendar Nova Consulta"} size="2xl" footer={renderFooter}>
      <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paciente</label>
          <SearchableSelect
             id="patient"
             placeholder="Selecione ou busque um paciente..."
             options={patientOptions}
             value={patientId}
             onChange={setPatientId}
          />
        </div>
        <div>
          <label htmlFor="procedure" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Procedimento</label>
           <SearchableSelect
             id="procedure"
             placeholder="Selecione ou busque um procedimento..."
             options={procedureOptions}
             value={procedureId}
             onChange={setProcedureId}
          />
        </div>
        <div>
          <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Médico(a)</label>
           <SearchableSelect
             id="doctor"
             placeholder="Selecione ou busque um(a) médico(a)..."
             options={doctorOptions}
             value={doctorId}
             onChange={setDoctorId}
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local</label>
           <SearchableSelect
             id="location"
             placeholder="Selecione um local..."
             options={locationOptions}
             value={locationId}
             onChange={setLocationId}
          />
        </div>
         <div>
          <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campanha (Opcional)</label>
          <select
            id="campaign"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Nenhuma</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data e Hora</label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentForm;
