
import React, { useState } from 'react';
import { Appointment } from '../types';

interface CalendarViewProps {
    appointments: Appointment[];
    onDayClick: (date: Date) => void;
    selectedDate: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onDayClick, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const placeholders = Array.from({ length: startDay }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear() &&
           day === today.getDate();
  };
  
  const isSelected = (day: number) => {
    return currentDate.getMonth() === selectedDate.getMonth() &&
           currentDate.getFullYear() === selectedDate.getFullYear() &&
           day === selectedDate.getDate();
  };

  const getAppointmentsForDay = (day: number) => {
    return appointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate.getFullYear() === currentDate.getFullYear() &&
               appDate.getMonth() === currentDate.getMonth() &&
               appDate.getDate() === day;
    });
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDayClick(clickedDate);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Mês anterior">
          &lt;
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Próximo mês">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {placeholders.map(p => <div key={`p-${p}`} />)}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          return (
            <button 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={`p-2 h-16 rounded-lg flex flex-col items-center justify-start transition-colors cursor-pointer focus:outline-none ring-2 ring-offset-2 dark:ring-offset-gray-800
                ${isSelected(day) ? 'ring-blue-500' : 'ring-transparent'} 
                ${isToday(day) ? 'bg-primary-500 text-white' : hasAppointments ? 'bg-primary-100 dark:bg-primary-900/50 hover:bg-primary-200 dark:hover:bg-primary-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <span className={`font-medium ${isToday(day) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{day}</span>
              {hasAppointments && (
                  <div className={`w-5 h-5 rounded-full mt-1 text-xs flex items-center justify-center font-bold ${isToday(day) ? 'bg-white text-primary-500' : 'bg-red-500 text-white'}`} title={`${dayAppointments.length} agendamento(s)`}>
                      {dayAppointments.length}
                  </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
