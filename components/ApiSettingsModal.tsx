

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useUIContext } from '../context';
import toast from 'react-hot-toast';

const ApiSettingsModal: React.FC = () => {
    const {
        isApiSettingsModalOpen: isOpen,
        closeApiSettingsModal: onClose,
        geminiApiKey,
        hfToken,
        groqApiKey,
        lmStudioUrl,
        lmStudioModel,
        setGeminiApiKey,
        setHfToken,
        setGroqApiKey,
        setLmStudioUrl,
        setLmStudioModel,
    } = useUIContext();

    const [localGeminiKey, setLocalGeminiKey] = useState('');
    const [localHfToken, setLocalHfToken] = useState('');
    const [localGroqKey, setLocalGroqKey] = useState('');
    const [localLmStudioUrl, setLocalLmStudioUrl] = useState('');
    const [localLmStudioModel, setLocalLmStudioModel] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLocalGeminiKey(geminiApiKey);
            setLocalHfToken(hfToken);
            setLocalGroqKey(groqApiKey);
            setLocalLmStudioUrl(lmStudioUrl);
            setLocalLmStudioModel(lmStudioModel);
        }
    }, [isOpen, geminiApiKey, hfToken, groqApiKey, lmStudioUrl, lmStudioModel]);
    
    const handleSave = () => {
        setGeminiApiKey(localGeminiKey);
        setHfToken(localHfToken);
        setGroqApiKey(localGroqKey);
        setLmStudioUrl(localLmStudioUrl);
        setLmStudioModel(localLmStudioModel);
        toast.success('Configurações de API salvas localmente!');
        onClose();
    };

    const renderFooter = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Cancelar
            </button>
            <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">
                Salvar Configurações
            </button>
        </div>
    );

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configurar Chaves de API e Endpoints" size="lg" footer={renderFooter}>
            <div className="space-y-6">
                <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong className="font-bold">Aviso de Segurança:</strong> As chaves inseridas aqui são salvas no armazenamento local do seu navegador. Não use esta funcionalidade em computadores compartilhados.
                    </p>
                </div>
                <div>
                    <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Gemini API Key</label>
                    <input
                        type="password"
                        id="gemini-key"
                        value={localGeminiKey}
                        onChange={(e) => setLocalGeminiKey(e.target.value)}
                        placeholder="Cole sua chave da API do Google Gemini aqui"
                        className={inputClasses}
                    />
                     <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Usado pelo provedor "Google Gemini".</p>
                </div>
                 <div>
                    <label htmlFor="hf-token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hugging Face User Access Token</label>
                    <input
                        type="password"
                        id="hf-token"
                        value={localHfToken}
                        onChange={(e) => setLocalHfToken(e.target.value)}
                        placeholder="Cole seu token de acesso da Hugging Face aqui"
                        className={inputClasses}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Usado pelo provedor "Hugging Face (Gaia)".</p>
                </div>
                 <div>
                    <label htmlFor="groq-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Groq API Key</label>
                    <input
                        type="password"
                        id="groq-key"
                        value={localGroqKey}
                        onChange={(e) => setLocalGroqKey(e.target.value)}
                        placeholder="Cole sua chave da API do Groq aqui"
                        className={inputClasses}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Usado para todos os modelos do provedor Groq.</p>
                </div>
                 <div>
                    <label htmlFor="lm-studio-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LM Studio URL</label>
                    <input
                        type="text"
                        id="lm-studio-url"
                        value={localLmStudioUrl}
                        onChange={(e) => setLocalLmStudioUrl(e.target.value)}
                        placeholder="Ex: http://localhost:1234"
                        className={inputClasses}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        URL base do seu servidor LM Studio local.
                    </p>
                </div>
                <div>
                    <label htmlFor="lm-studio-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LM Studio Model</label>
                    <input
                        type="text"
                        id="lm-studio-model"
                        value={localLmStudioModel}
                        onChange={(e) => setLocalLmStudioModel(e.target.value)}
                        placeholder="Nome/caminho do modelo no servidor"
                        className={inputClasses}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Nome do modelo carregado no LM Studio. Deixe em branco para usar o padrão configurado.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default ApiSettingsModal;
