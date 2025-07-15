
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, XCircleIcon } from './icons';

interface SearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    allowClear?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = 'Selecione uma opção', id, disabled = false, allowClear = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(() => options.find(option => option.value === value), [options, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredOptions = useMemo(() =>
        options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        ), [options, searchTerm]);
    
    const handleSelectOption = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    }

    return (
        <div ref={wrapperRef} className="relative w-full" id={id}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`relative w-full text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`block truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-400'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                
                {allowClear && value && (
                    <span className="absolute inset-y-0 right-5 flex items-center pr-2">
                        <button onClick={handleClear} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                             <XCircleIcon className="h-4 w-4 text-gray-400" />
                        </button>
                    </span>
                )}
                
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-700 max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            autoFocus
                        />
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {filteredOptions.length > 0 ? filteredOptions.map(option => (
                            <li
                                key={option.value}
                                onClick={() => handleSelectOption(option.value)}
                                className={`cursor-pointer select-none relative py-2 pl-10 pr-4 text-gray-900 dark:text-white ${value === option.value ? 'bg-primary-600 text-white' : 'hover:bg-primary-100 dark:hover:bg-gray-700'}`}
                            >
                                {value === option.value && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                                       &#10003;
                                    </span>
                                )}
                                <span className={`font-normal block truncate ${value === option.value ? 'font-semibold' : ''}`}>
                                    {option.label}
                                </span>
                            </li>
                        )) : (
                             <li className="cursor-default select-none relative py-2 px-4 text-gray-700 dark:text-gray-400">
                                Nenhum resultado encontrado.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
