

import React, { useState } from 'react';
import { CloseIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from './icons';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  
  if (!isOpen) return null;
  
  const modalSizeClass = isMaximized 
    ? 'w-full max-w-[95vw] h-[95vh]' 
    : sizeClasses[size];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] transition-all duration-300 ease-in-out ${modalSizeClass}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={isMaximized ? "Restaurar tamanho" : "Maximizar"}
            >
              {isMaximized ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Fechar modal"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-grow p-6 overflow-auto">
          {children}
        </div>
        {footer && (
            <div className="flex-shrink-0 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                {footer}
            </div>
        )}
      </div>
    </div>
  );
};

export default Modal;