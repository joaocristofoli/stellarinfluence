import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChannelType } from '../types/marketing';

// Initialize the API
const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface AIStrategySuggestion {
    title: string;
    description: string;
    howToDo: string;
    whenToDo: string;
    whyToDo: string;
    suggestedBudget: number;
    channel: ChannelType;
}

export const generateMarketingIdeas = async (
    companyName: string,
    companyDescription: string | null,
    channel: ChannelType,
    budget?: number
): Promise<AIStrategySuggestion[]> => {
    if (!apiKey) {
        throw new Error('API Key não configurada');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `
            Atue como um especialista em Marketing Digital Sênior.
            Crie 3 sugestões de estratégias de marketing altamente criativas e práticas para a seguinte empresa:
            
            Nome da Empresa: ${companyName}
            Ramo/Descrição: ${companyDescription || "Empresa local"}
            Canal de Foco: ${channel}
            ${budget ? `Orçamento Aproximado Disponível: R$ ${budget} (mas pode sugerir algo próximo)` : ''}

            Para cada sugestão, forneça:
            1. Título chamativo.
            2. Descrição (resumo do conceito).
            3. Como fazer (passo a passo prático para execução).
            4. Quando fazer (frequência ideal ou momento específico).
            5. Por que fazer (justificativa estratégica e impacto esperado).
            6. Orçamento estimado.

            Retorne APENAS um JSON array válido com o seguinte formato, sem markdown:
            [
                {
                    "title": "Título",
                    "description": "Resumo...",
                    "howToDo": "Passo 1... Passo 2...",
                    "whenToDo": "Semanalmente...",
                    "whyToDo": "Para aumentar...",
                    "suggestedBudget": 1000,
                    "channel": "${channel}"
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('Error generating AI ideas:', error);
        throw new Error('Falha ao gerar ideias com IA. Verifique sua chave de API.');
    }
};
