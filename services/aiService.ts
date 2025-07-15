
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from '@huggingface/inference';
import { ChatContext, ChatMessage, AutomationSuggestion, SwotAnalysis, AIProvider } from '../types';
import { calculateAge } from '../utils/export';

type ApiKeys = {
    gemini: string;
    huggingface: string;
    groq: string;
    lmStudioUrl?: string;
    lmStudioModel?: string;
};

// --- Helper to build context string ---
export const buildSummarizedContext = (context: ChatContext) => {
    const patientSummary = context.patients.map(p => ({ id: p.id, name: p.name, age: calculateAge(p.dateOfBirth), gender: p.gender, ethnicity: p.ethnicity, conditions: p.conditions, municipalityId: p.municipalityId, phone: p.phone,}));
    const appointmentSummary = context.appointments.map(a => ({
        patientName: context.patients.find(p => p.id === a.patientId)?.name || 'Desconhecido',
        procedureName: context.procedures.find(p => p.id === a.procedureId)?.name || 'Desconhecido',
        doctorName: context.doctors.find(d => d.id === a.doctorId)?.name || 'Desconhecido',
        date: a.date, status: a.status,
        occurrence: context.occurrences.find(o => o.id === a.occurrenceId)?.name || ''
    }));

    return `
--- INÍCIO DO DATASET ---
### Pacientes (resumo): ${JSON.stringify(patientSummary)}
### Agendamentos (resumo): ${JSON.stringify(appointmentSummary)}
### Médicos: ${JSON.stringify(context.doctors)}
### Procedimentos: ${JSON.stringify(context.procedures)}
### Tipos de Procedimento: ${JSON.stringify(context.procedureTypes)}
--- FIM DO DATASET ---
`;
}

// --- OpenAI-Compatible API Clients (for LM Studio and Groq) ---
const handleConnectionError = (url: string) => {
    return new Error(`Não foi possível conectar ao servidor em '${url}'.\n\nVerifique se:\n1. O servidor (ex: LM Studio) está rodando.\n2. A URL está correta. Para um servidor local, tente 'http://localhost:1234'.\n3. As permissões de CORS no servidor estão configuradas para aceitar requisições desta origem.`);
}

