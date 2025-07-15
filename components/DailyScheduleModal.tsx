





import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { Appointment, Patient, Procedure, Doctor, Location, Occurrence } from '../types';
import { PhoneIcon, WhatsAppIcon, PlusIcon, EditIcon, CheckIcon, XCircleIcon, MapPinIcon } from './icons';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import { useActionsContext, useDataContext, useUIContext } from '../context';


const getPatientInfo = (patientId: string, patients: Patient[]) => patients.find(p => p.id === patientId);
const getProcedureInfo = (procedureId: string, procedures: Procedure[]) => procedures.find(p => p.id === procedureId);
const getDoctorInfo = (doctorId: string, doctors: Doctor[]) => doctors.find(d => d.id === doctorId);
const getLocationInfo = (locationId: string, locations: Location[]) => locations.find(l => l.id === locationId);


const openWhatsAppReminder = (appointment: Appointment, patients: Patient[], procedures: Procedure[], doctors: Doctor[], locations: Location[]) => {
    const patient = getPatientInfo(appointment.patientId, patients);
    const procedure = getProcedureInfo(appointment.procedureId, procedures);
    const doctor = getDoctorInfo(appointment.doctorId, doctors);
    const location = getLocationInfo(appointment.locationId, locations);

    if(!patient || !procedure || !doctor || !location) return;

    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' };
    const appointmentDate = new Date(appointment.date).toLocaleDateString('pt-BR', dateOptions);
    const message = encodeURIComponent(`Olá ${patient.name}, este é um lembrete do seu agendamento de ${procedure.name} com ${doctor.name}, marcado para ${appointmentDate}, no local: ${location.name}.`);
    window.open(`https://wa.me/${patient.phone}?text=${message}`, '_blank');
};


// --- Inline form for new appointments ---
const NewAppointmentRow: React.FC<{
    time: string;
    date: Date;
    patients: Patient[];
    procedures: Procedure[];
    doctors: Doctor[];
    locations: Location[];
    occurrences: Occurrence[];
    onSave: (appointment: Partial<Appointment>) => void;
}> = ({ time, date, patients, procedures, doctors, locations, occurrences, onSave }) => {
    const [patientId, setPatientId] = useState('');
    const [procedureId, setProcedureId] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [occurrenceId, setOccurrenceId] = useState('');

    const patientOptions = useMemo(() => patients.map(p => ({ value: p.id, label: p.name })), [patients]);
    const procedureOptions = useMemo(() => procedures.map(p => ({ value: p.id, label: p.name })), [procedures]);
    const doctorOptions = useMemo(() => doctors.map(d => ({ value: d.id, label: d.name })), [doctors]);
    const locationOptions = useMemo(() => locations.map(l => ({ value: l.id, label: l.name })), [locations]);
    const occurrenceOptions = useMemo(() => occurrences.map(o => ({ value: o.id, label: o.name })), [occurrences]);

    const handleSave = () => {
        if (!patientId || !procedureId || !doctorId || !locationId) {
            toast.error('Selecione paciente, procedimento, médico e local para salvar.');
            return;
        }
        
        const [hours, minutes] = time.split(':').map(Number);
        const appointmentDate = new Date(date);
        appointmentDate.setHours(hours, minutes, 0, 0);

        onSave({
            patientId,
            procedureId,
            doctorId,
            locationId,
            date: appointmentDate.toISOString(),
            occurrenceId: occurrenceId || undefined
        });

        // Reset fields
        setPatientId('');
        setProcedureId('');
        setDoctorId('');
        setLocationId('');
        setOccurrenceId('');
    };

    return (
        <tr className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{time}</td>
            <td className="px-2 py-2">
                <SearchableSelect
                    options={patientOptions}
                    value={patientId}
                    onChange={setPatientId}
                    placeholder="Paciente..."
                />
            </td>
            <td className="px-2 py-2 align-top">
                 <div className="flex flex-col gap-2">
                     <SearchableSelect
                        options={procedureOptions}
                        value={procedureId}
                        onChange={setProcedureId}
                        placeholder="Procedimento..."
                     />
                     <SearchableSelect
                        options={doctorOptions}
                        value={doctorId}
                        onChange={setDoctorId}
                        placeholder="Médico..."
                     />
                     <SearchableSelect
                        options={locationOptions}
                        value={locationId}
                        onChange={setLocationId}
                        placeholder="Local..."
                     />
                 </div>
            </td>
            <td className="px-2 py-2">
                 <SearchableSelect
                    options={occurrenceOptions}
                    value={occurrenceId}
                    onChange={setOccurrenceId}
                    placeholder="Ocorrência..."
                    allowClear
                 />
            </td>
            <td className="px-4 py-2 text-right">
                <button 
                    onClick={handleSave} 
                    className="text-primary-600 hover:text-primary-800 p-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 disabled:text-gray-400 disabled:cursor-not-allowed" 
                    title="Adicionar Agendamento"
                    disabled={!patientId || !procedureId || !doctorId || !locationId}
                >
                    <PlusIcon className="h-6 w-6" />
                </button>
            </td>
        </tr>
    )
}


