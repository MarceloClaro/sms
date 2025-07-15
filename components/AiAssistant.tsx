

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatContext, AIProvider } from '../types';
import { getAiResponseStream, buildSummarizedContext } from '../services/aiService';
import { SendIcon, AiAssistantIcon, CopyIcon, ChevronDownIcon, DownloadIcon } from './icons';
import { useDataContext, useUIContext, useActionsContext } from '../context';
import toast from 'react-hot-toast';

const AiAssistant: React.FC = () => {
  const dataContext = useDataContext();
  const { aiProvider, geminiApiKey, hfToken, groqApiKey, lmStudioUrl, lmStudioModel } = useUIContext();
  const { saveChatHistory } = useActionsContext();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isRagVisible, setIsRagVisible] = useState(false);
  const [lastRagContext, setLastRagContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (dataContext.chatHistory && dataContext.chatHistory.length > 0) {
          setMessages(dataContext.chatHistory);
      } else {
          setMessages([{ id: 1, text: "Olá! Sou seu assistente clínico de IA. Selecione um provedor no menu e pergunte-me sobre o histórico de um paciente, a agenda de um médico, finanças e muito mais.", sender: 'ai' }]);
      }
  }, [dataContext.chatHistory]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    // --- Context and Payload Generation for Display ---
    const context: ChatContext = { 
        patients: dataContext.patients,
        appointments: dataContext.appointments,
        doctors: dataContext.doctors,
        procedures: dataContext.procedures,
        procedureTypes: dataContext.procedureTypes,
        campaigns: dataContext.campaigns,
        locations: dataContext.locations,
        municipalities: dataContext.municipalities,
        priceTables: dataContext.priceTables,
        priceTableEntries: dataContext.priceTableEntries,
        occurrences: dataContext.occurrences,
    };
    const today = new Date().toLocaleDateString('pt-BR');
    const summarizedContext = buildSummarizedContext(context);
    const systemInstruction = `Você é um assistente de IA para um sistema de gestão clínica. A data de hoje é ${today}. Responda à solicitação do usuário com base ESTRITAMENTE no dataset fornecido. Seja conciso e profissional. O dataset com os dados da clínica é o seguinte: ${summarizedContext}`;
    
    const historyForAI = [...messages, userMessage];
    const apiMessagesForDisplay = historyForAI.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
    }));

    const fullPayloadForDisplay = {
        provider: aiProvider,
        system_prompt: systemInstruction,
        conversation_history: apiMessagesForDisplay
    };

    const fullContextString = JSON.stringify(fullPayloadForDisplay, null, 2);
    setLastRagContext(fullContextString);
    // --- End Context Generation ---

    const aiMessage: ChatMessage = {
      id: Date.now() + 1,
      text: '',
      sender: 'ai',
    };
    
    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
    setIsLoading(true);

    let fullResponse = '';
    let errorText = '';

    try {
      const apiKeys = { gemini: geminiApiKey, huggingface: hfToken, groq: groqApiKey, lmStudioUrl, lmStudioModel };
      const stream = await getAiResponseStream(historyForAI, context, aiProvider, apiKeys);
      
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id ? { ...msg, text: fullResponse } : msg
          ));
        }
      }

    } catch (error) {
      console.error("Error streaming response from AI:", error);
      errorText = `Desculpe, ocorreu um erro ao comunicar com o provedor ${aiProvider}.\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`;
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id ? { ...msg, text: errorText } : msg
      ));
    } finally {
      setIsLoading(false);
      const finalAiMessageText = fullResponse || errorText;
      const finalHistory = [...historyForAI.slice(0, -1), userMessage, { ...aiMessage, text: finalAiMessageText }];
      await saveChatHistory(finalHistory);
    }
  };
  
  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  const handleDownloadRag = () => {
    if (!lastRagContext) return;
    const blob = new Blob([lastRagContext], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_payload_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Contexto completo da IA baixado!");
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <AiAssistantIcon className="h-6 w-6 mr-3 text-primary-500"/>
          Assistente Clínico (IA)
        </h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.sender === 'ai' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                <AiAssistantIcon className="h-5 w-5"/>
              </div>
            )}
            <div className={`relative max-w-lg p-3 rounded-2xl ${msg.sender === 'user'
                ? 'bg-primary-500 text-white rounded-br-none'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
              }`}
            >
              {msg.text ? <p className="text-sm whitespace-pre-wrap">{msg.text}</p> : (
                 <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              )}

               {msg.sender === 'ai' && msg.text && !isLoading && (
                <button 
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="absolute -top-2 -right-2 p-1.5 bg-gray-300 dark:bg-gray-600 rounded-full text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Copiar texto"
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              )}
               {copiedMessageId === msg.id && (
                <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded">Copiado!</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre a agenda, pacientes, etc."
            className="w-full pl-4 pr-12 py-3 border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-12 text-primary-500 hover:text-primary-700 disabled:text-gray-400"
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </div>

        {lastRagContext && (
            <div className="mt-4 border-t pt-4 dark:border-gray-600">
                <button
                    onClick={() => setIsRagVisible(!isRagVisible)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                    <span>Ver/Ocultar Contexto Completo da Última Mensagem (RAG + Histórico)</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isRagVisible ? 'rotate-180' : ''}`} />
                </button>
                {isRagVisible && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md relative max-h-48 overflow-y-auto">
                        <button 
                            onClick={handleDownloadRag}
                            className="absolute top-2 right-2 p-1.5 bg-gray-300 dark:bg-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500"
                            title="Baixar Contexto Completo"
                        >
                            <DownloadIcon className="h-4 w-4" />
                        </button>
                        <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 pr-8">
                            {lastRagContext}
                        </pre>
                    </div>
                )}
            </div>
        )}

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            A IA pode cometer erros. Considere verificar informações importantes. Isto não é um conselho médico.
        </p>
      </div>
    </div>
  );
};

export default AiAssistant;