async function* openAICompatibleStream(url: string, payload: any, apiKey?: string): AsyncGenerator<{ text: string }> {
    let response;
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...payload, stream: true }),
        });
    } catch (e) {
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
            throw handleConnectionError(url);
        }
        throw e;
    }


    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorBody}`);
    }
    if (!response.body) {
        throw new Error("No response body from stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
            const jsonStr = line.replace('data: ', '');
            if (jsonStr === '[DONE]') {
                return;
            }
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.error) {
                    console.error("Received error message in stream:", parsed.error.message);
                    continue; 
                }
                if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
                    const text = parsed.choices[0].delta.content;
                    if (text) {
                        yield { text };
                    }
                }
            } catch (e) {
                console.warn("Could not parse a stream chunk as JSON:", jsonStr);
            }
        }
    }
}

async function openAICompatibleNonStream(url: string, payload: any, apiKey?: string): Promise<string> {
    let response;
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...payload, stream: false }),
        });
    } catch (e) {
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
            throw handleConnectionError(url);
        }
        throw e;
    }

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorBody}`);
    }
    const json = await response.json();
    
    if (json.error) {
        throw new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`);
    }

    if (!json.choices || !Array.isArray(json.choices) || json.choices.length === 0) {
        console.error("API response is missing 'choices' array or it's empty:", json);
        throw new Error("A API retornou uma resposta em um formato inesperado.");
    }

    return json.choices[0]?.message?.content || '';
}


// --- NORMALIZED SERVICE FUNCTIONS ---

export async function* getAiResponseStream(history: ChatMessage[], context: ChatContext, provider: AIProvider, apiKeys: ApiKeys): AsyncGenerator<{ text: string }> {
    const today = new Date().toLocaleDateString('pt-BR');
    const summarizedContext = buildSummarizedContext(context);
    const systemInstruction = `Você é um assistente de IA para um sistema de gestão clínica. A data de hoje é ${today}. Responda à solicitação do usuário com base ESTRITAMENTE no dataset fornecido. Seja conciso e profissional. O dataset com os dados da clínica é o seguinte: ${summarizedContext}`;

    let historyForApi = [...history];
    if (provider !== 'gemini' && historyForApi.length > 0 && historyForApi[0].sender === 'ai') {
        historyForApi.shift();
    }

    const apiMessages = historyForApi.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
    }));
    
    if (provider === 'gemini') {
        if (!apiKeys.gemini || !apiKeys.gemini.trim()) throw new Error("Chave de API do Google Gemini não fornecida. Adicione-a nas configurações.");
        const client = new GoogleGenerativeAI(apiKeys.gemini);

        const geminiHistory = history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const stream = await model.generateContentStream({
            contents: geminiHistory,
            systemInstruction,
        });

        for await (const chunk of stream.stream) {
            yield { text: chunk.text() };
        }
    } else if (provider === 'huggingface') {
        if (!apiKeys.huggingface || !apiKeys.huggingface.trim()) throw new Error("Token do Hugging Face não fornecido. Adicione-o nas configurações.");
        const client = new HfInference(apiKeys.huggingface);
        const stream = client.chatCompletionStream({
            model: "CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it",
            messages: [{ role: "system", content: systemInstruction }, ...apiMessages],
        });
        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) yield { text };
        }
    } else if (provider.startsWith('groq')) {
        if (!apiKeys.groq || !apiKeys.groq.trim()) throw new Error("Chave de API do Groq não fornecida. Adicione-a nas configurações.");
        const model = provider === 'groq-gemma' ? 'gemma2-9b-it' : 'deepseek-r1-distill-llama-70b';
        const payload = { model, messages: [{ role: "system", content: systemInstruction }, ...apiMessages], temperature: 0.7, };
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        yield* openAICompatibleStream(url, payload, apiKeys.groq);
    } else if (provider === 'lm-studio') {
        const model = apiKeys.lmStudioModel || process.env.LM_STUDIO_MODEL || 'gemma-3-gaia-pt-br-4b-it-i1';
        const url = `${apiKeys.lmStudioUrl || process.env.LM_STUDIO_URL || 'http://localhost:1234'}/v1/chat/completions`;
        const payload = { model, messages: [{ role: "system", content: systemInstruction }, ...apiMessages], temperature: 0.7, };
        yield* openAICompatibleStream(url, payload);
    } else {
        throw new Error(`Provedor de IA não suportado: ${provider}`);
    }
}

async function getJsonResponse(systemInstruction: string, userPrompt: string, provider: AIProvider, apiKeys: ApiKeys, schema?: any): Promise<any> {
    const messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
    ];
    
    let textResponse: string;

    if (provider === 'gemini') {
        if (!apiKeys.gemini || !apiKeys.gemini.trim()) throw new Error("Chave de API do Google Gemini não fornecida. Adicione-a nas configurações.");
        const client = new GoogleGenerativeAI(apiKeys.gemini);
        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            systemInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        textResponse = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (provider.startsWith('groq')) {
        if (!apiKeys.groq || !apiKeys.groq.trim()) throw new Error("Chave de API do Groq não fornecida. Adicione-a nas configurações.");
        const model = provider === 'groq-gemma' ? 'gemma2-9b-it' : 'deepseek-r1-distill-llama-70b';
        const payload = { model, messages, temperature: 0.2 };
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        textResponse = await openAICompatibleNonStream(url, payload, apiKeys.groq);
    } else if (provider === 'huggingface') {
        if (!apiKeys.huggingface || !apiKeys.huggingface.trim()) throw new Error("Token do Hugging Face não fornecido. Adicione-o nas configurações.");
        const client = new HfInference(apiKeys.huggingface);
        textResponse = await client.chatCompletion({
            model: "CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it",
            messages: messages,
            max_tokens: 2048,
        }).then(res => res.choices[0].message.content || '');
    } else if (provider === 'lm-studio') {
        const model = apiKeys.lmStudioModel || process.env.LM_STUDIO_MODEL || 'gemma-3-gaia-pt-br-4b-it-i1';
        const url = `${apiKeys.lmStudioUrl || process.env.LM_STUDIO_URL || 'http://localhost:1234'}/v1/chat/completions`;
        const payload = { model, messages, temperature: 0.2, };
        textResponse = await openAICompatibleNonStream(url, payload);
    } else {
        throw new Error(`Provedor de IA não suportado: ${provider}`);
    }
    
    try {
        let jsonString = '';
        const markdownMatch = textResponse.match(/```(?:json)?\s*([\s\S]+?)\s*```/);

        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        } else {
            const firstBracket = textResponse.indexOf('[');
            const firstBrace = textResponse.indexOf('{');
            
            let start = -1;
            if (firstBracket === -1) start = firstBrace;
            else if (firstBrace === -1) start = firstBracket;
            else start = Math.min(firstBracket, firstBrace);
            
            if (start !== -1) {
                const lastBracket = textResponse.lastIndexOf(']');
                const lastBrace = textResponse.lastIndexOf('}');
                const end = Math.max(lastBracket, lastBrace);
                
                if (end > start) {
                    jsonString = textResponse.substring(start, end + 1);
                }
            }
        }

        if (!jsonString) {
             throw new Error("Nenhum objeto ou array JSON válido foi encontrado na resposta da IA.");
        }
        
        // Remove aspas duplas extras que a IA pode adicionar (ex: ""string"")
        jsonString = jsonString.replace(/""([^""]*)""/g, '"$1"');

        let parsedJson = JSON.parse(jsonString);

        if (parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson)) {
            const keys = Object.keys(parsedJson);
            if (keys.length === 1 && typeof parsedJson[keys[0]] === 'object' && parsedJson[keys[0]] !== null) {
                console.log(`AI response was wrapped in key "${keys[0]}". Unwrapping...`);
                return parsedJson[keys[0]];
            }
        }
        
        return parsedJson;
    } catch (e) {
        console.error("Falha ao analisar JSON da resposta da IA:", textResponse);
        if (e instanceof Error && e.message.includes('JSON')) {
             throw new Error("A IA retornou uma resposta em formato JSON inválido. A resposta completa está no console.");
        }
        throw e;
    }
}


export const generateAutomatedMessages = async (
    context: Partial<ChatContext>,
    provider: AIProvider,
    apiKeys: ApiKeys,
    targetDate: Date
): Promise<AutomationSuggestion[]> => {
    const referenceDate = targetDate.toISOString();
    
    const systemInstruction = `Você é uma API. Sua ÚNICA função é analisar os dados da clínica para a data de referência ${referenceDate} e retornar um array JSON de sugestões de automação.
As categorias são: 'reminder', 'preparation', 'follow-up', 'campaign'.
Para cada sugestão, forneça um "reasoning" (motivo) conciso explicando por que a sugestão foi gerada.
NUNCA forneça texto, explicações ou pensamentos. Sua resposta DEVE SER apenas o array JSON.
Sempre inclua o nome do paciente na mensagem.
Exemplo de formato de saída:
[
  {
    "patientId": "p001",
    "patientName": "Artur Silva",
    "patientPhone": "5588987654321",
    "type": "reminder",
    "message": "Olá Artur Silva. Lembrete da sua consulta de Acompanhamento Cardiológico amanhã às 09:00.",
    "reasoning": "Lembrete para consulta agendada em menos de 48 horas."
  }
]`;
    const userPrompt = `Dataset: ${JSON.stringify(context)}.`;

    const schema = {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                patientId: { type: 'string' },
                patientName: { type: 'string' },
                patientPhone: { type: 'string' },
                type: { type: 'string' },
                message: { type: 'string' },
                reasoning: { type: 'string' }
            },
            required: ['patientId', 'patientName', 'patientPhone', 'type', 'message', 'reasoning']
        }
    };

    const rawResult = await getJsonResponse(systemInstruction, userPrompt, provider, apiKeys, schema);

    if (!rawResult) return [];

    let suggestionsArray: any[] = [];
    if (Array.isArray(rawResult)) {
        suggestionsArray = rawResult;
    } else if (typeof rawResult === 'object' && rawResult !== null) {
        const key = Object.keys(rawResult).find(k => Array.isArray((rawResult as any)[k]));
        if (key) {
            suggestionsArray = (rawResult as any)[key];
        }
    }

    if (!Array.isArray(suggestionsArray)) {
        console.error("AI response for automation was not an array or an object containing an array:", rawResult);
        throw new Error("A IA retornou uma resposta para automação em um formato inesperado.");
    }

    return suggestionsArray.map((item: any): AutomationSuggestion | null => {
        if (typeof item !== 'object' || item === null) return null;

        const patientId = item.patientId || item.patient_id;
        const patientName = item.patientName || item.patient_name || item.name;
        const patientPhone = item.patientPhone || item.patient_phone || item.phone;
        const type = item.type || item.suggestion_type;
        const message = item.message || item.text;
        const reasoning = item.reasoning || item.reason;

        if (patientId && patientName && patientPhone && type && message) {
            const suggestion: AutomationSuggestion = {
                patientId: String(patientId),
                patientName: String(patientName),
                patientPhone: String(patientPhone),
                type: String(type) as AutomationSuggestion['type'],
                message: String(message),
            };
            if (reasoning) {
                suggestion.reasoning = String(reasoning);
            }
            return suggestion;
        }
        return null;
    }).filter((item): item is AutomationSuggestion => item !== null);
}

export const generateSwotAnalysis = async (topic: string, analysisData: any, context: ChatContext, provider: AIProvider, apiKeys: ApiKeys): Promise<SwotAnalysis> => {
     const systemInstruction = `Você é uma API de análise. Sua ÚNICA função é retornar uma análise SWOT em formato JSON. Baseado no tópico e nos dados fornecidos, gere a análise. NUNCA forneça texto, explicações ou pensamentos. Sua resposta DEVE SER apenas o objeto JSON. Certifique-se de que os valores dentro dos arrays sejam strings simples, sem aspas duplas extras.
 Exemplo de formato de saída:
 {
   "strengths": ["Alta taxa de comparecimento para Doutor X."],
   "weaknesses": ["Baixa receita gerada pelo procedimento Y."],
   "opportunities": ["Expandir marketing para o município Z com base no alto comparecimento."],
   "threats": ["Concorrência local pode afetar a retenção de pacientes."]
 }`;
    const userPrompt = `
        Tópico da Análise: ${topic}
        Dados para Análise: ${JSON.stringify(analysisData)}
        Contexto Geral: Total de Pacientes: ${context.patients.length}, Total de Agendamentos: ${context.appointments.length}
    `;

    const schema = {
        type: 'object',
        properties: {
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
            threats: { type: 'array', items: { type: 'string' } }
        },
        required: ['strengths', 'weaknesses', 'opportunities', 'threats']
    };

    const rawResult = await getJsonResponse(systemInstruction, userPrompt, provider, apiKeys, schema);

    const findKeyValues = (obj: any, keys: string[]): string[] => {
        for (const key of keys) {
            if (obj && typeof obj === 'object' && obj[key]) {
                const value = obj[key];
                if (Array.isArray(value)) {
                    return value.map(String).filter(Boolean);
                }
                if (typeof value === 'string') {
                    return value.split('\n')
                        .map(line => line.replace(/^\s*[-*]?\s*\d*\.?\s*/, '').trim())
                        .filter(Boolean);
                }
            }
        }
        return [];
    };
    
    const mappedResult: SwotAnalysis = {
        strengths: findKeyValues(rawResult, ['strengths', 'Strengths', 'forces', 'Forces', 'forças', 'Forças']),
        weaknesses: findKeyValues(rawResult, ['weaknesses', 'Weaknesses', 'fraquezas', 'Fraquezas']),
        opportunities: findKeyValues(rawResult, ['opportunities', 'Opportunities', 'oportunidades', 'Oportunidades']),
        threats: findKeyValues(rawResult, ['threats', 'Threats', 'ameaças', 'Ameaças']),
    };
    
    if (mappedResult.strengths.length > 0 || mappedResult.weaknesses.length > 0 || mappedResult.opportunities.length > 0 || mappedResult.threats.length > 0) {
        return mappedResult;
    }
    
    console.error("A estrutura final da resposta da IA não corresponde a uma Análise SWOT:", rawResult);
    throw new Error("A resposta da IA não continha uma Análise SWOT válida após o processamento.");
};