const DailyScheduleModal: React.FC = () => {
    const { appointments, patients, procedures, doctors, locations, occurrences } = useDataContext();
    const { isDailyScheduleModalOpen: isOpen, selectedDate: date, closeDailyScheduleModal: onClose } = useUIContext();
    const { updateAppointmentOccurrence: onUpdateOccurrence, saveAppointment: onSaveAppointment } = useActionsContext();
    
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Appointment>>({});
  
  const patientOptions = useMemo(() => patients.map(p => ({ value: p.id, label: p.name })), [patients]);
  const procedureOptions = useMemo(() => procedures.map(p => ({ value: p.id, label: p.name })), [procedures]);
  const doctorOptions = useMemo(() => doctors.map(d => ({ value: d.id, label: d.name })), [doctors]);
  const locationOptions = useMemo(() => locations.map(l => ({ value: l.id, label: l.name })), [locations]);
  const occurrenceOptions = useMemo(() => occurrences.map(o => ({ value: o.id, label: o.name })), [occurrences]);

  const handleStartEdit = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    setEditedData({
        patientId: appointment.patientId,
        procedureId: appointment.procedureId,
        doctorId: appointment.doctorId,
        locationId: appointment.locationId,
        occurrenceId: appointment.occurrenceId || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    if (!editingAppointmentId) return;
    onSaveAppointment(editedData, editingAppointmentId);
    handleCancelEdit();
  };

  const handleEditChange = (field: keyof typeof editedData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

    
  if (!isOpen || !date) return null;

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const dailyAppointments = appointments
    .filter(app => isSameDay(new Date(app.date), date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const modalTitle = `Agenda para ${date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`;

  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
      timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
      timeSlots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  const renderFooter = (
      <div className="flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
            Fechar
          </button>
        </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="7xl" footer={renderFooter}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Horário</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paciente</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Procedimento / Médico / Local</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">Ocorrência</th>
                    <th scope="col" className="relative px-4 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {timeSlots.map(time => {
                    const slotDate = new Date(date);
                    const [hours, minutes] = time.split(':').map(Number);
                    slotDate.setHours(hours, minutes, 0, 0);
                    
                    const appt = dailyAppointments.find(a => new Date(a.date).getTime() === slotDate.getTime());

                    if (appt) {
                        if (editingAppointmentId === appt.id) {
                            return (
                                <tr key={appt.id} className="bg-primary-50 dark:bg-gray-700">
                                     <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-2 py-2">
                                        <SearchableSelect
                                            options={patientOptions}
                                            value={editedData.patientId || ''}
                                            onChange={(val) => handleEditChange('patientId', val)}
                                            placeholder="Paciente..."
                                        />
                                    </td>
                                     <td className="px-2 py-2 align-top">
                                        <div className="flex flex-col gap-2">
                                            <SearchableSelect
                                                options={procedureOptions}
                                                value={editedData.procedureId || ''}
                                                onChange={(val) => handleEditChange('procedureId', val)}
                                                placeholder="Procedimento..."
                                            />
                                            <SearchableSelect
                                                options={doctorOptions}
                                                value={editedData.doctorId || ''}
                                                onChange={(val) => handleEditChange('doctorId', val)}
                                                placeholder="Médico..."
                                            />
                                            <SearchableSelect
                                                options={locationOptions}
                                                value={editedData.locationId || ''}
                                                onChange={(val) => handleEditChange('locationId', val)}
                                                placeholder="Local..."
                                            />
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <SearchableSelect
                                            options={occurrenceOptions}
                                            value={editedData.occurrenceId || ''}
                                            onChange={(val) => handleEditChange('occurrenceId', val)}
                                            placeholder="Ocorrência..."
                                            allowClear
                                        />
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm space-x-2">
                                        <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700 p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-gray-600" title="Salvar Alterações">
                                            <CheckIcon className="h-5 w-5" />
                                        </button>
                                         <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-gray-600" title="Cancelar Edição">
                                            <XCircleIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        }
                        const patient = getPatientInfo(appt.patientId, patients);
                        const procedure = getProcedureInfo(appt.procedureId, procedures);
                        const doctor = getDoctorInfo(appt.doctorId, doctors);
                        const location = getLocationInfo(appt.locationId, locations);
                        return (
                            <tr key={appt.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    <div>{patient?.name || 'N/A'}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <PhoneIcon className="h-3 w-3 mr-1.5" />
                                        {patient?.phone || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    <div className="font-semibold">{procedure?.name || 'N/A'}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{doctor?.name || 'N/A'}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                        <MapPinIcon className="h-3 w-3 mr-1.5" />
                                        {location?.name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <SearchableSelect
                                        options={occurrenceOptions}
                                        value={appt.occurrenceId || ''}
                                        onChange={(val) => onUpdateOccurrence(appt.id, val)}
                                        placeholder="Selecionar..."
                                        allowClear
                                    />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                     <button onClick={() => handleStartEdit(appt)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600" title="Editar Agendamento">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => openWhatsAppReminder(appt, patients, procedures, doctors, locations)} className="text-green-500 hover:text-green-700 p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50" title="Enviar lembrete via WhatsApp">
                                        <WhatsAppIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        );
                    } else {
                         return <NewAppointmentRow key={time} time={time} date={date} patients={patients} procedures={procedures} doctors={doctors} locations={locations} occurrences={occurrences} onSave={onSaveAppointment} />
                    }
                })}
            </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default DailyScheduleModal;
