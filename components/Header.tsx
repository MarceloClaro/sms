import React from 'react';
import { PlusIcon, PrintIcon } from './icons';
import { useUIContext } from '../context';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { openAppointmentModal } = useUIContext();
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm print:hidden">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
          aria-label="Imprimir página"
        >
          <PrintIcon className="h-5 w-5 mr-2" />
          Imprimir
        </button>
        <button 
          onClick={openAppointmentModal}
          className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
          aria-label="Agendar nova consulta"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Agendamento
        </button>
      </div>
    </header>
  );
};

export default Header;